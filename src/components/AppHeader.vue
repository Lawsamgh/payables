<template>
  <header
    class="sticky top-0 z-50 glass rounded-none border-b border-[var(--color-border)] shrink-0"
    style="
      transition: box-shadow 0.3s var(--ease);
      height: var(--app-header-height);
    "
  >
    <div
      class="w-full max-w-[1600px] mx-auto h-full px-4 py-3 md:px-6 md:py-3 flex flex-wrap items-center justify-end gap-3"
    >
      <nav
        v-if="settingsBreadcrumbs.length"
        class="breadcrumb-progress mr-auto flex items-center"
        aria-label="Breadcrumb"
      >
        <template v-for="(crumb, idx) in settingsBreadcrumbs" :key="crumb.path ?? idx">
          <router-link
            v-if="crumb.path"
            :to="crumb.path"
            class="breadcrumb-progress__step breadcrumb-progress__step--past"
          >
            <span class="breadcrumb-progress__node" aria-hidden="true" />
            <span class="breadcrumb-progress__label">{{ crumb.label }}</span>
          </router-link>
          <span
            v-else
            class="breadcrumb-progress__step breadcrumb-progress__step--current"
          >
            <span class="breadcrumb-progress__node" aria-hidden="true" />
            <span class="breadcrumb-progress__label">{{ crumb.label }}</span>
          </span>
          <span
            v-if="idx < settingsBreadcrumbs.length - 1"
            class="breadcrumb-progress__connector"
            :class="{ 'breadcrumb-progress__connector--filled': true }"
            aria-hidden="true"
          >
            <span class="breadcrumb-progress__connector-line" />
          </span>
        </template>
      </nav>
      <span
        v-if="route.name === 'entry' && vendorStore.vendor?.vendor_name"
        class="header-vendor-name mr-auto max-w-[10rem] sm:max-w-[14rem] md:max-w-[20rem] truncate text-xl md:text-3xl text-[var(--color-text)] font-normal"
        :title="vendorStore.vendor.vendor_name"
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
          (!isManager || documentSettings.managerEditDraftEnabled) &&
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
          :disabled="payableStore.syncing || vendorStore.purchaseOrderDuplicate || payableStore.softLockLockedByOther"
          :title="isMac ? 'Save (⌘S)' : 'Save (Ctrl+S)'"
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
          :disabled="payableStore.syncing || vendorStore.purchaseOrderDuplicate || payableStore.softLockLockedByOther"
          :title="isMac ? 'Save and Repost (⌘P)' : 'Save and Repost (Ctrl+P)'"
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
          :disabled="payableStore.syncing || vendorStore.purchaseOrderDuplicate || payableStore.softLockLockedByOther"
          :title="isMac ? 'Save and Post (⌘P)' : 'Save and Post (Ctrl+P)'"
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
      <button
        type="button"
        class="pill-btn glass-input inline-flex items-center justify-center w-9 h-9 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        :title="'Keyboard shortcuts (?)'"
        aria-label="Keyboard shortcuts"
        @click="shortcutsCheatsheetStore.open()"
      >
        <span class="text-base font-semibold">?</span>
      </button>
      <button
        type="button"
        class="pill-btn glass-input inline-flex items-center gap-2 rounded-full px-3 py-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
        :title="
          isMac ? 'Search and navigate (⌘K)' : 'Search and navigate (Ctrl+K)'
        "
        aria-label="Open command palette"
        @click="paletteStore.open()"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <kbd class="hidden sm:inline text-[11px] font-medium">{{
          isMac ? "⌘K" : "Ctrl+K"
        }}</kbd>
      </button>
      <div
        class="theme-switch"
        role="group"
        aria-label="Theme"
      >
        <button
          type="button"
          class="theme-switch__option"
          :class="{ 'theme-switch__option--active': themeStore.appearance === 'light' }"
          title="Light theme"
          :aria-pressed="themeStore.appearance === 'light'"
          @click="themeStore.setAppearance('light')"
        >
          <svg class="theme-switch__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>
        <button
          type="button"
          class="theme-switch__option"
          :class="{ 'theme-switch__option--active': themeStore.appearance === 'dark' }"
          title="Dark theme"
          :aria-pressed="themeStore.appearance === 'dark'"
          @click="themeStore.setAppearance('dark')"
        >
          <svg class="theme-switch__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        </button>
      </div>
      <span
        v-if="isConnected && displayEmail"
        class="user-email-badge inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[var(--label-size)] text-[var(--color-text)] bg-white/5 border border-[var(--color-border)] hover:bg-white/[0.08] transition-colors"
        :title="displayEmail"
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
        <span class="font-medium">{{ displayEmail }}</span>
      </span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { nextTick, ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getHomeRoute } from "../utils/homeTab";
