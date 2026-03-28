import type { ResultPagePayload } from '#/data'
import { gunzipSync, gzipSync, strFromU8, strToU8 } from 'fflate'
import { Gender } from './gender'

function toBase64Url(bytes: Uint8Array) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

function fromBase64Url(value: string) {
  const normalized = value
    .replaceAll('-', '+')
    .replaceAll('_', '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')
  return atob(normalized)
}

function isResultPagePayload(value: unknown): value is ResultPagePayload {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ResultPagePayload>
  return (
    (candidate.gender === Gender.FEMALE || candidate.gender === Gender.MALE)
    && typeof candidate.calculateScoreResult === 'object'
    && candidate.calculateScoreResult !== null
    && typeof candidate.analyzeScoreResult === 'object'
    && candidate.analyzeScoreResult !== null
  )
}

export function encodeResultPayload(payload: ResultPagePayload) {
  return toBase64Url(gzipSync(strToU8(JSON.stringify(payload))))
}

export function decodeResultPayload(value: string) {
  const parsed = JSON.parse(
    strFromU8(
      gunzipSync(
        strToU8(
          fromBase64Url(value),
          true,
        ),
      ),
    ),
  ) as unknown
  if (!isResultPagePayload(parsed)) {
    throw new TypeError('Invalid result payload')
  }
  return parsed
}
