<template>
  <div
    class="content-area relative flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6"
  >
    <UnsavedChangesModal
      :visible="showLeaveConfirmModal"
      :message="
        sessionPayableInvoice.createdIds.length > 0
          ? 'You have unsaved changes. Taxes added will be removed. Leave anyway?'
          : 'You have unsaved changes. Leave anyway?'
      "
      @confirm="onLeaveConfirm"
      @cancel="onLeaveCancel"
    />
    <RejectReasonModal
      :visible="showRejectModal"
      @submit="onRejectSubmit"
      @cancel="showRejectModal = false"
    />
    <EditRequestModal
      :visible="
        !!(
          documentSettings.editRequestEnabled &&
          showEditRequestModal &&
          pendingEditRequestForModal &&
          editRequestModalTransRef === (route.query.transRef as string)?.trim()
        )
      "
      :requested-by="pendingEditRequestForModal?.RequestedBy"
      :proceeding="grantingEditRequest"
      @dismiss="dismissEditRequestModal"
      @proceed="onProceedAllowEdit"
    />
    <DeleteDraftConfirmModal
      :visible="showDeleteDraftModal"
      :deleting="deletingDraft"
      @submit="onDeleteDraftConfirm"
      @cancel="showDeleteDraftModal = false"
    />
    <DeleteRowsConfirmModal
      :visible="showDeleteRowsConfirmModal"
      :row-count="pendingDeleteIndices.length"
      :deleting="deletingRows"
      @confirm="onDeleteRowsConfirm"
      @cancel="onDeleteRowsCancel"
    />
    <!-- TransRef QR modal (Approved entry only) -->
    <Teleport to="body">
      <Transition name="transref-qr-modal">
        <div
          v-if="showTransRefQrModal"
          class="transref-qr-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transref-qr-modal-title"
          @click.self="showTransRefQrModal = false"
        >
          <div class="transref-qr-modal">
            <h2 id="transref-qr-modal-title" class="transref-qr-modal__title">
              TransRef
            </h2>
            <p class="transref-qr-modal__subtitle">
              Scan for cheque collection
            </p>
            <div v-if="transRefQrDataUrl" class="transref-qr-modal__qr">
              <img
                :src="transRefQrDataUrl"
                :alt="`QR code for TransRef ${payableStore.currentTransRef}`"
                class="transref-qr-modal__qr-img"
              />
              <p class="transref-qr-modal__transref">
                {{ payableStore.currentTransRef }}
              </p>
            </div>
            <button
              type="button"
              class="transref-qr-modal__close"
              aria-label="Close"
              @click="showTransRefQrModal = false"
            >
              Close
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Vendors / Tax right sidebar modals – check without leaving entry -->
    <RightSidebarModal
      title="Vendors"
      :visible="showVendorsPeek"
      width="700px"
      content-class="right-sidebar-modal--vendors"
      @close="showVendorsPeek = false"
    >
      <VendorsView peek-mode />
    </RightSidebarModal>
    <RightSidebarModal
      title="Tax"
      :visible="showTaxPeek"
      width="700px"
      content-class="right-sidebar-modal--tax"
      @close="showTaxPeek = false"
    >
      <TaxView peek-mode />
    </RightSidebarModal>

    <div class="entry-topbar flex flex-wrap items-center gap-2 mb-4">
      <button
        v-if="documentSettings.bookletEnabled && booklet.count > 1"
        type="button"
        :disabled="!booklet.hasPrev"
        class="entry-side-page-btn entry-side-page-btn--left"
        :title="isMac ? 'Previous entry (⌘←)' : 'Previous entry (Ctrl+←)'"
        aria-label="Previous entry"
        @click="goPrev"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>
      <button
        v-if="documentSettings.bookletEnabled && booklet.count > 1"
        type="button"
        :disabled="!booklet.hasNext"
        class="entry-side-page-btn entry-side-page-btn--right"
        :title="isMac ? 'Next entry (⌘→)' : 'Next entry (Ctrl+→)'"
        aria-label="Next entry"
        @click="goNext"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
      <router-link
        :to="backToListRoute"
        class="pill-btn glass-input inline-flex items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-white/5 px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] no-underline transition-colors hover:bg-white/10 hover:text-[var(--color-text)]"
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
      <!-- Center: Reject + Approve -->
      <div class="flex flex-1 flex-wrap items-center justify-center gap-2">
        <span
          v-if="documentSettings.bookletEnabled && booklet.count > 1"
          class="entry-page-indicator"
          aria-live="polite"
        >
          {{ booklet.currentOpenIndex + 1 }} / {{ booklet.count }}
        </span>
        <template
          v-if="
            canApproveOrReject &&
            payableStore.mainPosted &&
            payableStore.mainStatus === 'Posted' &&
            payableStore.currentMainRecordId
          "
        >
          <button
            type="button"
            class="pill-btn glass-input inline-flex items-center gap-2 !rounded-xl border border-[var(--color-border)] bg-white/5 px-6 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="rejecting || approving"
            @click="showRejectModal = true"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {{ rejecting ? "Rejecting…" : "Reject" }}
          </button>
          <button
            type="button"
            class="pill-btn inline-flex items-center gap-2 !rounded-xl border-0 bg-emerald-600 px-6 py-2.5 text-[var(--label-size)] font-medium text-white transition-colors hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="rejecting || approving"
            @click="onApprove"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ approving ? "Approving…" : "Approve" }}
          </button>
        </template>
        <template
          v-if="
            documentSettings.invoiceDownloadWhen !== 'none' &&
            payableStore.mainPosted &&
            ((documentSettings.invoiceDownloadWhen === 'once_posted' &&
              (payableStore.mainStatus === 'Posted' ||
                payableStore.mainStatus === 'Approved')) ||
              (documentSettings.invoiceDownloadWhen === 'approved_only' &&
                payableStore.mainStatus === 'Approved'))
          "
        >
          <button
            type="button"
            class="pill-btn download-pdf-btn inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[var(--label-size)] font-semibold text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="downloadingPdf"
            @click="downloadApprovedPdf"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              stroke-width="2"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            {{ downloadingPdf ? "Downloading…" : "Download PDF" }}
          </button>
        </template>
      </div>
      <span
        v-if="payableStore.loading"
        class="text-xl font-bold text-[var(--color-text)] tabular-nums tracking-tight"
      >
        <Skeleton width="8rem" height="1.5rem" />
      </span>
      <div
        v-else-if="payableStore.currentTransRef"
        class="entry-transref-with-chip"
      >
        <span
          v-if="payableStore.softLockLockedByOther && payableStore.softLockMessage"
          class="soft-lock-chip"
        >
          READ-ONLY
        </span>
        <button
          v-if="payableStore.mainStatus === 'Approved'"
          type="button"
          class="entry-transref-btn text-xl font-bold text-[var(--color-text)] tabular-nums tracking-tight cursor-pointer bg-transparent border-0 p-0 rounded-lg hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]"
          :title="'Click to show TransRef QR code for scanning'"
          @click="showTransRefQrModal = true"
        >
          {{ payableStore.currentTransRef }}
        </button>
        <span
          v-else
          class="text-xl font-bold text-[var(--color-text)] tabular-nums tracking-tight"
        >
          {{ payableStore.currentTransRef }}
        </span>
      </div>
      <!-- Delete draft: icon on the right for Draft; disabled while another user has the lock -->
      <button
        v-if="
          !payableStore.loading &&
          payableStore.currentTransRef &&
          payableStore.currentMainRecordId &&
          payableStore.mainStatus === 'Draft'
        "
        type="button"
        class="entry-delete-draft-btn ml-auto inline-flex items-center justify-center w-10 h-10 rounded-xl border border-red-500/40 bg-red-500/20 text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500/50 enabled:hover:bg-red-500/30 enabled:hover:border-red-500/60 enabled:hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-red-500/20 disabled:hover:border-red-500/40"
        :disabled="
          deletingDraft || payableStore.softLockReadOnly
        "
        :title="
          payableStore.softLockReadOnly
            ? 'Cannot delete: another user is editing this draft'
            : 'Delete draft entry'
        "
        :aria-label="
          payableStore.softLockReadOnly
            ? 'Delete draft unavailable — draft locked by another user'
            : 'Delete draft entry'
        "
        @click="showDeleteDraftModal = true"
      >
        <svg
          class="h-5 w-5"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
          />
        </svg>
      </button>
    </div>

    <!-- Rejection history: show for Posted (resubmitted) only when we have data – avoids flash when none -->
    <section
      v-if="
        payableStore.mainPosted &&
        payableStore.mainStatus === 'Posted' &&
        rejectionHistory.length > 0
      "
      class="rejection-history mb-4"
    >
      <header class="rejection-history__header">
        <div class="rejection-history__header-inner">
          <svg
            class="rejection-history__icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
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
          <span
            class="rejection-history__dot"
            :class="{ 'rejection-history__dot--first': idx === 0 }"
            aria-hidden="true"
          />
          <div class="rejection-history__card">
            <div class="rejection-history__meta">
              <span class="rejection-history__num">#{{ idx + 1 }}</span>
              <span v-if="idx === 0" class="rejection-history__badge"
                >Most recent</span
              >
              <span class="rejection-history__date">{{
                formatRejectionDate(item.RejectedDate)
              }}</span>
              <span v-if="item.RejectedBy" class="rejection-history__by"
                >by {{ item.RejectedBy }}</span
              >
            </div>
            <p class="rejection-history__reason">{{ item.Reason }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- Vendor expiry checks: show for Draft, Rejected, or Posted. NOT for Approved only. GRA banner + Vendor balance (outside) on same row. -->
    <div
      v-if="showExpiryCheckBanner || showHeaderBalanceBanner"
      class="expiry-balance-row"
    >
      <div
        v-if="showExpiryCheckBanner"
        class="expiry-check-banner"
        role="status"
      >
        <span class="expiry-check-banner__icon" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
        <div class="expiry-check-banner__content">
          <div
            v-if="displayExpiryCheckBanner"
            class="expiry-check-banner__item"
            :class="{
              'expiry-check-banner__item--invalid': isExpiryCheckInvalid(
                payableStore.mainExpiryCheck,
                displayExpiryCheckBanner,
              ),
              'expiry-check-banner__item--valid': isExpiryCheckValid(
                payableStore.mainExpiryCheck,
                displayExpiryCheckBanner,
              ),
            }"
          >
            <span class="expiry-check-banner__item-icon" aria-hidden="true">
              <svg
                v-if="
                  isExpiryCheckInvalid(
                    payableStore.mainExpiryCheck,
                    displayExpiryCheckBanner,
                  )
                "
                class="expiry-check-banner__icon-svg"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 9l-6 6M9 9l6 6"
                />
              </svg>
              <svg
                v-else-if="
                  isExpiryCheckValid(
                    payableStore.mainExpiryCheck,
                    displayExpiryCheckBanner,
                  )
                "
                class="expiry-check-banner__icon-svg"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span v-else class="expiry-check-banner__icon-placeholder" />
            </span>
            <strong class="expiry-check-banner__label">GRA Expiry:</strong>
            <span class="expiry-check-banner__text">{{
              displayExpiryCheckBanner
            }}</span>
          </div>
          <div
            v-if="displayWhtExpiryCheckBanner"
            class="expiry-check-banner__item"
            :class="{
              'expiry-check-banner__item--invalid': isExpiryCheckInvalid(
                payableStore.mainWhtExpiryCheck,
                displayWhtExpiryCheckBanner,
              ),
              'expiry-check-banner__item--valid': isExpiryCheckValid(
                payableStore.mainWhtExpiryCheck,
                displayWhtExpiryCheckBanner,
              ),
            }"
          >
            <span class="expiry-check-banner__item-icon" aria-hidden="true">
              <svg
                v-if="
                  isExpiryCheckInvalid(
                    payableStore.mainWhtExpiryCheck,
                    displayWhtExpiryCheckBanner,
                  )
                "
                class="expiry-check-banner__icon-svg"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="10" />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 9l-6 6M9 9l6 6"
                />
              </svg>
              <svg
                v-else-if="
                  isExpiryCheckValid(
                    payableStore.mainWhtExpiryCheck,
                    displayWhtExpiryCheckBanner,
                  )
                "
                class="expiry-check-banner__icon-svg"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span v-else class="expiry-check-banner__icon-placeholder" />
            </span>
            <strong class="expiry-check-banner__label">WHT Expiry:</strong>
            <span class="expiry-check-banner__text">{{
              displayWhtExpiryCheckBanner
            }}</span>
          </div>
        </div>
      </div>
      <!-- Vendor balance in BC: outside GRA banner. Full width when Approved (no GRA), else inline on right -->
      <div
        v-if="showHeaderBalanceBanner"
        class="expiry-balance-row__balance"
        :class="{
          'expiry-balance-row__balance--full-width': !showExpiryCheckBanner,
        }"
      >
        <VendorBalanceBanner
          :loading="vendorStore.vendorBalanceLoading"
          :display-value="headerVendorBalanceDisplay"
          :zero-or-less="headerVendorBalanceZeroOrLess"
          compact
        />
      </div>
    </div>

    <!-- Load error: show when fetching existing entry failed (takes precedence) -->
    <div
      v-if="
        payableStore.error &&
        (route.query.transRef as string)?.trim() &&
        !payableStore.loading
      "
      class="entry-error-banner rounded-2xl border border-red-500/25 bg-red-500/10 px-5 py-4"
    >
      <p class="mb-3 text-[var(--label-size)] text-red-300">
        {{ payableStore.error }}
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          type="button"
          class="pill-btn inline-flex items-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 py-2.5 text-[var(--label-size)] font-semibold text-white hover:opacity-90"
          @click="retryLoadEntry"
        >
          Retry
        </button>
        <router-link
          :to="backToListRoute"
          class="pill-btn glass-input inline-flex items-center gap-2 rounded-xl border border-[var(--color-border)] px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text)] no-underline hover:bg-white/5"
        >
          Back to list
        </router-link>
      </div>
    </div>

    <!-- Rejected reason banner: show above grid when entry is Rejected (not in load error state) -->
    <div
      v-if="
        !payableStore.error &&
        payableStore.mainStatus === 'Rejected' &&
        (payableStore.mainRejectReason || '').trim()
      "
      class="reject-reason-banner mb-4"
      role="alert"
    >
      <span class="reject-reason-banner__icon" aria-hidden="true">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </span>
      <div class="reject-reason-banner__content">
        <strong class="reject-reason-banner__label">Rejection reason</strong>
        <p class="reject-reason-banner__text">
          {{ payableStore.mainRejectReason }}
        </p>
      </div>
    </div>

    <div
      v-if="!payableStore.error"
      class="booklet-flip-view"
      :class="{
        'booklet-flip-view--swipeable':
          documentSettings.bookletEnabled && booklet.count > 1,
      }"
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
          <!-- Expiry banner skeleton: show when loading existing entry (transRef) -->
          <div v-if="route.query.transRef" class="expiry-check-banner mb-4">
            <span
              class="expiry-check-banner__icon opacity-60"
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            <div class="expiry-check-banner__content">
              <div class="expiry-check-banner__item">
                <Skeleton width="1.25rem" height="1.25rem" />
                <Skeleton width="5.5rem" height="0.9rem" />
                <Skeleton width="12rem" height="1.25rem" />
              </div>
              <div class="expiry-check-banner__item">
                <Skeleton width="1.25rem" height="1.25rem" />
                <Skeleton width="5.5rem" height="0.9rem" />
                <Skeleton width="18rem" height="1.25rem" />
              </div>
            </div>
          </div>
          <div class="vendor-details-row mb-4">
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
          <div
            v-if="payableStore.softLockLockedByOther && payableStore.softLockMessage"
            class="soft-lock-banner mb-4"
            role="status"
          >
            <div class="soft-lock-banner__content">
              <div class="soft-lock-banner__top">
                <span class="soft-lock-banner__title">Draft locked for editing</span>
                <p class="soft-lock-banner__text">
                  <span class="soft-lock-banner__text-main">
                    {{ payableStore.softLockMessage }}
                  </span>
                </p>
              </div>
              <button
                type="button"
                class="soft-lock-inline-btn soft-lock-inline-btn--banner"
                @click="payableStore.takeOverSoftLock()"
              >
                Take over editing
              </button>
            </div>
          </div>
          <div class="vendor-details-row mb-4">
            <VendorDetails />
          </div>
          <div
            v-if="payableStore.mainStatus !== 'Posted' && payableStore.mainStatus !== 'Approved' && !payableStore.softLockReadOnly"
            class="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 backdrop-blur-[var(--blur-glass)]"
          >
            <Toolbar @add-row="spreadsheet.addRow()" />
          </div>
          <p
            class="mb-3 text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            <strong class="text-[var(--color-text)]">Required to save:</strong>
            Fill <span class="text-red-400/90">*</span> Purchase order and
            Vendor ID above; in the grid, each row must have at least one of:
            Invoice Number or Amount.
          </p>
          <div class="flex-1 min-h-[360px] flex flex-col min-w-0">
            <DataGrid @delete-row="handleDeleteRowByIndex" />
          </div>

          <!-- Floating action buttons: View Vendors / View Tax (new entry only) -->
          <div
            v-if="!route.query.transRef"
            class="entry-fab-group"
          >
            <button
              type="button"
              class="entry-fab"
              title="View Vendors"
              aria-label="View Vendors"
              @click="showVendorsPeek = true"
            >
              <svg class="entry-fab__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span class="entry-fab__label">Vendors</span>
            </button>
            <button
              type="button"
              class="entry-fab"
              title="View Tax"
              aria-label="View Tax"
              @click="showTaxPeek = true"
            >
              <svg class="entry-fab__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span class="entry-fab__label">Tax</span>
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { getHomeRoute } from "../utils/homeTab";
import VendorDetails from "../components/VendorDetails.vue";
import VendorBalanceBanner from "../components/VendorBalanceBanner.vue";
import UnsavedChangesModal from "../components/UnsavedChangesModal.vue";
import RejectReasonModal from "../components/RejectReasonModal.vue";
import EditRequestModal from "../components/EditRequestModal.vue";
import DeleteDraftConfirmModal from "../components/DeleteDraftConfirmModal.vue";
import DeleteRowsConfirmModal from "../components/DeleteRowsConfirmModal.vue";
import RightSidebarModal from "../components/RightSidebarModal.vue";
import Toolbar from "../components/Toolbar.vue";
import VendorsView from "./VendorsView.vue";
import TaxView from "./TaxView.vue";
import DataGrid from "../components/DataGrid.vue";
import Skeleton from "../components/Skeleton.vue";
import { useSpreadsheet } from "../composables/useSpreadsheet";
import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useBookletStore } from "../stores/bookletStore";
import { useFileMaker } from "../composables/useFileMaker";
import { useUserRole } from "../composables/useUserRole";
import {
  useEditRequest,
  type PendingEditRequest,
} from "../composables/useEditRequest";
import { useApprovalNotification } from "../composables/useApprovalNotification";
import { useRejectionNotification } from "../composables/useRejectionNotification";
import {
  LAYOUTS,
  type PayableInvoiceFieldData,
  type TaxValueFieldData,
} from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import {
  formatTimestampForFileMaker,
  formatDateOnlyForFileMaker,
} from "../utils/filemakerMappers";
import { formatNumberDisplay } from "../utils/formatNumber";
import { writeActivityLog } from "../utils/activityLog";
import { useToastStore } from "../stores/toastStore";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useLoadingOverlayStore } from "../stores/loadingOverlayStore";
import { useSessionPayableInvoiceStore } from "../stores/sessionPayableInvoiceStore";
import QRCode from "qrcode";

