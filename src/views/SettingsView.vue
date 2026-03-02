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
      <!-- Help -->
      <section class="settings-section">
        <h2 class="settings-section__title">Help</h2>
        <div class="settings-list">
          <router-link
            to="/settings/shortcuts"
            class="settings-item no-underline"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Keyboard shortcuts</span>
              <span class="settings-item__desc">View all keyboard shortcuts</span>
            </div>
            <svg
              class="settings-item__chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </section>

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

      <!-- Features (Admin only) -->
      <section v-if="userRole?.toLowerCase() === 'admin'" class="settings-section">
        <h2 class="settings-section__title">General</h2>
        <div class="settings-list">
          <router-link
            to="/settings/features"
            class="settings-item no-underline"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Features</span>
              <span class="settings-item__desc">Enable or disable features for your organisation</span>
            </div>
            <svg
              class="settings-item__chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
          <router-link
            to="/settings/qr-code"
            class="settings-item no-underline"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Generate QR Code</span>
              <span class="settings-item__desc">Configure URL for vendor cheque collection QR code</span>
            </div>
            <svg
              class="settings-item__chevron"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
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

      <!-- Notifications (Admin only) -->
      <section v-if="userRole?.toLowerCase() === 'admin'" class="settings-section">
        <h2 class="settings-section__title">Notifications</h2>
        <div class="settings-list">
          <router-link
            to="/settings/emails"
            class="settings-item no-underline"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Manage notification emails</span>
              <span class="settings-item__desc">View list and set Active (Yes/No) for each recipient</span>
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
          <div class="settings-item settings-item--form">
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
            <div class="settings-item__content settings-item__content--full">
              <span class="settings-item__title">Notification recipient (HOD Email)</span>
              <span class="settings-item__desc"
                >Choose who receives notification mails, or add a new email to the list</span
              >
              <div class="notification-dropdown mt-3">
                <div
                  ref="dropdownTriggerRef"
                  class="notification-dropdown__trigger"
                  :class="{
                    'notification-dropdown__trigger--open': dropdownOpen,
                    'notification-dropdown__trigger--disabled': savingHodEmail || emailList.loading,
                    'notification-dropdown__trigger--empty': !hodEmailInput,
                  }"
                  role="combobox"
                  aria-expanded="dropdownOpen"
                  aria-haspopup="listbox"
                  aria-controls="notification-recipient-list"
                  :aria-disabled="savingHodEmail || emailList.loading"
                  @click="toggleDropdown"
                >
                  <span class="notification-dropdown__value">
                    {{ selectedLabel || 'Select recipient' }}
                  </span>
                  <button
                    type="button"
                    class="notification-dropdown__add-icon-btn"
                    :disabled="savingHodEmail || emailList.loading"
                    title="Add new email to list"
                    aria-label="Add email"
                    @click.stop="showAddEmailModal = true"
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                  <svg
                    class="notification-dropdown__chevron"
                    :class="{ 'notification-dropdown__chevron--open': dropdownOpen }"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <Teleport to="body">
                <div
                  v-if="dropdownOpen && dropdownPosition"
                  id="notification-recipient-list"
                  ref="dropdownListRef"
                  class="notification-dropdown__list"
                  role="listbox"
                  :style="{
                    position: 'fixed',
                    top: `${dropdownPosition.top}px`,
                    left: `${dropdownPosition.left}px`,
                    width: `${dropdownPosition.width}px`,
                  }"
                >
                  <button
                    type="button"
                    class="notification-dropdown__item"
                    :class="{ 'notification-dropdown__item--selected': !hodEmailInput }"
                    role="option"
                    aria-selected="!hodEmailInput"
                    @click="selectOption('')"
                  >
                    <span class="notification-dropdown__item-label">— None —</span>
                  </button>
                  <button
                    v-for="opt in hodEmailOptions"
                    :key="opt.email"
                    type="button"
                    class="notification-dropdown__item"
                    :class="{ 'notification-dropdown__item--selected': hodEmailInput === opt.email }"
                    role="option"
                    :aria-selected="hodEmailInput === opt.email"
                    @click="selectOption(opt.email)"
                  >
                    <span class="notification-dropdown__item-label">{{ opt.label || opt.email }}</span>
                    <span v-if="opt.label" class="notification-dropdown__item-email">{{ opt.email }}</span>
                  </button>
                </div>
              </Teleport>
              <p v-if="hodEmailError" class="settings-notification__error mt-2">
                {{ hodEmailError }}
              </p>
              <p
                v-else-if="!emailList.loading && hodEmailOptions.length === 0"
                class="settings-notification__hint mt-2 text-[var(--color-text-muted)] text-[13px]"
              >
                No emails yet. Click the + icon to add a notification recipient.
              </p>
            </div>
          </div>
        </div>
      </section>

      <AddEmailModal
        :visible="showAddEmailModal"
        @close="showAddEmailModal = false"
        @added="onEmailAdded"
      />
    </div>

    <ResetPasswordModal
      :visible="showResetPasswordModal"
      @close="showResetPasswordModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useFileMaker } from '../composables/useFileMaker'