import { useCommandPaletteStore } from "../stores/commandPaletteStore";
import { useShortcutsCheatsheetStore } from "../stores/shortcutsCheatsheetStore";
import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useToastStore } from "../stores/toastStore";
import { useBookletStore } from "../stores/bookletStore";
import { useFileMaker } from "../composables/useFileMaker";
import { useEditRequest } from "../composables/useEditRequest";
import { useUserRole } from "../composables/useUserRole";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useThemeStore } from "../stores/themeStore";
import { useLoadingOverlayStore } from "../stores/loadingOverlayStore";
import { LAYOUTS } from "../utils/filemakerApi";
import { formatNumberDisplay } from "../utils/formatNumber";

const route = useRoute();
const router = useRouter();

/** Breadcrumb trail when in Settings (main or sub-page) */
const settingsBreadcrumbs = computed(() => {
  const path = route.path;
  if (!path.startsWith("/settings")) return [];
  if (path === "/settings") return [{ label: "Settings" }];
  const title = (route.meta?.title as string | undefined) ?? "";
  return [{ label: "Settings", path: "/settings" }, ...(title ? [{ label: title }] : [])];
});

const paletteStore = useCommandPaletteStore();
const shortcutsCheatsheetStore = useShortcutsCheatsheetStore();
const payableStore = usePayableStore();
const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);
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
const { fetchPendingEditRequest, getCachedPending, createEditRequest } =
  useEditRequest();
const { userFullName, isManager, isAdmin } = useUserRole();
const documentSettings = useDocumentSettingsStore();
const themeStore = useThemeStore();

/** Email for display in header: always lowercase regardless of login input. */
const displayEmail = computed(() =>
  String(loggedInEmail.value ?? "").trim().toLowerCase(),
);

/** Save/Post keyboard shortcuts (Ctrl+S, Ctrl+P) - only when on entry and palette closed */
function handleEntryShortcuts(e: KeyboardEvent) {
  if (paletteStore.visible) return;
  const isMod = e.metaKey || e.ctrlKey;
  if (!isMod || route.name !== "entry") return;

  const showActionDiv =
    (!isManager.value || documentSettings.managerEditDraftEnabled) &&
    (!route.query.transRef ||
      (payableStore.mainStatus != null &&
        (!payableStore.mainPosted || payableStore.mainStatus === "Rejected")));
  if (!showActionDiv) return;

  const poDuplicate = vendorStore.purchaseOrderDuplicate;
  if (poDuplicate) {
    toast.error("Purchase order already exists. Use a unique value.");
    return;
  }

  if (e.key === "s") {
    e.preventDefault();
    if (!payableStore.syncing) onSave();
    return;
  }
  if (e.key === "p") {
    e.preventDefault();
    if (payableStore.syncing) return;
    if (payableStore.mainStatus === "Rejected") {
      onRepost();
    } else if (!payableStore.mainPosted) {
      onPost();
    }
  }
}

onMounted(() => {
  document.addEventListener("keydown", handleEntryShortcuts);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleEntryShortcuts);
});

