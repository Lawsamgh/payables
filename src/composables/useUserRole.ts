/**
 * Shared composable for current user's role from Payables_Users.
 * Used by AppSidebar, AppSidebarRight, SettingsView, HomeView for role-based UI.
 * Data is loaded once via currentUserFromPayablesStore and shared across all consumers.
 */

import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useFileMaker } from './useFileMaker'
import { useCurrentUserFromPayablesStore } from '../stores/currentUserFromPayablesStore'

const STORAGE_KEY_ROLE = 'fm_user_role'

export function useUserRole() {
  const { loggedInEmail, isConnected } = useFileMaker()
  const userStore = useCurrentUserFromPayablesStore()
  const { role: userRole, fullName: userFullName, loaded: roleLoaded } = storeToRefs(userStore)

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
  const isAdmin = computed(() => roleLoaded.value && roleLower.value === 'admin')
  const isManager = computed(() => roleLoaded.value && roleLower.value === 'manager')
  const isOfficer = computed(() => roleLoaded.value && roleLower.value === 'officer')
  /** True when role loaded and user is not Manager (show nav items Manager should not see). */
  const showForManager = computed(() => roleLoaded.value && roleLower.value !== 'manager')
  /** True when Admin or Manager (can view activity logs). */
  const canViewLogs = computed(
    () => roleLoaded.value && (roleLower.value === 'admin' || roleLower.value === 'manager')
  )

  watch(userRole, (r) => r != null && writeCachedRole(r), { immediate: true })

  watch(
    [isConnected, loggedInEmail],
    () => {
      if (isConnected.value && loggedInEmail.value) {
        const cached = readCachedRole()
        if (cached != null) userStore.setRoleFromCache(cached)
      }
    },
    { immediate: true }
  )

  return {
    userRole,
    userFullName,
    roleLower,
    isAdmin,
    isManager,
    isOfficer,
    showForManager,
    canViewLogs,
    roleLoaded,
    loadUserRole: () => userStore.loadCurrentUser(),
  }
}
