/**
 * Shared keyboard shortcuts data for SettingsShortcutsView and ShortcutsCheatsheetModal.
 */

import { computed } from 'vue'

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform)

export function modPlus(key: string): string {
  return isMac ? `⌘${key}` : `Ctrl+${key}`
}

export function useShortcutsData() {
  const globalShortcuts = computed(() => [
    { action: 'Command palette (search, TransRef lookup, navigate)', keys: [modPlus('K')] },
    { action: 'New entry', keys: [modPlus('N')] },
    { action: 'Previous entry in booklet', keys: [modPlus('←')] },
    { action: 'Next entry in booklet', keys: [modPlus('→')] },
  ])

  const entryShortcuts = computed(() => [
    { action: 'Save', keys: [modPlus('S')] },
    { action: 'Save and Post', keys: [modPlus('P')] },
    { action: 'Save and Repost (when rejected)', keys: [modPlus('P')] },
  ])

  const gridShortcuts = computed(() => [
    { action: 'Move up', keys: ['↑'] },
    { action: 'Move down', keys: ['↓'] },
    { action: 'Move left', keys: ['←'] },
    { action: 'Move right', keys: ['→'] },
    { action: 'Move right / next cell', keys: ['Tab'] },
    { action: 'Move left / previous cell', keys: ['Shift+Tab'] },
    { action: 'Move down / commit', keys: ['Enter'] },
    { action: 'Close cell / cancel edit', keys: ['Escape'] },
  ])

  const contextShortcuts = [
    { action: 'Copy', desc: 'Right-click → Copy' },
    { action: 'Paste', desc: 'Right-click → Paste' },
    { action: 'Cut', desc: 'Right-click → Cut' },
    { action: 'Clear', desc: 'Right-click → Clear' },
  ]

  return {
    isMac,
    globalShortcuts,
    entryShortcuts,
    gridShortcuts,
    contextShortcuts,
  }
}
