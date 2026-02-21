<template>
  <aside
    class="overview-sidebar hidden lg:flex w-[400px] xl:w-[420px] shrink-0 flex-col border-l border-[var(--color-border)] bg-[var(--color-bg-card)]/80 backdrop-blur-[var(--blur-glass)]"
    style="min-height: 100vh"
  >
    <div class="overview-inner flex flex-col flex-1 p-5">
      <div
        class="overview-header mb-4 flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-soft)]/60 text-[var(--color-accent)]"
            aria-hidden="true"
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </span>
          <h3
            class="text-[28px] font-regular tracking-tight text-[var(--color-text)]"
          >
            Overview
          </h3>
        </div>
        <button
          type="button"
          class="pill-btn glass-input inline-flex items-center gap-1.5 px-3 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors shrink-0"
          aria-label="Log out"
          @click="onLogout"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Log out
        </button>
      </div>

      <!-- Home: skeleton while role loading -->
      <div
        v-if="route.name === 'home' && !roleLoaded"
        class="overview-cards space-y-3"
      >
        <div
          v-for="i in 4"
          :key="i"
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <div class="flex items-center justify-between mb-1.5">
            <Skeleton width="3rem" height="0.875rem" class="rounded" />
            <Skeleton width="2.25rem" height="1.5rem" class="rounded-full" />
          </div>
          <div class="space-y-2 mt-2">
            <Skeleton width="100%" height="0.875rem" class="rounded" />
            <Skeleton width="70%" height="0.875rem" class="rounded" />
          </div>
        </div>
      </div>

      <!-- Home: Overdue / Pending approval indicators + Draft & Posted with counts + totals -->
      <div v-else-if="route.name === 'home'" class="overview-cards space-y-3">
        <!-- Overdue / Pending approval badges -->
        <div
          v-if="
            roleLoaded &&
            (listSummary.overdueCount > 0 || listSummary.postedCount > 0)
          "
          class="overview-alerts flex flex-col gap-2"
        >
          <div
            v-if="listSummary.overdueCount > 0"
            class="overview-badge-card overview-badge-card--overdue rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2.5"
          >
            <span class="overview-badge-card__icon" aria-hidden="true">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </span>
            <span class="overview-badge-card__label">Overdue</span>
            <span class="overview-badge-card__value"
              >{{ listSummary.overdueCount }} awaiting approval</span
            >
          </div>
          <div
            v-if="listSummary.postedCount > 0"
            class="overview-badge-card overview-badge-card--pending rounded-xl border border-slate-500/40 bg-slate-500/15 px-3.5 py-2.5"
          >
            <span class="overview-badge-card__icon" aria-hidden="true">
              <svg
                class="h-4 w-4"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
            </span>
            <span class="overview-badge-card__label">Pending approval</span>
            <span class="overview-badge-card__value">{{
              listSummary.postedCount
            }}</span>
          </div>
        </div>
        <div
          v-if="roleLoaded && !isManager"
          class="overview-card overview-card--draft rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.06]"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span
              class="text-[var(--label-size)] font-medium text-[var(--color-text-muted)]"
              >Draft</span
            >
            <span
              class="overview-badge overview-badge--draft rounded-full min-w-[2.25rem] px-3.5 py-1.5 text-[16px] font-bold tabular-nums text-center"
              :title="String(listSummary.draftCount)"
            >
              {{ formatCompactCount(listSummary.draftCount) }}
            </span>
          </div>
          <div class="overview-totals">
            <div
              v-for="line in totalsByCurrencyLines(
                listSummary.draftTotalsByCurrency,
              )"
              :key="line.currency"
              class="overview-totals__line"
            >
              <span class="overview-totals__currency">{{ line.currency }}</span>
              <span class="overview-totals__amount">{{ line.formatted }}</span>
            </div>
            <p
              v-if="
                !totalsByCurrencyLines(listSummary.draftTotalsByCurrency).length
              "
              class="overview-totals__empty"
            >
              —
            </p>
          </div>
        </div>
        <div
          class="overview-card overview-card--posted rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.06]"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span
              class="text-[var(--label-size)] font-medium text-[var(--color-text-muted)]"
              >Posted</span
            >
            <span
              class="overview-badge overview-badge--posted rounded-full min-w-[2.25rem] px-3.5 py-1.5 text-[16px] font-bold tabular-nums text-center"
              :title="String(listSummary.postedCount)"
            >
              {{ formatCompactCount(listSummary.postedCount) }}
            </span>
          </div>
          <div class="overview-totals">
            <div
              v-for="line in totalsByCurrencyLines(
                listSummary.postedTotalsByCurrency,
              )"
              :key="line.currency"
              class="overview-totals__line"
            >
              <span class="overview-totals__currency">{{ line.currency }}</span>
              <span class="overview-totals__amount">{{ line.formatted }}</span>
            </div>
            <p
              v-if="
                !totalsByCurrencyLines(listSummary.postedTotalsByCurrency)
                  .length
              "
              class="overview-totals__empty"
            >
              —
            </p>
          </div>
        </div>
        <div
          v-if="roleLoaded && !isManager"
          class="overview-card-wrap overview-card-wrap--rejected"
          :class="{
            'overview-card-wrap--has-rejected': listSummary.rejectedCount > 0,
          }"
        >
          <span
            v-if="listSummary.rejectedCount > 0"
            class="overview-card__arrow"
            aria-hidden="true"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </span>
          <div
            class="overview-card overview-card--rejected rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.06]"
          >
            <div class="flex items-center justify-between mb-1.5">
              <span
                class="text-[var(--label-size)] font-medium text-[var(--color-text-muted)]"
                >Rejected</span
              >
              <span
                class="overview-badge overview-badge--rejected rounded-full min-w-[2.25rem] px-3.5 py-1.5 text-[16px] font-bold tabular-nums text-center"
                :title="String(listSummary.rejectedCount)"
              >
                {{ formatCompactCount(listSummary.rejectedCount) }}
              </span>
            </div>
            <div class="overview-totals">
              <div
                v-for="line in totalsByCurrencyLines(
                  listSummary.rejectedTotalsByCurrency,
                )"
                :key="line.currency"
                class="overview-totals__line"
              >
                <span class="overview-totals__currency">{{
                  line.currency
                }}</span>
                <span class="overview-totals__amount">{{
                  line.formatted
                }}</span>
              </div>
              <p
                v-if="
                  !totalsByCurrencyLines(listSummary.rejectedTotalsByCurrency)
                    .length
                "
                class="overview-totals__empty"
              >
                —
              </p>
            </div>
          </div>
        </div>
        <div
          class="overview-card overview-card--approved rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.06]"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span
              class="text-[var(--label-size)] font-medium text-[var(--color-text-muted)]"
              >Approved</span
            >
            <span
              class="overview-badge overview-badge--approved rounded-full min-w-[2.25rem] px-3.5 py-1.5 text-[16px] font-bold tabular-nums text-center"
              :title="String(listSummary.approvedCount)"
            >
              {{ formatCompactCount(listSummary.approvedCount) }}
            </span>
          </div>
          <div class="overview-totals">
            <div
              v-for="line in totalsByCurrencyLines(
                listSummary.approvedTotalsByCurrency,
              )"
              :key="line.currency"
              class="overview-totals__line"
            >
              <span class="overview-totals__currency">{{ line.currency }}</span>
              <span class="overview-totals__amount">{{ line.formatted }}</span>
            </div>
            <p
              v-if="
                !totalsByCurrencyLines(listSummary.approvedTotalsByCurrency)
                  .length
              "
              class="overview-totals__empty"
            >
              —
            </p>
          </div>
        </div>

        <!-- Vendor analytics: top by volume & entry count -->
        <div
          v-if="
            roleLoaded &&
            (listSummary.topVendorsByVolume.length > 0 ||
              listSummary.topVendorsByEntryCount.length > 0)
          "
          class="overview-vendor-analytics space-y-3 pt-1 border-t border-[var(--color-border)]/40"
        >
          <h4
            class="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
          >
            Vendor analytics
          </h4>
          <div
            v-if="listSummary.topVendorsByVolume.length > 0"
            class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
          >
            <p
              class="text-[11px] font-medium text-[var(--color-text-muted)] mb-2"
            >
              Top by volume
            </p>
            <ul class="space-y-1.5">
              <li
                v-for="(v, i) in listSummary.topVendorsByVolume"
                :key="v.vendorName + String(i)"
                class="flex items-center justify-between gap-2 text-[13px]"
              >
                <span
                  class="min-w-0 truncate text-[var(--color-text)]"
                  :title="v.vendorName"
                  >{{ v.vendorName }}</span
                >
                <span
                  class="tabular-nums text-[var(--color-text-muted)] shrink-0"
                >
                  {{ v.currency }} {{ formatNumberDisplay(v.total) || "0" }}
                </span>
              </li>
            </ul>
          </div>
          <div
            v-if="listSummary.topVendorsByEntryCount.length > 0"
            class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
          >
            <p
              class="text-[11px] font-medium text-[var(--color-text-muted)] mb-2"
            >
              Top by entry count
            </p>
            <ul class="space-y-1.5">
              <li
                v-for="(v, i) in listSummary.topVendorsByEntryCount"
                :key="v.vendorName + String(i)"
                class="flex items-center justify-between gap-2 text-[13px]"
              >
                <span
                  class="min-w-0 truncate text-[var(--color-text)]"
                  :title="v.vendorName"
                  >{{ v.vendorName }}</span
                >
                <span
                  class="tabular-nums text-[var(--color-text-muted)] shrink-0"
                  >{{ v.count }} entries</span
                >
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Entry: skeleton while loading -->
      <div
        v-else-if="route.name === 'entry' && payableStore.loading"
        class="overview-cards space-y-3"
      >
        <Skeleton width="100%" height="1rem" class="rounded mb-2" />
        <div
          v-for="i in 6"
          :key="i"
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <Skeleton width="4rem" height="0.75rem" class="rounded mb-2" />
          <Skeleton width="70%" height="1.25rem" class="rounded" />
        </div>
      </div>

      <!-- Entry: status + entry total + line count -->
      <div v-else-if="route.name === 'entry'" class="overview-cards space-y-3">
        <p
          class="text-[var(--label-size)] leading-relaxed text-[var(--color-text-muted)]"
        >
          {{
            payableStore.mainPosted
              ? "View-only (posted)"
              : "Edit and post when ready."
          }}
        </p>
        <div
          v-if="payableStore.mainCreatorFullName"
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Created by
          </p>
          <p
            class="text-[17px] font-medium text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ payableStore.mainCreatorFullName }}
          </p>
        </div>
        <div
          v-if="
            payableStore.mainPostedName &&
            (payableStore.mainStatus === 'Approved' ||
              payableStore.mainStatus === 'Posted')
          "
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Posted by
          </p>
          <p
            class="text-[17px] font-medium text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ payableStore.mainPostedName }}
          </p>
        </div>
        <div
          v-if="payableStore.mainStatus === 'Rejected'"
          class="overview-card overview-card--rejected-by rounded-xl px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Rejected by
          </p>
          <p
            class="text-[17px] font-medium text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ payableStore.mainRejectedBy || '—' }}
          </p>
        </div>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Entry total
          </p>
          <p
            class="text-[17px] font-medium tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ vendorStore.vendor.currency }}
            {{ formatNumberDisplay(payableStore.entryTotal) || "0.00" }}
          </p>
        </div>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Total Amount before VAT
          </p>
          <p
            class="text-[17px] font-medium tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ vendorStore.vendor.currency }}
            {{ formatNumberDisplay(entryTotalAmountBeforeVat) || "0.00" }}
          </p>
        </div>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Total Tax Amount
          </p>
          <p
            class="text-[17px] font-medium tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ vendorStore.vendor.currency }}
            {{ formatNumberDisplay(entryTotalTaxAmount) || "0.00" }}
          </p>
        </div>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Total Tax
          </p>
          <p
            class="text-[17px] font-medium tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ formatNumberDisplay(entryTotalTax) || "0.00" }}
          </p>
        </div>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-0.5"
          >
            Number of Invoice
          </p>
          <p
            class="text-[15px] font-semibold tabular-nums text-[var(--color-text)]"
          >
            {{ payableStore.filledRowCount }}
          </p>
        </div>
        <!-- Cheque issued: show when Approved/Posted and cheque has been collected -->
        <div
          v-if="
            payableStore.mainChequeIssued === 'Yes' &&
            (payableStore.mainStatus === 'Approved' ||
              payableStore.mainStatus === 'Posted')
          "
          class="overview-card rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1.5"
          >
            Cheque issued
          </p>
          <p
            class="text-2xl font-semibold tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
          >
            {{ payableStore.mainBankName || "—" }}
            {{
              payableStore.mainChequeNo ? `#${payableStore.mainChequeNo}` : ""
            }}
          </p>
          <p
            v-if="payableStore.mainChequeIssuedDate"
            class="text-[var(--label-size)] text-[var(--color-text-muted)] mt-1"
          >
            {{ payableStore.mainChequeIssuedDate }}
          </p>
        </div>
      </div>

      <!-- Invoices: total count + breakdown by status -->
      <div
        v-else-if="route.name === 'invoices'"
        class="overview-cards space-y-3"
      >
        <p
          class="text-[var(--label-size)] leading-relaxed text-[var(--color-text-muted)]"
        >
          All payable entries as PDF-style thumbnails. Search, filter by status,
          and open any to view or edit.
        </p>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Total invoices
          </p>
          <p
            class="text-[17px] font-semibold tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
            :title="String(listSummary.totalCount)"
          >
            {{ formatCompactCount(listSummary.totalCount) }}
          </p>
        </div>
        <div
          class="overview-card overview-card--draft rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-2.5 flex items-center justify-between"
        >
          <span class="text-[var(--label-size)] text-[var(--color-text-muted)]"
            >Draft</span
          >
          <span
            class="overview-badge overview-badge--draft rounded-full min-w-[2rem] px-2.5 py-1 text-[14px] font-bold tabular-nums"
            :title="String(listSummary.draftCount)"
            >{{ formatCompactCount(listSummary.draftCount) }}</span
          >
        </div>
        <div
          class="overview-card overview-card--posted rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-2.5 flex items-center justify-between"
        >
          <span class="text-[var(--label-size)] text-[var(--color-text-muted)]"
            >Posted</span
          >
          <span
            class="overview-badge overview-badge--posted rounded-full min-w-[2rem] px-2.5 py-1 text-[14px] font-bold tabular-nums"
            :title="String(listSummary.postedCount)"
            >{{ formatCompactCount(listSummary.postedCount) }}</span
          >
        </div>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-2.5 flex items-center justify-between"
        >
          <span class="text-[var(--label-size)] text-[var(--color-text-muted)]"
            >Rejected</span
          >
          <span
            class="rounded-full min-w-[2rem] px-2.5 py-1 text-[14px] font-bold tabular-nums text-center bg-red-500/20 text-red-400"
            :title="String(listSummary.rejectedCount)"
            >{{ formatCompactCount(listSummary.rejectedCount) }}</span
          >
        </div>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-2.5 flex items-center justify-between"
        >
          <span class="text-[var(--label-size)] text-[var(--color-text-muted)]"
            >Approved</span
          >
          <span
            class="rounded-full min-w-[2rem] px-2.5 py-1 text-[14px] font-bold tabular-nums text-center bg-emerald-500/20 text-emerald-400"
            :title="String(listSummary.approvedCount)"
            >{{ formatCompactCount(listSummary.approvedCount) }}</span
          >
        </div>
      </div>

      <!-- Cheque collection: total count + short description -->
      <div
        v-else-if="route.name === 'cheque-collection'"
        class="overview-cards space-y-3"
      >
        <p
          class="text-[var(--label-size)] leading-relaxed text-[var(--color-text-muted)]"
        >
          Log when vendors collect cheques. Each record links to a payable via
          TransRef for traceability.
        </p>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Collection records
          </p>
          <p
            class="text-[17px] font-semibold tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
            :title="String(chequeOverview.collectionCount)"
          >
            {{ formatCompactCount(chequeOverview.collectionCount) }}
          </p>
        </div>
      </div>

      <!-- Vendors: total count + short description -->
      <div
        v-else-if="route.name === 'vendors'"
        class="overview-cards space-y-3"
      >
        <p
          class="text-[var(--label-size)] leading-relaxed text-[var(--color-text-muted)]"
        >
          View, add, and edit vendor details. Use the table to manage vendors.
        </p>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Total vendors
          </p>
          <p
            class="text-[17px] font-semibold tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
            :title="String(vendorOverview.vendorCount)"
          >
            {{ formatCompactCount(vendorOverview.vendorCount) }}
          </p>
        </div>
      </div>

      <!-- Tax: total count + short description -->
      <div v-else-if="route.name === 'tax'" class="overview-cards space-y-3">
        <p
          class="text-[var(--label-size)] leading-relaxed text-[var(--color-text-muted)]"
        >
          Manage tax types, rates, and date ranges. Use the table to add and
          edit tax records.
        </p>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Total tax records
          </p>
          <p
            class="text-[17px] font-semibold tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
            :title="String(taxOverview.taxCount)"
          >
            {{ formatCompactCount(taxOverview.taxCount) }}
          </p>
        </div>
      </div>

      <!-- Activity Logs: total logs + short description -->
      <div
        v-else-if="route.name === 'settings-logs'"
        class="overview-cards space-y-3"
      >
        <p
          class="text-[var(--label-size)] leading-relaxed text-[var(--color-text-muted)]"
        >
          View audit trail of Created, Edited, Posted, Rejected, Approved, and
          Reposted events.
        </p>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Total logs
          </p>
          <p
            class="text-[17px] font-semibold tabular-nums text-[var(--color-text)] tracking-tight leading-snug"
            :title="String(activityLogOverview.logCount)"
          >
            {{ formatCompactCount(activityLogOverview.logCount) }}
          </p>
        </div>
      </div>

      <!-- Settings (and Manage Users, Documents): short description -->
      <div
        v-else-if="
          route.name === 'settings' ||
          route.name === 'settings-users' ||
          route.name === 'settings-documents'
        "
        class="overview-cards space-y-3"
      >
        <p
          class="text-[var(--label-size)] leading-relaxed text-[var(--color-text-muted)]"
        >
          Configure your preferences. Manage users, connection, and other
          options.
        </p>
        <div
          class="overview-card rounded-xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
        >
          <p
            class="text-[11px] font-medium text-[var(--color-text-muted)] mb-1"
          >
            Sections
          </p>
          <p class="text-[13px] text-[var(--color-text)] leading-relaxed">
            {{ canViewLogs ? 'Account · Audit · Documents · General' : 'Account · Documents · General' }}
          </p>
        </div>
      </div>
    </div>
    <LogoutConfirmModal
      :visible="showLogoutModal"
      @confirm="onLogoutConfirm"
      @cancel="showLogoutModal = false"
    />
  </aside>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import LogoutConfirmModal from "./LogoutConfirmModal.vue";
