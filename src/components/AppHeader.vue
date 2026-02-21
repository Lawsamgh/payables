<template>
  <header
    class="sticky top-0 z-50 glass border-b border-[var(--color-border)] shrink-0"
    style="
      transition: box-shadow 0.3s var(--ease);
      min-height: var(--app-header-height);
    "
  >
    <div
      class="w-full max-w-[1600px] mx-auto h-full min-h-[var(--app-header-height)] px-4 py-3 md:px-6 md:py-3 flex flex-wrap items-center justify-end gap-3"
    >
      <span
        v-if="route.name === 'entry' && vendorStore.vendor?.vendor_name"
        class="header-vendor-name mr-auto text-xl md:text-3xl text-[var(--color-text)] font-normal"
      >
        {{ vendorStore.vendor.vendor_name }}
      </span>
      <span
        v-if="route.name === 'entry' && payableStore.isDirty"
        class="text-[var(--label-size)] text-amber-400/90 font-medium"
        aria-live="polite"
      >
        Unsaved changes
      </span>
      <div
        v-if="
          route.name === 'entry' &&
          (!route.query.transRef ||
            (payableStore.mainStatus != null &&
              (!payableStore.mainPosted ||
                payableStore.mainStatus === 'Rejected')))
        "
        class="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          class="pill-btn glass-input inline-flex items-center gap-2 px-4 py-2.5 text-[var(--label-size)] font-semibold text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="payableStore.syncing"
          @click="onSave"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
            />
          </svg>
          {{ payableStore.syncing ? "Saving…" : "Save" }}
        </button>
        <button
          v-if="payableStore.mainStatus === 'Rejected'"
          type="button"
          class="pill-btn inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="payableStore.syncing"
          @click="onRepost"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {{ payableStore.syncing ? "Saving…" : "Save and Repost" }}
        </button>
        <button
          v-else-if="!payableStore.mainPosted"
          type="button"
          class="pill-btn inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="payableStore.syncing"
          @click="onPost"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          {{ payableStore.syncing ? "Saving…" : "Save and Post" }}
        </button>
      </div>
      <div
        v-if="showRequestEditButton"
        class="flex flex-wrap items-center gap-2"
      >
        <button
          type="button"
          class="pill-btn glass-input inline-flex items-center gap-2 rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-2.5 text-[var(--label-size)] font-semibold text-amber-400 transition-colors hover:bg-amber-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          :disabled="editRequestSending || !!editRequestPending"
          :title="
            editRequestPending
              ? 'Request sent. Manager will be prompted when they open this entry.'
              : 'Ask manager to allow editing this posted entry (e.g. posted by mistake).'
          "
          @click="onRequestEditForMistakePosted"
        >
          <svg
            class="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          {{
            editRequestSending
              ? "Sending…"
              : editRequestPending
                ? "Request pending"
                : "Request to edit (mistake posted)"
          }}
        </button>
      </div>
      <span
        v-if="isConnected && loggedInEmail"
        class="user-email-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[var(--label-size)] text-[var(--color-text)] bg-white/5 border border-[var(--color-border)] hover:bg-white/[0.08] transition-colors"
        :title="loggedInEmail"
      >
        <span
          class="user-email-badge__icon flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
          aria-hidden="true"
        >
          <svg
            class="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </span>
        <span class="font-medium">{{ loggedInEmail }}</span>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { nextTick, ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getHomeRoute } from "../utils/homeTab";
import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useToastStore } from "../stores/toastStore";
import { useBookletStore } from "../stores/bookletStore";
import { useFileMaker } from "../composables/useFileMaker";
import { useEditRequest } from "../composables/useEditRequest";
import { useUserRole } from "../composables/useUserRole";
import { LAYOUTS } from "../utils/filemakerApi";
import { formatNumberDisplay } from "../utils/formatNumber";

const route = useRoute();
const router = useRouter();

