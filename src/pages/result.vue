<script setup lang="ts">
import type {
  AnalyzeScoreResult,
  BaseScaleKey,
  ResultPagePayload,
} from '#/data'
import { breakpoints } from '#/breakpoints.stylex'
import { colors, radius, report, shadow, size, spacing, type } from '#/tokens.stylex'
import { Gender } from '#/utils/gender'
import { decodeResultPayload } from '#/utils/resultPayload'
import { axisBottom, axisLeft, line, range, scaleLinear, scalePoint, select } from 'd3'
import { computed, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'

interface ChartDatum {
  key: string
  label: string
  value: number
  section: 'validity' | 'clinical' | 'extra'
}

interface TableRow {
  key: BaseScaleKey
  rawScore: number
  standardScore: number
  correctedScore: number | null
}

const SCALE_LABELS = {
  'Q*': '疑问分 Q*',
  'L': '谎分 L',
  'F': '诈病分数 F',
  'K': '校正分数 K',
  'Hs': '疑病 Hs',
  'D': '抑郁 D',
  'Hy': '癔病 Hy',
  'Pd': '精神病态 Pd',
  'Pa': '妄想狂 Pa',
  'Pt': '精神衰弱 Pt',
  'Sc': '精神分裂症 Sc',
  'Ma': '轻躁狂 Ma',
  'Si': '社会内向性 Si',
  'Mas': '外显性焦虑 Mas',
  'Dy': '依赖性 Dy',
  'Do': '支配性 Do',
  'Re': '社会责任感 Re',
  'Cn': '控制 Cn',
} as const

const BASE_SCALE_ORDER = [
  'Q*',
  'L',
  'F',
  'K',
  'Hs',
  'D',
  'Hy',
  'Pd',
  'Mf',
  'Pa',
  'Pt',
  'Sc',
  'Ma',
  'Si',
  'Mas',
  'Dy',
  'Do',
  'Re',
  'Cn',
] as const satisfies readonly BaseScaleKey[]

const CORRECTED_SCALE_MAP: Partial<Record<BaseScaleKey, keyof ResultPagePayload['calculateScoreResult']['proPoint']>> = {
  Hs: 'Hs+0.5K',
  Pd: 'Pd+0.4K',
  Pt: 'Pt+1.0K',
  Sc: 'Sc+1.0K',
  Ma: 'Ma+0.2K',
}

const TWO_POINT_TO_CLINICAL_KEY: Record<string, keyof AnalyzeScoreResult['clinical']> = {
  1: 'Hs-1',
  2: 'D-2',
  3: 'Hy-3',
  4: 'Pd-4',
  5: 'Mf-5',
  6: 'Pa-6',
  7: 'Pt-7',
  8: 'Sc-8',
  9: 'Ma-9',
  0: 'Si-0',
}

const route = useRoute()
const chartRef = useTemplateRef<SVGSVGElement>('chart')

const parsedResult = computed(() => {
  const data = route.query.data
  if (typeof data !== 'string') {
    return { payload: null, error: '未提供测验结果数据。' }
  }

  try {
    return { payload: decodeResultPayload(data), error: '' }
  }
  catch {
    return { payload: null, error: '测验结果数据无效，或无法完成解析。' }
  }
})

const payload = computed(() => parsedResult.value.payload)
const errorMessage = computed(() => parsedResult.value.error)

function getScaleLabel(key: BaseScaleKey) {
  if (key === 'Mf') {
    return payload.value?.gender === Gender.MALE ? '女子气 Mf' : '男子气 Mf'
  }

  return SCALE_LABELS[key]
}

const chartData = computed<ChartDatum[]>(() => {
  if (!payload.value) {
    return []
  }

  return [
    { key: 'L', label: getScaleLabel('L'), value: payload.value.analyzeScoreResult.validity.L, section: 'validity' },
    { key: 'F', label: getScaleLabel('F'), value: payload.value.analyzeScoreResult.validity.F, section: 'validity' },
    { key: 'K', label: getScaleLabel('K'), value: payload.value.analyzeScoreResult.validity.K, section: 'validity' },
    { key: 'Hs-1', label: getScaleLabel('Hs'), value: payload.value.analyzeScoreResult.clinical['Hs-1'], section: 'clinical' },
    { key: 'D-2', label: getScaleLabel('D'), value: payload.value.analyzeScoreResult.clinical['D-2'], section: 'clinical' },
    { key: 'Hy-3', label: getScaleLabel('Hy'), value: payload.value.analyzeScoreResult.clinical['Hy-3'], section: 'clinical' },
    { key: 'Pd-4', label: getScaleLabel('Pd'), value: payload.value.analyzeScoreResult.clinical['Pd-4'], section: 'clinical' },
    { key: 'Mf-5', label: getScaleLabel('Mf'), value: payload.value.analyzeScoreResult.clinical['Mf-5'], section: 'clinical' },
    { key: 'Pa-6', label: getScaleLabel('Pa'), value: payload.value.analyzeScoreResult.clinical['Pa-6'], section: 'clinical' },
    { key: 'Pt-7', label: getScaleLabel('Pt'), value: payload.value.analyzeScoreResult.clinical['Pt-7'], section: 'clinical' },
    { key: 'Sc-8', label: getScaleLabel('Sc'), value: payload.value.analyzeScoreResult.clinical['Sc-8'], section: 'clinical' },
    { key: 'Ma-9', label: getScaleLabel('Ma'), value: payload.value.analyzeScoreResult.clinical['Ma-9'], section: 'clinical' },
    { key: 'Si-0', label: getScaleLabel('Si'), value: payload.value.analyzeScoreResult.clinical['Si-0'], section: 'clinical' },
    { key: 'Mas', label: getScaleLabel('Mas'), value: payload.value.analyzeScoreResult.extra.Mas, section: 'extra' },
    { key: 'Dy', label: getScaleLabel('Dy'), value: payload.value.analyzeScoreResult.extra.Dy, section: 'extra' },
    { key: 'Do', label: getScaleLabel('Do'), value: payload.value.analyzeScoreResult.extra.Do, section: 'extra' },
    { key: 'Re', label: getScaleLabel('Re'), value: payload.value.analyzeScoreResult.extra.Re, section: 'extra' },
    { key: 'Cn', label: getScaleLabel('Cn'), value: payload.value.analyzeScoreResult.extra.Cn, section: 'extra' },
  ]
})

const highlightedClinicalPeaks = computed(() => {
  if (!payload.value) {
    return []
  }

  return payload.value.analyzeScoreResult.twoPoint
    .split('')
    .map((code, index) => {
      const normalized = TWO_POINT_TO_CLINICAL_KEY[code]
      return {
        label: index === 0 ? 'max1' : 'max2',
        key: normalized,
        value: payload.value!.analyzeScoreResult.clinical[normalized],
      }
    })
})

const tableRows = computed<TableRow[]>(() => {
  if (!payload.value) {
    return []
  }

  return BASE_SCALE_ORDER.map((key) => {
    const correctedKey = CORRECTED_SCALE_MAP[key]
    return {
      key,
      rawScore: payload.value!.calculateScoreResult.oriPoint[key],
      standardScore: payload.value!.calculateScoreResult.proPoint[key],
      correctedScore: correctedKey ? payload.value!.calculateScoreResult.proPoint[correctedKey] : null,
    }
  })
})

watch(
  [chartRef, chartData, highlightedClinicalPeaks],
  ([svgElement, points, highlights]) => {
    if (!svgElement) {
      return
    }

    const svg = select(svgElement)
    svg.selectAll('*').remove()

    if (!points.length) {
      return
    }

    const width = 960
    const height = 440
    const margin = { top: 28, right: 36, bottom: 76, left: 48 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('role', 'img')
      .attr('aria-label', 'MeowPI 折线图')

    const root = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)
    const x = scalePoint()
      .domain(points.map(point => point.key))
      .range([0, innerWidth])
      .padding(0.45)
    const y = scaleLinear()
      .domain([0, 120])
      .range([innerHeight, 0])

    root.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', report.chartSurface)
      .attr('stroke', report.chartFrame)

    ;[50, 60, 70].forEach((guide) => {
      root.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y(guide))
        .attr('y2', y(guide))
        .attr('stroke', guide === 60 ? report.chartGuideMuted : report.chartGuide)
        .attr('stroke-dasharray', guide === 60 ? '6 6' : null)
        .attr('stroke-width', guide === 70 ? 1.5 : 1)
    })

    const separatorPositions = ['K', 'Si-0', 'Mf-5']
    separatorPositions.forEach((key) => {
      const xPos = x(key)
      if (xPos === undefined) {
        return
      }

      const offset = key === 'K' || key === 'Si-0' ? innerWidth / 34 : 0
      root.append('line')
        .attr('x1', xPos + offset)
        .attr('x2', xPos + offset)
        .attr('y1', 0)
        .attr('y2', innerHeight)
        .attr('stroke', key === 'Mf-5' ? report.chartAlert : report.chartSeparator)
        .attr('stroke-dasharray', key === 'Mf-5' ? '6 6' : null)
    })

    root.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', report.chartProfile)
      .attr('stroke-width', 2.5)
      .attr('d', line<ChartDatum>()
        .x((point: ChartDatum) => x(point.key) ?? 0)
        .y((point: ChartDatum) => y(point.value)))

    root.selectAll('circle.point')
      .data(points)
      .join('circle')
      .attr('class', 'point')
      .attr('cx', (point: ChartDatum) => x(point.key) ?? 0)
      .attr('cy', (point: ChartDatum) => y(point.value))
      .attr('r', 4.5)
      .attr('fill', report.chartProfile)

    root.selectAll('circle.highlight')
      .data(highlights)
      .join('circle')
      .attr('class', 'highlight')
      .attr('cx', (point: { key: string, value: number }) => x(point.key) ?? 0)
      .attr('cy', (point: { key: string, value: number }) => y(point.value))
      .attr('r', 6)
      .attr('fill', report.chartAlert)

    root.selectAll('text.highlight-label')
      .data(highlights)
      .join('text')
      .attr('class', 'highlight-label')
      .attr('x', (point: { key: string, value: number }) => (x(point.key) ?? 0) + 8)
      .attr('y', (point: { key: string, value: number }) => y(point.value) - 10)
      .attr('fill', report.chartAlert)
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text((point: { label: string }) => point.label)

    root.append('g')
      .call(axisLeft(y).tickValues(range(0, 121, 10)))
      .call((axis: any) => axis.select('.domain').attr('stroke', report.chartAxis))
      .call((axis: any) => axis.selectAll('.tick line').attr('stroke', report.chartFrame))

    const xAxis = root.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(axisBottom(x).tickSize(0))

    xAxis.select('.domain').attr('stroke', report.chartAxis)
    xAxis.selectAll('.tick text')
      .attr('fill', report.chartAxis)
      .attr('font-size', 12)
      .attr('text-anchor', 'end')
      .attr('dx', '-0.45em')
      .attr('dy', '0.35em')
      .attr('transform', 'rotate(-38)')
      .each(function renderLabel(this, pointKey) {
        const label = points.find(point => point.key === pointKey)?.label ?? String(pointKey)
        const text = select(this)
        text.text('')
        text.text(label)
      })
  },
  { immediate: true },
)

