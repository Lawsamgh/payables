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

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])

  function show(message: string, type: ToastType = 'info', duration = DEFAULT_DURATION) {
    const id = ++nextId
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

  function error(message: string, duration = DEFAULT_DURATION) {
    return show(message, 'error', duration)
  }

  function info(message: string, duration = DEFAULT_DURATION) {
    return show(message, 'info', duration)
  }

  function dismiss(id: number) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return { items: computed(() => items.value), show, success, error, info, dismiss }
})
