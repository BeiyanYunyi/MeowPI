import { defineConsts } from '@stylexjs/stylex'

export const breakpoints = defineConsts({
  sm: '@media (min-width: 320px)',
  md: '@media (min-width: 768px)',
  lg: '@media (min-width: 1080px)',
  xl: '@media (min-width: 2000px)',
})
