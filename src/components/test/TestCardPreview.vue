<script setup lang="ts">
import { colors, opacity, radius, shadow, spacing, type } from '#/tokens.stylex'

defineProps<{
  answer: boolean | null
  prompt: string
  stepLabel: string
  position: 'previous' | 'next'
  negativeLabel: string
  positiveLabel: string
}>()

const styles = defineStyleX({
  card: {
    inlineSize: '100%',
    marginInline: spacing.md,
    maxInlineSize: '720px',
    borderRadius: radius.md,
    border: `1px solid ${colors.borderSoft}`,
    backgroundColor: colors.surfaceMuted,
    boxShadow: shadow.soft,
    paddingBlock: spacing.lg,
    paddingInline: spacing.lg,
    opacity: opacity.preview,
    transitionProperty: 'transform, opacity',
    transitionDuration: '280ms',
    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
    backdropFilter: 'blur(6px)',
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
})
</script>

<template>
  <article
    v-stylex="styles.card"
    :aria-hidden="true"
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
  </article>
</template>
