/**
 * Session timeout warning: FileMaker Data API sessions expire after ~15 min of inactivity.
 * Shows a modal ~5 minutes before estimated expiry; user can click "Stay signed in" to extend (lightweight API call).
 * If the session has already expired, shows a clear toast and closes the modal.
 */

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { lastActivityAt, recordActivity } from '../utils/sessionActivity'
import { useFileMaker } from './useFileMaker'
import { useToastStore } from '../stores/toastStore'
import { LAYOUTS } from '../utils/filemakerApi'

/** Inactivity threshold (ms) before showing warning. 10 min = warn ~5 min before 15 min expiry (more buffer). */
const WARN_AFTER_MS = 10 * 60 * 1000
const CHECK_INTERVAL_MS = 30 * 1000

export function useSessionTimeout() {
  const { findRecordsWithIds, isConnected } = useFileMaker()
  const toast = useToastStore()
  const showWarningModal = ref(false)
  const extending = ref(false)

  const tick = ref(0)
  const minutesLeft = computed(() => {
    const elapsed = Date.now() - lastActivityAt.value
    const remaining = WARN_AFTER_MS - elapsed
    if (remaining <= 0) return 0
    return Math.ceil(remaining / 60_000)
  })
  /** Live countdown "m:ss" — updates every second when modal is visible (tick forces recompute). */
  const countdownFormatted = computed(() => {
    void tick.value
    const elapsed = Date.now() - lastActivityAt.value
    const remaining = WARN_AFTER_MS - elapsed
    if (remaining <= 0) return '0:00'
    const totalSeconds = Math.floor(remaining / 1000)
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  })

  function shouldShowWarning(): boolean {
    if (!isConnected.value) return false
    const elapsed = Date.now() - lastActivityAt.value
    return elapsed >= WARN_AFTER_MS && lastActivityAt.value > 0
  }

  let intervalId: ReturnType<typeof setInterval> | null = null
  let countdownIntervalId: ReturnType<typeof setInterval> | null = null

  function startCountdownTick() {
    if (!countdownIntervalId && showWarningModal.value) {
      countdownIntervalId = setInterval(() => { tick.value++ }, 1000)
    }
  }

  function stopCountdownTick() {
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId)
      countdownIntervalId = null
    }
  }

  watch(showWarningModal, (visible) => {
    if (visible) startCountdownTick()
    else stopCountdownTick()
  })

  function checkAndShow() {
    if (shouldShowWarning() && !showWarningModal.value) {
      showWarningModal.value = true
    }
  }

  async function extendSession() {
    if (!isConnected.value || extending.value) return
    extending.value = true
    try {
      const { error } = await findRecordsWithIds(LAYOUTS.PAYABLES_SETTINGS, { limit: 1 })
      if (!error) {
        recordActivity()
        showWarningModal.value = false
      } else {
        showWarningModal.value = false
        toast.error('Session already expired. Please sign in again.')
      }
    } finally {
      extending.value = false
    }
  }

  function dismissModal() {
    showWarningModal.value = false
  }

  function startInterval() {
    if (!intervalId && isConnected.value) {
      if (lastActivityAt.value === 0) recordActivity()
      intervalId = setInterval(checkAndShow, CHECK_INTERVAL_MS)
    }
  }

  function stopInterval() {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    stopCountdownTick()
  }

  watch(isConnected, (connected) => {
    if (connected) {
      if (lastActivityAt.value === 0) recordActivity()
      startInterval()
    } else {
      showWarningModal.value = false
      stopInterval()
    }
  })

  onMounted(() => {
    startInterval()
  })

  onUnmounted(() => {
    stopInterval()
  })

  return {
    showWarningModal,
    extending,
    minutesLeft,
    countdownFormatted,
    extendSession,
    dismissModal,
  }
}
