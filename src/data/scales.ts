import type {
  AdditionalScaleKey,
  AnalyzeScoreResult,
  BaseScaleKey,
  CalculateScoreResult,
  ClinicalScaleKey,
  CorrectedScaleKey,
  ProcessedScaleKey,
  ScaleScore,
  ValidityScaleKey,
} from './types'
import { Gender } from '../utils/gender'
import { NormM, NormSD } from './norm'
import { question } from './question'

const VALIDITY_SCALE_LABELS = ['L', 'F', 'K'] as const satisfies readonly ValidityScaleKey[]
const CLINICAL_SCALE_LABELS = ['Hs-1', 'D-2', 'Hy-3', 'Pd-4', 'Mf-5', 'Pa-6', 'Pt-7', 'Sc-8', 'Ma-9', 'Si-0'] as const
const ADDITIONAL_SCALE_LABELS = ['Mas', 'Dy', 'Do', 'Re', 'Cn'] as const satisfies readonly AdditionalScaleKey[]
const BASE_SCALE_KEYS = ['Q*', 'L', 'F', 'K', 'Hs', 'D', 'Hy', 'Pd', 'Mf', 'Pa', 'Pt', 'Sc', 'Ma', 'Si', 'Mas', 'Dy', 'Do', 'Re', 'Cn'] as const satisfies readonly BaseScaleKey[]

type NormScaleKey = keyof typeof NormM[Gender]
interface SimpleScaleConfig {
  trueIndex: number[]
  falseIndex: number[]
  scale: Exclude<NormScaleKey, CorrectedScaleKey>
}

interface CorrectedScaleConfig {
  trueIndex: number[]
  falseIndex: number[]
  scale: ClinicalScaleKey
  correctedScale: CorrectedScaleKey
  correctionFactor: number
}

function transT(score: number, gender: Gender, scale: NormScaleKey) {
  const mean = NormM[gender][scale]
  const standardDeviation = NormSD[gender][scale]
  return Math.round(50 + 10 * (score - mean) / standardDeviation)
}

function scoreAnswers(answers: boolean[], trueIndex: number[], falseIndex: number[]) {
  let score = 0
  trueIndex.forEach((value) => {
    if (answers[value - 1]) {
      score += 1
    }
  })
  falseIndex.forEach((value) => {
    if (!answers[value - 1]) {
      score += 1
    }
  })
  return score
}

function scoreScale(answers: boolean[], gender: Gender, config: SimpleScaleConfig): ScaleScore {
  const oriScore = scoreAnswers(answers, config.trueIndex, config.falseIndex)
  return { oriScore, proScore: transT(oriScore, gender, config.scale) }
}

function scoreCorrectedScale(
  answers: boolean[],
  gender: Gender,
  kScore: number,
  config: CorrectedScaleConfig,
) {
  const oriScore = scoreAnswers(answers, config.trueIndex, config.falseIndex)
  return {
    oriScore,
    proScore: transT(oriScore, gender, config.scale),
    correctedProScore: transT(
      oriScore + Math.round(config.correctionFactor * kScore),
      gender,
      config.correctedScale,
    ),
  }
}

function initializeScoreMap<T extends string>(keys: readonly T[]) {
  return Object.fromEntries(keys.map(key => [key, 0])) as Record<T, number>
}

function createScoreSeries<T extends string>(labels: readonly T[], scores: readonly number[]) {
  return Object.fromEntries(labels.map((label, index) => [label, scores[index]])) as Record<T, number>
}

function mapClinicalIndexToCode(index: number) {
  return index === 9 ? 0 : index + 1
}

/** 效度量表 - 疑问分 Q */
export function scaleQ(answers: boolean[]): ScaleScore {
  let score = 0
  const temp1 = [8, 13, 15, 16, 20, 21, 22, 23, 24, 32, 33, 35, 37, 38, 305, 317]
  const temp2 = [318, 290, 314, 315, 310, 308, 326, 288, 333, 328, 323, 331, 302, 311, 366, 362]
  temp1.forEach((value, index) => {
    const i1 = value - 1
    const i2 = temp2[index] - 1
    if (answers[i1] !== answers[i2]) {
      score += 1
    }
  })
  return { oriScore: score, proScore: score }
}

