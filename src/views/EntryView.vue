<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6"
  >
    <UnsavedChangesModal
      :visible="showLeaveConfirmModal"
      @confirm="onLeaveConfirm"
      @cancel="onLeaveCancel"
    />
    <RejectReasonModal
      :visible="showRejectModal"
      @submit="onRejectSubmit"
      @cancel="showRejectModal = false"
    />
    <div class="flex flex-wrap items-center gap-2 mb-4">
      <router-link
        to="/"
        class="pill-btn glass-input inline-flex items-center gap-1.5 px-3 py-2 text-[var(--label-size)] text-[var(--color-text-muted)] no-underline hover:text-[var(--color-text)]"
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
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to list
      </router-link>
      <!-- Center: booklet + Reject + Approve -->
      <div class="flex flex-1 flex-wrap items-center justify-center gap-2">
        <div
          v-if="booklet.count > 1"
          class="booklet-bar glass-input inline-flex items-center overflow-hidden rounded-full border border-[var(--color-border)]"
        >
          <button
            v-for="(ref, index) in booklet.openEntryRefs"
            :key="ref"
            type="button"
            class="booklet-page-btn min-w-[2rem] px-2.5 py-2 text-[var(--label-size)] font-medium transition-colors"
            :class="
              index === booklet.currentOpenIndex
                ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
            "
            :aria-label="`Entry ${index + 1} of ${booklet.count}`"
            :aria-current="
              index === booklet.currentOpenIndex ? 'true' : undefined
            "
            @click="goToPage(index)"
          >
            {{ index + 1 }}
          </button>
        </div>
        <template
          v-if="payableStore.mainPosted && payableStore.mainStatus === 'Posted' && payableStore.currentMainRecordId"
        >
          <button
            type="button"
            class="pill-btn inline-flex items-center gap-2 rounded-full bg-red-700/90 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="rejecting || approving"
            @click="showRejectModal = true"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            {{ rejecting ? "Rejecting…" : "Reject" }}
          </button>
          <button
            type="button"
            class="pill-btn inline-flex items-center gap-2 rounded-full bg-emerald-700 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="rejecting || approving"
            @click="onApprove"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {{ approving ? "Approving…" : "Approve" }}
          </button>
        </template>
      </div>
      <span
        v-if="payableStore.currentTransRef"
        class="text-xl font-bold text-[var(--color-text)] tabular-nums tracking-tight"
      >
        {{ payableStore.currentTransRef }}
      </span>
    </div>

    <!-- Rejection history: show for Posted (resubmitted) only, not for Rejected – Officer sees only reason banner -->
    <section
      v-if="payableStore.mainPosted && payableStore.mainStatus === 'Posted' && (rejectionHistoryLoading || rejectionHistory.length > 0)"
      class="rejection-history mb-4"
    >
      <header class="rejection-history__header">
        <div class="rejection-history__header-inner">
          <svg class="rejection-history__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <div>
            <h3 class="rejection-history__title">Rejection history</h3>
            <p class="rejection-history__subtitle">
              Prior rejections for this entry. Officer has since resubmitted.
            </p>
          </div>
        </div>
      </header>
      <div v-if="rejectionHistoryLoading" class="rejection-history__skeleton">
        <div v-for="i in 2" :key="i" class="rejection-history__skeleton-item">
          <div class="rejection-history__skeleton-dot" />
          <div class="rejection-history__skeleton-content">
            <div class="rejection-history__skeleton-line" style="width: 45%" />
            <div class="rejection-history__skeleton-line" style="width: 80%" />
          </div>
        </div>
      </div>
      <ul v-else class="rejection-history__timeline">
        <li
          v-for="(item, idx) in rejectionHistory"
          :key="idx"
          class="rejection-history__item"
        >
          <span class="rejection-history__line" />
          <span class="rejection-history__dot" :class="{ 'rejection-history__dot--first': idx === 0 }" aria-hidden="true" />
          <div class="rejection-history__card">
            <div class="rejection-history__meta">
              <span class="rejection-history__num">#{{ idx + 1 }}</span>
              <span v-if="idx === 0" class="rejection-history__badge">Most recent</span>
              <span class="rejection-history__date">{{ formatRejectionDate(item.RejectedDate) }}</span>
              <span v-if="item.RejectedBy" class="rejection-history__by">by {{ item.RejectedBy }}</span>
            </div>
            <p class="rejection-history__reason">{{ item.Reason }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Rejected reason: show on top when entry is Rejected -->
    <div
      v-if="payableStore.mainStatus === 'Rejected' && (payableStore.mainRejectReason || '').trim()"
      class="reject-reason-banner"
      role="alert"
    >
      <span class="reject-reason-banner__icon" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </span>
      <div class="reject-reason-banner__content">
        <strong class="reject-reason-banner__label">Rejection reason</strong>
        <p class="reject-reason-banner__text">{{ payableStore.mainRejectReason }}</p>
      </div>
    </div>

    <div
      class="booklet-flip-view"
      :class="{ 'booklet-flip-view--swipeable': booklet.count > 1 }"
      @touchstart="onSwipeStart"
      @touchend="onSwipeEnd"
    >
      <Transition :name="bookletTransitionName" mode="out-in">
        <div
          v-if="payableStore.loading"
          :key="`loading-${route.query.transRef || 'new'}`"
          class="entry-page flex flex-col flex-1 min-h-0"
        >
          <!-- Skeleton Loading State -->
          <div class="vendor-details-row relative mb-4">
            <section
              class="glass overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)]"
            >
              <div class="flex w-full items-center justify-between px-4 py-3">
                <Skeleton width="7rem" height="1.125rem" />
                <Skeleton width="1.25rem" height="1.25rem" />
              </div>
              <div class="border-t border-[var(--color-border)] px-4 pb-4 pt-3">
                <div
                  class="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3"
                >
                  <div v-for="i in 6" :key="i" class="block">
                    <Skeleton width="6rem" height="0.813rem" class="mb-1" />
                    <Skeleton width="100%" height="2.5rem" />
                  </div>
                </div>
              </div>
            </section>
            <button
              v-if="booklet.count > 1"
              type="button"
              disabled
              class="booklet-circle absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center glass-input border-2 opacity-30 pointer-events-none"
              aria-label="Previous entry"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              v-if="booklet.count > 1"
              type="button"
              disabled
              class="booklet-circle absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center glass-input border-2 opacity-30 pointer-events-none"
              aria-label="Next entry"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div class="mb-3">
            <div
              class="glass rounded-xl border border-[var(--color-border)] px-4 py-3 flex items-center gap-3"
            >
              <Skeleton width="6rem" height="2.25rem" />
              <Skeleton width="6rem" height="2.25rem" />
            </div>
          </div>
          <div class="mb-3">
            <Skeleton width="100%" height="0.813rem" class="max-w-[600px]" />
          </div>
          <div class="flex-1 min-h-[360px] flex flex-col min-w-0">
            <div
              class="data-grid-wrapper flex flex-col flex-1 min-h-0 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-sm overflow-hidden"
            >
              <div class="data-grid-scroll flex-1 min-h-0 overflow-auto">
                <table
                  class="data-grid-table border-collapse font-mono text-[var(--input-size)] w-full"
                >
                  <thead class="sticky top-0 z-10 bg-[var(--color-bg-dark)]">
                    <tr>
                      <th
                        class="row-header-th sticky left-0 z-20 border-b border-r border-[var(--color-border)] px-3 py-2.5"
                      ></th>
                      <th
                        class="border-b border-r border-[var(--color-border)] px-3 py-2.5"
                        colspan="2"
                      >
                        <Skeleton width="5rem" height="0.813rem" />
                      </th>
                      <th
                        class="border-b border-r border-[var(--color-border)] px-3 py-2.5"
                        colspan="4"
                      >
                        <Skeleton width="6rem" height="0.813rem" />
                      </th>
                      <th
                        class="border-b border-[var(--color-border)] px-2 py-2 w-14"
                      ></th>
                    </tr>
                    <tr>
                      <th
                        class="row-header-th sticky left-0 z-20 border-b border-r border-[var(--color-border)] px-3 py-2"
                      >
                        <Skeleton width="1rem" height="0.813rem" />
                      </th>
                      <th
                        v-for="i in 6"
                        :key="i"
                        class="border-b border-r border-[var(--color-border)] px-3 py-2"
                      >
                        <Skeleton width="4rem" height="0.813rem" />
                      </th>
                      <th
                        class="border-b border-[var(--color-border)] px-2 py-2 w-14"
                      ></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="i in 5" :key="i" class="data-grid-row">
                      <td
                        class="row-header-td sticky left-0 z-10 border-b border-r border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 text-center"
                      >
                        <Skeleton width="1.5rem" height="0.938rem" />
                      </td>
                      <td
                        v-for="j in 6"
                        :key="j"
                        class="border-b border-r border-[var(--color-border)] px-3 py-2"
                      >
                        <Skeleton width="5rem" height="0.938rem" />
                      </td>
                      <td
                        class="border-b border-[var(--color-border)] px-2 py-2 w-14"
                      >
                        <Skeleton
                          width="2.5rem"
                          height="2.5rem"
                          class="rounded-[10px]"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          :key="`entry-${route.query.transRef || 'new'}`"
          class="entry-page flex flex-col flex-1 min-h-0"
        >
          <div class="vendor-details-row relative mb-4">
            <VendorDetails />
            <button
              v-if="booklet.count > 1"
              type="button"
              :disabled="!booklet.hasPrev"
              class="booklet-circle absolute -left-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center glass-input border-2 text-orange-400/90 hover:text-orange-400 hover:bg-orange-500/10 border-orange-500/70 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-30 disabled:pointer-events-none disabled:border-[var(--color-border)] disabled:text-[var(--color-text-muted)] transition-all shadow-lg"
              aria-label="Previous entry"
              @click="goPrev"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              v-if="booklet.count > 1"
              type="button"
              :disabled="!booklet.hasNext"
              class="booklet-circle absolute -right-16 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full flex items-center justify-center glass-input border-2 text-orange-400/90 hover:text-orange-400 hover:bg-orange-500/10 border-orange-500/70 hover:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)] disabled:opacity-30 disabled:pointer-events-none disabled:border-[var(--color-border)] disabled:text-[var(--color-text-muted)] transition-all shadow-lg"
              aria-label="Next entry"
              @click="goNext"
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          <div class="mb-3">
            <Toolbar
              :can-delete-row="canDeleteRow"
              @add-row="spreadsheet.addRow()"
              @delete-row="handleDeleteRow"
            />
          </div>
          <p
            class="mb-3 text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            <strong class="text-[var(--color-text)]">Required to save:</strong>
            Fill <span class="text-red-400/90">*</span> Vendor name or Vendor ID
            above; in the grid, each row must have at least one of: Invoice
            Number, Amount, or Total.
          </p>
          <div class="flex-1 min-h-[360px] flex flex-col min-w-0">
            <DataGrid />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import VendorDetails from "../components/VendorDetails.vue";
import UnsavedChangesModal from "../components/UnsavedChangesModal.vue";
import RejectReasonModal from "../components/RejectReasonModal.vue";
import Toolbar from "../components/Toolbar.vue";
import DataGrid from "../components/DataGrid.vue";
import Skeleton from "../components/Skeleton.vue";
import { useSpreadsheet } from "../composables/useSpreadsheet";
import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useBookletStore } from "../stores/bookletStore";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import { formatTimestampForFileMaker, formatDateOnlyForFileMaker } from "../utils/filemakerMappers";
import { useToastStore } from "../stores/toastStore";

