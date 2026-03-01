/**
 * Shared session activity tracking for FileMaker Data API timeout warning.
 * useFileMaker records activity on every successful API response.
 * useSessionTimeout checks inactivity and shows the warning modal.
 */

import { ref } from 'vue'

export const lastActivityAt = ref<number>(0)

export function recordActivity(): void {
  lastActivityAt.value = Date.now()
}
