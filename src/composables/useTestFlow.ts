import { question } from '#/data'
import { computed, ref, shallowRef } from 'vue'

export interface TestFlowItem {
  id: string
  kind: 'gender' | 'question'
  prompt: string
  positiveLabel: string
  negativeLabel: string
  answer: boolean | null
  questionNumber: number | null
}

export function useTestFlow() {
  const answers = ref<(boolean | null)[]>(question.map(() => null))
  const assignedGender = shallowRef<boolean | null>(null)
  const currentIndex = shallowRef(0)

  const firstQuestionIndex = 1
  const lastQuestionIndex = question.length
  const reviewIndex = question.length + 1

  const answeredQuestionCount = computed(() =>
    answers.value.reduce((count, answer) => count + (answer === null ? 0 : 1), 0),
  )

  const isReviewStep = computed(() => currentIndex.value === reviewIndex)
  const canSubmit = computed(() => assignedGender.value !== null && answeredQuestionCount.value === question.length)

  function getItemAt(index: number): TestFlowItem | null {
    if (index < 0 || index > lastQuestionIndex) {
      return null
    }

    if (index === 0) {
      return {
        id: 'gender',
        kind: 'gender',
        prompt: '你的指派性别？',
        positiveLabel: '男',
        negativeLabel: '女',
        answer: assignedGender.value,
        questionNumber: null,
      }
    }

    const questionIndex = index - 1
    return {
      id: `question-${questionIndex}`,
      kind: 'question',
      prompt: question[questionIndex],
      positiveLabel: '是',
      negativeLabel: '否',
      answer: answers.value[questionIndex],
      questionNumber: index,
    }
  }

  const currentItem = computed(() => getItemAt(currentIndex.value))
  const previousItem = computed(() => getItemAt(isReviewStep.value ? lastQuestionIndex : currentIndex.value - 1))
  const nextItem = computed(() => getItemAt(isReviewStep.value ? -1 : currentIndex.value + 1))

  function setCurrentIndex(nextIndex: number) {
    currentIndex.value = Math.min(Math.max(nextIndex, 0), reviewIndex)
  }

  function setCurrentAnswer(value: boolean | null) {
    if (isReviewStep.value) {
      return
    }

    if (currentIndex.value === 0) {
      assignedGender.value = value
      return
    }

    answers.value[currentIndex.value - 1] = value
  }

  function canAdvanceFrom(index = currentIndex.value) {
    if (index === 0) {
      return assignedGender.value !== null
    }

    if (index >= firstQuestionIndex && index <= lastQuestionIndex) {
      return answers.value[index - 1] !== null
    }

    return false
  }

  function confirmCurrentAnswer(value: boolean) {
    setCurrentAnswer(value)

    if (currentIndex.value < lastQuestionIndex) {
      setCurrentIndex(currentIndex.value + 1)
      return
    }

    if (currentIndex.value === lastQuestionIndex) {
      setCurrentIndex(reviewIndex)
    }
  }

  function clearCurrentAnswer() {
    setCurrentAnswer(null)
  }

  function goPrevious() {
    if (currentIndex.value === 0) {
      return false
    }

    setCurrentIndex(currentIndex.value - 1)
    return true
  }

  function goNext() {
    if (isReviewStep.value || !canAdvanceFrom()) {
      return false
    }

    setCurrentIndex(currentIndex.value + 1)
    return true
  }

  return {
    answers,
    assignedGender,
    currentIndex,
    reviewIndex,
    answeredQuestionCount,
    canSubmit,
    currentItem,
    previousItem,
    nextItem,
    isReviewStep,
    setCurrentIndex,
    setCurrentAnswer,
    confirmCurrentAnswer,
    clearCurrentAnswer,
    canAdvanceFrom,
    goPrevious,
    goNext,
  }
}