const route = useRoute();
const router = useRouter();
const spreadsheet = useSpreadsheet();
const payableStore = usePayableStore();
const vendorStore = useVendorStore();
const booklet = useBookletStore();
const { isConnected, updateRecord, createRecord, findRecordsByQueryWithIds } =
  useFileMaker();
const toast = useToastStore();
const rejecting = ref(false);
const approving = ref(false);
const canDeleteRow = computed(() => spreadsheet.rowCount.value > 1);

/** Flip direction for transition: 'next' = slide left, 'prev' = slide right */
const flipDirection = ref<"next" | "prev">("next");
const bookletTransitionName = computed(() =>
  flipDirection.value === "next" ? "booklet-next" : "booklet-prev",
);

function formatRejectionDate(raw?: string): string {
  if (!raw?.trim()) return "";
  const s = raw.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/.exec(s);
  if (us) {
    const [, m, d, y, h, min] = us;
    const hh = parseInt(h, 10);
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 || 12;
    return `${m}/${d}/${y} ${h12}:${min} ${ampm}`;
  }
  return s;
}

function loadForRoute() {
  const transRef = route.query.transRef as string | undefined;
  if (transRef?.trim()) {
    payableStore.fetchDetailsByTransRef(transRef.trim());
  } else {
    payableStore.clearAll();
    vendorStore.reset();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    vendorStore.setField("payment_terms", `${yyyy}-${mm}-${dd}`);
  }
}