const route = useRoute();
const router = useRouter();
const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

/** Back to list: Invoices, Cheque Collection, Activity Logs, Overdue modal, or Home depending on arrival. */
const backToListRoute = computed(() => {
  const from = route.query.from;
  if (from === "invoices") return { name: "invoices" as const };
  if (from === "cheque-collection")
    return { name: "cheque-collection" as const };
  if (from === "settings-logs") return { name: "settings-logs" as const };
  if (from === "overdue")
    return { path: "/home", query: { tab: "posted", openOverdue: "1" } };
  return getHomeRoute();
});

/** Show Vendor balance in BC inline with expiry row when we have a saved entry and vendor. */
const showHeaderBalanceBanner = computed(
  () =>
    !!payableStore.currentTransRef &&
    (vendorStore.vendor?.vendor_id ?? "").trim().length > 0,
);

const headerVendorBalanceDisplay = computed(() => {
  const raw = vendorStore.vendor?.vendor_balance ?? "";
  if (!raw.trim()) return "";
  const n = parseFloat(String(raw).replace(/,/g, "").trim());
  return Number.isNaN(n) ? raw : formatNumberDisplay(n) || "";
});

const headerVendorBalanceZeroOrLess = computed(() => {
  if (vendorStore.vendorBalanceLoading) return false;
  const raw = vendorStore.vendor?.vendor_balance ?? "";
  if (!raw.trim()) return false;
  const n = parseFloat(String(raw).replace(/,/g, "").trim());
  return !Number.isNaN(n) && n <= 0;
});

