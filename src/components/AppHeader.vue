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
        v-if="route.name === 'entry' && payableStore.isDirty"
        class="text-[var(--label-size)] text-amber-400/90 font-medium"
        aria-live="polite"
      >
        Unsaved changes
      </span>
      <div
        v-if="route.name === 'entry' && (!route.query.transRef || (payableStore.mainStatus != null && (!payableStore.mainPosted || payableStore.mainStatus === 'Rejected')))"
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
    </div>
  </header>
</template>

<script setup lang="ts">
import { nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePayableStore } from "../stores/payableStore";
import { useToastStore } from "../stores/toastStore";
import { useBookletStore } from "../stores/bookletStore";
import { useFileMaker } from "../composables/useFileMaker";

const route = useRoute();
const router = useRouter();

const payableStore = usePayableStore();
const toast = useToastStore();
const booklet = useBookletStore();
const { isConnected, hasBaseUrl } = useFileMaker();

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
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push("/");
    } else {
      router.push("/");
    }
  } else if (markedPosted) {
    toast.success("Marked as posted.");
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push("/");
    } else {
      router.push("/");
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
  const result = await payableStore.syncToFileMaker({ markPosted: true, clearRejected: true });
  const { posted, updated, deleted, error: err, markedPosted } = result;
  if (err) {
    toast.error("Repost failed: " + err);
  } else if (posted > 0 || updated > 0 || deleted > 0) {
    const parts = [];
    if (posted > 0) parts.push(`${posted} new`);
    if (updated > 0) parts.push(`${updated} updated`);
    if (deleted > 0) parts.push(`${deleted} deleted`);
    toast.success(`Saved and reposted ${parts.join(", ")} row(s).`);
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push("/");
    } else {
      router.push("/");
    }
  } else if (markedPosted) {
    toast.success("Saved and reposted.");
    if (booklet.count > 1) {
      booklet.removeCurrent();
      const nextRef = booklet.currentTransRef;
      if (nextRef) router.push({ name: "entry", query: { transRef: nextRef } });
      else router.push("/");
    } else {
      router.push("/");
    }
  } else {
    toast.info("No changes to save. Edit and try again.");
  }
}
</script>
