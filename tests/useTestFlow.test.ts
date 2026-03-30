import assert from 'node:assert/strict'
import test from 'node:test'
import { nextTick } from 'vue'
import { getSwipeAnswer, SWIPE_THRESHOLD } from '../src/components/test/swipe'
import { useTestFlow } from '../src/composables/useTestFlow'
import { question } from '../src/data'

const TEST_FLOW_STORAGE_KEY = 'meow-pi:test-flow'

class MemoryStorage implements Storage {
  #store = new Map<string, string>()

  get length() {
    return this.#store.size
  }

  clear() {
    this.#store.clear()
  }

  getItem(key: string) {
    return this.#store.get(key) ?? null
  }

  key(index: number) {
    return [...this.#store.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.#store.delete(key)
  }

  setItem(key: string, value: string) {
    this.#store.set(key, value)
  }
}

const storage = new MemoryStorage()

Object.defineProperty(globalThis, 'localStorage', {
  value: storage,
  configurable: true,
  writable: true,
})

function answerAllQuestions(flow: ReturnType<typeof useTestFlow>) {
  flow.confirmCurrentAnswer(true)

  while (!flow.isReviewStep.value) {
    flow.confirmCurrentAnswer(true)
  }
}

test.beforeEach(() => {
  storage.clear()
})

test('test flow starts on the gender card', () => {
  const flow = useTestFlow()

  assert.equal(flow.currentIndex.value, 0)
  assert.equal(flow.currentItem.value?.kind, 'gender')
  assert.equal(flow.previousItem.value, null)
  assert.equal(flow.nextItem.value?.kind, 'question')
})

test('initializes from persisted storage when available', () => {
  storage.setItem(
    TEST_FLOW_STORAGE_KEY,
    JSON.stringify({
      assignedGender: false,
      answers: [true, false, ...question.slice(2).map(() => null)],
      currentIndex: 2,
    }),
  )

  const flow = useTestFlow()

  assert.equal(flow.assignedGender.value, false)
  assert.deepEqual(flow.answers.value.slice(0, 3), [true, false, null])
  assert.equal(flow.currentIndex.value, 2)
  assert.equal(flow.currentItem.value?.questionNumber, 2)
})

test('answering the gender card advances to question one', () => {
  const flow = useTestFlow()

  flow.confirmCurrentAnswer(true)

  assert.equal(flow.assignedGender.value, true)
  assert.equal(flow.currentIndex.value, 1)
  assert.equal(flow.currentItem.value?.questionNumber, 1)
})

test('goNext only moves forward when the current step is answered', () => {
  const flow = useTestFlow()

  assert.equal(flow.goNext(), false)

  flow.confirmCurrentAnswer(false)
  assert.equal(flow.currentIndex.value, 1)

  assert.equal(flow.goNext(), false)
  flow.setCurrentAnswer(true)
  assert.equal(flow.goNext(), true)
  assert.equal(flow.currentIndex.value, 2)
})

test('previous and next previews follow the current index', () => {
  const flow = useTestFlow()

  flow.confirmCurrentAnswer(true)
  flow.setCurrentAnswer(false)

  assert.equal(flow.previousItem.value?.kind, 'gender')
  assert.equal(flow.nextItem.value?.questionNumber, 2)

  flow.goNext()

  assert.equal(flow.previousItem.value?.questionNumber, 1)
  assert.equal(flow.currentItem.value?.questionNumber, 2)
  assert.equal(flow.nextItem.value?.questionNumber, 3)
})

test('clearing restores the current answer to null', () => {
  const flow = useTestFlow()

  flow.confirmCurrentAnswer(true)
  flow.setCurrentAnswer(false)
  flow.clearCurrentAnswer()

  assert.equal(flow.currentItem.value?.answer, null)
  assert.equal(flow.canAdvanceFrom(), false)
})

test('the final answer advances to the review step instead of auto-submitting', () => {
  const flow = useTestFlow()

  answerAllQuestions(flow)

  assert.equal(flow.isReviewStep.value, true)
  assert.equal(flow.currentItem.value, null)
  assert.equal(flow.previousItem.value?.questionNumber, 566)
  assert.equal(flow.canSubmit.value, true)
})

test('submit remains blocked until every answer is present', () => {
  const flow = useTestFlow()

  flow.confirmCurrentAnswer(true)
  assert.equal(flow.canSubmit.value, false)

  answerAllQuestions(flow)
  assert.equal(flow.canSubmit.value, true)
})

test('persisted progress is available to a new composable instance', async () => {
  const firstFlow = useTestFlow()

  firstFlow.confirmCurrentAnswer(true)
  firstFlow.setCurrentAnswer(false)
  firstFlow.goNext()

  await nextTick()

  const secondFlow = useTestFlow()

  assert.equal(secondFlow.assignedGender.value, true)
  assert.equal(secondFlow.answers.value[0], false)
  assert.equal(secondFlow.currentIndex.value, 2)
})

test('invalid persisted snapshots fall back to a fresh flow', () => {
  storage.setItem(
    TEST_FLOW_STORAGE_KEY,
    JSON.stringify({
      assignedGender: true,
      answers: [true],
      currentIndex: 99,
    }),
  )

  const flow = useTestFlow()

  assert.equal(flow.assignedGender.value, null)
  assert.equal(flow.currentIndex.value, 0)
  assert.equal(flow.answeredQuestionCount.value, 0)
})

test('resetFlow clears persisted progress and restoreFlow restores the snapshot', () => {
  const flow = useTestFlow()

  flow.confirmCurrentAnswer(true)
  flow.setCurrentAnswer(false)
  flow.goNext()
  flow.setCurrentAnswer(true)

  const snapshot = flow.createSnapshot()

  flow.resetFlow()
  assert.equal(flow.assignedGender.value, null)
  assert.equal(flow.currentIndex.value, 0)
  assert.equal(flow.answeredQuestionCount.value, 0)

  flow.restoreFlow(snapshot)

  assert.equal(flow.assignedGender.value, true)
  assert.deepEqual(flow.answers.value.slice(0, 2), [false, true])
  assert.equal(flow.currentIndex.value, 2)
  assert.equal(flow.currentItem.value?.questionNumber, 2)
})

test('short drags do not resolve to an answer', () => {
  assert.equal(getSwipeAnswer(SWIPE_THRESHOLD - 1), null)
  assert.equal(getSwipeAnswer(-SWIPE_THRESHOLD + 1), null)
  assert.equal(getSwipeAnswer(SWIPE_THRESHOLD), false)
  assert.equal(getSwipeAnswer(-SWIPE_THRESHOLD), true)
})