/** Booklet: add current entry to booklet, remove posted from booklet only when in draft mode (not rejected booklet). */
function syncBookletToDraftsOnly() {
  const transRef = (route.query.transRef as string)?.trim();
  if (!transRef) return;
  if (payableStore.currentTransRef !== transRef) return;
  if (booklet.mode === "rejected") {
    booklet.ensureCurrent(transRef);
    return;
  }
  if (payableStore.mainPosted) booklet.removeByRef(transRef);
  else booklet.ensureCurrent(transRef);
}

function goPrev() {
  if (!booklet.hasPrev) return;
  flipDirection.value = "prev";
  booklet.goPrev();
  const ref = booklet.currentTransRef;
  if (ref) router.push({ name: "entry", query: { transRef: ref } });
}

function goNext() {
  if (!booklet.hasNext) return;
  flipDirection.value = "next";
  booklet.goNext();
  const ref = booklet.currentTransRef;
  if (ref) router.push({ name: "entry", query: { transRef: ref } });
}

function goToPage(index: number) {
  if (index === booklet.currentOpenIndex) return;
  flipDirection.value = index > booklet.currentOpenIndex ? "next" : "prev";
  booklet.setCurrentIndex(index);
  const ref = booklet.currentTransRef;
  if (ref) router.push({ name: "entry", query: { transRef: ref } });
}

