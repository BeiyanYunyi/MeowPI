export const SWIPE_THRESHOLD = 44

export function getSwipeAnswer(distanceX: number, threshold = SWIPE_THRESHOLD): boolean | null {
  if (distanceX <= -threshold) {
    return false
  }

  if (distanceX >= threshold) {
    return true
  }

  return null
}
