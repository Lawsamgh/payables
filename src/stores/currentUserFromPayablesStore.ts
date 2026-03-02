/**
 * Single source of truth for current user data from Payables_Users.
 * Loads once and shares data with useUserRole and useOnboarding to avoid duplicate API calls.
 */

import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { PayablesUsersFieldData } from "../utils/filemakerApi";

function getFieldValue(
  fd: Record<string, unknown> | undefined,
  key: string
): string {
  if (!fd) return "";
  const v =
    fd[key] ??
    fd[key.replace(/([A-Z])/g, " $1").trim()] ??
    fd[key.charAt(0).toLowerCase() + key.slice(1)];
  if (v == null || v === "") return "";
  return String(v).trim();
}

function isOnboarded(value: string | undefined | null): boolean {
  if (value == null || value === "") return false;
  const lower = String(value).trim().toLowerCase();
  return lower === "1" || lower === "yes" || lower === "true";
}

export const useCurrentUserFromPayablesStore = defineStore(
  "currentUserFromPayables",
  () => {
    const recordId = ref<string | null>(null);
    const role = ref<string | null>(null);
    const fullName = ref<string | null>(null);
    const onboarded = ref<boolean>(true);
    const loaded = ref(false);

    const { loggedInEmail, isConnected, findRecordsWithIds } = useFileMaker();

    /** In-flight promise to deduplicate concurrent loads for the same email */
    let loadPromise: Promise<void> | null = null;
    let loadEmail: string | null = null;

    /**
     * Use GET /records instead of POST /_find to avoid 500 errors when the
     * FileMaker _find endpoint fails (layout/privilege/trigger issues).
     */
    async function loadCurrentUser(): Promise<void> {
      const email = loggedInEmail.value;
      if (!email || !isConnected.value) {
        recordId.value = null;
        role.value = null;
        fullName.value = null;
        onboarded.value = true;
        loaded.value = false;
        return;
      }
      const normalizedEmail = String(email).trim().toLowerCase();
      if (loadPromise && loadEmail === normalizedEmail) {
        await loadPromise;
        return;
      }
      loadEmail = normalizedEmail;
      loadPromise = (async () => {
        try {
          const { data: users } = await findRecordsWithIds<
            PayablesUsersFieldData | Record<string, unknown>
          >(LAYOUTS.PAYABLES_USERS, { limit: 500 });
          const match = users.find((r) => {
            const rowFd = r?.fieldData as Record<string, unknown> | undefined;
            const rowEmail = getFieldValue(rowFd, "Email");
            return rowEmail.trim().toLowerCase() === normalizedEmail;
          });
          const fd = match?.fieldData as Record<string, unknown> | undefined;
          const rid = match?.recordId ?? null;
          recordId.value = rid;
          if (fd) {
            role.value = getFieldValue(fd, "Role") || null;
            fullName.value =
              getFieldValue(fd, "FullName") ||
              (fd ? String(fd["Full Name"] ?? "").trim() : "") ||
              null;
            onboarded.value = isOnboarded(getFieldValue(fd, "Onboarded"));
          } else {
            role.value = null;
            fullName.value = null;
            onboarded.value = true;
          }
        } finally {
          loaded.value = true;
          loadPromise = null;
          loadEmail = null;
        }
      })();
      await loadPromise;
    }

    watch(
      [isConnected, loggedInEmail],
      () => {
        if (isConnected.value && loggedInEmail.value) {
          loadCurrentUser();
        } else {
          recordId.value = null;
          role.value = null;
          fullName.value = null;
          onboarded.value = true;
          loaded.value = false;
        }
      },
      { immediate: true }
    );

    function setRoleFromCache(cachedRole: string | null) {
      if (cachedRole != null && cachedRole.trim()) {
        role.value = cachedRole.trim();
        loaded.value = true;
      }
    }

    function markOnboardedComplete() {
      onboarded.value = true;
    }

    return {
      recordId,
      role,
      fullName,
      onboarded,
      loaded,
      loadCurrentUser,
      setRoleFromCache,
      markOnboardedComplete,
    };
  }
);
