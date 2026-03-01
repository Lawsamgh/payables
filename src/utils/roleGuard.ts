/**
 * Role guard helpers for router. Reads cached role from sessionStorage.
 * Must match useUserRole's storage format.
 */

const STORAGE_KEY_ROLE = 'fm_user_role'
const STORAGE_KEY_EMAIL = 'fm_logged_in_email'

/** Returns cached role (admin, manager, officer) or null if not available/invalid. */
export function getCachedRole(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY_ROLE)
    if (!raw) return null
    const { email, role } = JSON.parse(raw) as { email?: string; role?: string }
    const storedEmail = localStorage.getItem(STORAGE_KEY_EMAIL)?.trim().toLowerCase()
    if (!email || !storedEmail || email.trim().toLowerCase() !== storedEmail) return null
    return role && String(role).trim() ? String(role).trim().toLowerCase() : null
  } catch {
    return null
  }
}