/** 效度量表 - 谎分 L */
export function scaleL(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [],
    falseIndex: [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 195, 225, 255, 285],
    scale: 'L',
  })
}

/** 效度量表 - 诈病分数 F */
export function scaleF(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [14, 27, 31, 34, 35, 40, 42, 48, 49, 50, 53, 56, 66, 85, 121, 123, 139, 146, 151, 156, 168, 184, 197, 200, 202, 205, 206, 209, 210, 211, 215, 218, 227, 245, 246, 247, 252, 256, 269, 275, 286, 288, 291, 293],
    falseIndex: [17, 20, 54, 65, 75, 83, 112, 113, 115, 164, 169, 177, 185, 196, 199, 220, 257, 258, 272, 276],
    scale: 'F',
  })
}

/** 效度量表 - 校正分数 K */
export function scaleK(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [96],
    falseIndex: [30, 39, 71, 89, 124, 129, 134, 138, 142, 148, 160, 170, 171, 180, 183, 217, 234, 267, 272, 296, 316, 322, 368, 370, 372, 373, 375, 386, 394],
    scale: 'K',
  })
}

/** 临床量表-1 疑病 Hs */
export function scaleHs(answers: boolean[], gender: Gender, kScore: number) {
  return scoreCorrectedScale(answers, gender, kScore, {
    trueIndex: [23, 29, 43, 62, 72, 108, 114, 125, 161, 189, 273],
    falseIndex: [2, 3, 7, 9, 18, 51, 55, 63, 68, 103, 130, 153, 155, 163, 175, 188, 190, 192, 230, 243, 274, 281],
    scale: 'Hs',
    correctedScale: 'Hs+0.5K',
    correctionFactor: 0.5,
  })
}

/** 临床量表-2 抑郁 D */
export function scaleD(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [5, 32, 41, 43, 52, 67, 86, 104, 130, 138, 142, 158, 159, 182, 189, 193, 236, 259, 288, 290],
    falseIndex: [2, 8, 9, 18, 30, 36, 39, 46, 51, 57, 58, 64, 80, 88, 89, 95, 98, 107, 122, 131, 145, 152, 153, 154, 155, 160, 178, 191, 207, 208, 233, 241, 242, 248, 263, 270, 271, 272, 285, 296],
    scale: 'D',
  })
}

/** 临床量表-3 癔病 Hy */
export function scaleHy(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [10, 23, 32, 43, 44, 47, 76, 114, 179, 186, 189, 238, 253],
    falseIndex: [2, 3, 6, 7, 8, 9, 12, 26, 30, 51, 55, 71, 89, 93, 103, 107, 109, 124, 128, 129, 136, 137, 141, 147, 153, 160, 162, 163, 170, 172, 174, 175, 180, 188, 190, 192, 201, 213, 230, 234, 243, 265, 267, 274, 279, 289, 292],
    scale: 'Hy',
  })
}

/** 临床量表-4 精神病态 Pd */
export function scalePd(answers: boolean[], gender: Gender, kScore: number) {
  return scoreCorrectedScale(answers, gender, kScore, {
    trueIndex: [16, 21, 24, 32, 33, 35, 38, 42, 61, 67, 84, 94, 102, 106, 110, 118, 127, 215, 216, 224, 239, 244, 245, 284],
    falseIndex: [8, 20, 37, 82, 91, 96, 107, 134, 137, 141, 155, 170, 171, 173, 180, 183, 201, 231, 235, 237, 248, 267, 287, 289, 294, 296],
    scale: 'Pd',
    correctedScale: 'Pd+0.4K',
    correctionFactor: 0.4,
  })
}