const payableStore = usePayableStore();
const vendorStore = useVendorStore();
const toast = useToastStore();
const booklet = useBookletStore();
const {
  isConnected,
  hasBaseUrl,
  loggedInEmail,
  runScript,
  findRecordsWithIds,
  findRecordsByQueryWithIds,
} = useFileMaker();
const {
  fetchPendingEditRequest,
  getCachedPending,
  createEditRequest,
} = useEditRequest();
const { userFullName, isManager, isAdmin } = useUserRole();

/** Only officers see "Request to edit (mistake posted)"; Manager/Admin use Approve/Reject and the Proceed modal. */
const showRequestEditButton = computed(
  () =>
    route.name === "entry" &&
    payableStore.mainPosted &&
    payableStore.mainStatus === "Posted" &&
    route.query.transRef &&
    !isManager.value &&
    !isAdmin.value,
);

const editRequestSending = ref(false);
const editRequestPending = computed(() => {
  const transRef = route.query.transRef;
  if (typeof transRef !== "string" || !transRef.trim()) return null;
  return getCachedPending(transRef.trim());
});

watch(
  () => [
    route.query.transRef,
    payableStore.mainPosted,
    payableStore.mainStatus,
    payableStore.loading,
  ] as const,
  async ([transRef, mainPosted, mainStatus, loading]) => {
    if (
      loading ||
      typeof transRef !== "string" ||
      !transRef.trim() ||
      !mainPosted ||
      mainStatus !== "Posted"
    ) {
      return;
    }
    await fetchPendingEditRequest(transRef.trim());
  },
  { immediate: true },
);

async function onRequestEditForMistakePosted() {
  const transRef = route.query.transRef;
  if (typeof transRef !== "string" || !transRef.trim()) return;
  if (editRequestSending.value || editRequestPending.value) return;
  if (!hasBaseUrl.value || !isConnected.value) {
    toast.error("Connect to FileMaker first.");
    return;
  }
  editRequestSending.value = true;
  const officerName = (userFullName.value || "").trim() || "Officer";
  const { error } = await createEditRequest(transRef.trim(), officerName);
  if (error) {
    toast.error("Request failed: " + error);
  } else {
    await fetchPendingEditRequest(transRef.trim());
    toast.success("Request sent to manager. They will be prompted when they open this entry.");
  }
  editRequestSending.value = false;
}

/** Get FullName from Payables_Users fieldData (handles FullName / Full Name etc.). */
function getFullName(fd: Record<string, unknown> | undefined): string {
  if (!fd) return "";
  const v = fd.FullName ?? fd["Full Name"] ?? fd.fullName ?? fd.fullname;
  if (v == null || String(v).trim() === "") return "";
  return String(v).trim();
}

/** Get field value with casing variants (Email, email, Full Name, etc.). */
function getFieldValue(
  fd: Record<string, unknown> | undefined,
  key: string,
): string {
  if (!fd) return "";
  const v =
    fd[key] ??
    fd[key.replace(/([A-Z])/g, " $1").trim()] ??
    fd[key.charAt(0).toLowerCase() + key.slice(1)];
  if (v == null || v === "") return "";
  return String(v).trim();
}

/** Returns true if the string looks like an email (contains @). */
function looksLikeEmail(s: string): boolean {
  return typeof s === "string" && s.includes("@");
}

