<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
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
          Notification emails
        </h1>
        <p class="mt-1 text-[13px] text-[var(--color-text-muted)]">
          Manage the list of email recipients. Toggle Active to control who appears in the notification recipient dropdown.
        </p>
      </div>
      <button
        v-if="isConnected"
        type="button"
        class="pill-btn inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
        @click="showAddModal = true"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add email
      </button>
    </header>

    <div class="tax-table-wrap">
      <template v-if="emailList.loading">
        <div class="tax-table-skeleton">
          <table class="tax-table">
            <thead>
              <tr>
                <th><Skeleton width="12rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="10rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="5rem" height="0.875rem" class="rounded" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="i" class="tax-table-skeleton__row">
                <td><Skeleton width="70%" height="0.875rem" class="rounded max-w-[16rem]" /></td>
                <td><Skeleton width="60%" height="0.875rem" class="rounded max-w-[12rem]" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else-if="emailList.error" class="tax-table-error">
        {{ emailList.error }}
      </div>
      <div v-else-if="!isConnected" class="tax-table-empty">
        <p>Connect to FileMaker to view emails.</p>
      </div>
      <div v-else-if="emailList.allEmails.length === 0" class="tax-table-empty">
        <p>No emails yet.</p>
        <button
          type="button"
          class="pill-btn mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
          @click="showAddModal = true"
        >
          Add your first email
        </button>
      </div>
      <div v-else>
        <div class="tax-table-scroll">
          <table class="tax-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Label</th>
                <th class="tax-table__actions-th">Active</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in paginatedEmails" :key="row.recordId || index">
                <td>{{ row.email }}</td>
                <td>{{ row.label || '—' }}</td>
                <td class="tax-table__actions-td">
                  <button
                    type="button"
                    class="email-toggle"
                    :class="{ 'email-toggle--on': row.active, 'email-toggle--busy': togglingRecordId === row.recordId }"
                    :aria-label="row.active ? 'Set inactive' : 'Set active'"
                    :disabled="togglingRecordId === row.recordId"
                    @click="toggleActive(row)"
                  >
                    <span class="email-toggle__track">
                      <span class="email-toggle__thumb" />
                    </span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="totalPages > 1" class="pagination">
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPage <= 1"
            aria-label="Previous page"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            <svg class="pagination__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="pagination__label">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPage >= totalPages"
            aria-label="Next page"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            <svg class="pagination__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <AddEmailModal
      :visible="showAddModal"
      @close="showAddModal = false"
      @added="onEmailAdded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useEmailListStore } from '../stores/emailListStore'
import { useFileMaker } from '../composables/useFileMaker'
import { useToastStore } from '../stores/toastStore'
import type { EmailListFullItem } from '../stores/emailListStore'
import Skeleton from '../components/Skeleton.vue'
import AddEmailModal from '../components/AddEmailModal.vue'

const emailList = useEmailListStore()
const toast = useToastStore()
const { isConnected } = useFileMaker()

const PAGE_SIZE = 10
const showAddModal = ref(false)
const togglingRecordId = ref<string | null>(null)
const currentPage = ref(1)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(emailList.allEmails.length / PAGE_SIZE))
)
const paginatedEmails = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE
  return emailList.allEmails.slice(start, start + PAGE_SIZE)
})

onMounted(() => {
  emailList.loadEmailList()
})

watch(totalPages, (total) => {
  if (currentPage.value > total) currentPage.value = Math.max(1, total)
})

watch(() => emailList.allEmails.length, () => {
  currentPage.value = 1
})

async function toggleActive(row: EmailListFullItem) {
  if (togglingRecordId.value) return
  togglingRecordId.value = row.recordId
  const { error } = await emailList.setEmailActive(row.recordId, !row.active)
  togglingRecordId.value = null
  if (error) {
    toast.error('Failed to update: ' + error)
  } else {
    toast.success(row.active ? 'Email set to inactive.' : 'Email set to active.')
  }
}

function onEmailAdded() {
  showAddModal.value = false
}
</script>

<style scoped>
.email-toggle {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 9999px;
}
.email-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.email-toggle__track {
  display: flex;
  align-items: center;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
  border: 1px solid var(--color-border);
  transition: background-color 0.2s, border-color 0.2s;
}
.email-toggle--on .email-toggle__track {
  background: rgba(52, 211, 153, 0.35);
  border-color: rgba(52, 211, 153, 0.5);
}
.email-toggle__thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-text-muted);
  margin-left: 0.125rem;
  transition: transform 0.2s, background-color 0.2s;
}
.email-toggle--on .email-toggle__thumb {
  transform: translateX(1rem);
  background: rgb(52, 211, 153);
}
.email-toggle--busy .email-toggle__thumb {
  opacity: 0.6;
}
</style>
