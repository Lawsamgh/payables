/**
 * Email list for notification recipient dropdown.
 * Fetches from FileMaker EmailList table (Email, Label, Active fields).
 */

import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { EmailListFieldData } from "../utils/filemakerApi";

export interface EmailListOption {
  email: string;
  label: string;
}

export interface EmailListFullItem {
  recordId: string;
  email: string;
  label: string;
  active: boolean;
}

function isActive(active: string | undefined): boolean {
  const v = (active ?? "").trim().toLowerCase();
  return v === "yes" || v === "1" || v === "true" || v === "on";
}

export const useEmailListStore = defineStore("emailList", () => {
  const options = ref<EmailListOption[]>([]);
  const allEmails = ref<EmailListFullItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const { findRecordsWithIds, createRecord, updateRecord, isConnected } = useFileMaker();

  async function loadEmailList(): Promise<void> {
    if (!isConnected.value) {
      options.value = [];
      allEmails.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    try {
      const { data, error: err } = await findRecordsWithIds<EmailListFieldData>(
        LAYOUTS.EMAIL_LIST,
        { limit: 500 }
      );
      if (err) {
        error.value = err;
        options.value = [];
        allEmails.value = [];
        return;
      }
      const items: EmailListOption[] = [];
      const fullItems: EmailListFullItem[] = [];
      for (const record of data ?? []) {
        const fd = record?.fieldData as EmailListFieldData | Record<string, unknown> | undefined;
        if (!fd) continue;
        const r = fd as Record<string, unknown>;
        const activeRaw = fd.Active ?? r["Active"] ?? r["active"];
        const active = isActive(String(activeRaw ?? ""));
        const email = String(fd.Email ?? r["Email"] ?? r["email"] ?? "").trim();
        if (!email) continue;
        const label = String(fd.Label ?? r["Label"] ?? r["label"] ?? "").trim();
        if (active) items.push({ email, label: label || email });
        fullItems.push({
          recordId: record.recordId,
          email,
          label: label || email,
          active,
        });
      }
      options.value = items;
      allEmails.value = fullItems;
    } finally {
      loading.value = false;
    }
  }

  async function setEmailActive(recordId: string, active: boolean): Promise<{ error: string | null }> {
    if (!isConnected.value) return { error: "Not connected" };
    const { error: err } = await updateRecord(LAYOUTS.EMAIL_LIST, recordId, {
      Active: active ? "Yes" : "No",
    });
    if (err) return { error: err };
    await loadEmailList();
    return { error: null };
  }

  async function createEmail(email: string, label?: string): Promise<{ error: string | null }> {
    const trimmedEmail = (email ?? "").trim();
    if (!trimmedEmail) return { error: "Email is required" };
    if (!isConnected.value) return { error: "Not connected" };
    const { error: err } = await createRecord(LAYOUTS.EMAIL_LIST, {
      Email: trimmedEmail,
      Label: (label ?? "").trim() || trimmedEmail,
      Active: "Yes",
    });
    if (err) return { error: err };
    await loadEmailList();
    return { error: null };
  }

  watch(
    isConnected,
    (connected) => {
      if (connected) loadEmailList();
      else options.value = [];
    },
    { immediate: true }
  );

  return {
    options,
    allEmails,
    loading,
    error,
    loadEmailList,
    createEmail,
    setEmailActive,
  };
});
