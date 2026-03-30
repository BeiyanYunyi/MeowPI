<script setup lang="ts">
import { colors, motion, radius, shadow, spacing, type } from '#/tokens.stylex'
import { useDraggable } from '@vueuse/core'
import { computed, shallowRef, useTemplateRef } from 'vue'
import { getSwipeAnswer } from './swipe'

const props = defineProps<{
  answer: boolean | null
  negativeLabel: string
  positiveLabel: string
  prompt: string
  stepLabel: string
}>()

const emit = defineEmits<{
  answer: [value: boolean]
  clear: []
}>()

const cardRef = useTemplateRef<HTMLElement>('card')
const dragStartLeft = shallowRef(0)
const dragOffsetX = shallowRef(0)

const styles = defineStyleX({
  card: {
    position: 'relative',
    inlineSize: '100%',
    maxInlineSize: '720px',
    marginInline: 'auto',
    borderRadius: radius.lg,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceStrong,
    boxShadow: shadow.strong,
    paddingBlock: spacing.xl,
    paddingInline: spacing.lg,
    userSelect: 'none',
    touchAction: 'pan-y',
    outlineWidth: '0',
    outlineStyle: 'none',
    outlineColor: 'transparent',
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBlockEnd: spacing.lg,
    color: colors.textMuted,
    fontFamily: type.uiFamily,
    fontSize: type.eyebrow,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  prompt: {
    marginBlockStart: 0,
    marginBlockEnd: '32px',
    marginInline: 0,
    color: colors.textPrimary,
    fontFamily: type.readingFamily,
    fontSize: type.question,
    lineHeight: '1.38',
  },
  options: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: spacing.md,
    marginBlockEnd: spacing.lg,
  },
  option: {
    'display': 'flex',
    'justifyContent': 'space-between',
    'alignItems': 'center',
    'gap': spacing.md,
    'inlineSize': '100%',
    'minBlockSize': '64px',
    'paddingBlock': spacing.md,
    'paddingInline': spacing.lg,
    'borderRadius': radius.md,
    'borderWidth': '1px',
    'borderStyle': 'solid',
    'borderColor': colors.borderSoft,
    'backgroundColor': colors.surface,
    'color': colors.textPrimary,
    'fontFamily': type.uiFamily,
    'fontSize': type.body,
    'textAlign': 'start',
    'cursor': 'pointer',
    'transitionProperty': 'transform, background-color, border-color, box-shadow',
    'transitionDuration': motion.fast,
    'transitionTimingFunction': motion.standard,
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadow.soft,
    },
    ':focus-visible': {
      outlineWidth: '3px',
      outlineStyle: 'solid',
      outlineColor: colors.focusRing,
      outlineOffset: '2px',
    },
  },
  optionPositive: {
    backgroundColor: colors.yesSoft,
    borderColor: colors.yes,
  },
  optionNegative: {
    backgroundColor: colors.noSoft,
    borderColor: colors.no,
  },
  keyHint: {
    borderRadius: radius.pill,
    paddingBlock: spacing.xxs,
    paddingInline: spacing.sm,
    backgroundColor: colors.surfaceAccent,
    color: colors.textSecondary,
    fontSize: type.eyebrow,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  helper: {
    margin: '0',
    color: colors.textSecondary,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
    lineHeight: '1.5',
  },
  clear: {
    'borderWidth': '1px',
    'borderStyle': 'solid',
    'borderColor': colors.borderStrong,
    'borderRadius': radius.pill,
    'backgroundColor': colors.surfaceStrong,
    'color': colors.textSecondary,
    'paddingBlock': spacing.xs,
    'paddingInline': spacing.md,
    'fontFamily': type.uiFamily,
    'fontSize': type.meta,
    'cursor': 'pointer',
    'transitionProperty': 'transform, background-color, border-color, box-shadow',
    'transitionDuration': motion.fast,
    'transitionTimingFunction': motion.standard,
    ':focus-visible': {
      outlineWidth: '3px',
      outlineStyle: 'solid',
      outlineColor: colors.focusRing,
      outlineOffset: '2px',
    },
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: shadow.soft,
    },
  },
})

const { isDragging, position } = useDraggable(cardRef, {
  initialValue: { x: 0, y: 0 },
  axis: 'x',
  onStart() {
    dragStartLeft.value = cardRef.value?.getBoundingClientRect().left ?? 0
    dragOffsetX.value = 0
  },
  onMove(nextPosition) {
    dragOffsetX.value = nextPosition.x - dragStartLeft.value
  },
  onEnd(endPosition) {
    const swipeAnswer = getSwipeAnswer(dragOffsetX.value)
    if (swipeAnswer !== null) {
      emit('answer', swipeAnswer)
    }

    dragOffsetX.value = 0

    if (endPosition.x !== 0) {
      position.value = { x: 0, y: 0 }
    }
  },
})

const cardStyle = computed(() => ({
  transform: `translate(${dragOffsetX.value}px, 0px) rotate(${dragOffsetX.value / 42}deg)`,
  transition: isDragging.value ? 'none' : `transform ${motion.medium} ${motion.standard}`,
}))

const answerStatus = computed(() => {
  if (props.answer === true) {
    return `当前选择：${props.positiveLabel}`
  }

  if (props.answer === false) {
    return `当前选择：${props.negativeLabel}`
  }

  return '当前未作答'
})
</script>

<template>
  <article
    ref="card"
    v-stylex="styles.card"
    :style="cardStyle"
  >
    <div v-stylex="styles.meta">
      <span>{{ stepLabel }}</span>
      <span>{{ answerStatus }}</span>
    </div>
    <h2 v-stylex="styles.prompt">
      {{ prompt }}
    </h2>
    <div v-stylex="styles.options">
      <button
        v-stylex="[styles.option, answer === false && styles.optionNegative]"
        :aria-pressed="answer === false"
        type="button"
        @click="emit('answer', false)"
      >
        <span v-stylex="styles.keyHint">←</span>
        <span>{{ negativeLabel }}</span>
      </button>
      <div />
      <button
        v-stylex="[styles.option, answer === true && styles.optionPositive]"
        :aria-pressed="answer === true"
        type="button"
        @click="emit('answer', true)"
      >
        <span>{{ positiveLabel }}</span>
        <span v-stylex="styles.keyHint">→</span>
      </button>
    </div>
    <div v-stylex="styles.footer">
      <p v-stylex="styles.helper">
        左滑选 {{ positiveLabel }}，右滑选 {{ negativeLabel }}，也可以直接点击或使用方向键。
      </p>
      <button v-stylex="styles.clear" type="button" @click="emit('clear')">
        清除
      </button>
    </div>
  </article>
</template>
