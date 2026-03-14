<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="flex flex-wrap items-center justify-between gap-4 mb-6">
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
          Tax
        </h1>
      </div>
      <button
        type="button"
        class="pill-btn add-tax-btn inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
        @click="showAddModal = true"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Tax
      </button>
    </header>

    <p class="text-[var(--label-size)] text-[var(--color-text-muted)] mb-4">
      Manage tax codes here. Add new rates and view existing ones.
    </p>

    <!-- Search and filter -->
    <div
      v-if="!loading && !loadError && taxList.length > 0"
      class="tax-search-bar"
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
            placeholder="Search tax type, name, status…"
            autocomplete="off"
            aria-label="Search tax table"
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
        <div class="tax-search-bar__filter-wrap">
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
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
          </span>
          <select
            v-model="statusFilter"
            class="tax-search-bar__filter"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option v-for="s in uniqueStatuses" :key="s" :value="s">
              {{ s }}
            </option>
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
                d="M6 9l6 6 6-6"
              />
            </svg>
          </span>
        </div>
      </div>
      <p v-if="searchQuery || statusFilter" class="tax-search-bar__hint">
        {{ filteredTaxList.length }} result{{
          filteredTaxList.length === 1 ? "" : "s"
        }}
      </p>
    </div>

    <!-- Table -->
    <div class="logs-table-wrap">
      <template v-if="loading">
        <div class="tax-table-skeleton">
          <div class="tax-table-skeleton__search">
            <Skeleton width="100%" height="2.75rem" class="rounded-xl" />
            <Skeleton width="8rem" height="2.5rem" class="rounded-lg" />
          </div>
          <table class="tax-table">
            <thead>
              <tr>
                <th>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="3rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4.5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="4.5rem" height="0.875rem" class="rounded" />
                </th>
                <th>
                  <Skeleton width="3.5rem" height="0.875rem" class="rounded" />
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
                  <Skeleton width="2.5rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton width="5rem" height="0.875rem" class="rounded" />
                </td>
                <td>
                  <Skeleton
                    width="3.5rem"
                    height="1.25rem"
                    class="rounded-md"
                  />
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
      <div v-else-if="taxList.length === 0" class="tax-table-empty">
        <p>No tax codes yet.</p>
        <button
          type="button"
          class="pill-btn mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
          @click="showAddModal = true"
        >
          Add your first tax
        </button>
      </div>
      <div v-else-if="filteredTaxList.length === 0" class="tax-table-empty">
        <p>
          {{
            searchQuery || statusFilter
              ? "No matching tax codes."
              : "No tax codes yet."
          }}
        </p>
        <button
          v-if="searchQuery || statusFilter"
          type="button"
          class="pill-btn mt-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          @click="
            searchQuery = '';
            statusFilter = '';
          "
        >
          Clear filters
        </button>
      </div>
      <div v-else class="logs-table-body">
        <div class="tax-table-scroll logs-table-scroll">
          <table class="tax-table logs-table tax-table--sortable">
            <colgroup>
              <col class="tax-table__col-type" />
              <col class="tax-table__col-name" />
              <col class="tax-table__col-rate" />
              <col class="tax-table__col-action" />
              <col class="tax-table__col-start" />
              <col class="tax-table__col-end" />
              <col class="tax-table__col-status" />
              <col class="tax-table__col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th class="tax-table__sortable-th">
                  <button
                    type="button"
                    class="tax-table__sort-btn"
                    :class="{ 'tax-table__sort-btn--active': sortField === 'Tax_Type' }"
                    :aria-label="sortField === 'Tax_Type' ? `Sort Tax Type ${sortDir === 'asc' ? 'descending' : 'ascending'}` : 'Sort by Tax Type'"
                    @click="setSort('Tax_Type')"
                  >
                    Tax Type
                    <span class="tax-table__sort-icon" :class="{ 'tax-table__sort-icon--active': sortField === 'Tax_Type' }" aria-hidden="true">
                      <svg v-if="sortField !== 'Tax_Type'" class="tax-table__sort-unsorted" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 8l4-4 4 4h-3v4h-2V8H8zm8 8l-4 4-4-4h3v-4h2v4h3z"/>
                      </svg>
                      <svg v-else-if="sortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-5 6h3v6h4v-6h3L12 4z"/>
                      </svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 20l5-6h-3V8h-4v6H7l5 6z"/>
                      </svg>
                    </span>
                  </button>
                </th>
                <th class="tax-table__sortable-th">
                  <button
                    type="button"
                    class="tax-table__sort-btn"
                    :class="{ 'tax-table__sort-btn--active': sortField === 'Tax_Name' }"
                    :aria-label="sortField === 'Tax_Name' ? `Sort Tax Name ${sortDir === 'asc' ? 'descending' : 'ascending'}` : 'Sort by Tax Name'"
                    @click="setSort('Tax_Name')"
                  >
                    Tax Name
                    <span class="tax-table__sort-icon" :class="{ 'tax-table__sort-icon--active': sortField === 'Tax_Name' }" aria-hidden="true">
                      <svg v-if="sortField !== 'Tax_Name'" class="tax-table__sort-unsorted" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 8l4-4 4 4h-3v4h-2V8H8zm8 8l-4 4-4-4h3v-4h2v4h3z"/></svg>
                      <svg v-else-if="sortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-5 6h3v6h4v-6h3L12 4z"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l5-6h-3V8h-4v6H7l5 6z"/></svg>
                    </span>
                  </button>
                </th>
                <th class="tax-table__sortable-th tax-table__th-rate">
                  <button
                    type="button"
                    class="tax-table__sort-btn"
                    :class="{ 'tax-table__sort-btn--active': sortField === 'Tax_Rate' }"
                    :aria-label="sortField === 'Tax_Rate' ? `Sort Rate ${sortDir === 'asc' ? 'descending' : 'ascending'}` : 'Sort by Rate'"
                    @click="setSort('Tax_Rate')"
                  >
                    Rate
                    <span class="tax-table__sort-icon" :class="{ 'tax-table__sort-icon--active': sortField === 'Tax_Rate' }" aria-hidden="true">
                      <svg v-if="sortField !== 'Tax_Rate'" class="tax-table__sort-unsorted" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 8l4-4 4 4h-3v4h-2V8H8zm8 8l-4 4-4-4h3v-4h2v4h3z"/></svg>
                      <svg v-else-if="sortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-5 6h3v6h4v-6h3L12 4z"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l5-6h-3V8h-4v6H7l5 6z"/></svg>
                    </span>
                  </button>
                </th>
                <th class="tax-table__th-action">Action</th>
                <th class="tax-table__sortable-th tax-table__th-start">
                  <button
                    type="button"
                    class="tax-table__sort-btn"
                    :class="{ 'tax-table__sort-btn--active': sortField === 'Start_Date' }"
                    :aria-label="sortField === 'Start_Date' ? `Sort Start Date ${sortDir === 'asc' ? 'descending' : 'ascending'}` : 'Sort by Start Date'"
                    @click="setSort('Start_Date')"
                  >
                    Start Date
                    <span class="tax-table__sort-icon" :class="{ 'tax-table__sort-icon--active': sortField === 'Start_Date' }" aria-hidden="true">
                      <svg v-if="sortField !== 'Start_Date'" class="tax-table__sort-unsorted" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 8l4-4 4 4h-3v4h-2V8H8zm8 8l-4 4-4-4h3v-4h2v4h3z"/></svg>
                      <svg v-else-if="sortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-5 6h3v6h4v-6h3L12 4z"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l5-6h-3V8h-4v6H7l5 6z"/></svg>
                    </span>
                  </button>
                </th>
                <th class="tax-table__sortable-th tax-table__th-end">
                  <button
                    type="button"
                    class="tax-table__sort-btn"
                    :class="{ 'tax-table__sort-btn--active': sortField === 'End_Date' }"
                    :aria-label="sortField === 'End_Date' ? `Sort End Date ${sortDir === 'asc' ? 'descending' : 'ascending'}` : 'Sort by End Date'"
                    @click="setSort('End_Date')"
                  >
                    End Date
                    <span class="tax-table__sort-icon" :class="{ 'tax-table__sort-icon--active': sortField === 'End_Date' }" aria-hidden="true">
                      <svg v-if="sortField !== 'End_Date'" class="tax-table__sort-unsorted" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 8l4-4 4 4h-3v4h-2V8H8zm8 8l-4 4-4-4h3v-4h2v4h3z"/></svg>
                      <svg v-else-if="sortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-5 6h3v6h4v-6h3L12 4z"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l5-6h-3V8h-4v6H7l5 6z"/></svg>
                    </span>
                  </button>
                </th>
                <th class="tax-table__sortable-th">
                  <button
                    type="button"
                    class="tax-table__sort-btn"
                    :class="{ 'tax-table__sort-btn--active': sortField === 'Status' }"
                    :aria-label="sortField === 'Status' ? `Sort Status ${sortDir === 'asc' ? 'descending' : 'ascending'}` : 'Sort by Status'"
                    @click="setSort('Status')"
                  >
                    Status
                    <span class="tax-table__sort-icon" :class="{ 'tax-table__sort-icon--active': sortField === 'Status' }" aria-hidden="true">
                      <svg v-if="sortField !== 'Status'" class="tax-table__sort-unsorted" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 8l4-4 4 4h-3v4h-2V8H8zm8 8l-4 4-4-4h3v-4h2v4h3z"/></svg>
                      <svg v-else-if="sortDir === 'asc'" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-5 6h3v6h4v-6h3L12 4z"/></svg>
                      <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l5-6h-3V8h-4v6H7l5 6z"/></svg>
                    </span>
                  </button>
                </th>
                <th class="tax-table__actions-th"></th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in sortedTaxList"
                :key="row.recordId || index"
              >
              <td class="tax-table__cell-type">{{ row.fieldData.Tax_Type ?? "—" }}</td>
              <td class="tax-table__cell-name">{{ row.fieldData.Tax_Name ?? "—" }}</td>
              <td class="tax-table__cell-rate tabular-nums">{{ formatRate(row.fieldData.Tax_Rate) }}</td>
              <td class="tax-table__cell-action">{{ row.fieldData.Action?.trim() === "Sub" ? "Sub" : row.fieldData.Action?.trim() === "Add" ? "Add" : "—" }}</td>
              <td class="tax-table__cell-date">{{ formatDate(row.fieldData.Start_Date) }}</td>
              <td class="tax-table__cell-date">{{ formatDate(row.fieldData.End_Date) }}</td>
              <td class="tax-table__cell-status" :class="statusCellClass(row.fieldData.Status)">
                <span
                  v-if="row.fieldData.Status?.trim()"
                  class="tax-table__status-badge"
                  >{{ row.fieldData.Status }}</span
                >
                <span v-else>—</span>
              </td>
              <td class="tax-table__actions-td">
                <button
                  type="button"
                  class="tax-table__edit-btn"
                  aria-label="Edit"
                  @click="openEdit(row)"
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
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>

    <!-- Add / Edit Tax modal: click-outside does not close -->
    <Teleport to="body">
      <div v-if="showAddModal" class="tax-modal-backdrop">
        <div
          class="tax-modal"
          role="dialog"
          :aria-labelledby="
            editingRecordId ? 'edit-tax-title' : 'add-tax-title'
          "
          aria-modal="true"
        >
          <header class="tax-modal__header">
            <h2
              :id="editingRecordId ? 'edit-tax-title' : 'add-tax-title'"
              class="tax-modal__title"
            >
              {{ editingRecordId ? "Edit Tax" : "Add Tax" }}
            </h2>
            <button
              type="button"
              class="tax-modal__close"
              aria-label="Close"
              @click="
                showAddModal = false;
                editingRecordId = null;
              "
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
              <h3 class="tax-modal__section-title">Details</h3>
              <label class="tax-modal__label">
                <span>Tax Type</span>
                <div
                  ref="taxTypeDropdownRef"
                  class="tax-modal__search-dropdown"
                >
                  <div class="tax-modal__search-dropdown-input-wrap">
                    <input
                      v-model="taxTypeSearch"
                      type="text"
                      class="tax-modal__search-dropdown-input"
                      placeholder="Search or select type…"
                      autocomplete="off"
                      maxlength="32"
                      @focus="taxTypeDropdownOpen = true"
                      @blur="onTaxTypeBlur"
                      @keydown.down.prevent="moveTaxTypeHighlight(1)"
                      @keydown.up.prevent="moveTaxTypeHighlight(-1)"
                      @keydown.enter.prevent="applyTaxTypeHighlighted"
                      @keydown.escape="taxTypeDropdownOpen = false"
                    />
                    <span
                      class="tax-modal__search-dropdown-chevron"
                      :class="{
                        'tax-modal__search-dropdown-chevron--open':
                          taxTypeDropdownOpen,
                      }"
                      aria-hidden="true"
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                  </div>
                  <Transition name="search-dropdown">
                    <div
                      v-if="taxTypeDropdownOpen"
                      class="tax-modal__search-dropdown-list"
                      role="listbox"
                    >
                      <button
                        v-for="(t, i) in filteredTaxTypes"
                        :key="t"
                        type="button"
                        class="tax-modal__search-dropdown-item"
                        :class="{
                          'tax-modal__search-dropdown-item--highlight':
                            taxTypeHighlightIndex === i,
                        }"
                        role="option"
                        :aria-selected="taxTypeHighlightIndex === i"
                        @mousedown.prevent="selectTaxType(t)"
                      >
                        {{ t }}
                      </button>
                      <button
                        type="button"
                        class="tax-modal__search-dropdown-item tax-modal__search-dropdown-item--add"
                        :class="{
                          'tax-modal__search-dropdown-item--highlight':
                            taxTypeHighlightIndex === filteredTaxTypes.length,
                        }"
                        role="option"
                        :aria-selected="
                          taxTypeHighlightIndex === filteredTaxTypes.length
                        "
                        @mousedown.prevent="selectNewTaxType"
                      >
                        — Add new type —
                      </button>
                    </div>
                  </Transition>
                </div>
              </label>
              <label class="tax-modal__label">
                <span>Tax Name</span>
                <input
                  v-model="form.Tax_Name"
                  type="text"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Display name"
                  required
                />
              </label>
              <label class="tax-modal__label">
                <span>Tax Rate (%)</span>
                <input
                  v-model.number="form.Tax_Rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="e.g. 10"
                  required
                />
              </label>
              <label class="tax-modal__label">
                <span>Action</span>
                <select
                  v-model="form.Action"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  required
                >
                  <option value="Add">Add</option>
                  <option value="Sub">Sub</option>
                </select>
              </label>
            </section>
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">Date range</h3>
              <div class="tax-modal__row">
                <label class="tax-modal__label">
                  <span>Start Date</span>
                  <input
                    v-model="form.Start_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    required
                  />
                </label>
                <label class="tax-modal__label">
                  <span>End Date</span>
                  <input
                    v-model="form.End_Date"
                    type="date"
                    class="glass-input w-full px-3 py-2.5 rounded-lg"
                    required
                  />
                </label>
              </div>
            </section>
            <div class="tax-modal__actions">
              <button
                type="button"
                class="tax-modal__btn-cancel"
                @click="
                  showAddModal = false;
                  editingRecordId = null;
                "
              >
                Cancel
              </button>
              <button
                type="submit"
                class="tax-modal__btn-submit"
                :disabled="saving"
              >
                {{ saving ? "Saving…" : editingRecordId ? "Save" : "Add Tax" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import Skeleton from "../components/Skeleton.vue";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { TaxValueFieldData } from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { useToastStore } from "../stores/toastStore";
import { useTaxOverviewStore } from "../stores/taxOverviewStore";

const { createRecord, updateRecord, findRecordsWithIds, isConnected } =
  useFileMaker();
const toast = useToastStore();
const taxOverview = useTaxOverviewStore();

const taxList = ref<FindRecordWithId<TaxValueFieldData>[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const showAddModal = ref(false);

const searchQuery = ref("");
const statusFilter = ref("");

/** Unique Status values from the table for the filter dropdown. */
const uniqueStatuses = computed(() => {
  const set = new Set<string>();
  for (const { fieldData } of taxList.value) {
    const s = (fieldData.Status ?? "").trim();
    if (s) set.add(s);
  }
  return Array.from(set).sort();
});

/** Table rows filtered by search (Tax_Type, Tax_Name, Status, rate) and status filter. */
const filteredTaxList = computed(() => {
  let list = taxList.value;
  const q = searchQuery.value.toLowerCase();
  const status = statusFilter.value.trim();
  if (status) {
    list = list.filter((r) => (r.fieldData.Status ?? "").trim() === status);
  }
  if (!q) return list;
  return list.filter((r) => {
    const fd = r.fieldData;
    const type = (fd.Tax_Type ?? "").toLowerCase();
    const name = (fd.Tax_Name ?? "").toLowerCase();
    const st = (fd.Status ?? "").toLowerCase();
    const rate = formatRate(fd.Tax_Rate).toLowerCase();
    return (
      type.includes(q) || name.includes(q) || st.includes(q) || rate.includes(q)
    );
  });
});

type SortField = "Tax_Type" | "Tax_Name" | "Tax_Rate" | "Start_Date" | "End_Date" | "Status";
const sortField = ref<SortField>("Tax_Type");
const sortDir = ref<"asc" | "desc">("asc");

function setSort(field: SortField) {
  if (sortField.value === field) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDir.value = "asc";
  }
}

function parseDateForSort(value: string | undefined): number {
  if (!value?.trim()) return 0;
  const s = value.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (us) {
    const d = new Date(parseInt(us[3], 10), parseInt(us[1], 10) - 1, parseInt(us[2], 10));
    return d.getTime();
  }
  const iso = /^\d{4}-\d{2}-\d{2}/.exec(s);
  if (iso) return new Date(s).getTime();
  return 0;
}

const sortedTaxList = computed(() => {
  const list = [...filteredTaxList.value];
  const dir = sortDir.value === "asc" ? 1 : -1;
  const field = sortField.value;

  return list.sort((a, b) => {
    const fdA = a.fieldData;
    const fdB = b.fieldData;

    if (field === "Tax_Rate") {
      const ra = typeof fdA.Tax_Rate === "number" ? fdA.Tax_Rate : parseFloat(String(fdA.Tax_Rate ?? "")) || 0;
      const rb = typeof fdB.Tax_Rate === "number" ? fdB.Tax_Rate : parseFloat(String(fdB.Tax_Rate ?? "")) || 0;
      return (ra - rb) * dir;
    }
    if (field === "Start_Date" || field === "End_Date") {
      const da = parseDateForSort((fdA as Record<string, unknown>)[field] as string);
      const db = parseDateForSort((fdB as Record<string, unknown>)[field] as string);
      return (da - db) * dir;
    }

    const va = String((fdA as Record<string, unknown>)[field] ?? "").trim().toLowerCase();
    const vb = String((fdB as Record<string, unknown>)[field] ?? "").trim().toLowerCase();
    return va.localeCompare(vb, undefined, { sensitivity: "base" }) * dir;
  });
});

const editingRecordId = ref<string | null>(null);

const form = ref<TaxValueFieldData>({
  Tax_Type: "",
  Tax_Name: "",
  Tax_Rate: undefined,
  Action: "Add",
  Start_Date: "",
  End_Date: "",
});
const customTaxType = ref("");
const formError = ref<string | null>(null);
const saving = ref(false);

const taxTypeSearch = ref("");
const taxTypeDropdownOpen = ref(false);
const taxTypeHighlightIndex = ref(0);
const taxTypeDropdownRef = ref<HTMLElement | null>(null);

/** Unique Tax_Type values from the table, uppercase, sorted. */
const uniqueTaxTypes = computed(() => {
  const set = new Set<string>();
  for (const { fieldData } of taxList.value) {
    const t = (fieldData.Tax_Type ?? "").trim();
    if (t) set.add(t.toUpperCase());
  }
  return Array.from(set).sort();
});

/** Filter types by search (case-insensitive). */
const filteredTaxTypes = computed(() => {
  const q = taxTypeSearch.value.trim().toLowerCase();
  if (!q) return uniqueTaxTypes.value;
  return uniqueTaxTypes.value.filter((t) => t.toLowerCase().includes(q));
});

function moveTaxTypeHighlight(delta: number) {
  const n = filteredTaxTypes.value.length + 1;
  taxTypeHighlightIndex.value = (taxTypeHighlightIndex.value + delta + n) % n;
}

function applyTaxTypeHighlighted() {
  const i = taxTypeHighlightIndex.value;
  const list = filteredTaxTypes.value;
  if (i < list.length) selectTaxType(list[i]);
  else selectNewTaxType();
}

function selectTaxType(type: string) {
  form.value.Tax_Type = type;
  taxTypeSearch.value = type;
  customTaxType.value = "";
  taxTypeDropdownOpen.value = false;
  taxTypeHighlightIndex.value = 0;
}

function selectNewTaxType() {
  const raw = taxTypeSearch.value.trim();
  form.value.Tax_Type = "__other__";
  customTaxType.value = raw ? raw.toUpperCase() : "";
  taxTypeSearch.value = customTaxType.value || "— Add new type —";
  taxTypeDropdownOpen.value = false;
  taxTypeHighlightIndex.value = 0;
}

function onTaxTypeBlur() {
  setTimeout(() => {
    if (!taxTypeDropdownOpen.value) return;
    taxTypeDropdownOpen.value = false;
    const raw = taxTypeSearch.value.trim();
    if (raw && !form.value.Tax_Type) {
      form.value.Tax_Type = "__other__";
      customTaxType.value = raw.toUpperCase();
      taxTypeSearch.value = customTaxType.value;
    }
  }, 150);
}

function closeTaxTypeDropdownOnClickOutside(e: MouseEvent) {
  if (taxTypeDropdownRef.value?.contains(e.target as Node)) return;
  taxTypeDropdownOpen.value = false;
  const raw = taxTypeSearch.value.trim();
  if (raw && !form.value.Tax_Type) {
    form.value.Tax_Type = "__other__";
    customTaxType.value = raw.toUpperCase();
    taxTypeSearch.value = customTaxType.value;
  }
}

async function loadTaxes() {
  if (!isConnected.value) {
    taxList.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  loadError.value = null;
  const { data, error } = await findRecordsWithIds<TaxValueFieldData>(
    LAYOUTS.TAX_VALUE,
    { limit: 500 },
  );
  loading.value = false;
  if (error) {
    toast.error(error);
    loadError.value = null;
    taxList.value = [];
    taxOverview.setTaxCount(0);
  } else {
    taxList.value = data;
    taxOverview.setTaxCount(data.length);
  }
}

function formatRate(value: number | string | undefined): string {
  if (value == null || value === "") return "—";
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return `${n}%`;
}

function formatDate(value: string | undefined): string {
  if (!value?.trim()) return "—";
  return value.trim();
}

/** Convert FileMaker date (MM/dd/yyyy) to HTML date input (yyyy-MM-dd). */
function fileMakerDateToInput(value: string | undefined): string {
  if (!value?.trim()) return "";
  const raw = value.trim();
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(raw);
  if (us) {
    const m = us[1].padStart(2, "0");
    const d = us[2].padStart(2, "0");
    return `${us[3]}-${m}-${d}`;
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (iso) return raw;
  return "";
}

/** CSS class for status cell: valid=green, expired=red, other=yellow. Empty = no class. */
function statusCellClass(status: string | undefined): string {
  const s = (status ?? "").trim().toLowerCase();
  if (!s) return "";
  if (s === "valid") return "tax-table__status--valid";
  if (s === "expired") return "tax-table__status--expired";
  return "tax-table__status--other";
}

function openEdit(row: FindRecordWithId<TaxValueFieldData>) {
  const fd = row.fieldData;
  const actionRaw = (fd.Action ?? "").trim();
  form.value = {
    Tax_Type: fd.Tax_Type ?? "",
    Tax_Name: fd.Tax_Name ?? "",
    Tax_Rate: fd.Tax_Rate,
    Action: actionRaw === "Sub" ? "Sub" : "Add",
    Start_Date: fileMakerDateToInput(fd.Start_Date),
    End_Date: fileMakerDateToInput(fd.End_Date),
  };
  taxTypeSearch.value = (fd.Tax_Type ?? "").trim();
  customTaxType.value = "";
  editingRecordId.value = row.recordId;
  formError.value = null;
  showAddModal.value = true;
}

/** Convert YYYY-MM-DD (HTML date input) to MM/dd/yyyy for FileMaker. */
function toFileMakerDate(isoDate: string | undefined): string | undefined {
  if (!isoDate?.trim()) return undefined;
  const s = isoDate.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!match) return undefined;
  const [, y, m, d] = match;
  return `${m}/${d}/${y}`;
}

function resetForm() {
  editingRecordId.value = null;
  form.value = {
    Tax_Type: "",
    Tax_Name: "",
    Tax_Rate: undefined,
    Action: "Add",
    Start_Date: "",
    End_Date: "",
  };
  customTaxType.value = "";
  taxTypeSearch.value = "";
  taxTypeDropdownOpen.value = false;
  taxTypeHighlightIndex.value = 0;
  formError.value = null;
}

watch(showAddModal, (open) => {
  if (open) {
    if (!editingRecordId.value) resetForm();
  } else {
    taxTypeDropdownOpen.value = false;
  }
});

watch(taxTypeDropdownOpen, (open) => {
  if (open) taxTypeHighlightIndex.value = 0;
});

watch(filteredTaxTypes, () => {
  taxTypeHighlightIndex.value = Math.min(
    taxTypeHighlightIndex.value,
    filteredTaxTypes.value.length,
  );
});

onMounted(() => {
  document.addEventListener("click", closeTaxTypeDropdownOnClickOutside);
});
onUnmounted(() => {
  document.removeEventListener("click", closeTaxTypeDropdownOnClickOutside);
});

function validateForm(): string | null {
  const { Tax_Type, Tax_Name, Tax_Rate, Start_Date, End_Date } = form.value;
  const missing: string[] = [];
  const typeValue = Tax_Type?.trim();
  if (!typeValue) missing.push("Tax Type");
  else if (typeValue === "__other__" && !customTaxType.value.trim())
    missing.push("Tax Type (enter new type)");
  if (!Tax_Name?.trim()) missing.push("Tax Name");
  if (
    Tax_Rate == null ||
    (typeof Tax_Rate === "string" && Tax_Rate === "") ||
    (typeof Tax_Rate === "number" && Number.isNaN(Tax_Rate))
  )
    missing.push("Tax Rate");
  if (!Start_Date?.trim()) missing.push("Start Date");
  if (!End_Date?.trim()) missing.push("End Date");
  if (missing.length === 0) return null;
  if (missing.length === 1) return `${missing[0]} is required.`;
  return `Please fill in: ${missing.join(", ")}.`;
}

async function submit() {
  if (saving.value) return;
  if (!isConnected.value) {
    toast.error("Not connected to FileMaker.");
    formError.value = null;
    return;
  }
  const validationError = validateForm();
  if (validationError) {
    toast.error(validationError);
    formError.value = null;
    return;
  }
  saving.value = true;
  formError.value = null;
  const idToUpdate = editingRecordId.value
    ? String(editingRecordId.value).trim()
    : null;
  try {
    const { Tax_Type, Tax_Name, Tax_Rate, Action, Start_Date, End_Date } =
      form.value;
    const typeRaw =
      Tax_Type?.trim() === "__other__"
        ? customTaxType.value.trim()
        : (Tax_Type ?? "").trim();
    const typeValue = typeRaw ? typeRaw.toUpperCase() : undefined;
    const actionValue =
      (Action ?? "").trim() === "Sub" ? "Sub" : "Add";
    const fieldData: TaxValueFieldData = {
      Tax_Type: typeValue,
      Tax_Name: Tax_Name?.trim() || undefined,
      Tax_Rate:
        Tax_Rate != null && (typeof Tax_Rate !== "string" || Tax_Rate !== "")
          ? Number(Tax_Rate)
          : undefined,
      Action: actionValue,
      Start_Date: toFileMakerDate(Start_Date),
      End_Date: toFileMakerDate(End_Date),
    };
    if (idToUpdate) {
      const { error: err } = await updateRecord(
        LAYOUTS.TAX_VALUE,
        idToUpdate,
        fieldData,
      );
      if (err) {
        toast.error(err);
        formError.value = null;
        return;
      }
      toast.success("Tax updated successfully.");
    } else {
      const { error: err } = await createRecord(LAYOUTS.TAX_VALUE, fieldData);
      if (err) {
        toast.error(err);
        formError.value = null;
        return;
      }
      toast.success("Tax added successfully.");
    }
    showAddModal.value = false;
    editingRecordId.value = null;
    await loadTaxes();
  } finally {
    saving.value = false;
  }
}

onMounted(loadTaxes);
watch(isConnected, (connected) => {
  if (connected) loadTaxes();
});
</script>