import Skeleton from "./Skeleton.vue";
import { useFileMaker } from "../composables/useFileMaker";
import { useUserRole } from "../composables/useUserRole";
import { useListSummaryStore } from "../stores/listSummaryStore";
import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";
import { useVendorOverviewStore } from "../stores/vendorOverviewStore";
import { useChequeOverviewStore } from "../stores/chequeOverviewStore";
import { useTaxOverviewStore } from "../stores/taxOverviewStore";
import { useActivityLogOverviewStore } from "../stores/activityLogOverviewStore";
import { formatNumberDisplay, formatCompactCount } from "../utils/formatNumber";

const route = useRoute();
const router = useRouter();
const { logout } = useFileMaker();
const { isManager, roleLoaded, canViewLogs } = useUserRole();
const showLogoutModal = ref(false);

function onLogout() {
  showLogoutModal.value = true;
}

function onLogoutConfirm() {
  showLogoutModal.value = false;
  logout();
  router.push("/");
}

const listSummary = useListSummaryStore();
const payableStore = usePayableStore();

/** Entry overview: totals from grid rows. */
const entryTotalAmountBeforeVat = computed(() =>
  payableStore.rows.reduce((acc, r) => {
    const n = parseFloat(String(r.amount ?? "").replace(/,/g, "")) || 0;
    return acc + (Number.isNaN(n) ? 0 : n);
  }, 0),
);
const entryTotalTaxAmount = computed(() =>
  payableStore.rows.reduce((acc, r) => {
    const val = (r.reference ?? "").trim() || (r.tax ?? "");
    const n = parseFloat(String(val).replace(/,/g, "")) || 0;
    return acc + (Number.isNaN(n) ? 0 : n);
  }, 0),
);
const entryTotalTax = computed(() =>
  payableStore.rows.reduce((acc, r) => {
    const n = parseFloat(String(r.tax ?? "").replace(/,/g, "")) || 0;
    return acc + (Number.isNaN(n) ? 0 : n);
  }, 0),
);
const vendorStore = useVendorStore();
const vendorOverview = useVendorOverviewStore();
const chequeOverview = useChequeOverviewStore();
const taxOverview = useTaxOverviewStore();
const activityLogOverview = useActivityLogOverviewStore();