const spreadsheet = useSpreadsheet();
const payableStore = usePayableStore();
const vendorStore = useVendorStore();
const booklet = useBookletStore();
const {
  isConnected,
  updateRecord,
  createRecord,
  findRecordsByQueryWithIds,
  findRecordsWithIds,
  deleteRecord,
} = useFileMaker();
const toast = useToastStore();
const documentSettings = useDocumentSettingsStore();
const loadingOverlay = useLoadingOverlayStore();
const sessionPayableInvoice = useSessionPayableInvoiceStore();
const { roleLower, userFullName, roleLoaded } = useUserRole();
const rejecting = ref(false);
const approving = ref(false);
const downloadingPdf = ref(false);
const deletingDraft = ref(false);
const showDeleteDraftModal = ref(false);
const showDeleteRowsConfirmModal = ref(false);
const pendingDeleteIndices = ref<number[]>([]);
const deletingRows = ref(false);
const showTransRefQrModal = ref(false);
const showVendorsPeek = ref(false);
const showTaxPeek = ref(false);
const grantingEditRequest = ref(false);
const showEditRequestModal = ref(false);
const pendingEditRequestForModal = ref<PendingEditRequest | null>(null);
const editRequestModalTransRef = ref<string | null>(null);
const editRequestModalDismissedForTransRef = ref<string | null>(null);

/** QR data URL for TransRef (generated when modal is shown). */
const transRefQrDataUrl = ref<string | null>(null);
watchEffect(async () => {
  const transRef =
    showTransRefQrModal.value && payableStore.currentTransRef
      ? String(payableStore.currentTransRef).trim()
      : "";
  if (!transRef) {
    transRefQrDataUrl.value = null;
    return;
  }
  try {
    transRefQrDataUrl.value = await QRCode.toDataURL(transRef, {
      width: 200,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  } catch {
    transRefQrDataUrl.value = null;
  }
});

const { fetchPendingEditRequest, grantEditRequest, notifyEditRequestGranted } =
  useEditRequest();
const { notifyApprovalToOfficer } = useApprovalNotification();
const { notifyRejectedEntryToOfficer } = useRejectionNotification();

/** Only Manager and Admin can Approve or Reject a Posted entry. */
const canApproveOrReject = computed(
  () => roleLower.value === "manager" || roleLower.value === "admin",
);

/** Expiry check banner: for Rejected and Draft (always show when status is Draft/Rejected). */
const showExpiryCheckBanner = computed(() => {
  if (!payableStore.currentTransRef) return false;
  const s = payableStore.mainStatus;
  return s === "Draft" || s === "Rejected" || s === "Posted";
});
const displayExpiryCheckBanner = computed(() => {
  return payableStore.mainExpiryCheckDis ?? "—";
});
const displayWhtExpiryCheckBanner = computed(() => {
  return payableStore.mainWhtExpiryCheckDis ?? "—";
});

function isExpiryCheckInvalid(
  check: string | null,
  displayText?: string | null,
): boolean {
  if (check) {
    const s = check.toLowerCase().trim();
    if (s === "invalid" || s === "expired" || s === "no") return true;
    if (s === "valid" || s === "ok" || s === "yes" || s === "good")
      return false;
  }
  const text =
    displayText != null && displayText !== "—"
      ? String(displayText).toLowerCase()
      : "";
  if (!text) return false;
  if (
    text.includes("invalid") ||
    text.includes("expired") ||
    /\bno\b/.test(text)
  )
    return true;
  return false;
}
function isExpiryCheckValid(
  check: string | null,
  displayText?: string | null,
): boolean {
  if (check) {
    const s = check.toLowerCase().trim();
    if (s === "valid" || s === "ok" || s === "yes" || s === "good") return true;
    if (s === "invalid" || s === "expired" || s === "no") return false;
  }
  const text =
    displayText != null && displayText !== "—"
      ? String(displayText).toLowerCase()
      : "";
  if (!text) return false;
  if (
    text.includes("invalid") ||
    text.includes("expired") ||
    /\bno\b/.test(text)
  )
    return false;
  if (
    text.includes("valid") ||
    text.includes("ok") ||
    text.includes("yes") ||
    text.includes("good")
  )
    return true;
  return false;
}

/** Flip direction for transition: 'next' = slide left, 'prev' = slide right */
const flipDirection = ref<"next" | "prev">("next");
const bookletTransitionName = computed(() =>
  flipDirection.value === "next" ? "booklet-next" : "booklet-prev",
);

function formatRejectionDate(raw?: string): string {
  if (!raw?.trim()) return "";
  const s = raw.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})/.exec(
    s,
  );
  if (us) {
    const [, m, d, y, h, min] = us;
    const hh = parseInt(h, 10);
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 || 12;
    return `${m}/${d}/${y} ${h12}:${min} ${ampm}`;
  }
  return s;
}