import { useDocumentSettingsStore } from '../stores/documentSettingsStore'
import { useEmailListStore } from '../stores/emailListStore'
import { useToastStore } from '../stores/toastStore'
import { LAYOUTS } from '../utils/filemakerApi'
import type { PayablesUsersFieldData } from '../utils/filemakerApi'
import ResetPasswordModal from '../components/ResetPasswordModal.vue'
import AddEmailModal from '../components/AddEmailModal.vue'

const STORAGE_KEY_ROLE = 'fm_user_role'

const showResetPasswordModal = ref(false)
const userRole = ref<string | null>(null)
const roleLoaded = ref(false)

const documentSettings = useDocumentSettingsStore()
const emailList = useEmailListStore()
const toast = useToastStore()
const hodEmailInput = ref('')
const savingHodEmail = ref(false)
const hodEmailError = ref<string | null>(null)
const dropdownOpen = ref(false)
const dropdownTriggerRef = ref<HTMLElement | null>(null)
const dropdownListRef = ref<HTMLElement | null>(null)
const dropdownPosition = ref<{ top: number; left: number; width: number } | null>(null)
const showAddEmailModal = ref(false)

const { loggedInEmail, isConnected, findRecordsByQueryWithIds, findRecordsWithIds } = useFileMaker()

watch(
  () => documentSettings.hodEmail,
  (v) => {
    hodEmailInput.value = v ?? ''
  },
  { immediate: true },
)

const hodEmailOptions = computed(() => {
  const list = emailList.options
  const current = (documentSettings.hodEmail ?? '').trim()
  if (!current) return list
  const hasCurrent = list.some((o) => o.email.toLowerCase() === current.toLowerCase())
  if (hasCurrent) return list
  return [{ email: current, label: current }, ...list]
})

const selectedLabel = computed(() => {
  if (!hodEmailInput.value) return ''
  const opt = hodEmailOptions.value.find((o) => o.email === hodEmailInput.value)
  return opt ? (opt.label || opt.email) : hodEmailInput.value
})

function updateDropdownPosition() {
  const el = dropdownTriggerRef.value
  if (!el) {
    dropdownPosition.value = null
    return
  }
  const rect = el.getBoundingClientRect()
  dropdownPosition.value = {
    top: rect.bottom + 6,
    left: rect.left,
    width: Math.max(rect.width, 280),
  }
}

function toggleDropdown() {
  if (savingHodEmail.value || emailList.loading) return
  dropdownOpen.value = !dropdownOpen.value
  if (dropdownOpen.value) {
    setTimeout(updateDropdownPosition, 0)
  } else {
    dropdownPosition.value = null
  }
}

function selectOption(email: string) {
  hodEmailInput.value = email
  dropdownOpen.value = false
  dropdownPosition.value = null
  saveHodEmailField()
}