onMounted(loadForRoute);

const showLeaveConfirmModal = ref(false);
const showRejectModal = ref(false);

interface RejectionHistoryItem {
  RejectedDate?: string;
  RejectedBy?: string;
  Reason?: string;
}
const rejectionHistory = ref<RejectionHistoryItem[]>([]);
const rejectionHistoryLoading = ref(false);

async function fetchRejectionHistory() {
  const transRef = payableStore.currentTransRef;
  if (!transRef?.trim() || !payableStore.mainPosted || !isConnected.value) {
    rejectionHistory.value = [];
    rejectionHistoryLoading.value = false;
    return;
  }
  rejectionHistoryLoading.value = true;
  const { data, error } = await findRecordsByQueryWithIds<
    RejectionHistoryItem
  >(LAYOUTS.PAYABLES_REJECTION_HISTORY, { TransRef: transRef }, 50);
  if (error || !data?.length) {
    rejectionHistory.value = [];
  } else {
    const items: RejectionHistoryItem[] = data
      .map((r) => r.fieldData)
      .filter(Boolean)
      .map((fd) => {
        const raw = fd as Record<string, unknown>;
        return {
          RejectedDate: (fd.RejectedDate ?? raw["Rejected date"]) as string | undefined,
          RejectedBy: (fd.RejectedBy ?? raw["Rejected by"]) as string | undefined,
          Reason: (fd.Reason ?? raw["Reason"]) as string | undefined,
        };
      });
    items.sort((a, b) => {
      const da = a.RejectedDate ?? "";
      const db = b.RejectedDate ?? "";
      return db.localeCompare(da);
    });
    rejectionHistory.value = items;
  }
  rejectionHistoryLoading.value = false;
}
let leaveConfirmNext: (() => void) | ((allow: false) => void) | null = null;