/** Call FileMaker NotifyManagerOnPost script after successful post. Does not block UI. */
async function notifyManagerOnPost(): Promise<void> {
  const transRef = payableStore.currentTransRef;
  if (!transRef?.trim()) return;

  // Get FullName from Payables_Users via Payables_Main::CreatedBy > Payables_Users::Email
  let fullname = "";
  const cached = payableStore.mainCreatorFullName;
  if (cached && cached.trim() !== "" && !looksLikeEmail(cached)) {
    fullname = cached.trim();
  }
  if (!fullname) {
    const { data: mainRecords } = await findRecordsByQueryWithIds<
      Record<string, unknown>
    >(LAYOUTS.PAYABLES_MAIN, { TransRef: transRef }, 1);
    const createdBy = mainRecords[0]?.fieldData as
      | Record<string, unknown>
      | undefined;
    const creatorEmail =
      createdBy?.CreatedBy ?? createdBy?.["Created By"] ?? createdBy?.createdBy;
    const creatorEmailStr =
      creatorEmail != null ? String(creatorEmail).trim() : "";
    if (creatorEmailStr) {
      const { data: userRecords } = await findRecordsByQueryWithIds<
        Record<string, unknown>
      >(LAYOUTS.PAYABLES_USERS, { Email: creatorEmailStr }, 1);
      const fd = userRecords[0]?.fieldData as
        | Record<string, unknown>
        | undefined;
      const resolved = getFullName(fd);
      if (resolved && !looksLikeEmail(resolved)) fullname = resolved;
    }
  }

  // Get FullName of the officer posting (logged-in user) from Payables_Users via Email
  let postedname = "";
  const officerEmail = loggedInEmail.value?.trim();
  if (officerEmail) {
    const normalizedEmail = officerEmail.toLowerCase();
    let posterFd: Record<string, unknown> | undefined;
    const { data: posterRecords } = await findRecordsByQueryWithIds<
      Record<string, unknown>
    >(LAYOUTS.PAYABLES_USERS, { Email: officerEmail }, 1);
    posterFd = posterRecords[0]?.fieldData as
      | Record<string, unknown>
      | undefined;
    if (!posterRecords?.length) {
      const { data: byEmail } = await findRecordsByQueryWithIds<
        Record<string, unknown>
      >(LAYOUTS.PAYABLES_USERS, { email: officerEmail }, 1);
      if (byEmail?.length) {
        posterFd = byEmail[0]?.fieldData as Record<string, unknown> | undefined;
      }
    }
    if (!posterFd) {
      const { data: users } = await findRecordsWithIds<Record<string, unknown>>(
        LAYOUTS.PAYABLES_USERS,
        { limit: 500 },
      );
      const match = users?.find((r) => {
        const fd = r?.fieldData as Record<string, unknown> | undefined;
        const rowEmail = getFieldValue(fd, "Email");
        return rowEmail.trim().toLowerCase() === normalizedEmail;
      });
      posterFd = match?.fieldData as Record<string, unknown> | undefined;
    }
    const resolved = getFullName(posterFd);
    if (resolved && !looksLikeEmail(resolved)) postedname = resolved;
  }

  // Capture all values before any await so they survive navigation
  const vendorName = vendorStore.vendor?.vendor_name?.trim() || "—";
  const total = payableStore.entryTotal;
  const currency = vendorStore.vendor?.currency?.trim() || "";
  const amountStr =
    currency && total != null
      ? `${currency} ${formatNumberDisplay(total)}`
      : formatNumberDisplay(total) || "—";

  const { data: settingsRecords } = await findRecordsWithIds<
    Record<string, unknown>
  >(LAYOUTS.PAYABLES_SETTINGS, { limit: 1 });
  const settings = settingsRecords[0]?.fieldData;
  const email =
    settings?.HODEmail != null && String(settings.HODEmail).trim() !== ""
      ? String(settings.HODEmail).trim()
      : null;
  if (!email) return;

  const entryUrl = new URL(
    router.resolve({ name: "entry", query: { transRef } }).href,
    window.location.origin,
  ).href;

  const scriptParam = JSON.stringify({
    url: entryUrl,
    email,
    fullname: fullname || "Officer",
    postedname: postedname || "Officer",
    vendorname: vendorName,
    transref: transRef,
    amount: amountStr,
  });

  const { error } = await runScript(
    LAYOUTS.PAYABLES_MAIN,
    "NotifyManagerOnPost",
    scriptParam,
  );
  if (error) {
    toast.warning("Manager notification could not be sent: " + error);
  }
}

