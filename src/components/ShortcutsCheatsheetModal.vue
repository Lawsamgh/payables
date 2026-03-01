<template>
  <Teleport to="body">
    <Transition name="shortcuts-cheatsheet">
      <div
        v-if="visible"
        class="shortcuts-cheatsheet-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-cheatsheet-title"
        aria-describedby="shortcuts-cheatsheet-desc"
        @keydown="onKeydown"
        @click.self="cheatsheetStore.close()"
      >
        <div
          class="shortcuts-cheatsheet"
          @click.stop
        >
          <div class="shortcuts-cheatsheet__header">
            <h2 id="shortcuts-cheatsheet-title" class="shortcuts-cheatsheet__title">
              Keyboard shortcuts
            </h2>
            <p id="shortcuts-cheatsheet-desc" class="shortcuts-cheatsheet__subtitle">
              Press <kbd class="shortcuts-cheatsheet__kbd-inline">{{ modPlus('K') }}</kbd> to search · <kbd class="shortcuts-cheatsheet__kbd-inline">?</kbd> for this panel
            </p>
            <button
              type="button"
              class="shortcuts-cheatsheet__close"
              aria-label="Close"
              @click="cheatsheetStore.close()"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="shortcuts-cheatsheet__body">
            <div
              v-for="section in sections"
              :key="section.title"
              class="shortcuts-cheatsheet__section"
            >
              <h3 class="shortcuts-cheatsheet__section-title">{{ section.title }}</h3>
              <div class="shortcuts-cheatsheet__list">
                <div
                  v-for="row in section.rows"
                  :key="row.action"
                  class="shortcuts-cheatsheet__row"
                >
                  <span class="shortcuts-cheatsheet__action">{{ row.action }}</span>
                  <div v-if="row.keys" class="shortcuts-cheatsheet__keys">
                    <kbd
                      v-for="key in row.keys"
                      :key="key"
                      class="shortcuts-cheatsheet__kbd"
                    >{{ key }}</kbd>
                  </div>
                  <span v-else-if="row.desc" class="shortcuts-cheatsheet__desc">{{ row.desc }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="shortcuts-cheatsheet__footer">
            <router-link
              to="/settings/shortcuts"
              class="shortcuts-cheatsheet__link"
              @click="cheatsheetStore.close()"
            >
              Full reference in Settings →
            </router-link>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useShortcutsCheatsheetStore } from '../stores/shortcutsCheatsheetStore'
import { useShortcutsData, modPlus } from '../composables/useShortcutsData'

const cheatsheetStore = useShortcutsCheatsheetStore()
const visible = computed(() => cheatsheetStore.visible)
const {
  globalShortcuts,
  entryShortcuts,
  gridShortcuts,
  contextShortcuts,
} = useShortcutsData()

const sections = computed(() => [
  { title: 'Global', rows: globalShortcuts.value },
  { title: 'Entry view', rows: entryShortcuts.value },
  { title: 'Data grid', rows: gridShortcuts.value },
  { title: 'Context menu', rows: contextShortcuts.value },
])

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    cheatsheetStore.close()
  }
}
</script>

<style scoped>
.shortcuts-cheatsheet-backdrop {
  position: fixed;
  inset: 0;
  z-index: 280;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
}

.shortcuts-cheatsheet {
  width: 100%;
  max-width: 40rem;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  overflow: hidden;
}

.shortcuts-cheatsheet__header {
  flex-shrink: 0;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.shortcuts-cheatsheet__title {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.shortcuts-cheatsheet__subtitle {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.shortcuts-cheatsheet__kbd-inline {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
}

.shortcuts-cheatsheet__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: color 0.15s ease, background 0.15s ease;
}

.shortcuts-cheatsheet__close:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.08);
}

.shortcuts-cheatsheet__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

.shortcuts-cheatsheet__section {
  margin-bottom: 1rem;
}

.shortcuts-cheatsheet__section:last-child {
  margin-bottom: 0;
}

.shortcuts-cheatsheet__section-title {
  margin: 0 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.shortcuts-cheatsheet__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  overflow: hidden;
}

.shortcuts-cheatsheet__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
}

.shortcuts-cheatsheet__row:last-child {
  border-bottom: none;
}

.shortcuts-cheatsheet__action {
  flex: 1;
  min-width: 0;
  color: var(--color-text);
}

.shortcuts-cheatsheet__keys {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.shortcuts-cheatsheet__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  padding: 0.2rem 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.shortcuts-cheatsheet__desc {
  flex-shrink: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.shortcuts-cheatsheet__footer {
  flex-shrink: 0;
  padding: 0.75rem 1.25rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.shortcuts-cheatsheet__link {
  font-size: 0.8125rem;
  color: var(--color-accent);
  text-decoration: none;
  transition: color 0.15s ease;
}

.shortcuts-cheatsheet__link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}

/* Transition */
.shortcuts-cheatsheet-enter-active,
.shortcuts-cheatsheet-leave-active {
  transition: opacity 0.2s ease;
}

.shortcuts-cheatsheet-enter-active .shortcuts-cheatsheet,
.shortcuts-cheatsheet-leave-active .shortcuts-cheatsheet {
  transition: transform 0.2s ease;
}

.shortcuts-cheatsheet-enter-from,
.shortcuts-cheatsheet-leave-to {
  opacity: 0;
}

.shortcuts-cheatsheet-enter-from .shortcuts-cheatsheet,
.shortcuts-cheatsheet-leave-to .shortcuts-cheatsheet {
  transform: scale(0.96);
}
</style>
