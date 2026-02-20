/**
 * Shared composable for current user's role from Payables_Users.
 * Used by AppSidebar, AppSidebarRight, SettingsView, HomeView for role-based UI.
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useFileMaker } from './useFileMaker'
import { LAYOUTS } from '../utils/filemakerApi'
import type { PayablesUsersFieldData } from '../utils/filemakerApi'

const STORAGE_KEY_ROLE = 'fm_user_role'

const userRole = ref<string | null>(null)
const roleLoaded = ref(false)

function getFieldValue(fd: Record<string, unknown> | undefined, key: string): string {
  if (!fd) return ''
  const v =
    fd[key] ??
    fd[key.replace(/([A-Z])/g, ' $1').trim()] ??
    fd[key.charAt(0).toLowerCase() + key.slice(1)]
  if (v == null || v === '') return ''
  return String(v).trim()
}

export function useUserRole() {
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

  const roleLower = computed(() => (userRole.value ?? '').trim().toLowerCase())
  const isManager = computed(() => roleLoaded.value && roleLower.value === 'manager')
  const isOfficer = computed(() => roleLoaded.value && roleLower.value === 'officer')
  /** True when role loaded and user is not Manager (show nav items Manager should not see). */
  const showForManager = computed(() => roleLoaded.value && roleLower.value !== 'manager')

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
      const { data: users } = await findRecordsWithIds<
        PayablesUsersFieldData | Record<string, unknown>
      >(LAYOUTS.PAYABLES_USERS, { limit: 500 })
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

  watch(
    [isConnected, loggedInEmail],
    () => {
      if (isConnected.value && loggedInEmail.value) {
        const cached = readCachedRole()
        if (cached != null) {
          userRole.value = cached
          roleLoaded.value = true
        }
        loadUserRole()
      } else {
        userRole.value = null
        roleLoaded.value = false
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (isConnected.value && loggedInEmail.value) {
      const cached = readCachedRole()
      if (cached != null) {
        userRole.value = cached
        roleLoaded.value = true
      }
      loadUserRole()
    }
  })

  return { userRole, roleLower, isManager, isOfficer, showForManager, loadUserRole }
}
