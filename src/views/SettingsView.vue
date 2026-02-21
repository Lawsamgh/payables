<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="mb-10">
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        Settings
      </h1>
      <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
        Configure your preferences.
      </p>
    </header>

    <div class="flex flex-col gap-10">
      <!-- Account -->
      <section class="settings-section">
        <h2 class="settings-section__title">Account</h2>
        <div class="settings-list">
          <router-link
            v-if="showManageUsersAndDocuments"
            to="/settings/users"
            class="settings-item no-underline"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Manage Users</span>
              <span class="settings-item__desc"
                >Add, edit, and remove user accounts</span
              >
            </div>
            <svg
              class="settings-item__chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </router-link>
          <button
            type="button"
            class="settings-item settings-item--btn"
            @click="showResetPasswordModal = true"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l11.964-11.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Reset password</span>
              <span class="settings-item__desc">Change your sign-in password</span>
            </div>
            <svg
              class="settings-item__chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </section>

      <!-- Logs (Admin and Manager only) -->
      <section v-if="showLogs" class="settings-section">
        <h2 class="settings-section__title">Audit</h2>
        <div class="settings-list">
          <router-link
            to="/settings/logs"
            class="settings-item no-underline"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Activity Logs</span>
              <span class="settings-item__desc"
                >View audit trail of entries</span
              >
            </div>
            <svg
              class="settings-item__chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </router-link>
        </div>
      </section>

      <!-- Documents (hidden for Officer/Manager) -->
      <section v-if="showManageUsersAndDocuments" class="settings-section">
        <h2 class="settings-section__title">Documents</h2>
        <div class="settings-list">
          <router-link to="/settings/documents" class="settings-item no-underline">
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Documents</span>
              <span class="settings-item__desc"
                >View and manage documents</span
              >
            </div>
            <svg
              class="settings-item__chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </router-link>
        </div>
      </section>

      <!-- General -->
      <section class="settings-section">
        <h2 class="settings-section__title">General</h2>
        <div class="settings-list">
          <div class="settings-item settings-item--disabled">
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Notifications</span>
              <span class="settings-item__desc">Email and in-app alerts</span>
            </div>
            <span class="settings-item__badge">Coming soon</span>
          </div>
        </div>
      </section>
    </div>

    <ResetPasswordModal
      :visible="showResetPasswordModal"
      @close="showResetPasswordModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useFileMaker } from '../composables/useFileMaker'
import { LAYOUTS } from '../utils/filemakerApi'
import type { PayablesUsersFieldData } from '../utils/filemakerApi'
import ResetPasswordModal from '../components/ResetPasswordModal.vue'

const STORAGE_KEY_ROLE = 'fm_user_role'

const showResetPasswordModal = ref(false)
const userRole = ref<string | null>(null)
const roleLoaded = ref(false)

const { loggedInEmail, isConnected, findRecordsByQueryWithIds, findRecordsWithIds } = useFileMaker()

function readCachedRole(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_ROLE)
    if (!raw) return null
    const { email, role } = JSON.parse(raw) as { email?: string; role?: string }
    const current = loggedInEmail.value?.trim().toLowerCase()
    if (!email || !current || email.toLowerCase() !== current) return null
    return role && String(role).trim() ? String(role).trim() : null
  } catch {
    return null
  }
}

function writeCachedRole(role: string | null) {
  try {
    const email = loggedInEmail.value?.trim()
    if (!email) return
    sessionStorage.setItem(STORAGE_KEY_ROLE, JSON.stringify({ email, role: role ?? '' }))
  } catch {
    /* ignore */
  }
}

const showManageUsersAndDocuments = computed(() => {
  if (!roleLoaded.value) return false
  const r = userRole.value?.trim()
  if (!r) return false
  const lower = r.toLowerCase()
  return lower !== 'officer' && lower !== 'manager'
})

const showLogs = computed(() => {
  if (!roleLoaded.value) return false
  const r = userRole.value?.trim().toLowerCase()
  return r === 'admin' || r === 'manager'
})

function getFieldValue(fd: Record<string, unknown> | undefined, key: string): string {
  if (!fd) return ''
  const v = fd[key] ?? fd[key.replace(/([A-Z])/g, ' $1').trim()] ?? fd[key.charAt(0).toLowerCase() + key.slice(1)]
  if (v == null || v === '') return ''
  return String(v).trim()
}

async function loadUserRole() {
  const email = loggedInEmail.value
  if (!email || !isConnected.value) {
    userRole.value = null
    roleLoaded.value = false
    return
  }
  const normalizedEmail = String(email).trim().toLowerCase()
  const { data } = await findRecordsByQueryWithIds<PayablesUsersFieldData>(
    LAYOUTS.PAYABLES_USERS,
    { Email: email },
    1
  )
  let fd: Record<string, unknown> | undefined = data?.[0]?.fieldData as Record<string, unknown> | undefined
  if (!data?.length) {
    const { data: users } = await findRecordsWithIds<PayablesUsersFieldData | Record<string, unknown>>(
      LAYOUTS.PAYABLES_USERS,
      { limit: 500 }
    )
    const match = users.find((r) => {
      const rowFd = r?.fieldData as Record<string, unknown> | undefined
      const rowEmail = getFieldValue(rowFd, 'Email')
      return rowEmail.trim().toLowerCase() === normalizedEmail
    })
    fd = match?.fieldData as Record<string, unknown> | undefined
  }
  const role = getFieldValue(fd, 'Role')
  userRole.value = role || null
  roleLoaded.value = true
  writeCachedRole(userRole.value)
}

watch([isConnected, loggedInEmail], () => {
  if (isConnected.value && loggedInEmail.value) loadUserRole()
  else {
    userRole.value = null
    roleLoaded.value = false
  }
})

onMounted(() => {
  const email = loggedInEmail.value
  if (email && isConnected.value) {
    const cached = readCachedRole()
    if (cached != null) {
      userRole.value = cached
      roleLoaded.value = true
    }
    loadUserRole()
  }
})
</script>

<style scoped>
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.settings-section__title {
  margin: 0;
  padding: 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-bg-card);
  text-align: left;
  transition: background-color 0.2s ease;
}

.settings-item--btn {
  width: 100%;
  cursor: pointer;
  font: inherit;
  color: inherit;
  border: none;
}

.settings-item--btn:hover,
a.settings-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.settings-item--disabled {
  opacity: 0.65;
  cursor: default;
}

.settings-item__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 8px;
  color: var(--color-accent);
}

.settings-item__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.settings-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.settings-item__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
}

.settings-item__desc {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.settings-item__chevron {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-muted);
}

.settings-item__badge {
  flex-shrink: 0;
  padding: 0.2rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}
</style>
