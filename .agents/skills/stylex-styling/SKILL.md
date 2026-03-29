---
name: stylex-styling
description: StyleX styling system with project-specific design tokens, composable primitives, and custom v-stylex prop. MUST consult this skill before writing or modifying ANY styles in this project — the codebase uses custom design tokens, flex primitives, motion presets, and a v-stylex prop that differs from standard StyleX. Trigger whenever the user asks to create components, modify visual appearance, fix spacing/layout, add hover/focus effects, animations, responsive behavior, or anything involving CSS, styling, design tokens, breakpoints, or the v-stylex prop.
---

# StyleX Styling

This project uses StyleX for all styling. The system has three layers: **design tokens** for values, **design primitives** for multi-property patterns, and `defineStyleX` for component-specific styles. All styles are applied via a custom `v-stylex` prop.

## Quick Decision Guide

| Need                                                   | Use                           | Example                                         |
| ------------------------------------------------------ | ----------------------------- | ----------------------------------------------- |
| Single-property styling (color, spacing, font, border) | `defineStyleX`               | `color: #123456`                         |
| Pseudo-selectors (hover, focus)                        | `defineStyleX`               | `{ default: val, ":hover": hoverVal }`          |
| Responsive behavior                                    | `defineStylex` + breakpoints | `{ default: "none", [breakpoints.md]: "flex" }` |

## Custom `v-stylex` Prop

Use `v-stylex="styles.foo"` instead of `{...stylex.attrs(styles.foo)}`. This is transpiled by a custom Babel plugin.

```tsx
// Single style
<div v-stylex="styles.card">

// Composed — array of styles, primitives, and conditionals
<div v-stylex="[flex.row, styles.header, isActive && styles.active]">
```

## Design Tokens

Import from `#/tokens.stylex.ts`. Tokens include colors, spacing, typography, and more. Example:

```ts
import { colors, spacing } from "#/tokens.stylex";

const styles = stylex.create({
  card: {
    backgroundColor: colors.surface,
  },
});
```

## Breakpoints

Import from `#/breakpoints.stylex.ts`. Values: `sm` (320px), `md` (768px), `lg` (1080px), `xl` (2000px).

```ts
import { breakpoints } from "#/breakpoints.stylex";

const styles = stylex.create({
  grid: {
    display: { default: "none", [breakpoints.md]: "grid" },
    gridTemplateColumns: { default: "1fr", [breakpoints.lg]: "repeat(3, 1fr)" },
  },
});
```

## Example usage

```vue
<script setup lang="ts">
// no need to import defineStyleX, it's globally available
const styles = defineStyleX({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
})
</script>
<template>
  <div v-stylex="styles.container">
    <!-- content -->
  </div>
</template>
```

## Best Practices

1. **Always use the `v-stylex` prop** — never `{...stylex.props()}` or `{...stylex.attrs()}` directly.
2. **Conditional styles via arrays** — `v-stylex="[base, condition && conditional]"`
3. **Logical properties** — prefer `paddingBlock`/`paddingInline` over directional
4. **Pseudo-selectors as object keys** — `{ default: val, ":hover": hoverVal }`