async function onSave() {
  if (!hasBaseUrl.value) {
    toast.error(
      "FileMaker URL not set. Add VITE_FILEMAKER_BASE_URL to your .env and restart.",
    );
    return;
  }
  if (!isConnected.value) {
    toast.error(
      'Connect to FileMaker first. Click "Connect" in the status bar and sign in.',
    );
    return;
  }
  (document.activeElement as HTMLElement | null)?.blur();
  await nextTick();
  const result = await payableStore.syncToFileMaker({ markPosted: false });
  const { posted, updated, deleted, error: err, mainUpdated } = result;
  if (err) {
    toast.error("Save failed: " + err);
  } else if (posted > 0 || updated > 0 || deleted > 0) {
    const parts = [];
    if (posted > 0) parts.push(`${posted} new`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (deleted > 0) parts.push(`${deleted} deleted`);
    toast.success(`Saved ${parts.join(", ")} row(s) to FileMaker.`);
  } else if (mainUpdated) {
    toast.success("Vendor details saved.");
  } else {
    toast.info("No changes to save. Add or edit rows and try again.");
  }
}

async function onPost() {
  if (!hasBaseUrl.value) {
    toast.error(
      "FileMaker URL not set. Add VITE_FILEMAKER_BASE_URL to your .env and restart.",
    );
    return;
  }
  if (!isConnected.value) {
    toast.error(
      'Connect to FileMaker first. Click "Connect" in the status bar and sign in.',
    );
    return;
  }
  (document.activeElement as HTMLElement | null)?.blur();
  await nextTick();
  const result = await payableStore.syncToFileMaker({ markPosted: true });
  const { posted, updated, deleted, error: err, markedPosted } = result;
  if (err) {
    toast.error("Post failed: " + err);
  } else if (posted > 0 || updated > 0 || deleted > 0) {
    const parts = [];
    if (posted > 0) parts.push(`${posted} new`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (deleted > 0) parts.push(`${deleted} deleted`);
    toast.success(`Saved and posted ${parts.join(", ")} row(s).`);
    notifyManagerOnPost();
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push(getHomeRoute());
    } else {
      router.push(getHomeRoute());
    }
  } else if (markedPosted) {
    toast.success("Marked as posted.");
    notifyManagerOnPost();
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push(getHomeRoute());
    } else {
      router.push(getHomeRoute());
    }
  } else {
    toast.info("No changes to post. Add or edit rows and try again.");
  }
}

async function onRepost() {
  if (!hasBaseUrl.value) {
    toast.error(
      "FileMaker URL not set. Add VITE_FILEMAKER_BASE_URL to your .env and restart.",
    );
    return;
  }
  if (!isConnected.value) {
    toast.error(
      'Connect to FileMaker first. Click "Connect" in the status bar and sign in.',
    );
    return;
  }
  (document.activeElement as HTMLElement | null)?.blur();
  await nextTick();
  const result = await payableStore.syncToFileMaker({
    markPosted: true,
    clearRejected: true,
  });
  const { posted, updated, deleted, error: err, markedPosted } = result;
  if (err) {
    toast.error("Repost failed: " + err);
  } else if (posted > 0 || updated > 0 || deleted > 0) {
    const parts = [];
    if (posted > 0) parts.push(`${posted} new`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (deleted > 0) parts.push(`${deleted} deleted`);
    toast.success(`Saved and reposted ${parts.join(", ")} row(s).`);
    notifyManagerOnPost();
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push(getHomeRoute());
    } else {
      router.push(getHomeRoute());
    }
  } else if (markedPosted) {
    toast.success("Saved and reposted.");
    notifyManagerOnPost();
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push(getHomeRoute());
    } else {
      router.push(getHomeRoute());
    }
  } else {
    toast.info("No changes to save. Edit and try again.");
  }
}
</script>