onBeforeRouteLeave((_to, _from, next) => {
  if (payableStore.isDirty) {
    showLeaveConfirmModal.value = true;
    leaveConfirmNext = next;
  } else {
    next();
  }
});

function onLeaveConfirm() {
  if (leaveConfirmNext) {
    leaveConfirmNext();
    leaveConfirmNext = null;
  }
  showLeaveConfirmModal.value = false;
}

function onLeaveCancel() {
  if (leaveConfirmNext) {
    leaveConfirmNext(false);
    leaveConfirmNext = null;
  }
  showLeaveConfirmModal.value = false;
}

watch(() => route.query.transRef, loadForRoute);
watch(isConnected, (connected) => {
  if (connected && route.query.transRef) loadForRoute();
});
watch(
  () =>
    [
      route.query.transRef,
      payableStore.currentTransRef,
      payableStore.mainPosted,
    ] as const,
  () => syncBookletToDraftsOnly(),
  { immediate: true },
);
watch(
  () =>
    [
      payableStore.currentTransRef,
      payableStore.mainPosted,
      payableStore.loading,
    ] as const,
  ([transRef, mainPosted, loading]) => {
    if (!loading && transRef && mainPosted) {
      fetchRejectionHistory();
    } else {
      rejectionHistory.value = [];
    }
  },
  { immediate: true },
);

function handleDeleteRow() {
  spreadsheet.deleteRow(spreadsheet.selectedRow.value);
}

const SWIPE_THRESHOLD = 60;
const swipeStartX = ref(0);

function onSwipeStart(e: TouchEvent) {
  if (booklet.count <= 1) return;
  swipeStartX.value = e.touches[0].clientX;
}

function onSwipeEnd(e: TouchEvent) {
  if (booklet.count <= 1) return;
  const endX = e.changedTouches[0].clientX;
  const delta = endX - swipeStartX.value;
  if (delta > SWIPE_THRESHOLD && booklet.hasPrev) goPrev();
  else if (delta < -SWIPE_THRESHOLD && booklet.hasNext) goNext();
}

function onRejectSubmit(reason: string) {
  showRejectModal.value = false;
  performReject(reason);
}

async function performReject(reason: string) {
  const transRef = payableStore.currentTransRef;
  const mainRecordId = payableStore.currentMainRecordId;
  if (!transRef || !mainRecordId || !isConnected.value) return;
  rejecting.value = true;
  try {
    const { error: updateErr } = await updateRecord(
      LAYOUTS.PAYABLES_MAIN,
      mainRecordId,
      {
        Rejected: "Yes",
        RejectReason: reason.trim(),
      },
      { allowEmptyStrings: false },
    );
    if (updateErr) {
      toast.error("Reject failed: " + updateErr);
      return;
    }
    const { error: createErr } = await createRecord(
      LAYOUTS.PAYABLES_REJECTION_HISTORY,
      {
        TransRef: transRef,
        RejectedDate: formatTimestampForFileMaker(),
        RejectedBy: "Manager",
        Reason: reason.trim(),
      },
    );
    if (createErr) {
      toast.error("Rejected but failed to record history: " + createErr);
    }
    toast.success("Entry rejected.");
    await payableStore.fetchDetailsByTransRef(transRef);
    router.push({ name: "home" });
  } finally {
    rejecting.value = false;
  }
}