/** Only officers see "Request to edit (mistake posted)"; Manager/Admin use Approve/Reject and the Proceed modal. */
const showRequestEditButton = computed(
  () =>
    documentSettings.editRequestEnabled &&
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
  () =>
    [
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
  const loadingOverlay = useLoadingOverlayStore();
  loadingOverlay.show("Requesting edit…", "Please don't navigate away");
  try {
    const officerName = (userFullName.value || "").trim() || "Officer";
    const { error } = await createEditRequest(transRef.trim(), officerName);
    if (error) {
      toast.error("Request failed: " + error);
    } else {
      await fetchPendingEditRequest(transRef.trim());
      toast.success(
        "Request sent to manager. They will be prompted when they open this entry.",
      );
    }
  } finally {
    editRequestSending.value = false;
    loadingOverlay.hide();
  }
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

  const email = documentSettings.hodEmail?.trim() || null;
  if (!email) return;

  const entryUrl = new URL(
    router.resolve({ name: "entry", query: { transRef } }).href,
    window.location.origin,
  ).href;

  const copyEmail = documentSettings.copyHodEmail?.trim() || undefined;

  const scriptParam = JSON.stringify({
    url: entryUrl,
    email,
    fullname: fullname || "Officer",
    postedname: postedname || "Officer",
    vendorname: vendorName,
    transref: transRef,
    amount: amountStr,
    ...(copyEmail ? { copyEmail } : {}),
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
  if (payableStore.syncing) return;
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
    const hadNoTransRef = !(route.query.transRef as string)?.trim();
    if (hadNoTransRef && payableStore.currentTransRef) {
      router.push({
        name: "entry",
        query: { transRef: payableStore.currentTransRef },
      });
    }
  } else if (mainUpdated) {
    toast.success("Vendor details saved.");
  } else {
    toast.info("No changes to save. Add or edit rows and try again.");
  }
}

async function onPost() {
  if (payableStore.syncing) return;
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
  if (payableStore.syncing) return;
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

<style scoped>
/* Breadcrumb as progress line */
.breadcrumb-progress {
  font-size: var(--label-size);
  gap: 0;
  min-height: 2rem;
}

.breadcrumb-progress__step {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: inherit;
  transition: color 0.2s var(--ease);
}

.breadcrumb-progress__step--past {
  color: var(--color-text-muted);
  cursor: pointer;
}

.breadcrumb-progress__step--past:hover {
  color: var(--color-text);
}

.breadcrumb-progress__step--current {
  color: var(--color-text);
  font-weight: 600;
}

.breadcrumb-progress__node {
  flex-shrink: 0;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-text-muted);
  opacity: 0.6;
  transition: all 0.2s var(--ease);
}

.breadcrumb-progress__step--past .breadcrumb-progress__node {
  background: var(--color-accent);
  opacity: 0.8;
}

.breadcrumb-progress__step--past:hover .breadcrumb-progress__node {
  opacity: 1;
  transform: scale(1.1);
}

.breadcrumb-progress__step--current .breadcrumb-progress__node {
  width: 0.625rem;
  height: 0.625rem;
  background: var(--color-accent);
  opacity: 1;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.breadcrumb-progress__connector {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  width: 1.5rem;
  margin: 0 0.25rem;
}

.breadcrumb-progress__connector-line {
  flex: 1;
  height: 2px;
  background: var(--color-accent);
  opacity: 0.5;
  border-radius: 1px;
}

.breadcrumb-progress__connector--filled .breadcrumb-progress__connector-line {
  opacity: 0.7;
}

/* Theme switch – modern segmented control */
.theme-switch {
  display: inline-flex;
  padding: 0.25rem;
  gap: 2px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-input);
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.06);
}

.theme-switch__option {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: var(--color-text-muted);
  cursor: pointer;
  font: inherit;
  transition: color 0.2s var(--ease), background 0.2s var(--ease);
}

.theme-switch__option:hover {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.06);
}

.theme-switch__option--active {
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.theme-switch__option:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

.theme-switch__icon {
  width: 1rem;
  height: 1rem;
}
</style>
