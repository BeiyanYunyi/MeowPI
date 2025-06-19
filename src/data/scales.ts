import type { Gender } from '../utils/gender'
import type { ScaleFn } from './types'
import { useGender } from '../utils/gender'
import { NormM, NormSD } from './norm'

/**
 * 标准分
 * Standard T point
 */
function transT(score: number, scale: keyof typeof NormM[Gender]) {
  const gender = useGender()
  const mean = NormM[gender][scale]
  const standardDeviation = NormSD[gender][scale]
  return Math.round(50 + 10 * (score - mean) / standardDeviation)
}

function tFNorm(param: {
  answers: boolean[]
  trueIndex: number[]
  falseIndex: number[]
  scale: keyof typeof NormM[Gender]
}) {
  let oriScore = 0
  param.trueIndex.forEach((value) => {
    if (param.answers[value - 1]) {
      oriScore += 1
    }
  })
  param.falseIndex.forEach((value) => {
    if (!param.answers[value - 1]) {
      oriScore += 1
    }
  })
  return { oriScore, proScore: transT(oriScore, param.scale) }
}

/** 效度量表 - 疑问分 Q */
export const scaleQ: ScaleFn = (answers) => {
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
export const scaleL: ScaleFn = (answers) => {
  let oriScore = 0
  const temp = [15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 195, 225, 255, 285]
  temp.forEach((value) => {
    if (!answers[value - 1]) {
      oriScore += 1
    }
  })
  return { oriScore, proScore: transT(oriScore, 'L') }
}

/** 效度量表 - 诈病分数 F */
export const scaleF: ScaleFn = (answers) => {
  const temp_t = [14, 27, 31, 34, 35, 40, 42, 48, 49, 50, 53, 56, 66, 85, 121, 123, 139, 146, 151, 156, 168, 184, 197, 200, 202, 205, 206, 209, 210, 211, 215, 218, 227, 245, 246, 247, 252, 256, 269, 275, 286, 288, 291, 293]
  const temp_f = [17, 20, 54, 65, 75, 83, 112, 113, 115, 164, 169, 177, 185, 196, 199, 220, 257, 258, 272, 276]
  return tFNorm({ answers, trueIndex: temp_t, falseIndex: temp_f, scale: 'F' })
}