/** 临床量表-5 男子气/女子气 Mf */
export function scaleMf(answers: boolean[], gender: Gender): ScaleScore {
  if (gender === Gender.MALE) {
    return scoreScale(answers, gender, {
      trueIndex: [4, 25, 69, 70, 74, 77, 78, 87, 92, 126, 132, 134, 140, 149, 179, 187, 203, 204, 217, 226, 231, 239, 261, 278, 282, 295, 297, 299],
      falseIndex: [1, 19, 26, 28, 79, 80, 81, 89, 99, 112, 115, 116, 117, 120, 133, 144, 176, 198, 213, 214, 219, 221, 223, 229, 249, 254, 260, 262, 264, 280, 283, 300],
      scale: 'Mf',
    })
  }

  return scoreScale(answers, gender, {
    trueIndex: [4, 25, 70, 74, 77, 78, 87, 92, 126, 132, 133, 134, 140, 149, 187, 203, 204, 217, 226, 239, 261, 278, 282, 295, 299],
    falseIndex: [1, 19, 26, 28, 69, 79, 80, 81, 89, 99, 112, 115, 116, 117, 120, 144, 176, 179, 198, 213, 214, 219, 221, 223, 229, 231, 249, 254, 260, 262, 264, 280, 283, 297, 300],
    scale: 'Mf',
  })
}

/** 临床量表-6 妄想狂 Pa */
export function scalePa(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [16, 24, 27, 35, 110, 121, 123, 127, 151, 157, 158, 202, 275, 284, 291, 293, 299, 305, 314, 317, 326, 338, 341, 364, 365],
    falseIndex: [93, 107, 109, 111, 117, 124, 268, 281, 294, 313, 316, 319, 327, 347, 348],
    scale: 'Pa',
  })
}

/** 临床量表-7 精神衰弱 Pt */
export function scalePt(answers: boolean[], gender: Gender, kScore: number) {
  return scoreCorrectedScale(answers, gender, kScore, {
    trueIndex: [10, 15, 22, 32, 41, 67, 76, 86, 94, 102, 106, 142, 159, 182, 189, 217, 238, 266, 301, 304, 321, 336, 337, 340, 342, 343, 344, 346, 349, 351, 352, 356, 357, 358, 359, 360, 361, 362, 366],
    falseIndex: [3, 8, 36, 122, 152, 164, 178, 329, 353],
    scale: 'Pt',
    correctedScale: 'Pt+1.0K',
    correctionFactor: 1,
  })
}

/** 临床量表-8 精神分裂症 Sc */
export function scaleSc(answers: boolean[], gender: Gender, kScore: number) {
  return scoreCorrectedScale(answers, gender, kScore, {
    trueIndex: [15, 22, 40, 41, 47, 52, 76, 97, 104, 121, 156, 157, 159, 168, 179, 182, 194, 202, 210, 212, 238, 241, 251, 259, 266, 273, 282, 291, 297, 301, 303, 307, 308, 311, 312, 315, 320, 323, 324, 325, 328, 331, 332, 333, 334, 335, 339, 341, 345, 349, 350, 352, 354, 355, 356, 360, 363, 364, 366],
    falseIndex: [17, 65, 103, 119, 177, 178, 187, 192, 196, 220, 276, 281, 302, 306, 309, 310, 318, 322, 330],
    scale: 'Sc',
    correctedScale: 'Sc+1.0K',
    correctionFactor: 1,
  })
}

/** 临床量表-9 轻躁狂 Ma */
export function scaleMa(answers: boolean[], gender: Gender, kScore: number) {
  return scoreCorrectedScale(answers, gender, kScore, {
    trueIndex: [11, 13, 21, 22, 59, 64, 73, 97, 100, 109, 127, 134, 143, 156, 157, 167, 181, 194, 212, 222, 226, 228, 232, 233, 238, 240, 250, 251, 263, 266, 268, 271, 277, 279, 298],
    falseIndex: [101, 105, 111, 119, 120, 148, 166, 171, 180, 267, 289],
    scale: 'Ma',
    correctedScale: 'Ma+0.2K',
    correctionFactor: 0.2,
  })
}

