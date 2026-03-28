<script setup lang="ts">
import type {
  AnalyzeScoreResult,
  BaseScaleKey,
  ResultPagePayload,
} from '#/data'
import { decodeResultPayload } from '#/utils/resultPayload'
import * as d3 from 'd3'
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
    return { payload: null, error: 'No result payload was provided.' }
  }

  try {
    return { payload: decodeResultPayload(data), error: '' }
  }
  catch {
    return { payload: null, error: 'The result payload is invalid or could not be decoded.' }
  }
})

const payload = computed(() => parsedResult.value.payload)
const errorMessage = computed(() => parsedResult.value.error)

const chartData = computed<ChartDatum[]>(() => {
  if (!payload.value) {
    return []
  }

  return [
    { key: 'L', label: 'L', value: payload.value.analyzeScoreResult.validity.L, section: 'validity' },
    { key: 'F', label: 'F', value: payload.value.analyzeScoreResult.validity.F, section: 'validity' },
    { key: 'K', label: 'K', value: payload.value.analyzeScoreResult.validity.K, section: 'validity' },
    { key: 'Hs-1', label: 'Hs\n1', value: payload.value.analyzeScoreResult.clinical['Hs-1'], section: 'clinical' },
    { key: 'D-2', label: 'D\n2', value: payload.value.analyzeScoreResult.clinical['D-2'], section: 'clinical' },
    { key: 'Hy-3', label: 'Hy\n3', value: payload.value.analyzeScoreResult.clinical['Hy-3'], section: 'clinical' },
    { key: 'Pd-4', label: 'Pd\n4', value: payload.value.analyzeScoreResult.clinical['Pd-4'], section: 'clinical' },
    { key: 'Mf-5', label: 'Mf\n5', value: payload.value.analyzeScoreResult.clinical['Mf-5'], section: 'clinical' },
    { key: 'Pa-6', label: 'Pa\n6', value: payload.value.analyzeScoreResult.clinical['Pa-6'], section: 'clinical' },
    { key: 'Pt-7', label: 'Pt\n7', value: payload.value.analyzeScoreResult.clinical['Pt-7'], section: 'clinical' },
    { key: 'Sc-8', label: 'Sc\n8', value: payload.value.analyzeScoreResult.clinical['Sc-8'], section: 'clinical' },
    { key: 'Ma-9', label: 'Ma\n9', value: payload.value.analyzeScoreResult.clinical['Ma-9'], section: 'clinical' },
    { key: 'Si-0', label: 'Si\n0', value: payload.value.analyzeScoreResult.clinical['Si-0'], section: 'clinical' },
    { key: 'Mas', label: 'Mas', value: payload.value.analyzeScoreResult.extra.Mas, section: 'extra' },
    { key: 'Dy', label: 'Dy', value: payload.value.analyzeScoreResult.extra.Dy, section: 'extra' },
    { key: 'Do', label: 'Do', value: payload.value.analyzeScoreResult.extra.Do, section: 'extra' },
    { key: 'Re', label: 'Re', value: payload.value.analyzeScoreResult.extra.Re, section: 'extra' },
    { key: 'Cn', label: 'Cn', value: payload.value.analyzeScoreResult.extra.Cn, section: 'extra' },
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

    const svg = d3.select(svgElement)
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
      .attr('aria-label', 'MMPI profile chart')

    const root = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`)
    const x = d3.scalePoint()
      .domain(points.map(point => point.key))
      .range([0, innerWidth])
      .padding(0.45)
    const y = d3.scaleLinear()
      .domain([0, 120])
      .range([innerHeight, 0])

    root.append('rect')
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', '#fffdfa')
      .attr('stroke', '#d9cdbb')

    ;[50, 60, 70].forEach((guide) => {
      root.append('line')
        .attr('x1', 0)
        .attr('x2', innerWidth)
        .attr('y1', y(guide))
        .attr('y2', y(guide))
        .attr('stroke', guide === 60 ? '#8d6e63' : '#23201c')
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
        .attr('stroke', key === 'Mf-5' ? '#c0392b' : '#23201c')
        .attr('stroke-dasharray', key === 'Mf-5' ? '6 6' : null)
    })

    root.append('path')
      .datum(points)
      .attr('fill', 'none')
      .attr('stroke', '#22577a')
      .attr('stroke-width', 2.5)
      .attr('d', d3.line()
        .x((point: ChartDatum) => x(point.key) ?? 0)
        .y((point: ChartDatum) => y(point.value)))

    root.selectAll('circle.point')
      .data(points)
      .join('circle')
      .attr('class', 'point')
      .attr('cx', (point: ChartDatum) => x(point.key) ?? 0)
      .attr('cy', (point: ChartDatum) => y(point.value))
      .attr('r', 4.5)
      .attr('fill', '#22577a')

    root.selectAll('circle.highlight')
      .data(highlights)
      .join('circle')
      .attr('class', 'highlight')
      .attr('cx', (point: { key: string, value: number }) => x(point.key) ?? 0)
      .attr('cy', (point: { key: string, value: number }) => y(point.value))
      .attr('r', 6)
      .attr('fill', '#cf2f1d')

    root.selectAll('text.highlight-label')
      .data(highlights)
      .join('text')
      .attr('class', 'highlight-label')
      .attr('x', (point: { key: string, value: number }) => (x(point.key) ?? 0) + 8)
      .attr('y', (point: { key: string, value: number }) => y(point.value) - 10)
      .attr('fill', '#cf2f1d')
      .attr('font-size', 12)
      .attr('font-weight', 600)
      .text((point: { label: string }) => point.label)

    root.append('g')
      .call(d3.axisLeft(y).tickValues(d3.range(0, 121, 10)))
      .call((axis: any) => axis.select('.domain').attr('stroke', '#23201c'))
      .call((axis: any) => axis.selectAll('.tick line').attr('stroke', '#d9cdbb'))

    const xAxis = root.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(x).tickSize(0))

    xAxis.select('.domain').attr('stroke', '#23201c')
    xAxis.selectAll('.tick text')
      .attr('fill', '#23201c')
      .attr('font-size', 12)
      .each(function renderLabel(this: SVGTextElement, pointKey: string) {
        const label = points.find(point => point.key === pointKey)?.label ?? String(pointKey)
        const text = d3.select(this)
        const segments = label.split('\n')
        text.text('')
        segments.forEach((segment, index) => {
          text.append('tspan')
            .attr('x', 0)
            .attr('dy', index === 0 ? '0.8em' : '1.1em')
            .text(segment)
        })
      })
  },
  { immediate: true },
)

const styles = defineStyleX({
  page: {
    minHeight: '100vh',
    backgroundColor: '#f6f1e8',
    color: '#23201c',
    paddingBlock: '24px 48px',
    paddingInline: '20px',
  },
  shell: {
    maxWidth: '1120px',
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  hero: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: '16px',
    alignItems: 'end',
  },
  eyebrow: {
    margin: 0,
    fontSize: '13px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#7b6752',
  },
  title: {
    margin: '6px 0 0',
    fontSize: 'clamp(28px, 4vw, 44px)',
    lineHeight: 1.1,
  },
  summaryCard: {
    minWidth: '220px',
    border: '1px solid #d9cdbb',
    borderRadius: '18px',
    padding: '16px 18px',
    backgroundColor: '#fffdfa',
  },
  summaryLabel: {
    margin: 0,
    fontSize: '13px',
    color: '#7b6752',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  summaryValue: {
    margin: '6px 0 0',
    fontSize: '36px',
    fontWeight: 700,
  },
  card: {
    border: '1px solid #d9cdbb',
    borderRadius: '24px',
    backgroundColor: '#fffdfa',
    boxShadow: '0 18px 36px rgba(35, 32, 28, 0.08)',
    overflow: 'hidden',
  },
  cardHeader: {
    paddingBlock: '18px 0',
    paddingInline: '20px',
    borderBottom: '1px solid #ece3d6',
  },
  cardTitle: {
    margin: 0,
    fontSize: '20px',
  },
  cardBody: {
    paddingBlock: '20px 24px 24px',
    paddingInline: '20px',
  },
  chartWrap: {
    overflowX: 'auto',
  },
  chart: {
    width: '100%',
    minWidth: '860px',
    display: 'block',
  },
  note: {
    margin: '12px 0 0',
    color: '#7b6752',
    fontSize: '14px',
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
    fontSize: '14px',
    color: '#7b6752',
    paddingBlock: '12px',
    borderBottom: '1px solid #ece3d6',
  },
  td: {
    paddingBlock: '12px',
    borderBottom: '1px solid #f0e8dc',
    fontVariantNumeric: 'tabular-nums',
  },
  empty: {
    border: '1px solid #d9cdbb',
    borderRadius: '24px',
    backgroundColor: '#fffdfa',
    padding: '28px',
  },
  emptyTitle: {
    margin: 0,
    fontSize: '24px',
  },
  emptyText: {
    margin: '8px 0 0',
    color: '#7b6752',
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
              MMPI result profile
            </p>
            <h1 v-stylex="styles.title">
              Result overview
            </h1>
          </div>
          <div v-stylex="styles.summaryCard">
            <p v-stylex="styles.summaryLabel">
              Two-point code
            </p>
            <p v-stylex="styles.summaryValue">
              {{ payload.analyzeScoreResult.twoPoint }}
            </p>
          </div>
        </header>

        <section v-stylex="styles.card">
          <div v-stylex="styles.cardHeader">
            <h2 v-stylex="styles.cardTitle">
              Profile chart
            </h2>
          </div>
          <div v-stylex="styles.cardBody">
            <div v-stylex="styles.chartWrap">
              <svg ref="chart" v-stylex="styles.chart" />
            </div>
            <p v-stylex="styles.note">
              Clinical scores use the K-corrected profile where applicable, following the Python reference chart.
            </p>
          </div>
        </section>

        <section v-stylex="styles.card">
          <div v-stylex="styles.cardHeader">
            <h2 v-stylex="styles.cardTitle">
              Score table
            </h2>
          </div>
          <div v-stylex="styles.cardBody">
            <div v-stylex="styles.tableWrap">
              <table v-stylex="styles.table">
                <thead>
                  <tr>
                    <th v-stylex="styles.th" scope="col">
                      Scale
                    </th>
                    <th v-stylex="styles.th" scope="col">
                      Raw score
                    </th>
                    <th v-stylex="styles.th" scope="col">
                      Standard score
                    </th>
                    <th v-stylex="styles.th" scope="col">
                      K-corrected score
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in tableRows" :key="row.key">
                    <td v-stylex="styles.td">
                      {{ row.key }}
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
          Result unavailable
        </h1>
        <p v-stylex="styles.emptyText">
          {{ errorMessage }}
        </p>
      </section>
    </div>
  </section>
</template>
