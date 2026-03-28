import type { Gender } from '../utils/gender'

export type BaseScaleKey = (
  'Q*'
  | 'L'
  | 'F'
  | 'K'
  | 'Hs'
  | 'D'
  | 'Hy'
  | 'Pd'
  | 'Mf'
  | 'Pa'
  | 'Pt'
  | 'Sc'
  | 'Ma'
  | 'Si'
  | 'Mas'
  | 'Dy'
  | 'Do'
  | 'Re'
  | 'Cn'
)

export type CorrectedScaleKey = 'Hs+0.5K' | 'Pd+0.4K' | 'Pt+1.0K' | 'Sc+1.0K' | 'Ma+0.2K'

export type ProcessedScaleKey = BaseScaleKey | CorrectedScaleKey

export type ValidityScaleKey = 'L' | 'F' | 'K'

export type ClinicalScaleKey = 'Hs' | 'D' | 'Hy' | 'Pd' | 'Mf' | 'Pa' | 'Pt' | 'Sc' | 'Ma' | 'Si'

export type AdditionalScaleKey = 'Mas' | 'Dy' | 'Do' | 'Re' | 'Cn'

export interface ScaleScore {
  oriScore: number
  proScore: number
}

export type ScaleFn = (answers: boolean[], gender: Gender) => ScaleScore

export interface CalculateScoreResult {
  oriPoint: Record<BaseScaleKey, number>
  proPoint: Record<ProcessedScaleKey, number>
}

export type ScoreSeries<T extends string> = Record<T, number>

export interface AnalyzeScoreResult {
  twoPoint: `${number}${number}`
  validity: ScoreSeries<ValidityScaleKey>
  clinical: ScoreSeries<'Hs-1' | 'D-2' | 'Hy-3' | 'Pd-4' | 'Mf-5' | 'Pa-6' | 'Pt-7' | 'Sc-8' | 'Ma-9' | 'Si-0'>
  extra: ScoreSeries<AdditionalScaleKey>
}
