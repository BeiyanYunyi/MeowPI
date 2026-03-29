<script setup lang="ts">
import { colors, radius, shadow, spacing, type } from '#/tokens.stylex'

defineProps<{
  answeredCount: number
  totalQuestions: number
  canSubmit: boolean
}>()

const emit = defineEmits<{
  back: []
  submit: []
}>()

const styles = defineStyleX({
  card: {
    inlineSize: '100%',
    maxInlineSize: '720px',
    marginInline: 'auto',
    borderRadius: radius.lg,
    border: `1px solid ${colors.borderSoft}`,
    backgroundColor: colors.surfaceStrong,
    boxShadow: shadow.strong,
    paddingBlock: spacing.xl,
    paddingInline: spacing.lg,
  },
  eyebrow: {
    margin: '0 0 12px 0',
    color: colors.textMuted,
    fontFamily: type.uiFamily,
    fontSize: type.eyebrow,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    margin: '0 0 16px 0',
    color: colors.textPrimary,
    fontFamily: type.readingFamily,
    fontSize: type.title,
    lineHeight: '1.15',
  },
  body: {
    margin: '0 0 24px 0',
    color: colors.textSecondary,
    fontFamily: type.uiFamily,
    fontSize: type.body,
    lineHeight: '1.6',
  },
  status: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: spacing.sm,
    marginBlockEnd: spacing.lg,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAccent,
    color: colors.textPrimary,
    paddingBlock: spacing.xs,
    paddingInline: spacing.md,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
  },
  actions: {
    display: 'flex',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  secondary: {
    minBlockSize: '56px',
    borderRadius: radius.pill,
    border: `1px solid ${colors.borderStrong}`,
    backgroundColor: colors.surfaceStrong,
    color: colors.textSecondary,
    paddingBlock: spacing.sm,
    paddingInline: spacing.lg,
    fontFamily: type.uiFamily,
    fontSize: type.body,
    cursor: 'pointer',
  },
  primary: {
    minBlockSize: '56px',
    borderRadius: radius.pill,
    border: 'none',
    backgroundColor: colors.textPrimary,
    color: colors.surfaceStrong,
    paddingBlock: spacing.sm,
    paddingInline: spacing.xl,
    fontFamily: type.uiFamily,
    fontSize: type.body,
    cursor: 'pointer',
  },
  disabled: {
    opacity: '0.4',
    cursor: 'not-allowed',
  },
})
</script>

<template>
  <article v-stylex="styles.card">
    <p v-stylex="styles.eyebrow">
      完成检查
    </p>
    <h2 v-stylex="styles.title">
      所有问题已经走完，确认后提交结果。
    </h2>
    <p v-stylex="styles.body">
      你可以返回上一题修改答案。提交后将按当前作答内容计算量表分数。
    </p>
    <div v-stylex="styles.status">
      <span>{{ answeredCount }} / {{ totalQuestions }}</span>
      <span>{{ canSubmit ? '可提交' : '仍有缺失' }}</span>
    </div>
    <div v-stylex="styles.actions">
      <button v-stylex="styles.secondary" type="button" @click="emit('back')">
        返回检查
      </button>
      <button
        v-stylex="[styles.primary, !canSubmit && styles.disabled]"
        :disabled="!canSubmit"
        type="button"
        @click="emit('submit')"
      >
        提交测验
      </button>
    </div>
  </article>
</template>
