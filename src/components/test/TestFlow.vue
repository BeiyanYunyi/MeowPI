<script setup lang="ts">
import type { TestFlowItem } from '#/composables/useTestFlow'
import { breakpoints } from '#/breakpoints.stylex'
import { useTestFlow } from '#/composables/useTestFlow'
import { colors, motion, radius, shadow, spacing, type } from '#/tokens.stylex'
import { computed, nextTick, useTemplateRef, watch } from 'vue'
import TestCardPreview from './TestCardPreview.vue'
import TestQuestionCard from './TestQuestionCard.vue'
import TestReviewCard from './TestReviewCard.vue'

const emit = defineEmits<{
  submit: [{ answers: boolean[], assignedGender: boolean }]
}>()

const flow = useTestFlow()
const stageRef = useTemplateRef<HTMLElement>('stage')

const totalQuestions = flow.answers.value.length
const isDev = import.meta.env.DEV
const currentIndex = flow.currentIndex
const answeredQuestionCount = flow.answeredQuestionCount
const canSubmit = flow.canSubmit
const currentItem = flow.currentItem
const previousItem = flow.previousItem
const nextItem = flow.nextItem
const isReviewStep = flow.isReviewStep

const styles = defineStyleX({
  shell: {
    minBlockSize: '100vh',
    paddingBlock: spacing.xxl,
    paddingInline: {
      default: spacing.md,
      [breakpoints.md]: spacing.xxl,
    },
    backgroundColor: colors.pageBg,
    backgroundImage: `radial-gradient(circle at top, ${colors.pageGlow}, transparent 38%)`,
  },
  content: {
    maxInlineSize: '1120px',
    marginInline: 'auto',
    display: 'grid',
    gap: spacing.xl,
  },
  header: {
    display: 'grid',
    gap: spacing.sm,
  },
  heading: {
    margin: '0',
    color: colors.textPrimary,
    fontFamily: type.readingFamily,
    fontSize: type.title,
    lineHeight: '1.08',
  },
  subheading: {
    margin: '0',
    color: colors.textSecondary,
    fontFamily: type.uiFamily,
    fontSize: type.body,
    lineHeight: '1.5',
    maxInlineSize: '720px',
  },
  progressRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
    color: colors.textSecondary,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
  },
  progressTrack: {
    inlineSize: '100%',
    blockSize: '10px',
    overflow: 'hidden',
    borderRadius: radius.pill,
    backgroundColor: colors.progressTrack,
    boxShadow: shadow.soft,
  },
  progressFill: {
    blockSize: '100%',
    backgroundColor: colors.progressFill,
    borderRadius: radius.pill,
    transitionProperty: 'width',
    transitionDuration: motion.medium,
    transitionTimingFunction: motion.standard,
  },
  stage: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    gap: spacing.xxs,
    outline: 'none',
  },
  controls: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  controlGroup: {
    display: 'flex',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  button: {
    'minBlockSize': '52px',
    'borderRadius': radius.pill,
    'border': `1px solid ${colors.borderStrong}`,
    'backgroundColor': colors.surfaceStrong,
    'color': colors.textSecondary,
    'paddingBlock': spacing.sm,
    'paddingInline': spacing.lg,
    'fontFamily': type.uiFamily,
    'fontSize': type.meta,
    'cursor': 'pointer',
    ':focus-visible': {
      outline: `3px solid ${colors.focusRing}`,
      outlineOffset: '2px',
    },
  },
  primaryButton: {
    backgroundColor: colors.textPrimary,
    color: colors.surfaceStrong,
    border: 'none',
  },
  buttonDisabled: {
    opacity: '0.38',
    cursor: 'not-allowed',
  },
  hint: {
    margin: '0',
    color: colors.textMuted,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
    lineHeight: '1.5',
  },
  debug: {
    justifySelf: 'start',
  },
})

const progressPercent = computed(() => `${(answeredQuestionCount.value / totalQuestions) * 100}%`)
const currentStepLabel = computed(() => getStepLabel(currentItem.value))
const canMoveNext = computed(() => flow.canAdvanceFrom())

watch(
  () => currentIndex.value,
  async () => {
    await nextTick()
    stageRef.value?.focus()
  },
  { immediate: true },
)

