/**
 * Onboarding state for new users. Loads Onboarded from Payables_Users and
 * updates it when the user dismisses the onboarding modal.
 * Data is loaded once via currentUserFromPayablesStore and shared with useUserRole.
 */

import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useFileMaker } from './useFileMaker'
import { LAYOUTS } from '../utils/filemakerApi'
import { useCurrentUserFromPayablesStore } from '../stores/currentUserFromPayablesStore'

export function useOnboarding() {
  const { updateRecord } = useFileMaker()
  const userStore = useCurrentUserFromPayablesStore()
  const { recordId: userRecordId, onboarded, loaded: onboardLoaded } = storeToRefs(userStore)

  const needsOnboarding = computed(
    () => onboardLoaded.value && !onboarded.value && userRecordId.value != null
  )

  const roleLower = computed(() => (userStore.role ?? '').trim().toLowerCase())

  async function markOnboarded(): Promise<boolean> {
    const rid = userRecordId.value
    if (!rid) return false
    const { error } = await updateRecord(LAYOUTS.PAYABLES_USERS, rid, { Onboarded: '1' })
    if (error) return false
    userStore.markOnboardedComplete()
    return true
  }

  return {
    needsOnboarding,
    userRole: roleLower,
    markOnboarded,
  }
}
