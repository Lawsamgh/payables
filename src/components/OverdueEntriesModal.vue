<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);"
      role="dialog"
      aria-modal="true"
      aria-labelledby="overdue-modal-title"
    >
      <div
        class="glass w-full max-w-3xl rounded-2xl border border-[var(--color-border)] shadow-xl overflow-hidden flex flex-col"
        style="max-height: min(85vh, 560px);"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div class="flex items-center gap-3">
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl"
              style="background: rgba(251, 146, 60, 0.15);"
              aria-hidden="true"
            >
              <svg class="h-5 w-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 id="overdue-modal-title" class="text-lg font-semibold text-[var(--color-text)]">
                Overdue entries
              </h2>
              <p class="text-sm text-[var(--color-text-muted)] mt-0.5">
                <template v-if="loading && entries.length === 0">Loading…</template>
                <template v-else>{{ entries.length }} {{ entries.length === 1 ? 'entry' : 'entries' }} awaiting approval</template>
              </p>
            </div>
          </div>
          <button
            type="button"
            class="pill-btn p-2.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5 rounded-xl transition-colors"
            aria-label="Close"
            @click="$emit('close', { navigating: false })"
          >
            <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-hidden flex flex-col min-h-0">
          <div v-if="loading && entries.length === 0" class="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div class="overdue-modal-loading flex flex-col items-center gap-3">
              <div class="overdue-modal-spinner w-10 h-10 rounded-full border-2 border-[var(--color-accent)] border-t-transparent animate-spin" aria-hidden="true" />
              <p class="text-[var(--color-text-muted)] text-sm">Loading overdue entries…</p>
            </div>
          </div>
          <div v-else-if="entries.length === 0" class="flex-1 flex flex-col items-center justify-center px-6 py-12 text-center">
            <div class="rounded-2xl p-6 mb-4" style="background: rgba(148, 163, 184, 0.08);">
              <svg class="h-12 w-12 text-[var(--color-text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p class="text-[var(--color-text)] font-medium">No overdue entries</p>
            <p class="text-sm text-[var(--color-text-muted)] mt-1 max-w-xs">All posted entries are within the approval window.</p>
          </div>

          <template v-else>
            <div class="overflow-x-auto overflow-y-auto flex-1 overscroll-contain">
              <div class="px-6 py-3">
                <!-- Table header (sticky) -->
                <div class="overdue-modal-header">
                  <span class="overdue-modal-col overdue-modal-col--vendor">Vendor</span>
                  <span class="overdue-modal-col overdue-modal-col--ref">Ref</span>
                  <span class="overdue-modal-col overdue-modal-col--posted">Posted</span>
                  <span class="overdue-modal-col overdue-modal-col--days">Overdue</span>
                  <span class="overdue-modal-col overdue-modal-col--amount">Amount</span>
                  <span class="overdue-modal-col overdue-modal-col--action" aria-hidden="true" />
                </div>
                <router-link
                  v-for="entry in entries"
                  :key="entry.transRef"
                  :to="{ name: 'entry', query: { transRef: entry.transRef, from: 'overdue' } }"
                  class="overdue-modal-row"
                  @click="$emit('close', { navigating: true })"
                >
                  <span class="overdue-modal-col overdue-modal-col--vendor truncate font-medium text-[var(--color-text)]">
                    {{ entry.vendorName || '—' }}
                  </span>
                  <span class="overdue-modal-col overdue-modal-col--ref text-[var(--color-text-muted)] text-[var(--label-size)] truncate font-mono">
                    {{ entry.transRef || '—' }}
                  </span>
                  <span class="overdue-modal-col overdue-modal-col--posted text-[var(--color-text-muted)] text-[var(--label-size)] tabular-nums">
                    {{ formatPostedDate(entry.postedDate) }}
                  </span>
                  <span class="overdue-modal-col overdue-modal-col--days">
                    <span
                      v-if="entry.daysOverdue != null"
                      class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium tabular-nums"
                      :class="entry.daysOverdue >= 14 ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-500/10 text-amber-300/90'"
                    >
                      {{ entry.daysOverdue }} {{ entry.daysOverdue === 1 ? 'day' : 'days' }}
                    </span>
                    <span v-else class="text-[var(--color-text-muted)]">—</span>
                  </span>
                  <span class="overdue-modal-col overdue-modal-col--amount tabular-nums font-medium text-[var(--color-text)]">
                    {{ formatAmount(entry) }}
                  </span>
                  <span class="overdue-modal-col overdue-modal-col--action overdue-modal-row__arrow">
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </router-link>
              </div>
            </div>

            <!-- Open all + Footer totals -->
            <div class="px-6 py-4 border-t border-[var(--color-border)] shrink-0 space-y-3">
              <button
                type="button"
                class="pill-btn w-full inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] px-4 py-2.5 text-white hover:opacity-90 rounded-xl font-medium"
                @click="openAllInBooklet"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                {{ entries.length === 1 ? 'Open entry' : 'Open all in booklet' }}
              </button>
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
              <div class="text-sm text-[var(--color-text-muted)]">
                <span class="font-medium text-[var(--color-text)]">{{ entries.length }}</span>
                {{ entries.length === 1 ? 'entry' : 'entries' }}
              </div>
              <template v-for="(sum, currency) in totalsByCurrency" :key="currency">
                <div class="text-sm">
                  <span class="text-[var(--color-text-muted)]">{{ currency }} total:</span>
                  <span class="font-medium text-[var(--color-text)] tabular-nums ml-1.5">{{ formatNumberDisplay(sum) }}</span>
                </div>
              </template>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { OverdueEntry } from '../stores/listSummaryStore'