function retryLoadEntry() {
  const transRef = (route.query.transRef as string)?.trim();
  if (transRef) {
    payableStore.clearError();
    payableStore.fetchDetailsByTransRef(transRef);
  }
}

function loadForRoute() {
  sessionPayableInvoice.clear();
  showEditRequestModal.value = false;
  pendingEditRequestForModal.value = null;
  editRequestModalTransRef.value = null;
  const transRef = route.query.transRef as string | undefined;
  if (transRef?.trim()) {
    payableStore.fetchDetailsByTransRef(transRef.trim());
  } else {
    payableStore.clearAll();
    vendorStore.reset();
    vendorStore.setField("currency", "GHS");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    vendorStore.setField("payment_terms", `${yyyy}-${mm}-${dd}`);
  }
}

/** Booklet: add current entry to booklet, remove posted from booklet only when in draft mode (not rejected/overdue booklet). */
function syncBookletToDraftsOnly() {
  const transRef = (route.query.transRef as string)?.trim();
  if (!transRef) return;
  if (payableStore.currentTransRef !== transRef) return;
  if (booklet.mode === "rejected" || booklet.mode === "overdue") {
    booklet.ensureCurrent(transRef);
    return;
  }
  if (payableStore.mainPosted) booklet.removeByRef(transRef);
  else booklet.ensureCurrent(transRef);
}

function entryQuery(transRef: string) {
  const q: { transRef: string; from?: string } = { transRef };
  const from = route.query.from;
  if (
    from === "invoices" ||
    from === "cheque-collection" ||
    from === "settings-logs" ||
    from === "overdue"
  )
    q.from = from;
  return { name: "entry" as const, query: q };
}

function goPrev() {
  if (!booklet.hasPrev) return;
  flipDirection.value = "prev";
  booklet.goPrev();
  const ref = booklet.currentTransRef;
  if (ref) router.push(entryQuery(ref));
}

function goNext() {
  if (!booklet.hasNext) return;
  flipDirection.value = "next";
  booklet.goNext();
  const ref = booklet.currentTransRef;
  if (ref) router.push(entryQuery(ref));
}

function goToPage(index: number) {
  if (index === booklet.currentOpenIndex) return;
  flipDirection.value = index > booklet.currentOpenIndex ? "next" : "prev";
  booklet.setCurrentIndex(index);
  const ref = booklet.currentTransRef;
  if (ref) router.push(entryQuery(ref));
}

function onBeforeUnload(e: BeforeUnloadEvent) {
  if (payableStore.isDirty || sessionPayableInvoice.createdIds.length > 0) {
    e.preventDefault();
    e.returnValue = "";
  }
}

onMounted(() => {
  loadForRoute();
  window.addEventListener("beforeunload", onBeforeUnload);
});

onUnmounted(() => {
  window.removeEventListener("beforeunload", onBeforeUnload);
  void payableStore.releaseSoftLock();
});

const showLeaveConfirmModal = ref(false);
const showRejectModal = ref(false);

interface RejectionHistoryItem {
  RejectedDate?: string;
  RejectedBy?: string;
  Reason?: string;
}
const rejectionHistory = ref<RejectionHistoryItem[]>([]);
const rejectionHistoryLoading = ref(false);

