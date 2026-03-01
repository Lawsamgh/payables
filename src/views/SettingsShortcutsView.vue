<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="shortcuts-header sticky top-0 z-10 -mx-4 -mt-5 px-4 pt-5 pb-4 md:-mx-6 md:-mt-6 md:px-6 md:pt-6 md:pb-4 mb-10 bg-[#0f172a] border-b border-[var(--color-border)]">
      <router-link
        to="/settings"
        class="inline-flex items-center gap-2 text-[var(--label-size)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] no-underline mb-4 transition-colors"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Settings
      </router-link>
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        Keyboard shortcuts
      </h1>
      <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
        Quick reference for all shortcuts in the application.
      </p>
    </header>

    <div class="shortcuts-grid flex flex-col gap-10">
      <section class="shortcuts-section">
        <h2 class="shortcuts-section__title">Global</h2>
        <div class="shortcuts-list glass rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div
            v-for="row in globalShortcuts"
            :key="row.action"
            class="shortcuts-row flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0"
          >
            <span class="shortcuts-row__action text-[var(--label-size)] text-[var(--color-text)]">{{ row.action }}</span>
            <div class="shortcuts-row__keys flex items-center gap-2 flex-wrap justify-end">
              <kbd
                v-for="key in row.keys"
                :key="key"
                class="shortcuts-kbd"
              >{{ key }}</kbd>
            </div>
          </div>
        </div>
      </section>

      <section class="shortcuts-section">
        <h2 class="shortcuts-section__title">Entry view</h2>
        <div class="shortcuts-list glass rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div
            v-for="row in entryShortcuts"
            :key="row.action"
            class="shortcuts-row flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0"
          >
            <span class="shortcuts-row__action text-[var(--label-size)] text-[var(--color-text)]">{{ row.action }}</span>
            <div class="shortcuts-row__keys flex items-center gap-2 flex-wrap justify-end">
              <kbd
                v-for="key in row.keys"
                :key="key"
                class="shortcuts-kbd"
              >{{ key }}</kbd>
            </div>
          </div>
        </div>
      </section>

      <section class="shortcuts-section">
        <h2 class="shortcuts-section__title">Data grid (invoice rows)</h2>
        <div class="shortcuts-list glass rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div
            v-for="row in gridShortcuts"
            :key="row.action"
            class="shortcuts-row flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0"
          >
            <span class="shortcuts-row__action text-[var(--label-size)] text-[var(--color-text)]">{{ row.action }}</span>
            <div class="shortcuts-row__keys flex items-center gap-2 flex-wrap justify-end">
              <kbd
                v-for="key in row.keys"
                :key="key"
                class="shortcuts-kbd"
              >{{ key }}</kbd>
            </div>
          </div>
        </div>
      </section>

      <section class="shortcuts-section">
        <h2 class="shortcuts-section__title">Data grid context menu</h2>
        <div class="shortcuts-list glass rounded-2xl border border-[var(--color-border)] overflow-hidden">
          <div
            v-for="row in contextShortcuts"
            :key="row.action"
            class="shortcuts-row flex items-center justify-between gap-4 px-4 py-3 border-b border-[var(--color-border)] last:border-b-0"
          >
            <span class="shortcuts-row__action text-[var(--label-size)] text-[var(--color-text)]">{{ row.action }}</span>
            <span class="shortcuts-row__desc text-[13px] text-[var(--color-text-muted)]">{{ row.desc }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useShortcutsData } from '../composables/useShortcutsData'

const {
  globalShortcuts,
  entryShortcuts,
  gridShortcuts,
  contextShortcuts,
} = useShortcutsData()
</script>

<style scoped>
.shortcuts-section__title {
  margin: 0 0 0.75rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.shortcuts-kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.75rem;
  padding: 0.25rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid var(--color-border);
  border-radius: 6px;
}

.shortcuts-row:last-child {
  border-bottom: none !important;
}
</style>