function onEmailAdded(email: string) {
  hodEmailInput.value = email
  saveHodEmailField()
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as Node
  if (
    dropdownOpen.value &&
    dropdownTriggerRef.value &&
    !dropdownTriggerRef.value.contains(target) &&
    dropdownListRef.value &&
    !dropdownListRef.value.contains(target)
  ) {
    dropdownOpen.value = false
    dropdownPosition.value = null
  }
}

async function saveHodEmailField() {
  hodEmailError.value = null
  savingHodEmail.value = true
  const { error } = await documentSettings.saveHodEmail(hodEmailInput.value ?? '')
  savingHodEmail.value = false
  if (error) hodEmailError.value = error
}

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

function handleScroll() {
  if (dropdownOpen.value) {
    updateDropdownPosition()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', handleScroll, true)
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

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', handleScroll, true)
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

.settings-item--form {
  flex-wrap: wrap;
  align-items: flex-start;
}

.settings-item__content--full {
  flex: 1;
  min-width: 0;
}

.settings-notification__input-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.notification-dropdown {
  position: relative;
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.notification-dropdown__trigger {
  position: relative;
  flex: 1;
  min-width: 14rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.9375rem;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-dropdown__trigger:hover:not(.notification-dropdown__trigger--disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(148, 163, 184, 0.25);
}

.notification-dropdown__trigger--open {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 2px rgba(251, 146, 60, 0.2);
}

.notification-dropdown__trigger--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.notification-dropdown__value {
  flex: 1;
  min-width: 0;
  text-align: left;
}

.notification-dropdown__trigger:not(.notification-dropdown__trigger--disabled) .notification-dropdown__value {
  color: var(--color-text);
}

.notification-dropdown__trigger--empty .notification-dropdown__value {
  color: var(--color-text-muted);
}

.notification-dropdown__chevron {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-muted);
  transition: transform 0.2s ease;
}

.notification-dropdown__chevron--open {
  transform: rotate(180deg);
  color: var(--color-accent);
}

.notification-dropdown__list {
  min-width: 18rem;
  max-height: 240px;
  overflow-y: auto;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 0.5rem;
}


.notification-dropdown__item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.125rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  font-size: 0.875rem;
  text-align: left;
  color: var(--color-text);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.notification-dropdown__item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.notification-dropdown__item--selected {
  background: rgba(251, 146, 60, 0.15);
  color: var(--color-accent);
}

.notification-dropdown__item-label {
  font-weight: 500;
}

.notification-dropdown__item-email {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.notification-dropdown__add-icon-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  color: var(--color-text-muted);
  background: transparent;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.notification-dropdown__add-icon-btn:hover:not(:disabled) {
  color: var(--color-accent);
  background: rgba(251, 146, 60, 0.15);
}

.notification-dropdown__add-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.notification-dropdown__add-icon-btn svg {
  width: 1rem;
  height: 1rem;
}

.settings-item--form .notification-dropdown {
  position: relative;
}

.settings-notification__save {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
  font-weight: 600;
  background: var(--color-accent);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.settings-notification__save:hover:not(:disabled) {
  opacity: 0.9;
}

.settings-notification__save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.settings-notification__error {
  font-size: 0.8125rem;
  color: rgb(248, 113, 113);
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

.settings-toggle {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.settings-toggle__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
.settings-toggle__input:disabled + .settings-toggle__track {
  opacity: 0.6;
  cursor: not-allowed;
}
.settings-toggle__track {
  display: flex;
  align-items: center;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
  border: 1px solid var(--color-border);
  transition: background-color 0.2s, border-color 0.2s;
}
.settings-toggle__track::after {
  content: '';
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-text-muted);
  margin-left: 0.125rem;
  transition: transform 0.2s, background-color 0.2s;
}
.settings-toggle__input:checked + .settings-toggle__track {
  background: rgba(251, 146, 60, 0.25);
  border-color: rgba(251, 146, 60, 0.5);
}
.settings-toggle__input:checked + .settings-toggle__track::after {
  transform: translateX(1rem);
  background: var(--color-accent);
}
</style>
