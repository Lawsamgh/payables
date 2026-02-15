import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  type: ToastType
}

let nextId = 0
const DEFAULT_DURATION = 3200

function playErrorSound() {
  try {
    const ctx = new (window.AudioContext || (window as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.12)
  } catch {
    // Ignore if AudioContext unavailable
  }
}

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])

  function show(message: string, type: ToastType = 'info', duration = DEFAULT_DURATION, options?: { sound?: boolean }) {
    const id = ++nextId
    if (type === 'error' && options?.sound !== false) {
      playErrorSound()
    }
    items.value = [...items.value, { id, message, type }]
    if (duration > 0) {
      setTimeout(() => {
        items.value = items.value.filter((t) => t.id !== id)
      }, duration)
    }
    return id
  }

  function success(message: string, duration = DEFAULT_DURATION) {
    return show(message, 'success', duration)
  }

  function error(message: string, duration = DEFAULT_DURATION, playSound = true) {
    return show(message, 'error', duration, { sound: playSound })
  }

  function info(message: string, duration = DEFAULT_DURATION) {
    return show(message, 'info', duration)
  }

  function dismiss(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return { items: computed(() => items.value), show, success, error, info, dismiss }
})