import { useBookletStore } from '../stores/bookletStore'
import { formatNumberDisplay } from '../utils/formatNumber'

const props = defineProps<{
  visible: boolean
  entries: OverdueEntry[]
  loading?: boolean
}>()

const emit = defineEmits<{ close: [payload?: { navigating?: boolean }] }>()
const router = useRouter()
const booklet = useBookletStore()

function openAllInBooklet() {
  const refs = props.entries.map((e) => e.transRef).filter(Boolean)
  if (refs.length === 0) return
  booklet.openBookletWithRefs(refs, 'overdue')
  router.push({ name: 'entry', query: { transRef: refs[0], from: 'overdue' } })
  emit('close', { navigating: true })
}

const totalsByCurrency = computed(() => {
  const map: Record<string, number> = {}
  for (const e of props.entries) {
    if (e.currency && e.total != null && Number.isFinite(e.total)) {
      map[e.currency] = (map[e.currency] ?? 0) + e.total
    }
  }
  return map
})

function formatAmount(entry: OverdueEntry): string {
  if (entry.currency && entry.total != null && Number.isFinite(entry.total)) {
    return `${entry.currency} ${formatNumberDisplay(entry.total)}`
  }
  return entry.transRef || '—'
}

function formatPostedDate(dateStr: string | undefined): string {
  if (!dateStr?.trim()) return '—'
  const d = new Date(dateStr + 'T12:00:00')
  if (isNaN(d.getTime())) return dateStr
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
</script>

<style scoped>
.overdue-modal-header {
  display: grid;
  grid-template-columns: 1fr minmax(5rem, 7rem) minmax(7rem, 9rem) minmax(5rem, 7rem) minmax(8rem, 10rem) 2rem;
  gap: 0 1rem;
  align-items: center;
  padding: 0.5rem 0 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.overdue-modal-header .overdue-modal-col--amount {
  text-align: right;
}

.overdue-modal-row {
  display: grid;
  grid-template-columns: 1fr minmax(5rem, 7rem) minmax(7rem, 9rem) minmax(5rem, 7rem) minmax(8rem, 10rem) 2rem;
  gap: 0 1rem;
  align-items: center;
  padding: 0.875rem 0.75rem;
  margin: 0 -0.75rem;
  border-radius: 0.75rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  text-decoration: none;
  transition: background 0.2s ease, box-shadow 0.2s ease;
}

.overdue-modal-row:last-child {
  border-bottom: none;
}

.overdue-modal-row:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.12);
}

.overdue-modal-row__arrow {
  color: var(--color-text-muted);
  transition: color 0.2s ease, transform 0.2s ease;
}

.overdue-modal-row:hover .overdue-modal-row__arrow {
  color: var(--color-text);
  transform: translateX(2px);
}

.overdue-modal-row .overdue-modal-col--amount {
  text-align: right;
}
</style>