/** Get "Rejected by" value from raw fieldData trying common FileMaker key variants. */
function getRejectedByFromRaw(
  raw: Record<string, unknown> | undefined,
): string {
  if (!raw) return "";
  const keys = [
    "RejectedBy",
    "Rejected by",
    "rejectedBy",
    "rejected by",
    "REJECTEDBY",
  ];
  for (const k of keys) {
    const v = raw[k];
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return "";
}

async function fetchRejectionHistory() {
  const transRef = payableStore.currentTransRef;
  const shouldFetch =
    transRef?.trim() &&
    isConnected.value &&
    (payableStore.mainPosted || payableStore.mainStatus === "Rejected");
  if (!shouldFetch) {
    rejectionHistory.value = [];
    rejectionHistoryLoading.value = false;
    return;
  }
  rejectionHistoryLoading.value = true;
  const { data, error } = await findRecordsByQueryWithIds<RejectionHistoryItem>(
    LAYOUTS.PAYABLES_REJECTION_HISTORY,
    { TransRef: transRef ?? "" },
    50,
  );
  if (error || !data?.length) {
    rejectionHistory.value = [];
  } else {
    const rawRecords = data.map(
      (r) => r.fieldData as Record<string, unknown> | undefined,
    );
    const items: RejectionHistoryItem[] = rawRecords
      .filter((raw): raw is Record<string, unknown> => !!raw)
      .map((raw) => {
        const rejectedBy = getRejectedByFromRaw(raw);
        const rejectedDate = (raw.RejectedDate ??
          raw["Rejected date"] ??
          raw["Rejected Date"]) as string | undefined;
        const reason = (raw.Reason ?? raw["Reason"]) as string | undefined;
        return {
          RejectedDate: rejectedDate,
          RejectedBy: rejectedBy || undefined,
          Reason: reason,
        };
      });
    items.sort((a, b) => {
      const da = a.RejectedDate ?? "";
      const db = b.RejectedDate ?? "";
      return db.localeCompare(da);
    });
    rejectionHistory.value = items;
    // Populate sidebar "Rejected by" from most recent rejection when entry is Rejected
    if (payableStore.mainStatus === "Rejected") {
      const firstRaw = data[0]?.fieldData as
        | Record<string, unknown>
        | undefined;
      const rejectedByName =
        getRejectedByFromRaw(firstRaw) || items[0]?.RejectedBy?.trim() || "";
      if (rejectedByName) payableStore.setMainRejectedBy(rejectedByName);
    }
  }
  rejectionHistoryLoading.value = false;
}
let leaveConfirmNext: (() => void) | ((allow: false) => void) | null = null;

onBeforeRouteLeave((_to, _from, next) => {
  if (payableStore.isDirty || sessionPayableInvoice.createdIds.length > 0) {
    showLeaveConfirmModal.value = true;
    leaveConfirmNext = next;
  } else {
    void payableStore.releaseSoftLock();
    next();
  }
});

async function onLeaveConfirm() {
  const ids = [...sessionPayableInvoice.createdIds];
  sessionPayableInvoice.clear();
  if (ids.length > 0 && isConnected.value) {
    for (const recordId of ids) {
      await deleteRecord(LAYOUTS.PAYABLE_INVOICE, recordId);
    }
  }
  await payableStore.releaseSoftLock();
  if (leaveConfirmNext) {
    (leaveConfirmNext as () => void)();
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
      payableStore.mainStatus,
      payableStore.loading,
    ] as const,
  ([transRef, mainPosted, mainStatus, loading]) => {
    const shouldFetch =
      !loading && !!transRef && (mainPosted || mainStatus === "Rejected");
    if (shouldFetch) {
      fetchRejectionHistory();
    } else {
      rejectionHistory.value = [];
    }
  },
  { immediate: true },
);

watch(
  () => route.query.transRef,
  () => {
    editRequestModalDismissedForTransRef.value = null;
    showEditRequestModal.value = false;
    pendingEditRequestForModal.value = null;
    editRequestModalTransRef.value = null;
    spreadsheet.clearRowSelection();
  },
);

watch(
  () => payableStore.currentTransRef,
  () => {
    spreadsheet.clearRowSelection();
  },
);

watch(
  () =>
    [
      payableStore.currentTransRef,
      payableStore.mainPosted,
      payableStore.mainStatus,
      payableStore.loading,
      canApproveOrReject.value,
      roleLoaded.value,
    ] as const,
  async ([
    transRef,
    mainPosted,
    mainStatus,
    loading,
    canApprove,
    roleLoadedVal,
  ]) => {
    if (
      loading ||
      !transRef ||
      !canApprove ||
      !roleLoadedVal ||
      !mainPosted ||
      mainStatus !== "Posted"
    ) {
      showEditRequestModal.value = false;
      pendingEditRequestForModal.value = null;
      editRequestModalTransRef.value = null;
      return;
    }
    const { data: pending } = await fetchPendingEditRequest(transRef);
    if (pending && editRequestModalDismissedForTransRef.value !== transRef) {
      pendingEditRequestForModal.value = pending;
      editRequestModalTransRef.value = transRef;
      showEditRequestModal.value = true;
    } else {
      pendingEditRequestForModal.value = null;
      editRequestModalTransRef.value = null;
      showEditRequestModal.value = false;
    }
  },
  { immediate: true },
);

function dismissEditRequestModal() {
  if (payableStore.currentTransRef) {
    editRequestModalDismissedForTransRef.value = payableStore.currentTransRef;
  }
  showEditRequestModal.value = false;
}

async function onProceedAllowEdit() {
  if (grantingEditRequest.value) return;
  const transRef = payableStore.currentTransRef;
  const mainRecordId = payableStore.currentMainRecordId;
  const requestedBy = pendingEditRequestForModal.value?.RequestedBy;
  if (!transRef || !mainRecordId || !isConnected.value) return;
  const managerName = (userFullName.value || "").trim() || "Manager";
  grantingEditRequest.value = true;
  try {
    const { error } = await grantEditRequest(
      transRef,
      mainRecordId,
      managerName,
    );
    if (error) {
      toast.error("Could not allow edit: " + error);
      return;
    }
    const { error: notifyErr } = await notifyEditRequestGranted(
      transRef,
      requestedBy ?? "Officer",
    );
    if (notifyErr) {
      toast.warning("Officer notification could not be sent: " + notifyErr);
    }
    toast.success(
      "Entry returned to draft. Officer can now edit and post again.",
    );
    showEditRequestModal.value = false;
    pendingEditRequestForModal.value = null;
    editRequestModalTransRef.value = null;
    await payableStore.fetchDetailsByTransRef(transRef);
    router.push(getHomeRoute());
  } finally {
    grantingEditRequest.value = false;
  }
}

function handleDeleteRowByIndex(rowIndex: number) {
  if (spreadsheet.rowCount.value <= 1) return;
  pendingDeleteIndices.value = [rowIndex];
  showDeleteRowsConfirmModal.value = true;
}

function onDeleteRowsCancel() {
  pendingDeleteIndices.value = [];
  showDeleteRowsConfirmModal.value = false;
}

async function onDeleteRowsConfirm() {
  const indices = [...pendingDeleteIndices.value].sort((a, b) => b - a);
  pendingDeleteIndices.value = [];
  if (indices.length === 0) {
    showDeleteRowsConfirmModal.value = false;
    return;
  }
  const maxDelete = spreadsheet.rowCount.value - 1;
  const toDelete = indices.slice(0, maxDelete);
  if (toDelete.length === 0) {
    showDeleteRowsConfirmModal.value = false;
    return;
  }
  deletingRows.value = true;
  try {
    for (const rowIndex of toDelete) {
      const row = payableStore.rows[rowIndex];
      const invNum = row ? String(row.invoice_number ?? "").trim() : "";
      spreadsheet.deleteRow(rowIndex);
      if (
        invNum &&
        isConnected.value &&
        sessionPayableInvoice.createdIds.length > 0
      ) {
        const { data } =
          await findRecordsByQueryWithIds<PayableInvoiceFieldData>(
            LAYOUTS.PAYABLE_INVOICE,
            { invoiceNumber: invNum },
            100,
          );
        const sessionIds = new Set(sessionPayableInvoice.createdIds);
        const idsToRemove: string[] = [];
        for (const r of data) {
          const rid = r.recordId;
          if (rid && sessionIds.has(String(rid).trim())) {
            idsToRemove.push(String(rid).trim());
          }
        }
        for (const recordId of idsToRemove) {
          await deleteRecord(LAYOUTS.PAYABLE_INVOICE, recordId);
        }
        if (idsToRemove.length > 0) {
          sessionPayableInvoice.removeCreatedIds(idsToRemove);
        }
      }
    }
    spreadsheet.clearRowSelection();
  } finally {
    deletingRows.value = false;
    pendingDeleteIndices.value = [];
    showDeleteRowsConfirmModal.value = false;
  }
}

async function onDeleteDraftConfirm(reason: string) {
  const mainRecordId = payableStore.currentMainRecordId;
  const transRef = payableStore.currentTransRef;
  if (
    !mainRecordId ||
    !transRef ||
    !isConnected.value ||
    payableStore.mainStatus !== "Draft"
  ) {
    if (payableStore.softLockReadOnly) {
      toast.warning(
        "You can’t delete this draft while another user is editing it.",
      );
    }
    showDeleteDraftModal.value = false;
    return;
  }
  deletingDraft.value = true;
  try {
    const serverLockErr = await payableStore.verifyServerDraftEditingLock({
      forDelete: true,
    });
    if (serverLockErr) {
      toast.error(serverLockErr);
      showDeleteDraftModal.value = false;
      return;
    }
    const rows = payableStore.rows;
    let firstError: string | null = null;
    for (const row of rows) {
      const recordId = (row as { recordId?: string })?.recordId;
      if (recordId && String(recordId).trim()) {
        const { error } = await deleteRecord(
          LAYOUTS.PAYABLES_DETAILS,
          recordId,
        );
        if (error) {
          firstError = error;
          break;
        }
      }
    }
    if (firstError) {
      toast.error("Could not delete entry: " + firstError);
      await payableStore.fetchDetailsByTransRef(transRef);
      showDeleteDraftModal.value = false;
      return;
    }
    const actor = (userFullName.value || "").trim() || "—";
    const vendorName = vendorStore.vendor?.vendor_name ?? "";
    const activityErr = await writeActivityLog(
      createRecord,
      transRef,
      "Deleted",
      actor,
      reason?.trim() || undefined,
      payableStore.entryTotal,
      vendorName,
    );
    if (activityErr) {
      toast.error("Draft deleted but activity log failed: " + activityErr);
    }

    const { error: mainErr } = await deleteRecord(
      LAYOUTS.PAYABLES_MAIN,
      mainRecordId,
    );
    if (mainErr) {
      toast.error("Could not delete entry: " + mainErr);
      return;
    }
    showDeleteDraftModal.value = false;
    booklet.removeByRef(transRef);
    payableStore.clearAll();
    vendorStore.reset();
    toast.success("Draft entry deleted.");
    router.push({ name: "entry" });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Delete failed unexpectedly.";
    toast.error(msg);
    showDeleteDraftModal.value = false;
  } finally {
    deletingDraft.value = false;
  }
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
  if (rejecting.value) return;
  const transRef = payableStore.currentTransRef;
  const mainRecordId = payableStore.currentMainRecordId;
  if (!transRef || !mainRecordId || !isConnected.value) return;
  rejecting.value = true;
  loadingOverlay.show("Rejecting…", "Please don't navigate away");
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
    const rejectedBy = (userFullName.value || "").trim() || "Manager";
    const { error: createErr } = await createRecord(
      LAYOUTS.PAYABLES_REJECTION_HISTORY,
      {
        TransRef: transRef,
        RejectedDate: formatTimestampForFileMaker(),
        RejectedBy: rejectedBy,
        Reason: reason.trim(),
      },
    );
    if (createErr) {
      toast.error("Rejected but failed to record history: " + createErr);
    }
    const activityErr = await writeActivityLog(
      createRecord,
      transRef,
      "Rejected",
      rejectedBy,
      reason.trim(),
      payableStore.entryTotal,
    );
    if (activityErr) {
      toast.error("Rejected but failed to record activity: " + activityErr);
    }
    const postedName = payableStore.mainPostedName ?? "";
    const creatorName = payableStore.mainCreatorFullName ?? "";
    const vendorName = vendorStore.vendor?.vendor_name ?? "";
    const { error: notifyErr } = await notifyRejectedEntryToOfficer({
      transRef,
      postedName,
      creatorName,
      rejectedBy,
      rejectReason: reason.trim(),
      vendorName,
    });
    if (notifyErr) {
      toast.info("Rejection notification could not be sent: " + notifyErr);
    }
    toast.success("Entry rejected.");
    await payableStore.fetchDetailsByTransRef(transRef);
    router.push(backToListRoute.value);
  } finally {
    loadingOverlay.hide();
    rejecting.value = false;
  }
}

