import assert from 'node:assert/strict'
import test from 'node:test'

import { analyze_score, calculate_score } from '../src/data/scales'
import { Gender } from '../src/utils/gender'

const emptyAnswers = Array.from<boolean>({ length: 566 }).fill(false)

test('calculate_score matches expected male all-false fixture', () => {
  const result = calculate_score(emptyAnswers, Gender.MALE)

  assert.deepStrictEqual(result, {
    oriPoint: {
      'Q*': 0,
      'L': 15,
      'F': 20,
      'K': 29,
      'Hs': 22,
      'D': 40,
      'Hy': 47,
      'Pd': 26,
      'Mf': 32,
      'Pa': 15,
      'Pt': 9,
      'Sc': 19,
      'Ma': 11,
      'Si': 36,
      'Mas': 13,
      'Dy': 8,
      'Do': 21,
      'Re': 24,
      'Cn': 22,
    },
    proPoint: {
      'Q*': 0,
      'L': 87,
      'F': 59,
      'K': 84,
      'Hs': 78,
      'D': 78,
      'Hy': 97,
      'Pd': 66,
      'Mf': 61,
      'Pa': 56,
      'Pt': 39,
      'Sc': 46,
      'Ma': 36,
      'Si': 52,
      'Mas': 42,
      'Dy': 28,
      'Do': 68,
      'Re': 58,
      'Cn': 41,
      'Hs+0.5K': 95,
      'Pd+0.4K': 82,
      'Pt+1.0K': 62,
      'Sc+1.0K': 64,
      'Ma+0.2K': 41,
    },
  })
})

test('calculate_score matches expected female all-false fixture', () => {
  const result = calculate_score(emptyAnswers, Gender.FEMALE)

  assert.deepStrictEqual(result, {
    oriPoint: {
      'Q*': 0,
      'L': 15,
      'F': 20,
      'K': 29,
      'Hs': 22,
      'D': 40,
      'Hy': 47,
      'Pd': 26,
      'Mf': 35,
      'Pa': 15,
      'Pt': 9,
      'Sc': 19,
      'Ma': 11,
      'Si': 36,
      'Mas': 13,
      'Dy': 8,
      'Do': 21,
      'Re': 24,
      'Cn': 22,
    },
    proPoint: {
      'Q*': 0,
      'L': 88,
      'F': 67,
      'K': 89,
      'Hs': 74,
      'D': 73,
      'Hy': 94,
      'Pd': 67,
      'Mf': 58,
      'Pa': 56,
      'Pt': 38,
      'Sc': 46,
      'Ma': 39,
      'Si': 48,
      'Mas': 40,
      'Dy': 22,
      'Do': 71,
      'Re': 57,
      'Cn': 42,
      'Hs+0.5K': 92,
      'Pd+0.4K': 83,
      'Pt+1.0K': 62,
      'Sc+1.0K': 67,
      'Ma+0.2K': 46,
    },
  })
})

test('analyze_score returns Python-style two-point code and chart series', () => {
  const result = analyze_score(calculate_score(emptyAnswers, Gender.MALE))

  assert.deepStrictEqual(result, {
    twoPoint: '31',
    validity: { L: 87, F: 59, K: 84 },
    clinical: {
      'Hs-1': 95,
      'D-2': 78,
      'Hy-3': 97,
      'Pd-4': 82,
      'Mf-5': 61,
      'Pa-6': 56,
      'Pt-7': 62,
      'Sc-8': 64,
      'Ma-9': 41,
      'Si-0': 52,
    },
    extra: { Mas: 42, Dy: 28, Do: 68, Re: 58, Cn: 41 },
  })
})

test('calculate_score rejects incomplete answer sets', () => {
  assert.throws(
    () => calculate_score(Array.from<boolean>({ length: 565 }).fill(false), Gender.MALE),
    /Expected 566 answers, received 565/,
  )
})
