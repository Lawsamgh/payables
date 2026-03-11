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
  const { runScript, loggedInEmail } = useFileMaker()
  const userStore = useCurrentUserFromPayablesStore()
  const { recordId: userRecordId, onboarded, loaded: onboardLoaded } = storeToRefs(userStore)

  const needsOnboarding = computed(
    () => onboardLoaded.value && !onboarded.value && userRecordId.value != null
  )

  const roleLower = computed(() => (userStore.role ?? '').trim().toLowerCase())

  async function markOnboarded(): Promise<boolean> {
    const email = loggedInEmail.value?.trim()
    if (!email) return false
    const scriptParam = JSON.stringify({ email })
    const { error, scriptError } = await runScript(
      LAYOUTS.PAYABLES_USERS,
      'UpdateOnboardingField',
      scriptParam
    )
    const code = (scriptError ?? '0').trim()
    if (error || code !== '0') return false
    userStore.markOnboardedComplete()
    return true
  }

  return {
    needsOnboarding,
    userRole: roleLower,
    markOnboarded,
  }
}
