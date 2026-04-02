<script setup lang="ts">
import { colors, motion, opacity, radius, shadow, spacing, type } from '#/tokens.stylex'

defineProps<{
  answer: boolean | null
  prompt: string
  stepLabel: string
  position: 'previous' | 'next'
  negativeLabel: string
  positiveLabel: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  navigate: [position: 'previous' | 'next']
}>()

const styles = defineStyleX({
  card: {
    'inlineSize': '100%',
    'marginInline': spacing.md,
    'maxInlineSize': '720px',
    'borderRadius': radius.md,
    'borderWidth': '1px',
    'borderStyle': 'solid',
    'borderColor': colors.borderSoft,
    'backgroundColor': colors.surfaceMuted,
    'boxShadow': shadow.soft,
    'paddingBlock': spacing.lg,
    'paddingInline': spacing.lg,
    'opacity': opacity.preview,
    'transitionProperty': 'transform, opacity, background-color, border-color, box-shadow',
    'transitionDuration': motion.medium,
    'transitionTimingFunction': motion.standard,
    'backdropFilter': 'blur(6px)',
    'textAlign': 'start',
    'cursor': 'pointer',
    ':hover:not(:disabled)': {
      transform: 'translateY(-2px)',
      backgroundColor: colors.surfaceStrong,
      borderColor: colors.borderStrong,
      boxShadow: shadow.strong,
      opacity: '1',
    },
    ':focus-visible': {
      backgroundColor: colors.surfaceStrong,
      borderColor: colors.borderStrong,
      boxShadow: shadow.strong,
      opacity: '1',
      outlineWidth: '3px',
      outlineStyle: 'solid',
      outlineColor: colors.focusRing,
      outlineOffset: '2px',
    },
    ':disabled': {
      cursor: 'not-allowed',
      opacity: opacity.disabled,
    },
  },
  meta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
    marginBlockEnd: spacing.sm,
    fontFamily: type.uiFamily,
    fontSize: type.eyebrow,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  prompt: {
    margin: '0',
    color: colors.textSecondary,
    fontFamily: type.readingFamily,
    fontSize: type.body,
    lineHeight: '1.5',
  },
  badge: {
    borderRadius: radius.pill,
    paddingBlock: spacing.xxs,
    paddingInline: spacing.sm,
    fontSize: type.eyebrow,
    backgroundColor: colors.pendingSoft,
    color: colors.pending,
  },
  badgeAnswered: {
    backgroundColor: colors.surfaceAccent,
    color: colors.textSecondary,
  },
  direction: {
    marginBlockStart: spacing.sm,
    marginBlockEnd: 0,
    marginInline: 0,
    color: colors.textMuted,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
    lineHeight: '1.5',
  },
})
</script>

<template>
  <button
    v-stylex="styles.card"
    :aria-label="`${position === 'previous' ? '跳转到上一题' : '跳转到下一题'}：${stepLabel}`"
    :disabled="disabled"
    type="button"
    @click="emit('navigate', position)"
  >
    <div v-stylex="styles.meta">
      <span>{{ stepLabel }}</span>
      <span v-stylex="[styles.badge, answer !== null && styles.badgeAnswered]">
        {{ answer === null ? '未作答' : `${answer ? positiveLabel : negativeLabel}` }}
      </span>
    </div>
    <p v-stylex="styles.prompt">
      {{ prompt }}
    </p>
    <p v-stylex="styles.direction">
      {{ position === 'previous' ? '点击返回上一题' : '点击前往下一题' }}
    </p>
  </button>
</template>