function getStepLabel(item: TestFlowItem | null) {
  if (!item) {
    return '完成'
  }

  if (item.kind === 'gender') {
    return '开始设置'
  }

  return `问题 ${item.questionNumber} / ${totalQuestions}`
}

function handleAnswer(value: boolean) {
  flow.confirmCurrentAnswer(value)
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    handleAnswer(false)
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    handleAnswer(true)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    flow.goPrevious()
    return
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    flow.goNext()
    return
  }

  if (event.key === 'Backspace') {
    event.preventDefault()
    flow.clearCurrentAnswer()
  }
}

function handleSubmit() {
  if (!canSubmit.value || flow.assignedGender.value === null) {
    return
  }

  emit('submit', {
    answers: flow.answers.value as boolean[],
    assignedGender: flow.assignedGender.value,
  })
}

function handleRandomFill() {
  flow.assignedGender.value = Math.random() > 0.5
  flow.answers.value = flow.answers.value.map(() => Math.random() > 0.5)
  flow.setCurrentIndex(flow.reviewIndex)
}
</script>

<template>
  <section v-stylex="styles.shell">
    <div v-stylex="styles.content">
      <header v-stylex="styles.header">
        <h1 v-stylex="styles.heading">
          MeowPI 测验
        </h1>
        <p v-stylex="styles.subheading">
          一次只回答一张卡片。向左或向右拖动卡片即可作答，也可以点击按钮或使用方向键。
        </p>
        <div v-stylex="styles.progressRow">
          <span>{{ currentStepLabel }}</span>
          <span>已完成 {{ answeredQuestionCount }} / {{ totalQuestions }}</span>
        </div>
        <div v-stylex="styles.progressTrack" aria-hidden="true">
          <div v-stylex="styles.progressFill" :style="{ width: progressPercent }" />
        </div>
      </header>

      <div
        ref="stage"
        v-stylex="styles.stage"
        tabindex="0"
        @keydown="handleKeydown"
      >
        <TestCardPreview
          v-if="previousItem"
          :answer="previousItem.answer"
          :negative-label="previousItem.negativeLabel"
          :positive-label="previousItem.positiveLabel"
          :prompt="previousItem.prompt"
          :step-label="getStepLabel(previousItem)"
          position="previous"
        />

        <TestQuestionCard
          v-if="currentItem"
          :answer="currentItem.answer"
          :negative-label="currentItem.negativeLabel"
          :positive-label="currentItem.positiveLabel"
          :prompt="currentItem.prompt"
          :step-label="getStepLabel(currentItem)"
          @answer="handleAnswer"
          @clear="flow.clearCurrentAnswer"
        />
        <TestReviewCard
          v-else-if="isReviewStep"
          :answered-count="answeredQuestionCount"
          :can-submit="canSubmit"
          :total-questions="totalQuestions"
          @back="flow.goPrevious"
          @submit="handleSubmit"
        />

        <TestCardPreview
          v-if="nextItem"
          :answer="nextItem.answer"
          :negative-label="nextItem.negativeLabel"
          :positive-label="nextItem.positiveLabel"
          :prompt="nextItem.prompt"
          :step-label="getStepLabel(nextItem)"
          position="next"
        />
      </div>

      <div v-stylex="styles.controls">
        <div v-stylex="styles.controlGroup">
          <button
            v-stylex="[styles.button, currentIndex === 0 && styles.buttonDisabled]"
            :disabled="currentIndex === 0"
            type="button"
            @click="flow.goPrevious"
          >
            上一张
          </button>
          <button
            v-if="currentItem"
            v-stylex="[styles.button, styles.primaryButton, !canMoveNext && styles.buttonDisabled]"
            :disabled="!canMoveNext"
            type="button"
            @click="flow.goNext"
          >
            下一张
          </button>
        </div>

        <p v-stylex="styles.hint">
          键盘：← 否，→ 是，↑ 上一张，↓ 下一张，Backspace 清除。
        </p>
      </div>

      <button
        v-if="isDev"
        v-stylex="[styles.button, styles.debug]"
        type="button"
        @click="handleRandomFill"
      >
        随机填充
      </button>
    </div>
  </section>
</template>