/** 临床量表-0 社会内向性 Si */
export function scaleSi(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [32, 67, 82, 111, 117, 124, 138, 147, 171, 172, 180, 201, 236, 267, 278, 292, 304, 316, 321, 332, 336, 342, 357, 369, 370, 373, 376, 378, 379, 385, 389, 393, 398, 399],
    falseIndex: [25, 33, 57, 91, 99, 110, 126, 143, 193, 208, 229, 231, 254, 262, 281, 296, 309, 353, 359, 367, 371, 374, 377, 380, 381, 382, 383, 384, 387, 388, 390, 391, 392, 395, 396, 397],
    scale: 'Si',
  })
}

/** 附加量表- 外显性焦虑 Mas */
export function scaleMas(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [13, 14, 23, 31, 32, 43, 67, 86, 125, 142, 158, 186, 191, 217, 238, 241, 263, 301, 317, 321, 322, 335, 337, 340, 352, 361, 372, 398, 418, 424, 431, 439, 442, 499, 506, 530, 555],
    falseIndex: [7, 18, 107, 163, 190, 230, 242, 264, 287, 367, 407, 520, 528],
    scale: 'Mas',
  })
}

/** 附加量表- 依赖性 Dy */
export function scaleDy(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [19, 21, 24, 41, 63, 67, 70, 82, 86, 98, 100, 138, 141, 158, 165, 180, 189, 201, 212, 236, 239, 259, 267, 304, 305, 321, 337, 338, 343, 357, 361, 362, 370, 372, 373, 393, 398, 399, 408, 440, 443, 461, 487, 488, 489, 509, 521, 531, 554],
    falseIndex: [9, 79, 107, 163, 170, 193, 264, 411],
    scale: 'Dy',
  })
}

/** 附加量表- 支配性 Do */
export function scaleDo(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [64, 229, 255, 270, 406, 432, 523],
    falseIndex: [32, 61, 82, 86, 94, 186, 223, 224, 240, 249, 250, 267, 268, 304, 343, 356, 419, 483, 547, 558, 562],
    scale: 'Do',
  })
}

/** 附加量表- 社会责任感 Re */
export function scaleRe(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [58, 111, 173, 221, 294, 412, 501, 552],
    falseIndex: [6, 28, 30, 33, 56, 116, 118, 157, 175, 181, 223, 224, 260, 304, 388, 419, 434, 437, 468, 471, 472, 529, 553, 558],
    scale: 'Re',
  })
}

/** 附加量表- 控制 Cn */
export function scaleCn(answers: boolean[], gender: Gender): ScaleScore {
  return scoreScale(answers, gender, {
    trueIndex: [6, 20, 30, 56, 67, 105, 116, 134, 145, 162, 169, 181, 225, 236, 238, 285, 296, 319, 337, 376, 379, 381, 418, 447, 460, 461, 529, 555],
    falseIndex: [58, 80, 92, 96, 111, 167, 174, 220, 242, 249, 250, 291, 313, 360, 439, 444, 449, 483, 488, 489, 527, 548],
    scale: 'Cn',
  })
}

