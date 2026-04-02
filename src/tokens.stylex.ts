import { defineConsts } from '@stylexjs/stylex'

export const colors = defineConsts({
  pageBg: '#f4ecdf',
  pageGlow: 'rgba(221, 156, 100, 0.18)',
  surface: '#fffaf2',
  surfaceStrong: '#fffdf8',
  surfaceMuted: 'rgba(255, 250, 242, 0.72)',
  surfaceAccent: '#f3e2cf',
  textPrimary: '#241a12',
  textSecondary: '#655548',
  textMuted: '#8d7c6f',
  borderSoft: 'rgba(65, 44, 24, 0.12)',
  borderStrong: 'rgba(65, 44, 24, 0.22)',
  focusRing: '#c96a3d',
  progressTrack: 'rgba(65, 44, 24, 0.1)',
  progressFill: '#241a12',
  yes: '#1f7a62',
  yesSoft: 'rgba(31, 122, 98, 0.12)',
  no: '#bd5f42',
  noSoft: 'rgba(189, 95, 66, 0.12)',
  pending: '#b1832f',
  pendingSoft: 'rgba(177, 131, 47, 0.14)',
})

export const report = defineConsts({
  chartSurface: '#fffdfa',
  chartFrame: '#d9cdbb',
  chartGuide: '#241a12',
  chartGuideMuted: '#8d7c6f',
  chartAxis: '#241a12',
  chartSeparator: '#241a12',
  chartAlert: '#cf2f1d',
  chartProfile: '#22577a',
  dividerSoft: '#ece3d6',
  dividerMuted: '#f0e8dc',
})

export const spacing = defineConsts({
  xxs: '4px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
})

export const radius = defineConsts({
  sm: '16px',
  md: '24px',
  lg: '32px',
  pill: '999px',
})

export const shadow = defineConsts({
  soft: '0 18px 42px rgba(65, 44, 24, 0.12)',
  strong: '0 28px 72px rgba(65, 44, 24, 0.16)',
})

export const motion = defineConsts({
  instant: '1ms',
  fast: '180ms',
  medium: '280ms',
  slow: '420ms',
  standard: 'cubic-bezier(0.22, 1, 0.36, 1)',
  gentle: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
})

export const opacity = defineConsts({
  muted: '0.42',
  preview: '0.56',
  disabled: '0.32',
})

export const size = defineConsts({
  contentMax: '1120px',
  cardWidth: 'min(100%, 720px)',
  cardMinHeight: '420px',
  cardStackGap: '136px',
  cardShiftX: '560px',
  actionHeight: '64px',
  actionMinWidth: '168px',
  stageMinHeight: '620px',
})

export const type = defineConsts({
  eyebrow: '13px',
  meta: '15px',
  body: '18px',
  title: 'clamp(1.9rem, 1.2rem + 2vw, 3.2rem)',
  question: 'clamp(1.5rem, 1.1rem + 1.4vw, 2.5rem)',
  number: 'clamp(1rem, 0.9rem + 0.45vw, 1.2rem)',
  readingFamily: '\'Iowan Old Style\', \'Palatino Linotype\', \'Noto Serif SC\', serif',
  uiFamily: '\'Avenir Next\', \'Segoe UI\', \'PingFang SC\', sans-serif',
})