async function onApprove() {
  if (approving.value) return;
  const mainRecordId = payableStore.currentMainRecordId;
  const transRef = payableStore.currentTransRef;
  if (!mainRecordId || !isConnected.value || !transRef) return;
  approving.value = true;
  loadingOverlay.show("Approving…", "Please don't navigate away");
  try {
    const approvedBy = (userFullName.value || "").trim() || "Manager";
    const { error: updateErr } = await updateRecord(
      LAYOUTS.PAYABLES_MAIN,
      mainRecordId,
      {
        Approved: "Yes",
        ApprovedDate: formatDateOnlyForFileMaker(),
        ApprovedBy: approvedBy,
      },
    );
    if (updateErr) {
      toast.error("Approve failed: " + updateErr);
      return;
    }
    const activityErr = await writeActivityLog(
      createRecord,
      transRef,
      "Approved",
      approvedBy,
      undefined,
      payableStore.entryTotal,
    );
    if (activityErr) {
      toast.error("Approved but failed to record activity: " + activityErr);
    }
    if (documentSettings.approvalEmailToOfficerEnabled) {
      const postedName = payableStore.mainPostedName ?? "";
      const vendorName = vendorStore.vendor?.vendor_name ?? "";
      const { error: notifyErr } = await notifyApprovalToOfficer({
        transRef,
        postedName,
        approvedBy,
        vendorName,
      });
      if (notifyErr) {
        toast.info("Approval notification could not be sent: " + notifyErr);
      }
    }
    toast.success("Entry approved.");
    await payableStore.fetchDetailsByTransRef(transRef);
    router.push(backToListRoute.value);
  } finally {
    loadingOverlay.hide();
    approving.value = false;
  }
}

/** Format number with thousand separators for PDF (e.g. 8295.4 -> "8,295.40"). */
function formatPdfNumber(value: string | number): string {
  const n =
    typeof value === "number"
      ? value
      : parseFloat(String(value).replace(/,/g, ""));
  if (Number.isNaN(n)) return String(value ?? "—");
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format date for PDF vendor table (DD/MM/YYYY). */
function formatDateForPdfDisplay(dateStr: string | undefined): string {
  if (!dateStr?.trim()) return "—";
  const s = dateStr.trim();
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) {
    const [, y, m, d] = iso;
    return `${d!.padStart(2, "0")}/${m!.padStart(2, "0")}/${y}`;
  }
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, m, d, y] = us;
    return `${d!.padStart(2, "0")}/${m!.padStart(2, "0")}/${y}`;
  }
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  return s;
}

/** Convert amount to words for PDF. */
function amountInWords(amount: number, currencyCode = ""): string {
  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];
  function toWords(n: number): string {
    if (n === 0) return "Zero";
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return (tens[Math.floor(n / 10)] + " " + ones[n % 10]).trim();
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred " +
        toWords(n % 100)
      ).trim();
    if (n < 1e6)
      return (
        toWords(Math.floor(n / 1000)) +
        " Thousand " +
        toWords(n % 1000)
      ).trim();
    if (n < 1e9)
      return (
        toWords(Math.floor(n / 1e6)) +
        " Million " +
        toWords(n % 1e6)
      ).trim();
    return String(n);
  }
  const wholeStr = whole === 0 ? "Zero" : toWords(whole);
  const currency = currencyCode ? ` ${currencyCode}` : "";
  if (cents === 0) return `${wholeStr}${currency} only`;
  return `${wholeStr}${currency} and ${cents}/100`;
}

