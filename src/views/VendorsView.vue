<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto min-h-[400px]"
    :class="peekMode ? 'px-0 py-0' : 'px-4 py-5 md:px-6 md:py-6'"
  >
    <header v-if="!peekMode" class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
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
          Back
        </router-link>
        <h1 class="text-xl font-bold tracking-tight text-[var(--color-text)]">
          Vendors
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="pill-btn glass-input inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-50 disabled:pointer-events-none"
          :disabled="filteredVendorList.length === 0 || exporting"
          aria-label="Export vendors to CSV"
          @click="onExport"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        <button
          type="button"
          class="pill-btn glass-input inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-50 disabled:pointer-events-none"
          :disabled="filteredVendorList.length === 0 || exporting"
          aria-label="Export vendors to PDF"
          @click="onExportPdf"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          PDF
        </button>
        <button
          type="button"
          class="pill-btn inline-flex items-center gap-2 rounded-full glass-input px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text)] hover:bg-white/5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          :disabled="refreshing || !isConnected"
          aria-label="Refresh vendors from BCPS"
          @click="onRefreshFromBCPS"
        >
          <svg
            class="h-4 w-4"
            :class="{ 'animate-spin': refreshing }"
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
          {{ refreshing ? "Refreshing…" : "Refresh Data" }}
        </button>
      </div>
    </header>

    <p v-if="!peekMode" class="text-[var(--label-size)] text-[var(--color-text-muted)] mb-4">
      Manage vendors here. View and edit vendor details.
    </p>
    <div
      :class="{ 'peek-sidebar-sticky': peekMode }"
      class="peek-sidebar-header"
    >
      <p
        v-if="peekMode"
        class="tax-peek-hint text-[13px] text-[var(--color-text-muted)] mb-4"
      >
        Vendors with active GRA and WHT only. Search to narrow down.
      </p>
      <!-- Search -->
      <div
        v-if="!loading && !loadError && vendorList.length > 0"
        class="tax-search-bar"
        :class="{ 'opacity-70 pointer-events-none': refreshing }"
      >
      <div class="tax-search-bar__row">
        <div
          class="search-bar__wrap tax-search-bar__search"
          :class="{ 'search-bar__wrap--has-value': searchQuery }"
        >
          <span class="search-bar__icon" aria-hidden="true">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model.trim="searchQuery"
            type="search"
            class="search-bar__input"
            placeholder="Search vendors…"
            autocomplete="off"
            aria-label="Search vendors"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-bar__clear"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div v-if="!peekMode" class="tax-search-bar__filter-wrap">
          <span class="tax-search-bar__filter-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </span>
          <select
            v-model="graExpiryFilter"
            class="tax-search-bar__filter"
            aria-label="Filter by GRA expiry"
          >
            <option value="">GRA: All</option>
            <option value="valid">GRA: Valid</option>
            <option value="expired">GRA: Expired</option>
          </select>
          <span class="tax-search-bar__filter-chevron" aria-hidden="true">
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
        <div v-if="!peekMode" class="tax-search-bar__filter-wrap">
          <span class="tax-search-bar__filter-icon" aria-hidden="true">
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </span>
          <select
            v-model="whtExpiryFilter"
            class="tax-search-bar__filter"
            aria-label="Filter by WHT expiry"
          >
            <option value="">WHT: All</option>
            <option value="valid">WHT: Valid</option>
            <option value="expired">WHT: Expired</option>
          </select>
          <span class="tax-search-bar__filter-chevron" aria-hidden="true">
            <svg
              width="12"
              height="12"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </div>
      </div>
      <p v-if="searchQuery || graExpiryFilter || whtExpiryFilter" class="tax-search-bar__hint">
        {{ (peekMode ? displayVendorList.length : filteredVendorList.length) }} result{{
          (peekMode ? displayVendorList.length : filteredVendorList.length) === 1 ? "" : "s"
        }}
      </p>
      <p v-else-if="peekMode && displayVendorList.length > 0" class="tax-search-bar__hint">
        {{ displayVendorList.length }} vendor{{
          displayVendorList.length === 1 ? "" : "s"
        }} with active GRA & WHT
      </p>
      </div>
    </div>

    <!-- Table -->
    <div class="logs-table-wrap">
      <template v-if="loading">
        <div class="tax-table-skeleton">
          <div class="tax-table-skeleton__search">
            <Skeleton width="100%" height="2.75rem" class="rounded-xl" />
          </div>
          <table class="tax-table">
            <thead>
              <tr>
                <th>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="6rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4.5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </th>
                <th class="tax-table__actions-th">
                  <Skeleton width="2.5rem" height="0.875rem" class="rounded" />
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 6" :key="i" class="tax-table-skeleton__row">
                <td>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton
                    width="70%"
                    height="0.875rem"
                    class="rounded max-w-[8rem]"
                  />
                </td>
                <td>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="4rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="3rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="3rem" height="0.875rem" class="rounded" />
                </td>
                <td class="tax-table__actions-td">
                  <Skeleton
                    width="3.5rem"
                    height="1.75rem"
                    class="rounded-lg"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else-if="loadError" class="tax-table-error">
        {{ loadError }}
      </div>
      <div v-else-if="vendorList.length === 0" class="tax-table-empty">
        <p>No vendors yet.</p>
      </div>
      <div
        v-else-if="filteredVendorList.length === 0"
        class="tax-table-empty"
        :class="{ 'opacity-75 pointer-events-none': refreshing }"
      >
        <p>{{
          searchQuery || graExpiryFilter || whtExpiryFilter
            ? "No matching vendors."
            : "No vendors yet."
        }}</p>
        <button
          v-if="(searchQuery || graExpiryFilter || whtExpiryFilter) && !refreshing"
          type="button"
          class="pill-btn mt-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
      <div
        v-else-if="peekMode && displayVendorList.length === 0"
        class="tax-table-empty"
        :class="{ 'opacity-75 pointer-events-none': refreshing }"
      >
        <p>No vendors with active GRA and WHT.</p>
      </div>
      <!-- Peek mode: modern card list -->
      <div
        v-else-if="peekMode"
        class="peek-cards"
        :class="{ 'opacity-75 pointer-events-none': refreshing }"
      >
        <div
          v-for="(row, index) in displayVendorList"
          :key="row.recordId || index"
          class="peek-card peek-card--vendor"
        >
          <div class="peek-card__main peek-card__main--vendor">
            <div class="peek-card__vendor-left">
              <span class="peek-card__vendor-name">{{ getField(row, "Vendor_Name") }}</span>
              <span class="peek-card__vendor-id">{{ getField(row, "Vendor_ID") }}</span>
              <div class="peek-card__vendor-details">
                <span v-if="getField(row, 'Vendor_Location') !== '—'">
                  <svg class="peek-card__detail-icon" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {{ getField(row, "Vendor_Location") }}
                </span>
                <span v-if="getField(row, 'Vendor_Email') !== '—'">
                  <svg class="peek-card__detail-icon" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  {{ getField(row, "Vendor_Email") }}
                </span>
              </div>
            </div>
            <div class="peek-card__meta peek-card__meta--vendor peek-card__meta--right">
              <span
                class="peek-card__status peek-card__status--inline"
                :class="expiryCheckStatusClass(getField(row, 'Expiry_Check'))"
              >
                GRA {{ getField(row, "Expiry_Check") }}
              </span>
              <span
                class="peek-card__status peek-card__status--inline"
                :class="expiryCheckStatusClass(getField(row, 'WHT_Expiry_Check'))"
              >
                WHT {{ getField(row, "WHT_Expiry_Check") }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        v-else
        class="logs-table-body"
        :class="{ 'opacity-75 pointer-events-none': refreshing }"
      >
        <div class="tax-table-scroll logs-table-scroll">
          <table class="tax-table logs-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor Name</th>
                <th>Location</th>
                <th>Email</th>
                <th>Tin Number</th>
                <th>GRA Expiry</th>
                <th>Expiry Check</th>
                <th>WHT Expiry</th>
                <th>WHT Expiry Check</th>
                <th class="tax-table__actions-th"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in filteredVendorList"
                :key="row.recordId || index"
              >
              <td>{{ getField(row, "Vendor_ID") }}</td>
              <td>{{ getField(row, "Vendor_Name") }}</td>
              <td>{{ getField(row, "Vendor_Location") }}</td>
              <td>{{ getField(row, "Vendor_Email") }}</td>
              <td>{{ getField(row, "Tin_Number") }}</td>
              <td>{{ formatDate(getField(row, "GRA_Expiry_Date")) }}</td>
              <td>
                <span
                  class="tax-table__status tax-table__status--with-icon"
                  :class="expiryCheckStatusClass(getField(row, 'Expiry_Check'))"
                >
                  <svg
                    v-if="expiryCheckStatusClass(getField(row, 'Expiry_Check')) === 'tax-table__status--valid'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else-if="expiryCheckStatusClass(getField(row, 'Expiry_Check')) === 'tax-table__status--expired'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  <span class="tax-table__status-badge">{{
                    getField(row, "Expiry_Check")
                  }}</span>
                </span>
              </td>
              <td>{{ formatDate(getField(row, "WHT_Expiry_Date")) }}</td>
              <td>
                <span
                  class="tax-table__status tax-table__status--with-icon"
                  :class="expiryCheckStatusClass(getField(row, 'WHT_Expiry_Check'))"
                >
                  <svg
                    v-if="expiryCheckStatusClass(getField(row, 'WHT_Expiry_Check')) === 'tax-table__status--valid'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg
                    v-else-if="expiryCheckStatusClass(getField(row, 'WHT_Expiry_Check')) === 'tax-table__status--expired'"
                    class="tax-table__status-icon"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 9l-6 6M9 9l6 6" />
                  </svg>
                  <span class="tax-table__status-badge">{{
                    getField(row, "WHT_Expiry_Check")
                  }}</span>
                </span>
              </td>
              <td class="tax-table__actions-td">
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="tax-table__edit-btn"
                    aria-label="View field history"
                    :disabled="refreshing || !hasHistoryForRow(row)"
                    :title="
                      hasHistoryForRow(row)
                        ? `Field history for ${getField(row, 'Vendor_Name')}`
                        : 'No field history'
                    "
                    @click="!refreshing && hasHistoryForRow(row) && openHistory(row)"
                  >
                    <svg
                      width="16"
                      height="16"
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
                  </button>
                  <button
                    type="button"
                    class="tax-table__edit-btn"
                    aria-label="Edit"
                    :disabled="refreshing"
                    @click="!refreshing && openEdit(row)"
                  >
                    <svg
                      width="16"
                      height="16"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

    <!-- Add / Edit Vendor modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="tax-modal-backdrop">
        <div
          class="tax-modal vendor-modal"
          role="dialog"
          aria-labelledby="edit-vendor-title"
          aria-modal="true"
        >
          <header class="tax-modal__header">
            <h2
              id="edit-vendor-title"
              class="tax-modal__title"
            >
              Edit Vendor
            </h2>
            <button
              type="button"
              class="tax-modal__close"
              aria-label="Close"
              @click="closeModal"
            >
              <svg
                class="tax-modal__close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>
          <div v-if="formError" class="tax-modal__error" role="alert">
            <svg
              class="tax-modal__error-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span class="tax-modal__error-text">{{ formError }}</span>
          </div>
          <form class="tax-modal__form" @submit.prevent="submit">
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">Basic details</h3>
              <label class="tax-modal__label">
                <span>Vendor ID</span>
                <input
                  v-model="form.Vendor_ID"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  :class="{ 'opacity-75 cursor-not-allowed': editingRecordId }"
                  placeholder="Vendor ID"
                  :readonly="!!editingRecordId"
                />
              </label>
              <label class="tax-modal__label">
                <span>Vendor Name</span>
                <input
                  v-model="form.Vendor_Name"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  :class="{ 'opacity-75 cursor-not-allowed': editingRecordId }"
                  placeholder="Vendor name"
                  required
                  :readonly="!!editingRecordId"
                />
              </label>
              <label class="tax-modal__label">
                <span>Vendor Location</span>
                <input
                  v-model="form.Vendor_Location"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Location"
                />
              </label>
              <label class="tax-modal__label">
                <span>Vendor Email</span>
                <input
                  v-model="form.Vendor_Email"
                  type="email"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  :class="{ 'opacity-75 cursor-not-allowed': editingRecordId }"
                  placeholder="email@example.com"
                  :readonly="!!editingRecordId"
                />
              </label>
              <label class="tax-modal__label">
                <span>Tin Number</span>
                <input
                  v-model="form.Tin_Number"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="TIN"
                />
              </label>
            </section>
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">Dates</h3>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>GRA Expiry Date</span>
                  <input
                    v-model="form.GRA_Expiry_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>Received Date</span>
                  <input
                    v-model="form.Received_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
              </div>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>WHT Expiry Date</span>
                  <input
                    v-model="form.WHT_Expiry_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
                <label class="tax-modal__label">
                  <span>Received WHT Date</span>
                  <input
                    v-model="form.Received_WHT_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                  />
                </label>
              </div>
            </section>
            <div class="tax-modal__actions">
              <button
                type="button"
                class="tax-modal__btn-cancel"
                @click="closeModal"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="tax-modal__btn-submit"
                :disabled="saving"
              >
                {{ saving ? "Saving…" : "Save" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Field history modal (no outside-click close) -->
    <Teleport to="body">
      <div v-if="showHistoryModal" class="tax-modal-backdrop vendor-history-backdrop">
        <div
          class="tax-modal vendor-history-modal"
          role="dialog"
          aria-labelledby="history-modal-title"
          aria-modal="true"
        >
          <header class="tax-modal__header vendor-history-modal__header">
            <div class="flex items-center gap-3">
              <div
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 id="history-modal-title" class="tax-modal__title vendor-history-modal__title">
                  Field history
                </h2>
                <p v-if="historyVendorName" class="vendor-history-modal__subtitle">
                  {{ historyVendorName }}
                </p>
              </div>
            </div>
            <button
              type="button"
              class="tax-modal__close"
              aria-label="Close"
              @click="closeHistoryModal"
            >
              <svg class="tax-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div class="vendor-history-modal__body">
            <div
              v-if="historyLoading"
              class="vendor-history-modal__empty"
            >
              <div class="vendor-history-modal__empty-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p>Loading…</p>
            </div>
            <div
              v-else-if="historyError"
              class="vendor-history-modal__empty vendor-history-modal__empty--error"
            >
              <p>{{ historyError }}</p>
            </div>
            <div
              v-else-if="historyList.length === 0"
              class="vendor-history-modal__empty"
            >
              <div class="vendor-history-modal__empty-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p>No field changes recorded yet.</p>
            </div>
            <div v-else class="vendor-history-modal__table-wrap">
              <table class="vendor-history-modal__table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Field</th>
                    <th>Old</th>
                    <th>New</th>
                    <th>Changed by</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(h, i) in historyList" :key="i">
                    <td class="vendor-history-modal__cell--date">{{ h.Timestamp }}</td>
                    <td>
                      <span class="vendor-history-modal__badge">{{ h.FieldName }}</span>
                    </td>
                    <td class="vendor-history-modal__cell--value" :title="h.OldValue">{{ h.OldValue }}</td>
                    <td class="vendor-history-modal__cell--value vendor-history-modal__cell--new" :title="h.NewValue">{{ h.NewValue }}</td>
                    <td class="vendor-history-modal__cell--actor">{{ displayName(h.ChangedBy) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Skeleton from "../components/Skeleton.vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { VendorTblFieldData } from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { useToastStore } from "../stores/toastStore";
import { useLoadingOverlayStore } from "../stores/loadingOverlayStore";
import { useVendorOverviewStore } from "../stores/vendorOverviewStore";
import { useUserRole } from "../composables/useUserRole";
import {
  formatDateForFileMaker,
  formatTimestampForFileMaker,
} from "../utils/filemakerMappers";
import { downloadCsv } from "../utils/exportData";

const props = withDefaults(defineProps<{ peekMode?: boolean }>(), { peekMode: false });

const {
  updateRecord,
  findRecordsWithIds,
  findRecordsByQueryWithIds,
  createRecord,
  runScript,
  isConnected,
  loggedInEmail,
} = useFileMaker();
const { userFullName } = useUserRole();
const toast = useToastStore();
const vendorOverview = useVendorOverviewStore();

const vendorList = ref<
  FindRecordWithId<VendorTblFieldData | Record<string, unknown>>[]
>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const showAddModal = ref(false);
const searchQuery = ref("");
const graExpiryFilter = ref<"" | "valid" | "expired">("");
const whtExpiryFilter = ref<"" | "valid" | "expired">("");
const editingRecordId = ref<string | null>(null);
const form = ref<VendorTblFieldData>({
  Vendor_ID: "",
  Vendor_Name: "",
  Vendor_Location: "",
  Vendor_Email: "",
  GRA_Expiry_Date: "",
  Received_Date: "",
  Tin_Number: "",
  WHT_Expiry_Date: "",
  Received_WHT_Date: "",
});
const formError = ref<string | null>(null);
const saving = ref(false);
const showHistoryModal = ref(false);
const historyVendorName = ref("");
const emailToNameMap = ref<Map<string, string>>(new Map());
const vendorIdsWithHistory = ref<Set<string>>(new Set());
const historyList = ref<
  { FieldName: string; OldValue: string; NewValue: string; ChangedBy: string; Timestamp: string }[]
>([]);
const historyLoading = ref(false);
const historyError = ref<string | null>(null);
const originalFieldData = ref<{
  Tin_Number: string;
  GRA_Expiry_Date: string;
  Received_Date: string;
  WHT_Expiry_Date: string;
  Received_WHT_Date: string;
} | null>(null);
const refreshing = ref(false);
const exporting = ref(false);

function getField(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
  key: string,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  const v = fd[key] ?? fd[key.replace(/_/g, " ")];
  if (v == null || v === "") return "—";
  return String(v).trim();
}

function expiryCheckStatusClass(value: string): string {
  if (!value || value === "—") return "tax-table__status--other";
  const s = value.toLowerCase().trim();
  if (s === "valid" || s === "ok" || s === "yes" || s === "good")
    return "tax-table__status--valid";
  if (s === "expired" || s === "no" || s === "invalid")
    return "tax-table__status--expired";
  return "tax-table__status--other";
}

function matchesExpiryFilter(
  value: string,
  filter: "" | "valid" | "expired",
): boolean {
  if (!filter) return true;
  const s = (value ?? "").toLowerCase().trim();
  if (filter === "valid")
    return ["valid", "ok", "yes", "good"].includes(s);
  if (filter === "expired")
    return ["expired", "no", "invalid"].includes(s);
  return true;
}

const filteredVendorList = computed(() => {
  let result = vendorList.value;
  const q = searchQuery.value.toLowerCase();
  if (q) {
    result = result.filter((r) => {
      const fd = r.fieldData as Record<string, unknown>;
      const id = String(fd.Vendor_ID ?? fd["Vendor ID"] ?? "").toLowerCase();
      const name = String(
        fd.Vendor_Name ?? fd["Vendor Name"] ?? "",
      ).toLowerCase();
      const loc = String(
        fd.Vendor_Location ?? fd["Vendor Location"] ?? "",
      ).toLowerCase();
      const email = String(
        fd.Vendor_Email ?? fd["Vendor Email"] ?? "",
      ).toLowerCase();
      const tin = String(fd.Tin_Number ?? fd["Tin Number"] ?? "").toLowerCase();
      return (
        id.includes(q) ||
        name.includes(q) ||
        loc.includes(q) ||
        email.includes(q) ||
        tin.includes(q)
      );
    });
  }
  const gra = graExpiryFilter.value;
  const wht = whtExpiryFilter.value;
  if (gra || wht) {
    result = result.filter((r) => {
      const fd = r.fieldData as Record<string, unknown>;
      const graCheck = String(
        fd.Expiry_Check ?? fd["Expiry Check"] ?? "",
      ).trim();
      const whtCheck = String(
        fd.WHT_Expiry_Check ?? fd["WHT Expiry Check"] ?? "",
      ).trim();
      return (
        matchesExpiryFilter(graCheck, gra) &&
        matchesExpiryFilter(whtCheck, wht)
      );
    });
  }
  return result;
});

/** In peek mode (sidebar), show only vendors with active (valid) GRA and WHT. */
const displayVendorList = computed(() => {
  const list = filteredVendorList.value;
  if (!props.peekMode) return list;
  return list.filter((r) => {
    const fd = r.fieldData as Record<string, unknown>;
    const graCheck = String(
      fd.Expiry_Check ?? fd["Expiry Check"] ?? "",
    ).trim();
    const whtCheck = String(
      fd.WHT_Expiry_Check ?? fd["WHT Expiry Check"] ?? "",
    ).trim();
    return (
      matchesExpiryFilter(graCheck, "valid") &&
      matchesExpiryFilter(whtCheck, "valid")
    );
  });
});

function clearFilters() {
  searchQuery.value = "";
  graExpiryFilter.value = "";
  whtExpiryFilter.value = "";
}

function formatDate(value: string | undefined): string {
  if (!value?.trim()) return "—";
  return value.trim();
}

function escapeCsvCell(value: unknown): string {
  if (value == null || value === "") return "";
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function getExportRows(): string[][] {
  const headers = [
    "Vendor ID",
    "Vendor Name",
    "Location",
    "Email",
    "Tin Number",
    "GRA Expiry",
    "Expiry Check",
    "WHT Expiry",
    "WHT Expiry Check",
  ];
  const rows = filteredVendorList.value.map((r) => [
    getField(r, "Vendor_ID"),
    getField(r, "Vendor_Name"),
    getField(r, "Vendor_Location"),
    getField(r, "Vendor_Email"),
    getField(r, "Tin_Number"),
    formatDate(getField(r, "GRA_Expiry_Date")),
    getField(r, "Expiry_Check"),
    formatDate(getField(r, "WHT_Expiry_Date")),
    getField(r, "WHT_Expiry_Check"),
  ]);
  return [headers, ...rows];
}

function onExport() {
  if (filteredVendorList.value.length === 0) return;
  exporting.value = true;
  try {
    const rows = getExportRows();
    const content = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\r\n");
    const filename = `vendors-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(filename, content);
    toast.success("CSV downloaded.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Export failed.";
    toast.error(msg);
  } finally {
    exporting.value = false;
  }
}

async function onExportPdf() {
  if (filteredVendorList.value.length === 0) return;
  exporting.value = true;
  try {
    const [pdfMakeModule, vfsModule] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);
    const pdfMake = (pdfMakeModule as { default: unknown }).default as {
      createPdf: (def: unknown) => { download: (name: string) => void };
      addVirtualFileSystem?: (vfs: Record<string, string>) => void;
    };
    const vfs = (vfsModule as { default: Record<string, string> }).default;
    if (pdfMake.addVirtualFileSystem && vfs) {
      pdfMake.addVirtualFileSystem(vfs);
    }
    const rows = getExportRows();
    const [headerRow, ...dataRows] = rows;
    const body = [
      headerRow.map((cell, i) => ({
        text: cell,
        style: "tableHeader",
        fillColor: "#1e293b",
        ...(i === 0 ? { noWrap: true } : {}),
      })),
      ...dataRows.map((row) =>
        row.map((cell) => ({ text: cell ?? "—", style: "tableCell" })),
      ),
    ];
    const docDefinition = {
      pageSize: "A4" as const,
      pageOrientation: "landscape" as const,
      pageMargins: [40, 40, 40, 60],
      defaultStyle: { fontSize: 8 },
      styles: {
        tableHeader: { bold: true, color: "#f1f5f9", fontSize: 7 },
        tableCell: { fontSize: 8 },
      },
      content: [
        {
          text: "Vendors",
          fontSize: 16,
          bold: true,
          margin: [0, 0, 0, 12],
        },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "*", "auto", "auto", "auto", "auto", "auto"],
            body,
          },
          layout: "lightHorizontalLines",
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        margin: [40, 8, 40, 0],
        text: `Page ${currentPage} of ${pageCount}`,
        fontSize: 8,
        alignment: "center" as const,
      }),
    };
    const filename = `vendors-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdfMake.createPdf(docDefinition).download(filename);
    toast.success("PDF downloaded.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF export failed.";
    toast.error(msg);
  } finally {
    exporting.value = false;
  }
}

function fileMakerDateToInput(value: string | undefined): string {
  if (!value?.trim()) return "";
  const raw = value.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (us) {
    const m = us[1].padStart(2, "0");
    const d = us[2].padStart(2, "0");
    return `${us[3]}-${m}-${d}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return "";
}

function toFileMakerDate(isoDate: string | undefined): string | undefined {
  return formatDateForFileMaker(isoDate);
}

function closeModal() {
  showAddModal.value = false;
  editingRecordId.value = null;
}

function looksLikeEmail(s: string): boolean {
  return /^[^@]+@[^@]+\.[^@]+$/.test(String(s || "").trim());
}

function getFullNameFromUserRecord(fd: Record<string, unknown> | undefined): string {
  if (!fd) return "";
  const v = fd.FullName ?? fd["Full Name"] ?? fd.fullName ?? fd.fullname;
  return v != null && String(v).trim() ? String(v).trim() : "";
}

function displayName(by: string): string {
  if (!by?.trim()) return "—";
  const key = by.trim().toLowerCase();
  return emailToNameMap.value.get(key) ?? by;
}

function getVendorId(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
): string {
  const fd = row.fieldData as Record<string, unknown>;
  return String(fd?.Vendor_ID ?? fd?.["Vendor ID"] ?? "").trim();
}

function hasHistoryForRow(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
): boolean {
  const vid = getVendorId(row);
  return vid ? vendorIdsWithHistory.value.has(vid) : false;
}

async function loadVendorIdsWithHistory(): Promise<void> {
  if (!isConnected.value) return;
  try {
    const { data } = await findRecordsWithIds<Record<string, unknown>>(
      LAYOUTS.VENDOR_FIELD_HISTORY,
      { limit: 5000 },
    );
    const ids = new Set<string>();
    for (const r of data ?? []) {
      const fd = r.fieldData as Record<string, unknown>;
      const vid = String(fd?.Vendor_ID ?? fd?.["Vendor ID"] ?? "").trim();
      if (vid) ids.add(vid);
    }
    vendorIdsWithHistory.value = ids;
  } catch {
    vendorIdsWithHistory.value = new Set();
  }
}

function getHistoryField(
  fd: Record<string, unknown>,
  key: string,
): string {
  const alt = key.replace(/_/g, " ");
  const v = fd[key] ?? fd[alt] ?? fd[key.replace(/([A-Z])/g, " $1").trim()];
  return v != null ? String(v).trim() : "";
}

function openHistory(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
) {
  const fd = row.fieldData as Record<string, unknown>;
  const vid = String(fd.Vendor_ID ?? fd["Vendor ID"] ?? "").trim();
historyVendorName.value = String(
      (fd.Vendor_Name ?? fd["Vendor Name"] ?? vid) || "Unknown",
    );
  showHistoryModal.value = true;
  loadVendorHistory(vid);
}

function closeHistoryModal() {
  showHistoryModal.value = false;
  historyVendorName.value = "";
  historyList.value = [];
  emailToNameMap.value = new Map();
  historyError.value = null;
}

async function loadVendorHistory(vendorId: string) {
  if (!vendorId || !isConnected.value) {
    historyList.value = [];
    return;
  }
  historyLoading.value = true;
  historyError.value = null;
  try {
    const { data, error } = await findRecordsByQueryWithIds<
      Record<string, unknown>
    >(LAYOUTS.VENDOR_FIELD_HISTORY, { Vendor_ID: vendorId }, 200);
    if (error) {
      historyError.value = error;
      historyList.value = [];
      return;
    }
    const list = data
      .map((r) => {
        const fd = r.fieldData as Record<string, unknown>;
        return {
          FieldName: getHistoryField(fd, "FieldName"),
          OldValue: getHistoryField(fd, "OldValue"),
          NewValue: getHistoryField(fd, "NewValue"),
          ChangedBy: getHistoryField(fd, "ChangedBy"),
          Timestamp: getHistoryField(fd, "Timestamp"),
        };
      })
      .filter((h) => h.FieldName || h.OldValue || h.NewValue)
      .reverse();
    historyList.value = list;
    const emails = [...new Set(list.map((h) => h.ChangedBy).filter(looksLikeEmail))];
    const map = new Map<string, string>();
    if (emails.length > 0) {
      const { data: users } = await findRecordsWithIds<Record<string, unknown>>(
        LAYOUTS.PAYABLES_USERS,
        { limit: 500 },
      );
      for (const r of users ?? []) {
        const fd = r.fieldData as Record<string, unknown>;
        const email = String(fd?.Email ?? fd?.email ?? "").trim().toLowerCase();
        const name = getFullNameFromUserRecord(fd);
        if (email && name && !looksLikeEmail(name)) map.set(email, name);
      }
    }
    emailToNameMap.value = map;
  } finally {
    historyLoading.value = false;
  }
}

function resetForm() {
  editingRecordId.value = null;
  originalFieldData.value = null;
  form.value = {
    Vendor_ID: "",
    Vendor_Name: "",
    Vendor_Location: "",
    Vendor_Email: "",
    GRA_Expiry_Date: "",
    Received_Date: "",
    Tin_Number: "",
    WHT_Expiry_Date: "",
    Received_WHT_Date: "",
  };
  formError.value = null;
}

function openEdit(
  row: FindRecordWithId<VendorTblFieldData | Record<string, unknown>>,
) {
  const fd = row.fieldData as Record<string, unknown>;
  const gra = fileMakerDateToInput(
    String(fd.GRA_Expiry_Date ?? fd["GRA Expiry Date"] ?? "").trim() || undefined,
  );
  const recv = fileMakerDateToInput(
    String(fd.Received_Date ?? fd["Received Date"] ?? "").trim() || undefined,
  );
  const wht = fileMakerDateToInput(
    String(fd.WHT_Expiry_Date ?? fd["WHT Expiry Date"] ?? "").trim() || undefined,
  );
  const recvWht = fileMakerDateToInput(
    String(fd.Received_WHT_Date ?? fd["Received WHT Date"] ?? "").trim() || undefined,
  );
  form.value = {
    Vendor_ID: String(fd.Vendor_ID ?? fd["Vendor ID"] ?? ""),
    Vendor_Name: String(fd.Vendor_Name ?? fd["Vendor Name"] ?? ""),
    Vendor_Location: String(fd.Vendor_Location ?? fd["Vendor Location"] ?? ""),
    Vendor_Email: String(fd.Vendor_Email ?? fd["Vendor Email"] ?? ""),
    GRA_Expiry_Date: gra,
    Received_Date: recv,
    Tin_Number: String(fd.Tin_Number ?? fd["Tin Number"] ?? ""),
    WHT_Expiry_Date: wht,
    Received_WHT_Date: recvWht,
  };
  originalFieldData.value = {
    Tin_Number: String(fd.Tin_Number ?? fd["Tin Number"] ?? ""),
    GRA_Expiry_Date: gra,
    Received_Date: recv,
    WHT_Expiry_Date: wht,
    Received_WHT_Date: recvWht,
  };
  editingRecordId.value = row.recordId;
  formError.value = null;
  showAddModal.value = true;
}

watch(showAddModal, (open) => {
  if (!open) editingRecordId.value = null;
});

const VENDOR_HISTORY_FIELDS = [
  "Tin_Number",
  "GRA_Expiry_Date",
  "Received_Date",
  "WHT_Expiry_Date",
  "Received_WHT_Date",
] as const;

const VENDOR_FIELD_DISPLAY_NAMES: Record<string, string> = {
  Tin_Number: "Tin Number",
  GRA_Expiry_Date: "GRA Expiry Date",
  Received_Date: "Received Date",
  WHT_Expiry_Date: "WHT Expiry Date",
  Received_WHT_Date: "Received WHT Date",
};

function validateForm(): string | null {
  if (!form.value.Vendor_Name?.trim()) return "Vendor Name is required.";
  return null;
}

function formatDateForDisplay(isoOrFm: string): string {
  const s = isoOrFm.trim();
  if (!s) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (m) return `${m[2]}/${m[3]}/${m[1]}`;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) return s;
  return s;
}

async function writeVendorFieldHistory(
  vendorId: string,
  changes: { field: string; oldVal: string; newVal: string }[],
): Promise<void> {
  if (changes.length === 0) return;
  const actor = (userFullName.value || loggedInEmail.value)?.trim() || "—";
  const timestamp = formatTimestampForFileMaker();
  for (const { field, oldVal, newVal } of changes) {
    const fieldName = VENDOR_FIELD_DISPLAY_NAMES[field] ?? field;
    await createRecord(LAYOUTS.VENDOR_FIELD_HISTORY, {
      Vendor_ID: vendorId,
      FieldName: fieldName,
      OldValue: oldVal || "—",
      NewValue: newVal || "—",
      ChangedBy: actor,
      Timestamp: timestamp,
    });
  }
}

async function submit() {
  if (saving.value) return;
  if (!isConnected.value) {
    toast.error("Not connected to FileMaker.");
    formError.value = null;
    return;
  }
  const err = validateForm();
  if (err) {
    toast.error(err);
    formError.value = null;
    return;
  }
  saving.value = true;
  formError.value = null;
  const idToUpdate = editingRecordId.value
    ? String(editingRecordId.value).trim()
    : null;
  try {
    const fieldData: VendorTblFieldData = {
      Vendor_ID: form.value.Vendor_ID?.trim() || undefined,
      Vendor_Name: form.value.Vendor_Name?.trim(),
      Vendor_Location: form.value.Vendor_Location?.trim() || undefined,
      Vendor_Email: form.value.Vendor_Email?.trim() || undefined,
      GRA_Expiry_Date: toFileMakerDate(form.value.GRA_Expiry_Date),
      Received_Date: toFileMakerDate(form.value.Received_Date),
      Tin_Number: form.value.Tin_Number?.trim() || undefined,
      WHT_Expiry_Date: toFileMakerDate(form.value.WHT_Expiry_Date),
      Received_WHT_Date: toFileMakerDate(form.value.Received_WHT_Date),
    };
    if (!idToUpdate) return;
    const orig = originalFieldData.value;
    const vendorId = form.value.Vendor_ID?.trim() || "";
    if (orig && vendorId) {
      const changes: { field: string; oldVal: string; newVal: string }[] = [];
      for (const key of VENDOR_HISTORY_FIELDS) {
        const oldV = String(orig[key as keyof typeof orig] ?? "").trim();
        const newV = String(
          (form.value as Record<string, unknown>)[key] ?? "",
        ).trim();
        if (oldV !== newV) {
          const displayOld =
            key.endsWith("_Date") && oldV
              ? formatDateForDisplay(oldV)
              : oldV || "—";
          const displayNew =
            key.endsWith("_Date") && newV
              ? formatDateForDisplay(newV)
              : newV || "—";
          changes.push({
            field: key,
            oldVal: displayOld,
            newVal: displayNew,
          });
        }
      }
      await writeVendorFieldHistory(vendorId, changes);
    }
    const { error } = await updateRecord(
      LAYOUTS.VENDOR_TBL,
      idToUpdate,
      fieldData,
    );
    if (error) {
      toast.error(error);
      formError.value = null;
      return;
    }
    toast.success("Vendor updated successfully.");
    closeModal();
    resetForm();
    await loadVendors();
  } finally {
    saving.value = false;
  }
}

async function loadVendors(opts?: { silent?: boolean }) {
  if (!isConnected.value) {
    vendorList.value = [];
    loading.value = false;
    return;
  }
  if (!opts?.silent) loading.value = true;
  loadError.value = null;
  const BATCH = 1000;
  let offset = 0;
  const all: typeof vendorList.value = [];
  try {
    while (true) {
      const options: { limit: number; offset?: number } = { limit: BATCH };
      if (offset > 0) options.offset = offset;
      const { data, error } = await findRecordsWithIds<
        VendorTblFieldData | Record<string, unknown>
      >(LAYOUTS.VENDOR_TBL, options);
      if (error) {
        toast.error(error);
        loadError.value = null;
        vendorList.value = [];
        vendorOverview.setVendorCount(0);
        return;
      }
      all.push(...data);
      if (data.length < BATCH) break;
      offset += data.length;
    }
    vendorList.value = all;
    vendorOverview.setVendorCount(all.length);
    await loadVendorIdsWithHistory();
  } finally {
    if (!opts?.silent) loading.value = false;
  }
}

async function onRefreshFromBCPS() {
  if (refreshing.value || !isConnected.value) return;
  refreshing.value = true;
  showAddModal.value = false;
  const loadingOverlay = useLoadingOverlayStore();
  loadingOverlay.show("Refreshing…", "Please don't navigate away");
  try {
    const { error, scriptError } = await runScript(
      LAYOUTS.VENDOR_TBL,
      "GetVendorsFromBCPSOS" // PSOS – script error 3 can be returned even on success
    );
    if (error && scriptError !== "3") {
      toast.error("Refresh failed: " + error);
      return;
    }
    toast.success("Refresh completed. Reloading vendors…");
    await loadVendors({ silent: true });
  } finally {
    refreshing.value = false;
    loadingOverlay.hide();
  }
}

onMounted(loadVendors);
watch(isConnected, (connected) => {
  if (connected) loadVendors();
});
</script>

<style scoped>
.vendor-modal {
  max-width: 720px;
}
</style>
