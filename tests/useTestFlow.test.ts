import assert from 'node:assert/strict'
import test from 'node:test'

import { getSwipeAnswer, SWIPE_THRESHOLD } from '../src/components/test/swipe'
import { useTestFlow } from '../src/composables/useTestFlow'

function answerAllQuestions(flow: ReturnType<typeof useTestFlow>) {
  flow.confirmCurrentAnswer(true)

  while (!flow.isReviewStep.value) {
    flow.confirmCurrentAnswer(true)
  }
}

test('test flow starts on the gender card', () => {
  const flow = useTestFlow()

  assert.equal(flow.currentIndex.value, 0)
  assert.equal(flow.currentItem.value?.kind, 'gender')
  assert.equal(flow.previousItem.value, null)
  assert.equal(flow.nextItem.value?.kind, 'question')
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

test('short drags do not resolve to an answer', () => {
  assert.equal(getSwipeAnswer(SWIPE_THRESHOLD - 1), null)
  assert.equal(getSwipeAnswer(-SWIPE_THRESHOLD + 1), null)
  assert.equal(getSwipeAnswer(SWIPE_THRESHOLD), false)
  assert.equal(getSwipeAnswer(-SWIPE_THRESHOLD), true)
})
