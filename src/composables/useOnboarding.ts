/**
 * Onboarding state for new users. Loads Onboarded from Payables_Users and
 * updates it when the user dismisses the onboarding modal.
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useFileMaker } from './useFileMaker'
import { LAYOUTS } from '../utils/filemakerApi'
import type { PayablesUsersFieldData } from '../utils/filemakerApi'

function getFieldValue(fd: Record<string, unknown> | undefined, key: string): string {
  if (!fd) return ''
  const v =
    fd[key] ??
    fd[key.replace(/([A-Z])/g, ' $1').trim()] ??
    fd[key.charAt(0).toLowerCase() + key.slice(1)]
  if (v == null || v === '') return ''
  return String(v).trim()
}

function isOnboarded(value: string | undefined | null): boolean {
  if (value == null || value === '') return false
  const lower = String(value).trim().toLowerCase()
  return lower === '1' || lower === 'yes' || lower === 'true'
}

const userRecordId = ref<string | null>(null)
const onboarded = ref<boolean>(true) // default true so we don't flash modal before load
const userRole = ref<string | null>(null)
const onboardLoaded = ref(false)

export function useOnboarding() {
  const { loggedInEmail, isConnected, findRecordsByQueryWithIds, findRecordsWithIds, updateRecord } = useFileMaker()

  const needsOnboarding = computed(
    () => onboardLoaded.value && !onboarded.value && userRecordId.value != null
  )

  const roleLower = computed(() => (userRole.value ?? '').trim().toLowerCase())

  async function loadOnboardingStatus() {
    const email = loggedInEmail.value
    if (!email || !isConnected.value) {
      userRecordId.value = null
      onboarded.value = true
      userRole.value = null
      onboardLoaded.value = false
      return
    }
    const normalizedEmail = String(email).trim().toLowerCase()
    const { data } = await findRecordsByQueryWithIds<PayablesUsersFieldData>(
      LAYOUTS.PAYABLES_USERS,
      { Email: email },
      1
    )
    let recordId: string | null = null
    let fd: Record<string, unknown> | undefined
    if (data?.[0]) {
      recordId = data[0].recordId ?? null
      fd = data[0].fieldData as Record<string, unknown>
    } else {
      const { data: users } = await findRecordsWithIds<
        PayablesUsersFieldData | Record<string, unknown>
      >(LAYOUTS.PAYABLES_USERS, { limit: 500 })
      const match = users.find((r) => {
        const rowFd = r?.fieldData as Record<string, unknown> | undefined
        const rowEmail = getFieldValue(rowFd, 'Email')
        return rowEmail.trim().toLowerCase() === normalizedEmail
      })
      if (match) {
        recordId = match.recordId ?? null
        fd = match.fieldData as Record<string, unknown>
      }
    }
    userRecordId.value = recordId
    if (fd) {
      const onboardedVal = getFieldValue(fd, 'Onboarded')
      const role = getFieldValue(fd, 'Role')
      onboarded.value = isOnboarded(onboardedVal)
      userRole.value = role || null
    } else {
      onboarded.value = true
      userRole.value = null
    }
    onboardLoaded.value = true
  }

  async function markOnboarded(): Promise<boolean> {
    const rid = userRecordId.value
    if (!rid) return false
    const { error } = await updateRecord(LAYOUTS.PAYABLES_USERS, rid, { Onboarded: '1' })
    if (error) return false
    onboarded.value = true
    return true
  }

  watch(
    [isConnected, loggedInEmail],
    () => {
      if (isConnected.value && loggedInEmail.value) {
        loadOnboardingStatus()
      } else {
        userRecordId.value = null
        onboarded.value = true
        userRole.value = null
        onboardLoaded.value = false
      }
    },
    { immediate: true }
  )

  onMounted(() => {
    if (isConnected.value && loggedInEmail.value) {
      loadOnboardingStatus()
    }
  })

  return {
    needsOnboarding,
    userRole: roleLower,
    markOnboarded,
  }
}