/** One line per currency for a cleaner list (currency label + amount). */
function totalsByCurrencyLines(
  byCurrency: Record<string, number>,
): { currency: string; formatted: string }[] {
  return Object.entries(byCurrency)
    .filter(([, v]) => Number.isFinite(v) && v !== 0)
    .map(([currency, total]) => ({
      currency,
      formatted: formatNumberDisplay(total) || "0.00",
    }));
}
</script>

<style scoped>
.overview-card-wrap {
  position: relative;
}

.overview-card-wrap--rejected {
  position: relative;
}

.overview-card__arrow {
  position: absolute;
  top: -0.75rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(239, 68, 68, 0.9);
  animation: overview-card-arrow-bounce 1.2s ease-in-out infinite;
  z-index: 2;
}

@keyframes overview-card-arrow-bounce {
  0%,
  100% {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
  50% {
    transform: translateX(-50%) translateY(4px);
    opacity: 0.85;
  }
}

.overview-badge {
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
.overview-badge--draft {
  background: rgba(251, 146, 60, 0.35);
  color: rgb(254, 215, 170);
}
.overview-badge--posted {
  background: rgba(148, 163, 184, 0.25);
  color: rgb(226, 232, 240);
}

.overview-badge--rejected {
  background: rgba(239, 68, 68, 0.3);
  color: rgb(254, 202, 202);
}

/* Rejected by card: red outline so it stands out in the Overview */
.overview-card--rejected-by {
  border: 2px solid rgba(239, 68, 68, 0.7);
  background: rgba(239, 68, 68, 0.08);
}

.overview-badge--approved {
  background: rgba(34, 197, 94, 0.3);
  color: rgb(187, 247, 208);
}

.overview-totals {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.overview-totals__line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.overview-totals__currency {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.overview-totals__amount {
  font-size: 0.9375rem;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}

.overview-totals__empty {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 0;
}

.overview-alerts {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.overview-badge-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 0.75rem;
}

.overview-badge-card__icon {
  flex-shrink: 0;
  opacity: 0.9;
}

.overview-badge-card--overdue .overview-badge-card__icon {
  color: rgb(245, 158, 11);
}

.overview-badge-card--overdue .overview-badge-card__label {
  color: rgb(253, 230, 138);
}

.overview-badge-card--overdue .overview-badge-card__value {
  color: rgb(254, 243, 199);
  font-weight: 600;
}

.overview-badge-card--pending .overview-badge-card__icon {
  color: rgb(148, 163, 184);
}

.overview-badge-card--pending .overview-badge-card__label {
  color: rgb(203, 213, 225);
}

.overview-badge-card--pending .overview-badge-card__value {
  color: rgb(226, 232, 240);
  font-weight: 600;
}
</style>