const styles = defineStyleX({
  page: {
    minBlockSize: '100vh',
    backgroundColor: colors.pageBg,
    backgroundImage: `radial-gradient(circle at top, ${colors.pageGlow}, transparent 40%)`,
    color: colors.textPrimary,
    paddingBlock: {
      default: spacing.lg,
      [breakpoints.md]: spacing.xxl,
    },
    paddingInline: {
      default: spacing.md,
      [breakpoints.md]: spacing.xxl,
    },
  },
  shell: {
    maxInlineSize: size.contentMax,
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  hero: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    alignItems: 'end',
  },
  eyebrow: {
    margin: 0,
    color: colors.textMuted,
    fontFamily: type.uiFamily,
    fontSize: type.eyebrow,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  title: {
    marginBlockStart: spacing.xs,
    marginBlockEnd: 0,
    marginInline: 0,
    color: colors.textPrimary,
    fontFamily: type.readingFamily,
    fontSize: type.title,
    lineHeight: 1.1,
  },
  summaryCard: {
    minInlineSize: '220px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderSoft,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceStrong,
    boxShadow: shadow.soft,
    paddingBlock: spacing.md,
    paddingInline: spacing.md,
  },
  summaryLabel: {
    margin: 0,
    color: colors.textMuted,
    fontFamily: type.uiFamily,
    fontSize: type.eyebrow,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  summaryValue: {
    marginBlockStart: spacing.xs,
    marginBlockEnd: 0,
    marginInline: 0,
    color: colors.textPrimary,
    fontFamily: type.readingFamily,
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: '1',
  },
  card: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    boxShadow: shadow.soft,
    overflow: 'hidden',
  },
  cardHeader: {
    paddingBlockStart: spacing.md,
    paddingBlockEnd: 0,
    paddingInline: spacing.md,
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: report.dividerSoft,
  },
  cardTitle: {
    marginBlockStart: 0,
    marginBlockEnd: spacing.md,
    marginInline: 0,
    color: colors.textPrimary,
    fontFamily: type.readingFamily,
    fontSize: '20px',
    lineHeight: '1.2',
  },
  cardBody: {
    paddingBlockStart: spacing.md,
    paddingBlockEnd: spacing.lg,
    paddingInline: spacing.md,
  },
  chartWrap: {
    overflowX: 'auto',
  },
  chart: {
    width: '100%',
    minInlineSize: '860px',
    display: 'block',
  },
  note: {
    marginBlockStart: spacing.sm,
    marginBlockEnd: 0,
    marginInline: 0,
    color: colors.textSecondary,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
    lineHeight: '1.5',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    minWidth: '720px',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    color: colors.textSecondary,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
    fontWeight: 600,
    paddingBlock: spacing.sm,
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: report.dividerSoft,
  },
  td: {
    color: colors.textPrimary,
    fontFamily: type.uiFamily,
    fontSize: type.meta,
    paddingBlock: spacing.sm,
    borderBlockEndWidth: '1px',
    borderBlockEndStyle: 'solid',
    borderBlockEndColor: report.dividerMuted,
    fontVariantNumeric: 'tabular-nums',
  },
  empty: {
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceStrong,
    boxShadow: shadow.soft,
    padding: spacing.lg,
  },
  emptyTitle: {
    marginBlockStart: 0,
    marginBlockEnd: spacing.sm,
    marginInline: 0,
    color: colors.textPrimary,
    fontFamily: type.readingFamily,
    fontSize: '24px',
    lineHeight: '1.2',
  },
  emptyText: {
    marginBlockStart: 0,
    marginBlockEnd: 0,
    marginInline: 0,
    color: colors.textSecondary,
    fontFamily: type.uiFamily,
    fontSize: type.body,
    lineHeight: '1.6',
  },
})
</script>

<template>
  <section v-stylex="styles.page">
    <div v-stylex="styles.shell">
      <template v-if="payload">
        <header v-stylex="styles.hero">
          <div>
            <p v-stylex="styles.eyebrow">
              MeowPI 结果
            </p>
            <h1 v-stylex="styles.title">
              结果概览
            </h1>
          </div>
          <div v-stylex="styles.summaryCard">
            <p v-stylex="styles.summaryLabel">
              两点编码
            </p>
            <p v-stylex="styles.summaryValue">
              {{ payload.analyzeScoreResult.twoPoint }}
            </p>
          </div>
        </header>

        <section v-stylex="styles.card">
          <div v-stylex="styles.cardHeader">
            <h2 v-stylex="styles.cardTitle">
              折线图
            </h2>
          </div>
          <div v-stylex="styles.cardBody">
            <div v-stylex="styles.chartWrap">
              <svg ref="chart" v-stylex="styles.chart" />
            </div>
            <p v-stylex="styles.note">
              绘图时采用 K 校正后的分数。
            </p>
          </div>
        </section>

        <section v-stylex="styles.card">
          <div v-stylex="styles.cardHeader">
            <h2 v-stylex="styles.cardTitle">
              分数表
            </h2>
          </div>
          <div v-stylex="styles.cardBody">
            <div v-stylex="styles.tableWrap">
              <table v-stylex="styles.table">
                <thead>
                  <tr>
                    <th v-stylex="styles.th" scope="col">
                      量表
                    </th>
                    <th v-stylex="styles.th" scope="col">
                      原始分
                    </th>
                    <th v-stylex="styles.th" scope="col">
                      标准分
                    </th>
                    <th v-stylex="styles.th" scope="col">
                      K 校正分
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in tableRows" :key="row.key">
                    <td v-stylex="styles.td">
                      {{ getScaleLabel(row.key) }}
                    </td>
                    <td v-stylex="styles.td">
                      {{ row.rawScore }}
                    </td>
                    <td v-stylex="styles.td">
                      {{ row.standardScore }}
                    </td>
                    <td v-stylex="styles.td">
                      {{ row.correctedScore ?? '' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </template>

      <section v-else v-stylex="styles.empty">
        <h1 v-stylex="styles.emptyTitle">
          无法显示结果
        </h1>
        <p v-stylex="styles.emptyText">
          {{ errorMessage }}
        </p>
      </section>
    </div>
  </section>
</template>