/** Build and download PDF with pdfmake (invoice-style layout, B&W friendly). */
async function downloadApprovedPdf() {
  if (downloadingPdf.value) return;
  const status = payableStore.mainStatus;
  const when = documentSettings.invoiceDownloadWhen;
  const ok =
    payableStore.mainPosted &&
    (when === "approved_only"
      ? status === "Approved"
      : when === "once_posted"
        ? status === "Posted" || status === "Approved"
        : false);
  if (!ok) return;
  downloadingPdf.value = true;
  loadingOverlay.show("Preparing PDF…");
  try {
    const [pdfMakeModule, vfsModule] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);
    const pdfMake =
      (
        pdfMakeModule as {
          default?: {
            createPdf: (def: unknown) => { download: (name: string) => void };
            addVirtualFileSystem?: (v: unknown) => void;
          };
        }
      ).default ??
      (pdfMakeModule as {
        createPdf: (def: unknown) => { download: (name: string) => void };
        addVirtualFileSystem?: (v: unknown) => void;
      });
    const vfs = (vfsModule as { default?: unknown }).default ?? vfsModule;
    if (pdfMake.addVirtualFileSystem && vfs) {
      pdfMake.addVirtualFileSystem(vfs);
    }

    const transRef = payableStore.currentTransRef?.trim() ?? "";
    const v = vendorStore.vendor;
    const amountToPayVal =
      typeof payableStore.amountToPay === "number"
        ? payableStore.amountToPay
        : 0;
    const advancePaymentVal = payableStore.advancePaymentNum ?? 0;
    const advancePaymentStr =
      (v.currency ? `${v.currency} ` : "") + formatPdfNumber(advancePaymentVal);
    const totalFormatted = formatPdfNumber(amountToPayVal);
    const totalStr = (v.currency ? `${v.currency} ` : "") + totalFormatted;
    const dateStr = new Date().toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const vendorLine =
      [transRef, v.vendor_id, v.vendor_name].filter(Boolean).join("  ·  ") ||
      "—";
    const inWords = amountInWords(amountToPayVal, v.currency || "");

    const rows = payableStore.rows.filter(
      (r) =>
        (r.invoice_number ?? "").trim() !== "" ||
        (r.amount ?? "").trim() !== "" ||
        (r.total ?? "").trim() !== "",
    );

    const subTotal = rows.reduce((acc, r) => {
      const n = parseFloat(String(r.amount ?? "").replace(/,/g, ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);
    const totalTax = rows.reduce((acc, r) => {
      const taxAmount = (r.reference ?? "").trim() || (r.tax ?? "");
      const n = parseFloat(String(taxAmount).replace(/,/g, ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);
    const totalWhtTax = rows.reduce((acc, r) => {
      const n = parseFloat(String(r.wht_tax_amount ?? "").replace(/,/g, ""));
      return acc + (Number.isNaN(n) ? 0 : n);
    }, 0);
    const subTotalStr =
      (v.currency ? `${v.currency} ` : "") + formatPdfNumber(subTotal);

    const uniqueInvoices = [
      ...new Set(
        rows.map((r) => (r.invoice_number ?? "").trim()).filter(Boolean),
      ),
    ];
    const payableInvoiceByInv = new Map<string, PayableInvoiceFieldData[]>();
    let taxListData: FindRecordWithId<TaxValueFieldData>[] = [];
    if (isConnected.value && uniqueInvoices.length > 0) {
      const [invResults, taxRes] = await Promise.all([
        Promise.all(
          uniqueInvoices.map((inv) =>
            findRecordsByQueryWithIds<PayableInvoiceFieldData>(
              LAYOUTS.PAYABLE_INVOICE,
              { invoiceNumber: inv },
              100,
            ),
          ),
        ),
        findRecordsWithIds<TaxValueFieldData>(LAYOUTS.TAX_VALUE, {
          limit: 500,
        }),
      ]);
      invResults.forEach((res, i) => {
        const inv = uniqueInvoices[i];
        if (inv && res.data?.length) {
          payableInvoiceByInv.set(
            inv,
            res.data.map((r) => r.fieldData).filter(Boolean),
          );
        }
      });
      taxListData = taxRes.data ?? [];
    }

    function getActionForTax(
      taxName: string,
      rate: number,
      taxType?: string,
    ): "Add" | "Sub" {
      const nameMatch = String(taxName ?? "").trim();
      for (const { fieldData } of taxListData) {
        const fd = fieldData;
        const matchName = String(fd.Tax_Name ?? "").trim() === nameMatch;
        const matchRate = Number(fd.Tax_Rate) === rate;
        const matchType =
          !taxType ||
          String(fd.Tax_Type ?? "").trim() === String(taxType).trim();
        if (matchName && matchRate && matchType) {
          return (fd.Action ?? "").trim() === "Sub" ? "Sub" : "Add";
        }
      }
      return "Add";
    }

    function buildTaxBreakdownText(
      row: (typeof rows)[0],
      actionFilter: "Add" | "Sub",
    ): string {
      const inv = (row.invoice_number ?? "").trim();
      if (!inv) return "—";
      const records = payableInvoiceByInv.get(inv);
      if (!records?.length) return "—";
      const parts = records
        .filter((rec) => {
          const rate = Number(rec.Rate ?? 0);
          const name = (rec.TaxName ?? "").trim();
          const action = getActionForTax(name, rate, rec.Tax_Type);
          return action === actionFilter;
        })
        .map((rec) => {
          const rate = Number(rec.Rate ?? 0);
          const name = (rec.TaxName ?? "").trim() || "Tax";
          const rateStr = rate !== 0 ? `${rate}%` : "";
          return `${name}${rateStr ? ` ${rateStr}` : ""}`;
        });
      return parts.length ? parts.join(", ") : "—";
    }

    const tableFontSize = 7;
    const tableHeaderRow = [
      {
        text: "Invoice No.",
        fillColor: "#ebebeb",
        bold: true,
        fontSize: tableFontSize,
      },
      {
        text: "Amount before VAT",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "Tax Rate",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "Tax Amount",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "Tax breakdown (Add)",
        fillColor: "#ebebeb",
        bold: true,
        fontSize: tableFontSize,
      },
      {
        text: "WHT Tax",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "WHT Tax Amount",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
      {
        text: "WHT Tax breakdown (Sub)",
        fillColor: "#ebebeb",
        bold: true,
        fontSize: tableFontSize,
      },
      {
        text: "Total",
        fillColor: "#ebebeb",
        bold: true,
        alignment: "right" as const,
        fontSize: tableFontSize,
      },
    ];
    const tableBody = [
      tableHeaderRow,
      ...rows.map((r) => {
        const taxAmount = (r.reference ?? "").trim() || (r.tax ?? "");
        return [
          {
            text: (r.invoice_number ?? "").trim() || "—",
            fontSize: tableFontSize,
          },
          {
            text: formatPdfNumber(r.amount ?? ""),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
          {
            text: formatPdfNumber(r.tax ?? ""),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
          {
            text: formatPdfNumber(taxAmount),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
          { text: buildTaxBreakdownText(r, "Add"), fontSize: tableFontSize },
          {
            text: formatPdfNumber(r.wht_tax ?? ""),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
          {
            text: formatPdfNumber(r.wht_tax_amount ?? ""),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
          { text: buildTaxBreakdownText(r, "Sub"), fontSize: tableFontSize },
          {
            text: formatPdfNumber(r.total ?? ""),
            alignment: "right" as const,
            fontSize: tableFontSize,
          },
        ];
      }),
    ];

    const watermarkText = transRef ? `APPROVED · ${transRef}` : "APPROVED";
    const docDefinition = {
      pageSize: "A4",
      pageOrientation: "landscape",
      pageMargins: [40, 50, 40, 70],
      defaultStyle: { fontSize: 10, color: "#000" },
      watermark: {
        text: watermarkText,
        color: "#b0b0b0",
        opacity: 0.12,
        bold: true,
        angle: -45,
      },
      content: [
        {
          columns: [
            { text: "Invoice Payment - PDF", fontSize: 15, bold: true },
            {
              text: dateStr.toUpperCase(),
              fontSize: 10,
              alignment: "right",
              width: "*",
            },
          ],
          margin: [0, 0, 0, 10],
        },
        {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 762, y2: 0 }],
          margin: [0, 4, 0, 10],
        },
        {
          text: vendorLine,
          alignment: "center",
          bold: true,
          fontSize: 12,
          margin: [0, 0, 0, 6],
        },
        {
          table: {
            widths: [120, "*"],
            body: [
              [
                {
                  text: "Purchase order",
                  bold: true,
                  fillColor: "#f5f5f5",
                  fontSize: 8,
                },
                { text: v.purchase_order?.trim() || "—", fontSize: 8 },
              ],
              [
                {
                  text: "Vendor ID",
                  bold: true,
                  fillColor: "#f5f5f5",
                  fontSize: 8,
                },
                { text: v.vendor_id?.trim() || "—", fontSize: 8 },
              ],
              [
                {
                  text: "Vendor name",
                  bold: true,
                  fillColor: "#f5f5f5",
                  fontSize: 8,
                },
                { text: v.vendor_name?.trim() || "—", fontSize: 8 },
              ],
              [
                {
                  text: "Date (DD/MM/YYYY)",
                  bold: true,
                  fillColor: "#f5f5f5",
                  fontSize: 8,
                },
                {
                  text: formatDateForPdfDisplay(
                    v.payment_terms?.trim() ||
                      new Date().toISOString().slice(0, 10),
                  ),
                  fontSize: 8,
                },
              ],
              [
                {
                  text: "Email",
                  bold: true,
                  fillColor: "#f5f5f5",
                  fontSize: 8,
                },
                { text: v.contact_email?.trim() || "—", fontSize: 8 },
              ],
              [
                {
                  text: "Currency",
                  bold: true,
                  fillColor: "#f5f5f5",
                  fontSize: 8,
                },
                { text: v.currency?.trim() || "—", fontSize: 8 },
              ],
              [
                {
                  text: "Vendor balance in BC",
                  bold: true,
                  fillColor: "#f5f5f5",
                  fontSize: 8,
                },
                {
                  text: v.vendor_balance?.trim()
                    ? (v.currency ? `${v.currency} ` : "") +
                      formatPdfNumber(v.vendor_balance)
                    : "—",
                  fontSize: 8,
                },
              ],
            ],
          },
          layout: { hLineWidth: () => 0.2, vLineWidth: () => 0.2 },
          margin: [0, 0, 0, 12],
        },
        {
          canvas: [{ type: "line", x1: 0, y1: 0, x2: 762, y2: 0 }],
          margin: [0, 0, 0, 12],
        },
        {
          table: {
            headerRows: 1,
            widths: [65, 70, 42, 55, "*", 42, 60, "*", 55],
            body: tableBody,
          },
          layout: { hLineWidth: () => 0.25, vLineWidth: () => 0.25 },
          margin: [0, 0, 0, 14],
        },
        {
          columns: [
            {
              width: "*",
              stack: [
                {
                  text: "Amount in words",
                  bold: true,
                  fontSize: 9,
                  margin: [0, 0, 0, 4],
                },
                { text: inWords, fontSize: 10 },
              ],
              fillColor: "#f8f8f8",
              margin: [0, 4, 8, 4],
            },
            {
              width: 240,
              table: {
                widths: [130, "*"],
                body: [
                  [
                    {
                      text: "Sub Total (excl. tax)",
                      fontSize: 9,
                      fillColor: "#f5f5f5",
                    },
                    {
                      text: subTotalStr,
                      fontSize: 9,
                      alignment: "right" as const,
                      fillColor: "#f5f5f5",
                    },
                  ],
                  [
                    {
                      text: "Total Tax (Add)",
                      fontSize: 9,
                      fillColor: "#f5f5f5",
                    },
                    {
                      text:
                        (v.currency ? `${v.currency} ` : "") +
                        formatPdfNumber(totalTax),
                      fontSize: 9,
                      alignment: "right" as const,
                      fillColor: "#f5f5f5",
                    },
                  ],
                  [
                    {
                      text: "Total WHT Tax (Sub)",
                      fontSize: 9,
                      fillColor: "#f5f5f5",
                    },
                    {
                      text:
                        (v.currency ? `${v.currency} ` : "") +
                        formatPdfNumber(totalWhtTax),
                      fontSize: 9,
                      alignment: "right" as const,
                      fillColor: "#f5f5f5",
                    },
                  ],
                  [
                    {
                      text: "Advance Payment",
                      fontSize: 9,
                      fillColor: "#f5f5f5",
                    },
                    {
                      text: advancePaymentVal > 0 ? advancePaymentStr : "—",
                      fontSize: 9,
                      alignment: "right" as const,
                      fillColor: "#f5f5f5",
                    },
                  ],
                  [
                    {
                      text: "Amount to Pay",
                      fontSize: 9,
                      bold: true,
                      fillColor: "#f5f5f5",
                    },
                    {
                      text: totalStr,
                      fontSize: 9,
                      bold: true,
                      alignment: "right" as const,
                      fillColor: "#f5f5f5",
                    },
                  ],
                ],
              },
              layout: { hLineWidth: () => 0.2, vLineWidth: () => 0.2 },
            },
          ],
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 10, 40, 0],
        stack: [
          {
            text: `PAGE ${currentPage} of ${pageCount}`,
            fontSize: 9,
            alignment: "center" as const,
          },
          {
            text:
              "Finance Payables  ·  " +
              new Date().toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            fontSize: 8,
            alignment: "center" as const,
            margin: [0, 2, 0, 0],
          },
        ],
      }),
    };

    const filename = transRef
      ? `Approved-Payable-${transRef.replace(/[/\\?%*:|"<>]/g, "-")}.pdf`
      : "Approved-Payable.pdf";
    pdfMake.createPdf(docDefinition).download(filename);
    toast.success("PDF downloaded.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF download failed.";
    toast.error(msg);
  } finally {
    downloadingPdf.value = false;
    loadingOverlay.hide();
  }
}
</script>

<style scoped>
.rejection-history {
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  background: linear-gradient(
    135deg,
    rgba(251, 191, 36, 0.08) 0%,
    rgba(245, 158, 11, 0.04) 100%
  );
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
  background: linear-gradient(
    180deg,
    rgba(251, 191, 36, 0.5) 0%,
    transparent 100%
  );
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
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.15) 0%,
    rgba(239, 68, 68, 0.08) 100%
  );
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

/* Vendor expiry checks: very visible banner */
.expiry-check-banner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  margin-bottom: 1rem;
  border-radius: 12px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.2) 0%,
    rgba(59, 130, 246, 0.08) 100%
  );
  border: 1px solid rgba(59, 130, 246, 0.4);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.12);
}
.expiry-check-banner__icon {
  flex-shrink: 0;
  color: rgb(96, 165, 250);
}
.expiry-check-banner__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.expiry-balance-row {
  display: flex;
  align-items: stretch;
  gap: 1rem;
  margin-bottom: 1rem;
}
.expiry-balance-row .expiry-check-banner {
  flex: 1;
  min-width: 0;
  margin-bottom: 0;
}
.expiry-balance-row__balance {
  flex-shrink: 0;
  margin-left: auto;
}
.expiry-balance-row__balance--full-width {
  flex: 1;
  min-width: 0;
  margin-left: 0;
}
.expiry-balance-row__balance--full-width :deep(.vendor-balance-banner) {
  width: 100%;
  min-width: 0;
}
.expiry-check-banner__item {
  display: grid;
  grid-template-columns: 1.25rem 5.5rem 1fr;
  align-items: center;
  gap: 0.625rem;
  min-height: 1.5rem;
}
.expiry-check-banner__item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
}
.expiry-check-banner__icon-svg {
  width: 1.25rem;
  height: 1.25rem;
}
.expiry-check-banner__icon-placeholder {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
}
.expiry-check-banner__label {
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  min-width: 5.5rem;
}
.expiry-check-banner__item--invalid {
  color: rgb(252, 165, 165);
}
.expiry-check-banner__item--invalid .expiry-check-banner__text {
  color: rgb(252, 165, 165);
}
.expiry-check-banner__item--valid {
  color: rgb(134, 239, 172);
}
.expiry-check-banner__item--valid .expiry-check-banner__text {
  color: rgb(134, 239, 172);
}
.expiry-check-banner__item:not(.expiry-check-banner__item--invalid):not(
    .expiry-check-banner__item--valid
  )
  .expiry-check-banner__label {
  color: rgb(191, 219, 254);
}
.expiry-check-banner__item:not(.expiry-check-banner__item--invalid):not(
    .expiry-check-banner__item--valid
  )
  .expiry-check-banner__text {
  color: var(--color-text);
}
.expiry-check-banner__text {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);
  letter-spacing: -0.01em;
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

/* TransRef QR modal */
.transref-qr-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
}
.transref-qr-modal {
  width: 100%;
  max-width: 18rem;
  padding: 1.5rem;
  background: linear-gradient(
    180deg,
    rgba(30, 41, 59, 0.98) 0%,
    rgba(15, 23, 42, 0.98) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
  text-align: center;
}
.transref-qr-modal__title {
  margin: 0 0 0.25rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}
.transref-qr-modal__subtitle {
  margin: 0 0 1.25rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
.transref-qr-modal__qr {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}
.transref-qr-modal__qr-img {
  width: 200px;
  height: 200px;
  border-radius: 8px;
}
.transref-qr-modal__transref {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: var(--color-text);
}
.transref-qr-modal__close {
  padding: 0.5rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.transref-qr-modal__close:hover {
  background: rgba(255, 255, 255, 0.15);
}
.transref-qr-modal-enter-active,
.transref-qr-modal-leave-active {
  transition: opacity 0.2s ease;
}
.transref-qr-modal-enter-from,
.transref-qr-modal-leave-to {
  opacity: 0;
}

/* Floating action buttons (new entry) */
.entry-fab-group {
  position: fixed;
  bottom: calc(var(--app-footer-height, 3.25rem) + 1rem);
  right: 1.5rem;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  pointer-events: none;
}
.entry-fab-group > * {
  pointer-events: auto;
}
.entry-fab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: rgb(30, 41, 59);
  border: 1px solid var(--color-border);
  border-radius: 9999px;
  color: var(--color-text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25), 0 2px 6px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s var(--ease), box-shadow 0.2s var(--ease), background 0.2s ease;
}
.entry-fab:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 3px 8px rgba(0, 0, 0, 0.2);
  background: rgb(51, 65, 85);
}
.entry-fab:active {
  transform: translateY(0);
}
.entry-fab__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}
.entry-fab__label {
  white-space: nowrap;
}

.entry-transref-with-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.entry-side-page-btn {
  position: absolute;
  top: clamp(6.25rem, 12vh, 8.5rem);
  transform: none;
  z-index: 80;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  border: 1px solid var(--color-border);
  background: rgba(15, 23, 42, 0.75);
  color: rgb(251 146 60 / 0.95);
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.entry-side-page-btn svg {
  width: 1.55rem;
  height: 1.55rem;
}

.entry-page-indicator {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  min-width: 4.5rem;
  padding: 0.58rem 1.15rem;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.5);
  background: linear-gradient(
    160deg,
    rgba(30, 41, 59, 0.96),
    rgba(15, 23, 42, 0.93)
  );
  color: rgba(248, 250, 252, 0.99);
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  box-shadow:
    0 10px 24px rgba(2, 6, 23, 0.42),
    0 0 0 1px rgba(59, 130, 246, 0.2) inset;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.entry-side-page-btn--left {
  left: -2.4rem;
}

.entry-side-page-btn--right {
  right: -2.4rem;
}

.entry-side-page-btn:hover:not(:disabled) {
  background: rgba(249, 115, 22, 0.14);
  border-color: rgba(251, 146, 60, 0.45);
}

.entry-side-page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.app-layout.theme-light .entry-page-indicator {
  border-color: rgba(37, 99, 235, 0.3);
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.96),
    rgba(241, 245, 249, 0.94)
  );
  color: rgba(15, 23, 42, 0.88);
  box-shadow:
    0 8px 18px rgba(148, 163, 184, 0.22),
    0 0 0 1px rgba(37, 99, 235, 0.08) inset;
}

@media (max-width: 1320px) {
  .entry-side-page-btn {
    display: none;
  }
}

.soft-lock-chip {
  padding: 0.18rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  border: 1px solid rgba(148, 163, 184, 0.7);
  color: rgba(191, 219, 254, 0.95);
  background: rgba(15, 23, 42, 0.9);
}

.app-layout.theme-light .soft-lock-chip {
  background: #e5f1ff;
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.6);
}

.soft-lock-inline-btn {
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  border: 1px solid rgba(59, 130, 246, 0.7);
  background: transparent;
  color: #bfdbfe;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
}

.soft-lock-inline-btn:hover {
  background: rgba(37, 99, 235, 0.2);
  border-color: rgba(59, 130, 246, 0.9);
}

.app-layout.theme-light .soft-lock-inline-btn {
  color: #1d4ed8;
  border-color: rgba(59, 130, 246, 0.7);
}

.app-layout.theme-light .soft-lock-inline-btn:hover {
  background: rgba(219, 234, 254, 0.9);
}

.soft-lock-inline-btn--banner {
  padding-inline: 1rem;
  background: #2563eb;
  border-color: #2563eb;
  color: #f9fafb;
  font-weight: 600;
}

.soft-lock-inline-btn--banner:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}

.app-layout.theme-light .soft-lock-inline-btn--banner {
  background: #2563eb;
  border-color: #2563eb;
  color: #f9fafb;
}

.app-layout.theme-light .soft-lock-inline-btn--banner:hover {
  background: #1d4ed8;
  border-color: #1d4ed8;
}
</style>