export function calculate_score(answers: boolean[], gender: Gender): CalculateScoreResult {
  if (answers.length !== question.length) {
    throw new RangeError(`Expected ${question.length} answers, received ${answers.length}`)
  }

  const oriPoint = initializeScoreMap(BASE_SCALE_KEYS) as Record<BaseScaleKey, number>
  const proPoint = initializeScoreMap([
    ...BASE_SCALE_KEYS,
    'Hs+0.5K',
    'Pd+0.4K',
    'Pt+1.0K',
    'Sc+1.0K',
    'Ma+0.2K',
  ] as const) as Record<ProcessedScaleKey, number>

  const q = scaleQ(answers)
  oriPoint['Q*'] = q.oriScore
  proPoint['Q*'] = q.proScore

  const l = scaleL(answers, gender)
  oriPoint.L = l.oriScore
  proPoint.L = l.proScore

  const f = scaleF(answers, gender)
  oriPoint.F = f.oriScore
  proPoint.F = f.proScore

  const k = scaleK(answers, gender)
  oriPoint.K = k.oriScore
  proPoint.K = k.proScore

  const hs = scaleHs(answers, gender, k.oriScore)
  oriPoint.Hs = hs.oriScore
  proPoint.Hs = hs.proScore
  proPoint['Hs+0.5K'] = hs.correctedProScore

  const d = scaleD(answers, gender)
  oriPoint.D = d.oriScore
  proPoint.D = d.proScore

  const hy = scaleHy(answers, gender)
  oriPoint.Hy = hy.oriScore
  proPoint.Hy = hy.proScore

  const pd = scalePd(answers, gender, k.oriScore)
  oriPoint.Pd = pd.oriScore
  proPoint.Pd = pd.proScore
  proPoint['Pd+0.4K'] = pd.correctedProScore

  const mf = scaleMf(answers, gender)
  oriPoint.Mf = mf.oriScore
  proPoint.Mf = mf.proScore

  const pa = scalePa(answers, gender)
  oriPoint.Pa = pa.oriScore
  proPoint.Pa = pa.proScore

  const pt = scalePt(answers, gender, k.oriScore)
  oriPoint.Pt = pt.oriScore
  proPoint.Pt = pt.proScore
  proPoint['Pt+1.0K'] = pt.correctedProScore

  const sc = scaleSc(answers, gender, k.oriScore)
  oriPoint.Sc = sc.oriScore
  proPoint.Sc = sc.proScore
  proPoint['Sc+1.0K'] = sc.correctedProScore

  const ma = scaleMa(answers, gender, k.oriScore)
  oriPoint.Ma = ma.oriScore
  proPoint.Ma = ma.proScore
  proPoint['Ma+0.2K'] = ma.correctedProScore

  const si = scaleSi(answers, gender)
  oriPoint.Si = si.oriScore
  proPoint.Si = si.proScore

  const mas = scaleMas(answers, gender)
  oriPoint.Mas = mas.oriScore
  proPoint.Mas = mas.proScore

  const dy = scaleDy(answers, gender)
  oriPoint.Dy = dy.oriScore
  proPoint.Dy = dy.proScore

  const doScale = scaleDo(answers, gender)
  oriPoint.Do = doScale.oriScore
  proPoint.Do = doScale.proScore

  const re = scaleRe(answers, gender)
  oriPoint.Re = re.oriScore
  proPoint.Re = re.proScore

  const cn = scaleCn(answers, gender)
  oriPoint.Cn = cn.oriScore
  proPoint.Cn = cn.proScore

  return { oriPoint, proPoint }
}

export function analyze_score(scoreResult: CalculateScoreResult): AnalyzeScoreResult {
  const validityScores = VALIDITY_SCALE_LABELS.map(key => scoreResult.proPoint[key])
  const clinicalScores = [
    scoreResult.proPoint['Hs+0.5K'],
    scoreResult.proPoint.D,
    scoreResult.proPoint.Hy,
    scoreResult.proPoint['Pd+0.4K'],
    scoreResult.proPoint.Mf,
    scoreResult.proPoint.Pa,
    scoreResult.proPoint['Pt+1.0K'],
    scoreResult.proPoint['Sc+1.0K'],
    scoreResult.proPoint['Ma+0.2K'],
    scoreResult.proPoint.Si,
  ]
  const extraScores = ADDITIONAL_SCALE_LABELS.map(key => scoreResult.proPoint[key])

  const firstIndex = clinicalScores.reduce((bestIndex, score, index, list) =>
    score > list[bestIndex] ? index : bestIndex, 0)
  const clinicalWithoutFirst = clinicalScores.map((score, index) => index === firstIndex ? Number.NEGATIVE_INFINITY : score)
  const secondIndex = clinicalWithoutFirst.reduce((bestIndex, score, index, list) =>
    score > list[bestIndex] ? index : bestIndex, 0)

  return {
    twoPoint: `${mapClinicalIndexToCode(firstIndex)}${mapClinicalIndexToCode(secondIndex)}`,
    validity: createScoreSeries(VALIDITY_SCALE_LABELS, validityScores),
    clinical: createScoreSeries(CLINICAL_SCALE_LABELS, clinicalScores),
    extra: createScoreSeries(ADDITIONAL_SCALE_LABELS, extraScores),
  }
}