async function onApprove() {
  const mainRecordId = payableStore.currentMainRecordId;
  if (!mainRecordId || !isConnected.value) return;
  approving.value = true;
  try {
    const { error: updateErr } = await updateRecord(
      LAYOUTS.PAYABLES_MAIN,
      mainRecordId,
      { Approved: "Yes", ApprovedDate: formatDateOnlyForFileMaker() },
    );
    if (updateErr) {
      toast.error("Approve failed: " + updateErr);
      return;
    }
    toast.success("Entry approved.");
    await payableStore.fetchDetailsByTransRef(payableStore.currentTransRef ?? "");
    router.push({ name: "home" });
  } finally {
    approving.value = false;
  }
}
</script>

<style scoped>
.rejection-history {
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(245, 158, 11, 0.04) 100%);
  border: 1px solid rgba(251, 191, 36, 0.35);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}

.rejection-history__header {
  margin-bottom: 1rem;
}

.rejection-history__header-inner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.rejection-history__icon {
  flex-shrink: 0;
  color: rgba(251, 191, 36, 0.9);
}

.rejection-history__title {
  margin: 0 0 0.125rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);
}

.rejection-history__subtitle {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.rejection-history__skeleton {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rejection-history__skeleton-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.rejection-history__skeleton-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.3);
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.rejection-history__skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.rejection-history__skeleton-line {
  height: 0.75rem;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
}

.rejection-history__timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 280px;
  overflow-y: auto;
}

.rejection-history__item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding-bottom: 1rem;
}

.rejection-history__item:last-child {
  padding-bottom: 0;
}

.rejection-history__item:last-child .rejection-history__line {
  display: none;
}

.rejection-history__line {
  position: absolute;
  left: 4px;
  top: 16px;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, rgba(251, 191, 36, 0.5) 0%, transparent 100%);
}

.rejection-history__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(251, 191, 36, 0.6);
  flex-shrink: 0;
  margin-top: 0.35rem;
  z-index: 1;
}

.rejection-history__dot--first {
  width: 12px;
  height: 12px;
  margin-top: 0.25rem;
  background: rgba(251, 191, 36, 0.95);
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.25);
}

.rejection-history__card {
  flex: 1;
  min-width: 0;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.rejection-history__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
}

.rejection-history__num {
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.rejection-history__badge {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  background: rgba(251, 191, 36, 0.25);
  color: rgba(251, 191, 36, 0.95);
}

.rejection-history__date {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(251, 191, 36, 0.95);
}

.rejection-history__by {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.rejection-history__reason {
  margin: 0;
  font-size: 0.9375rem;
  line-height: 1.5;
  color: var(--color-text);
  white-space: pre-wrap;
  word-break: break-word;
}

.reject-reason-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
  border: 1px solid rgba(239, 68, 68, 0.35);
  box-shadow: 0 2px 12px rgba(239, 68, 68, 0.1);
}

.reject-reason-banner__icon {
  flex-shrink: 0;
  color: rgba(248, 113, 113, 0.95);
}

.reject-reason-banner__content {
  flex: 1;
  min-width: 0;
}

.reject-reason-banner__label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(254, 202, 202, 0.95);
  margin-bottom: 0.25rem;
}

.reject-reason-banner__text {
  font-size: 1rem;
  font-weight: 500;
  line-height: 1.45;
  color: var(--color-text);
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}

.booklet-flip-view {
  min-height: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.booklet-flip-view--swipeable {
  touch-action: pan-y pinch-zoom;
}

/* Simple slide + fade between entries */
.booklet-next-enter-active,
.booklet-next-leave-active,
.booklet-prev-enter-active,
.booklet-prev-leave-active {
  transition:
    transform 0.22s ease-out,
    opacity 0.18s ease-out;
}
.booklet-next-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}
.booklet-next-enter-from {
  transform: translateX(20px);
  opacity: 0;
}
.booklet-prev-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
.booklet-prev-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .booklet-next-enter-active,
  .booklet-next-leave-active,
  .booklet-prev-enter-active,
  .booklet-prev-leave-active {
    transition: opacity 0.15s ease;
  }
  .booklet-next-leave-to,
  .booklet-next-enter-from,
  .booklet-prev-leave-to,
  .booklet-prev-enter-from {
    transform: none;
  }
}
</style>
