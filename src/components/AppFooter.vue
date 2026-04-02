<script setup lang="ts">
import { colors, size, spacing, type } from '#/tokens.stylex'

const styles = defineStyleX({
  footer: {
    backgroundColor: colors.pageBg,
    paddingBlockStart: spacing.sm,
    paddingBlockEnd: spacing.xl,
    paddingInline: spacing.md,
  },
  inner: {
    maxInlineSize: size.contentMax,
    marginInline: 'auto',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    color: colors.textMuted,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
    lineHeight: '1.6',
  },
  text: {
    margin: 0,
  },
  link: {
    'color': colors.textPrimary,
    'textDecorationLine': 'underline',
    'textUnderlineOffset': '0.18em',
    'textDecorationThickness': '1px',
    ':focus-visible': {
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: colors.focusRing,
      outlineOffset: '3px',
    },
  },
  license: {
    margin: 0,
  },
})
</script>

<template>
  <footer v-stylex="styles.footer">
    <div v-stylex="styles.inner">
      <p v-stylex="styles.text">
        Free software. Source on
        <a
          v-stylex="styles.link"
          href="https://github.com/BeiyanYunyi/MeowPI"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </p>
      <p v-stylex="styles.license">
        Licensed under AGPL-3.0
      </p>
    </div>
  </footer>
</template>
