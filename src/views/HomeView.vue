<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6"
  >
    <!-- Hero: Apple-style large title + CTA -->
    <header class="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div>
        <h1
          class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
          style="letter-spacing: -0.025em; line-height: 1.2"
        >
          Finance Payables
        </h1>
        <p class="mt-1 text-[13px] text-[var(--color-text-muted)]">
          Open entries and flip between them like a booklet.
        </p>
      </div>
      <router-link
        to="/entry"
        class="pill-btn inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white no-underline shadow-md hover:bg-orange-600 transition-colors"
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
        New entry
      </router-link>
    </header>

    <!-- Skeleton loader: list placeholder while loading -->
    <div v-if="loading" class="flex flex-col gap-10">
      <section class="flex flex-col gap-3">
        <header class="flex items-center gap-2 px-4">
          <Skeleton width="4rem" height="0.75rem" class="rounded" />
          <Skeleton width="2rem" height="1rem" class="rounded-full" />
        </header>
        <ul class="list-none p-0 m-0 flex flex-col gap-2">
          <li
            v-for="i in 5"
            :key="i"
            class="list-row list-row--draft rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3.5 flex items-center gap-3"
          >
            <Skeleton width="1.5rem" height="1.5rem" circle />
            <Skeleton width="40%" height="0.875rem" class="max-w-[8rem]" />
            <Skeleton width="5rem" height="0.75rem" />
            <Skeleton width="4rem" height="0.75rem" />
            <Skeleton width="5rem" height="0.75rem" />
            <Skeleton width="4rem" height="2rem" class="rounded-full ml-auto" />
          </li>
        </ul>
      </section>
      <section class="flex flex-col gap-3">
        <header class="flex items-center gap-2 px-4">
          <Skeleton width="4rem" height="0.75rem" class="rounded" />
          <Skeleton width="2rem" height="1rem" class="rounded-full" />
        </header>
        <ul class="list-none p-0 m-0 flex flex-col gap-2">
          <li
            v-for="i in 3"
            :key="i"
            class="list-row rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3.5 flex items-center gap-3"
          >
            <Skeleton
              width="1.25rem"
              height="1.25rem"
              circle
              class="shrink-0"
            />
            <Skeleton width="35%" height="0.875rem" class="max-w-[7rem]" />
            <Skeleton width="4.5rem" height="0.75rem" />
            <Skeleton width="3.5rem" height="0.75rem" />
            <Skeleton width="4.5rem" height="0.75rem" />
            <Skeleton
              width="3rem"
              height="1.75rem"
              class="rounded-full ml-auto"
            />
          </li>
        </ul>
      </section>
    </div>
    <div
      v-else-if="error"
      class="rounded-2xl bg-red-500/10 border border-red-500/20 px-5 py-4 text-[var(--label-size)] text-red-300"
    >
      {{ error }}
    </div>
    <template v-else-if="list.length === 0">
      <div class="glass rounded-2xl p-12 text-center">
        <p class="text-[var(--color-text-muted)] mb-3">No payables yet.</p>
        <router-link
          to="/entry"
          class="text-[var(--color-accent)] font-medium hover:underline"
          >Create one</router-link
        >
      </div>
    </template>
    <div v-else class="flex flex-col gap-10">
      <!-- Greeting + Stats dashboard: KPIs + Vendors -->
      <div class="stats-dashboard">
        <p class="stats-dashboard__greeting">{{ greeting }}</p>
        <div class="stats-dashboard__kpis">
          <div class="stat-card stat-card--draft">
            <span class="stat-card__label">Draft</span>
            <span class="stat-card__value">{{ displayedDraft }}</span>
            <span class="stat-card__sublabel">entries</span>
          </div>
          <div class="stat-card stat-card--posted">
            <span class="stat-card__label">Posted</span>
            <span class="stat-card__value">{{ displayedPosted }}</span>
            <span class="stat-card__sublabel">entries</span>
          </div>
          <div
            class="stat-card-wrap stat-card-wrap--rejected"
            :class="{ 'stat-card-wrap--has-rejected': displayedRejected > 0 }"
          >
            <span
              v-if="displayedRejected > 0"
              class="stat-card__arrow"
              aria-hidden="true"
            >
              <svg
                width="28"
                height="28"
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
            <button
              type="button"
              class="stat-card stat-card--rejected stat-card--clickable"
              :class="{ 'stat-card--booklet': displayedRejected > 1 }"
              :disabled="displayedRejected === 0"
              :aria-label="
                displayedRejected > 1
                  ? `Open ${displayedRejected} rejected entries in booklet`
                  : displayedRejected === 1
                    ? 'Open rejected entry'
                    : 'No rejected entries'
              "
              @click="openRejectedCard"
            >
              <span class="stat-card__label">Rejected</span>
              <span class="stat-card__value">{{ displayedRejected }}</span>
              <span class="stat-card__sublabel">entries</span>
              <span
                v-if="displayedRejected > 0"
                class="stat-card__action-icon"
                aria-hidden="true"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          </div>
          <div class="stat-card stat-card--approved">
            <span class="stat-card__label">Approved</span>
            <span class="stat-card__value">{{ displayedApproved }}</span>
            <span class="stat-card__sublabel">entries</span>
          </div>
        </div>
        <div class="stats-dashboard__charts">
          <router-link
            to="/vendors"
            class="stat-card stat-card--vendors stat-card--link stats-dashboard__vendors"
            aria-label="View vendors"
          >
            <span class="stat-card__label">Vendors</span>
            <span class="stat-card__value">{{ displayedVendors }}</span>
            <span class="stat-card__sublabel">vendors</span>
            <span class="stat-card__action-icon stat-card__action-icon--vendors" aria-hidden="true">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </span>
          </router-link>
        </div>
      </div>

      <!-- Calendar + Posted/Approved by vendor chart (select date to update chart) -->
      <section class="daily-chart-section daily-chart-section--with-calendar">
        <div class="chart-calendar">
          <div class="chart-calendar__header">
            <button
              type="button"
              class="chart-calendar__nav"
              aria-label="Previous month"
              @click="calendarPrevMonth"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <span class="chart-calendar__month">{{ calendarMonthLabel }}</span>
            <button
              type="button"
              class="chart-calendar__nav"
              aria-label="Next month"
              @click="calendarNextMonth"
            >
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>
          <div class="chart-calendar__weekdays">
            <span
              v-for="w in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']"
              :key="w"
              class="chart-calendar__weekday"
              >{{ w }}</span
            >
          </div>
          <div class="chart-calendar__grid">
            <template v-for="(week, wi) in calendarGrid" :key="wi">
              <button
                v-for="(cell, ci) in week"
                :key="wi * 7 + ci"
                type="button"
                class="chart-calendar__day"
                :class="{
                  'chart-calendar__day--empty': !cell,
                  'chart-calendar__day--selected': cell?.isSelected,
                  'chart-calendar__day--today':
                    cell?.isToday && !cell?.isSelected,
                }"
                :disabled="!cell"
                @click="cell && selectChartDate(cell.dateKey)"
              >
                {{ cell ? cell.day : "" }}
              </button>
            </template>
          </div>
          <button
            type="button"
            class="chart-calendar__today"
            @click="goToToday"
          >
            Today
          </button>
        </div>
        <div class="chart-calendar__chart">
          <div class="daily-chart-section__toggle">
            <button
              type="button"
              class="daily-chart-metric-btn"
              :class="{
                'daily-chart-metric-btn--active': dailyChartMode === 'posted',
              }"
              @click="dailyChartMode = 'posted'"
            >
              Posted
            </button>
            <button
              type="button"
              class="daily-chart-metric-btn"
              :class="{
                'daily-chart-metric-btn--active': dailyChartMode === 'approved',
              }"
              @click="dailyChartMode = 'approved'"
            >
              Approved
            </button>
          </div>
          <DailyPostedChart
            :data="
              dailyChartMode === 'posted' ? postedByVendor : approvedByVendor
            "
            :currency="
              dailyChartMode === 'posted' ? postedCurrency : approvedCurrency
            "
            :total-label="
              dailyChartMode === 'posted'
                ? postedTodayTotalsLabel
                : approvedTodayTotalsLabel
            "
            :date-label="selectedChartDateLabel"
            :chart-type="dailyChartMode"
            x-axis-mode="vendor"
          />
        </div>
      </section>

      <!-- Search + tab control + list (tight gap between tabs and list) -->
      <div class="home-lists">
        <div class="search-and-tabs">
          <div class="search-bar search-bar--compact">
            <div
              class="search-bar__wrap"
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
                :placeholder="searchPlaceholder"
                autocomplete="off"
                :aria-label="`Search ${activeSegment} entries`"
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
            <p v-if="searchQuery" class="search-bar__hint">
              <template v-if="hasResultsInAnyTab">
                <span v-if="filteredDraftList.length > 0"
                  >{{ filteredDraftList.length }} in Draft</span
                >
                <template
                  v-if="
                    filteredDraftList.length > 0 &&
                    (filteredPostedList.length > 0 ||
                      filteredRejectedList.length > 0 ||
                      filteredApprovedList.length > 0)
                  "
                >
                  ·
                </template>
                <span v-if="filteredPostedList.length > 0"
                  >{{ filteredPostedList.length }} in Posted</span
                >
                <template
                  v-if="
                    filteredPostedList.length > 0 &&
                    (filteredRejectedList.length > 0 ||
                      filteredApprovedList.length > 0)
                  "
                >
                  ·
                </template>
                <span v-if="filteredRejectedList.length > 0"
                  >{{ filteredRejectedList.length }} in Rejected</span
                >
                <template
                  v-if="
                    filteredRejectedList.length > 0 &&
                    filteredApprovedList.length > 0
                  "
                >
                  ·
                </template>
                <span v-if="filteredApprovedList.length > 0"
                  >{{ filteredApprovedList.length }} in Approved</span
                >
                <span
                  v-if="currentTabHasNoResults && hasResultsInAnyTab"
                  class="search-bar__hint-switch"
                >
                  — switch tab to see them
                </span>
              </template>
              <template v-else>No matches in any tab</template>
            </p>
          </div>

          <!-- Segment control: Draft | Posted | Rejected | Approved (by Status) -->
          <div
            class="segment-control"
            role="tablist"
            aria-label="List by status"
          >
            <button
              type="button"
              role="tab"
              aria-selected="activeSegment === 'draft'"
              aria-controls="panel-draft"
              id="tab-draft"
              class="segment-control__segment"
              :class="{
                'segment-control__segment--active': activeSegment === 'draft',
              }"
              @click="activeSegment = 'draft'"
            >
              <span class="segment-control__label">Draft</span>
              <span class="segment-control__badge">{{
                searchQuery
                  ? `${filteredDraftList.length} of ${draftList.length}`
                  : draftList.length
              }}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="activeSegment === 'posted'"
              aria-controls="panel-posted"
              id="tab-posted"
              class="segment-control__segment"
              :class="{
                'segment-control__segment--active': activeSegment === 'posted',
              }"
              @click="activeSegment = 'posted'"
            >
              <span class="segment-control__label">Posted</span>
              <span class="segment-control__badge">{{
                searchQuery
                  ? `${filteredPostedList.length} of ${postedList.length}`
                  : postedList.length
              }}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="activeSegment === 'rejected'"
              aria-controls="panel-rejected"
              id="tab-rejected"
              class="segment-control__segment"
              :class="{
                'segment-control__segment--active':
                  activeSegment === 'rejected',
              }"
              @click="activeSegment = 'rejected'"
            >
              <span class="segment-control__label">Rejected</span>
              <span class="segment-control__badge">{{
                searchQuery
                  ? `${filteredRejectedList.length} of ${rejectedList.length}`
                  : rejectedList.length
              }}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected="activeSegment === 'approved'"
              aria-controls="panel-approved"
              id="tab-approved"
              class="segment-control__segment"
              :class="{
                'segment-control__segment--active':
                  activeSegment === 'approved',
              }"
              @click="activeSegment = 'approved'"
            >
              <span class="segment-control__label">Approved</span>
              <span class="segment-control__badge">{{
                searchQuery
                  ? `${filteredApprovedList.length} of ${approvedList.length}`
                  : approvedList.length
              }}</span>
            </button>
          </div>
        </div>

        <!-- Draft panel -->
        <section
          v-show="activeSegment === 'draft'"
          id="panel-draft"
          role="tabpanel"
          aria-labelledby="tab-draft"
          class="flex flex-col gap-3"
        >
          <!-- Open booklet bar -->
          <div
            v-if="booklet.selectedCount > 0"
            class="flex flex-wrap items-center gap-3 rounded-2xl border border-orange-500/40 bg-orange-500/10 px-4 py-3"
          >
            <button
              type="button"
              class="pill-btn inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
              @click="openBookletWithSelected"
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
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
              Open booklet ({{ booklet.selectedCount }})
            </button>
            <button
              type="button"
              class="text-[var(--label-size)] font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
              @click="booklet.clearSelection()"
            >
              Clear selection
            </button>
          </div>
          <div v-if="filteredDraftList.length > 0" class="list-view--inset">
            <div
              v-for="(item, index) in draftListToShow"
              :key="item.recordId || `d-${index}`"
              class="list-view__row list-row list-row--draft group px-4 py-3.5"
              :class="
                booklet.isSelected(item.fieldData.TransRef ?? '')
                  ? 'bg-orange-500/5 border-l-4 border-l-orange-500'
                  : 'border-l-4 border-l-transparent'
              "
            >
              <button
                type="button"
                class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
                :class="
                  booklet.isSelected(item.fieldData.TransRef ?? '')
                    ? 'border-orange-500 bg-orange-500/20 text-orange-400'
                    : 'border-[var(--color-border)] text-transparent hover:border-[var(--color-text-muted)]'
                "
                :aria-label="
                  booklet.isSelected(item.fieldData.TransRef ?? '')
                    ? 'Remove from booklet'
                    : 'Add to booklet'
                "
                @click.stop="
                  booklet.toggleSelected(item.fieldData.TransRef ?? '')
                "
              >
                <svg
                  v-if="booklet.isSelected(item.fieldData.TransRef ?? '')"
                  class="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </button>
              <span
                class="font-medium text-[var(--color-text)] min-w-0 truncate"
                >{{ item.fieldData.VendorName || "—" }}</span
              >
              <div class="list-row__meta">
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Vendor ID</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.VendorID || ''"
                    >{{ item.fieldData.VendorID || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Ref</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.TransRef || ''"
                    >{{ item.fieldData.TransRef || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col list-row__meta-col--total">
                  <span class="list-row__meta-label">Total</span>
                  <span
                    class="list-row__meta-value list-row__meta-value--total tabular-nums"
                    >{{
                      item.fieldData.Total != null
                        ? `${item.fieldData.Currency ?? ""} ${formatNumberDisplay(item.fieldData.Total)}`.trim()
                        : "—"
                    }}</span
                  >
                </div>
              </div>
              <router-link
                :to="{
                  name: 'entry',
                  query: { transRef: item.fieldData.TransRef ?? '' },
                }"
                class="pill-btn glass-input inline-flex items-center justify-end gap-1.5 px-3.5 py-2 text-[var(--label-size)] font-medium text-[var(--color-accent)] no-underline opacity-90 group-hover:opacity-100 transition-opacity justify-self-end"
                @click="openInBooklet(item.fieldData.TransRef ?? '')"
              >
                Open
                <svg
                  class="h-3.5 w-3.5 shrink-0"
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
              </router-link>
            </div>
          </div>
          <div v-if="totalPagesDraft > 1" class="pagination">
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPageDraft <= 1"
              aria-label="Previous page"
              @click="currentPageDraft = Math.max(1, currentPageDraft - 1)"
            >
              <svg
                class="pagination__icon"
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
            <span class="pagination__label">
              Page {{ currentPageDraft }} of {{ totalPagesDraft }}
            </span>
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPageDraft >= totalPagesDraft"
              aria-label="Next page"
              @click="
                currentPageDraft = Math.min(
                  totalPagesDraft,
                  currentPageDraft + 1,
                )
              "
            >
              <svg
                class="pagination__icon"
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
          <p
            v-if="filteredDraftList.length === 0"
            class="rounded-2xl border border-dashed border-[var(--color-border)] py-8 px-4 text-center text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            {{
              searchQuery ? "No matching draft entries." : "No draft payables."
            }}
          </p>
        </section>

        <!-- Posted panel -->
        <section
          v-show="activeSegment === 'posted'"
          id="panel-posted"
          role="tabpanel"
          aria-labelledby="tab-posted"
          class="flex flex-col gap-3"
        >
          <div v-if="filteredPostedList.length > 0" class="list-view--inset">
            <div
              v-for="(item, index) in postedListToShow"
              :key="item.recordId || `p-${index}`"
              class="list-view__row list-row group px-4 py-3.5"
            >
              <span class="flex min-w-0 items-center gap-2">
                <span
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"
                  title="Posted"
                >
                  <svg
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span class="font-medium text-[var(--color-text)] truncate">{{
                  item.fieldData.VendorName || "—"
                }}</span>
              </span>
              <div class="list-row__meta">
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Vendor ID</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.VendorID || ''"
                    >{{ item.fieldData.VendorID || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Ref</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.TransRef || ''"
                    >{{ item.fieldData.TransRef || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col list-row__meta-col--total">
                  <span class="list-row__meta-label">Total</span>
                  <span
                    class="list-row__meta-value list-row__meta-value--total tabular-nums"
                    >{{
                      item.fieldData.Total != null
                        ? `${item.fieldData.Currency ?? ""} ${formatNumberDisplay(item.fieldData.Total)}`.trim()
                        : "—"
                    }}</span
                  >
                </div>
              </div>
              <router-link
                :to="{
                  name: 'entry',
                  query: { transRef: item.fieldData.TransRef ?? '' },
                }"
                class="pill-btn glass-input inline-flex items-center justify-end gap-1.5 px-3.5 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] no-underline opacity-80 group-hover:opacity-100 group-hover:text-[var(--color-text)] transition-all justify-self-end"
              >
                View
                <svg
                  class="h-3.5 w-3.5 shrink-0"
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
              </router-link>
            </div>
          </div>
          <div v-if="totalPagesPosted > 1" class="pagination">
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPagePosted <= 1"
              aria-label="Previous page"
              @click="currentPagePosted = Math.max(1, currentPagePosted - 1)"
            >
              <svg
                class="pagination__icon"
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
            <span class="pagination__label">
              Page {{ currentPagePosted }} of {{ totalPagesPosted }}
            </span>
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPagePosted >= totalPagesPosted"
              aria-label="Next page"
              @click="
                currentPagePosted = Math.min(
                  totalPagesPosted,
                  currentPagePosted + 1,
                )
              "
            >
              <svg
                class="pagination__icon"
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
          <p
            v-if="filteredPostedList.length === 0"
            class="rounded-2xl border border-dashed border-[var(--color-border)] py-8 px-4 text-center text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            {{
              searchQuery
                ? "No matching posted entries."
                : "No posted payables yet."
            }}
          </p>
        </section>

        <!-- Rejected panel -->
        <section
          v-show="activeSegment === 'rejected'"
          id="panel-rejected"
          role="tabpanel"
          aria-labelledby="tab-rejected"
          class="flex flex-col gap-3"
        >
          <div v-if="filteredRejectedList.length > 0" class="list-view--inset">
            <div
              v-for="(item, index) in rejectedListToShow"
              :key="item.recordId || `r-${index}`"
              class="list-view__row list-row group px-4 py-3.5"
            >
              <span
                class="font-medium text-[var(--color-text)] min-w-0 truncate"
                >{{ item.fieldData.VendorName || "—" }}</span
              >
              <div class="list-row__meta">
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Vendor ID</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.VendorID || ''"
                    >{{ item.fieldData.VendorID || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Ref</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.TransRef || ''"
                    >{{ item.fieldData.TransRef || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col list-row__meta-col--total">
                  <span class="list-row__meta-label">Total</span>
                  <span
                    class="list-row__meta-value list-row__meta-value--total tabular-nums"
                    >{{
                      item.fieldData.Total != null
                        ? `${item.fieldData.Currency ?? ""} ${formatNumberDisplay(item.fieldData.Total)}`.trim()
                        : "—"
                    }}</span
                  >
                </div>
              </div>
              <router-link
                :to="{
                  name: 'entry',
                  query: { transRef: item.fieldData.TransRef ?? '' },
                }"
                class="pill-btn glass-input inline-flex items-center justify-end gap-1.5 px-3.5 py-2 text-[var(--label-size)] font-medium text-[var(--color-accent)] no-underline opacity-90 group-hover:opacity-100 transition-opacity justify-self-end"
              >
                Open
                <svg
                  class="h-3.5 w-3.5 shrink-0"
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
              </router-link>
            </div>
          </div>
          <div v-if="totalPagesRejected > 1" class="pagination">
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPageRejected <= 1"
              aria-label="Previous page"
              @click="
                currentPageRejected = Math.max(1, currentPageRejected - 1)
              "
            >
              <svg
                class="pagination__icon"
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
            <span class="pagination__label"
              >Page {{ currentPageRejected }} of {{ totalPagesRejected }}</span
            >
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPageRejected >= totalPagesRejected"
              aria-label="Next page"
              @click="
                currentPageRejected = Math.min(
                  totalPagesRejected,
                  currentPageRejected + 1,
                )
              "
            >
              <svg
                class="pagination__icon"
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
          <p
            v-if="filteredRejectedList.length === 0"
            class="rounded-2xl border border-dashed border-[var(--color-border)] py-8 px-4 text-center text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            {{
              searchQuery
                ? "No matching rejected entries."
                : "No rejected payables."
            }}
          </p>
        </section>

        <!-- Approved panel -->
        <section
          v-show="activeSegment === 'approved'"
          id="panel-approved"
          role="tabpanel"
          aria-labelledby="tab-approved"
          class="flex flex-col gap-3"
        >
          <div v-if="filteredApprovedList.length > 0" class="list-view--inset">
            <div
              v-for="(item, index) in approvedListToShow"
              :key="item.recordId || `a-${index}`"
              class="list-view__row list-row group px-4 py-3.5"
            >
              <span
                class="font-medium text-[var(--color-text)] min-w-0 truncate"
                >{{ item.fieldData.VendorName || "—" }}</span
              >
              <div class="list-row__meta">
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Vendor ID</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.VendorID || ''"
                    >{{ item.fieldData.VendorID || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Ref</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="item.fieldData.TransRef || ''"
                    >{{ item.fieldData.TransRef || "—" }}</span
                  >
                </div>
                <div class="list-row__meta-col list-row__meta-col--total">
                  <span class="list-row__meta-label">Total</span>
                  <span
                    class="list-row__meta-value list-row__meta-value--total tabular-nums"
                    >{{
                      item.fieldData.Total != null
                        ? `${item.fieldData.Currency ?? ""} ${formatNumberDisplay(item.fieldData.Total)}`.trim()
                        : "—"
                    }}</span
                  >
                </div>
              </div>
              <router-link
                :to="{
                  name: 'entry',
                  query: { transRef: item.fieldData.TransRef ?? '' },
                }"
                class="pill-btn glass-input inline-flex items-center justify-end gap-1.5 px-3.5 py-2 text-[var(--label-size)] font-medium text-[var(--color-accent)] no-underline opacity-90 group-hover:opacity-100 transition-opacity justify-self-end"
              >
                View
                <svg
                  class="h-3.5 w-3.5 shrink-0"
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
              </router-link>
            </div>
          </div>
          <div v-if="totalPagesApproved > 1" class="pagination">
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPageApproved <= 1"
              aria-label="Previous page"
              @click="
                currentPageApproved = Math.max(1, currentPageApproved - 1)
              "
            >
              <svg
                class="pagination__icon"
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
            <span class="pagination__label"
              >Page {{ currentPageApproved }} of {{ totalPagesApproved }}</span
            >
            <button
              type="button"
              class="pagination__btn"
              :disabled="currentPageApproved >= totalPagesApproved"
              aria-label="Next page"
              @click="
                currentPageApproved = Math.min(
                  totalPagesApproved,
                  currentPageApproved + 1,
                )
              "
            >
              <svg
                class="pagination__icon"
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
          <p
            v-if="filteredApprovedList.length === 0"
            class="rounded-2xl border border-dashed border-[var(--color-border)] py-8 px-4 text-center text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            {{
              searchQuery
                ? "No matching approved entries."
                : "No approved payables."
            }}
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import Skeleton from "../components/Skeleton.vue";
import DailyPostedChart from "../components/DailyPostedChart.vue";
import { useFileMaker } from "../composables/useFileMaker";
import { useListSummaryStore } from "../stores/listSummaryStore";
import { useBookletStore } from "../stores/bookletStore";
import { LAYOUTS } from "../utils/filemakerApi";
import type { PayablesMainFieldData } from "../utils/filemakerApi";
import { formatNumberDisplay } from "../utils/formatNumber";
import type { FindRecordWithId } from "../composables/useFileMaker";

const router = useRouter();
const { findRecordsWithIds, isConnected } = useFileMaker();
const listSummary = useListSummaryStore();
const booklet = useBookletStore();

/** Selected draft refs in list order (for Apple Books–style booklet). */
const selectedDraftRefsInOrder = computed(() =>
  draftList.value
    .map((item) => (item.fieldData.TransRef ?? "").trim())
    .filter((ref) => ref && booklet.isSelected(ref)),
);

function openInBooklet(transRef: string) {
  booklet.addOpenEntry(transRef);
}

function openBookletWithSelected() {
  const refs = selectedDraftRefsInOrder.value;
  if (refs.length === 0) return;
  booklet.openBookletWithRefs(refs, "draft");
  router.push({ name: "entry", query: { transRef: refs[0] } });
}

const list = ref<FindRecordWithId<PayablesMainFieldData>[]>([]);
const vendorCount = ref(0);
const loading = ref(false);
const error = ref<string | null>(null);

const PAGE_SIZE = 5;
const searchQuery = ref("");
const activeSegment = ref<"draft" | "posted" | "rejected" | "approved">(
  "draft",
);
const currentPageDraft = ref(1);
const currentPagePosted = ref(1);
const currentPageRejected = ref(1);
const currentPageApproved = ref(1);

/** Greeting with dummy name (time-based). */
const greeting = computed(() => {
  const name = "Alex";
  const h = new Date().getHours();
  const timeGreeting =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}, ${name}`;
});

/** Animated display values for stat cards (count-up). */
const displayedDraft = ref(0);
const displayedPosted = ref(0);
const displayedRejected = ref(0);
const displayedApproved = ref(0);
const displayedVendors = ref(0);

function animateValue(ref: { value: number }, target: number, duration = 500) {
  const start = ref.value;
  const startTime = performance.now();
  function step(now: number) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - t, 2);
    ref.value = Math.round(start + (target - start) * ease);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/** Match item by search (vendor name, ID, invoice #, ref). */
function matchesSearch(
  item: FindRecordWithId<PayablesMainFieldData>,
  q: string,
): boolean {
  if (!q.trim()) return true;
  const s = q.trim().toLowerCase();
  const name = String(item.fieldData?.VendorName ?? "").toLowerCase();
  const vendorId = String(item.fieldData?.VendorID ?? "").toLowerCase();
  const invoice = String(item.fieldData?.InvoiceNumber ?? "").toLowerCase();
  const ref = String(item.fieldData?.TransRef ?? "").toLowerCase();
  return (
    name.includes(s) ||
    vendorId.includes(s) ||
    invoice.includes(s) ||
    ref.includes(s)
  );
}

/** Get creation timestamp from record (FileMaker CreationTimestamp, any casing). */
function getCreationTimestamp(
  item: FindRecordWithId<PayablesMainFieldData>,
): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined;
  if (!fd) return "";
  const raw =
    fd.CreationTimestamp ??
    fd["Creation timestamp"] ??
    fd.creationTimestamp ??
    fd.creation_timestamp ??
    "";
  return String(raw ?? "").trim();
}

/** Get PostedDate for posted chart (FileMaker PostedDate field). Fallback to Date. */
function getPostedDate(item: FindRecordWithId<PayablesMainFieldData>): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined;
  if (!fd) return "";
  const raw =
    fd.PostedDate ??
    fd["Posted date"] ??
    fd.postedDate ??
    fd.posted_date ??
    fd.Date ??
    fd.date ??
    "";
  return String(raw ?? "").trim();
}

/** Get ApprovedDate for approved chart (FileMaker ApprovedDate field). Fallback to Date. */
function getApprovedDate(
  item: FindRecordWithId<PayablesMainFieldData>,
): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined;
  if (!fd) return "";
  const raw =
    fd.ApprovedDate ??
    fd["Approved date"] ??
    fd.approvedDate ??
    fd.approved_date ??
    fd.Date ??
    fd.date ??
    "";
  return String(raw ?? "").trim();
}

/** Resolve Status from record: Status field, or derived from Approved/Rejected/Posted (Draft if none). */
function getStatus(item: FindRecordWithId<PayablesMainFieldData>): string {
  const fd = item?.fieldData as Record<string, unknown> | undefined;
  if (!fd) return "Draft";
  const status = fd.Status ?? fd.status;
  if (status != null && String(status).trim()) return String(status).trim();
  const approved = fd.Approved ?? fd.approved;
  const rejected = fd.Rejected ?? fd.rejected;
  const posted = fd.Posted ?? fd.posted;
  if (approved != null && String(approved).trim()) return "Approved";
  if (rejected != null && String(rejected).trim()) return "Rejected";
  if (posted != null && String(posted).trim() === "Yes") return "Posted";
  return "Draft";
}

/** Sort by CreationTimestamp (recent first). Fallback to recordId when timestamp is missing. */
function sortByCreationTimestamp(
  items: FindRecordWithId<PayablesMainFieldData>[],
): FindRecordWithId<PayablesMainFieldData>[] {
  return [...items].sort((a, b) => {
    const tsA = getCreationTimestamp(a);
    const tsB = getCreationTimestamp(b);
    if (!tsA && !tsB) {
      const idA = Number(a.recordId) || 0;
      const idB = Number(b.recordId) || 0;
      return idB - idA;
    }
    if (!tsA) return 1;
    if (!tsB) return -1;
    const dateA = new Date(tsA).getTime();
    const dateB = new Date(tsB).getTime();
    return dateB - dateA;
  });
}

/** Filter and sort by Status (Draft, Posted, Rejected, Approved) then by date. */
function filterByStatusAndSort(
  items: FindRecordWithId<PayablesMainFieldData>[],
  status: string,
): FindRecordWithId<PayablesMainFieldData>[] {
  const filtered = items.filter((item) => getStatus(item) === status);
  return sortByCreationTimestamp(filtered);
}

const draftList = computed(() => filterByStatusAndSort(list.value, "Draft"));
const postedList = computed(() => filterByStatusAndSort(list.value, "Posted"));
const rejectedList = computed(() =>
  filterByStatusAndSort(list.value, "Rejected"),
);
const approvedList = computed(() =>
  filterByStatusAndSort(list.value, "Approved"),
);

/** Rejected entry TransRefs in list order (for opening single entry or booklet). */
const rejectedRefsInOrder = computed(() =>
  rejectedList.value
    .map((item) => (item.fieldData.TransRef ?? "").trim())
    .filter(Boolean),
);

function openRejectedCard() {
  const refs = rejectedRefsInOrder.value;
  if (refs.length === 0) return;
  if (refs.length === 1) {
    router.push({ name: "entry", query: { transRef: refs[0] } });
    return;
  }
  booklet.openBookletWithRefs(refs, "rejected");
  router.push({ name: "entry", query: { transRef: refs[0] } });
}

/** Normalize any date/timestamp to YYYY-MM-DD for grouping. */
function toDateKey(raw: string | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const s = raw.trim();
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Daily totals for posted entries, grouped by currency (never sum USD + GHS). Group by PostedDate. */
const dailyPostedByCurrency = computed(() => {
  const byCurrency = new Map<string, Map<string, number>>();
  for (const item of postedList.value) {
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const dateKey = toDateKey(getPostedDate(item));
    if (!dateKey) continue;
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    if (!byCurrency.has(currency)) byCurrency.set(currency, new Map());
    const dateMap = byCurrency.get(currency)!;
    dateMap.set(dateKey, (dateMap.get(dateKey) ?? 0) + total);
  }
  const result: Record<string, { date: string; total: number }[]> = {};
  byCurrency.forEach((dateMap, currency) => {
    result[currency] = Array.from(dateMap.entries()).map(([date, total]) => ({
      date,
      total,
    }));
  });
  return result;
});

/** Primary currency for the chart bars (the one with the largest total). */
const primaryCurrency = computed(() => {
  const byCur = dailyPostedByCurrency.value;
  let best = "GHS";
  let maxSum = 0;
  for (const [currency, data] of Object.entries(byCur)) {
    const sum = data.reduce((s, d) => s + d.total, 0);
    if (sum > maxSum) {
      maxSum = sum;
      best = currency;
    }
  }
  return best;
});

/** All unique posting days (across all currencies) so the chart shows every day with activity. */
const allPostedDateKeys = computed(() => {
  const byCur = dailyPostedByCurrency.value;
  const set = new Set<string>();
  for (const data of Object.values(byCur)) {
    for (const { date } of data) set.add(date);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b));
});

/** Today's date as YYYY-MM-DD (local). */
function todayDateKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Date selected in the calendar; chart shows posted-by-vendor or approved-by-vendor for this day. */
const selectedChartDate = ref(todayDateKey());

/** Toggle: show Posted or Approved amounts in the daily chart. */
const dailyChartMode = ref<"posted" | "approved">("posted");

/** Which month the calendar is showing (YYYY-MM). */
const calendarViewMonthRef = ref(todayDateKey().slice(0, 7));

/** Calendar grid for the current view month: weeks of days (null = empty cell). */
const calendarGrid = computed(() => {
  const [y, m] = calendarViewMonthRef.value.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const last = new Date(y, m, 0);
  const firstDay = first.getDay();
  const daysInMonth = last.getDate();
  const cells:
    | { dateKey: string; day: number; isSelected: boolean; isToday: boolean }
    | null[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  const today = todayDateKey();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    cells.push({
      dateKey,
      day: d,
      isSelected: dateKey === selectedChartDate.value,
      isToday: dateKey === today,
    });
  }
  const remainder = cells.length % 7;
  if (remainder) for (let i = 0; i < 7 - remainder; i++) cells.push(null);
  const weeks: (typeof cells)[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
});

const calendarMonthLabel = computed(() => {
  const [y, m] = calendarViewMonthRef.value.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
});

function calendarPrevMonth() {
  const [y, m] = calendarViewMonthRef.value.split("-").map(Number);
  if (m === 1) {
    calendarViewMonthRef.value = `${y - 1}-12`;
  } else {
    calendarViewMonthRef.value = `${y}-${String(m - 1).padStart(2, "0")}`;
  }
}

function calendarNextMonth() {
  const [y, m] = calendarViewMonthRef.value.split("-").map(Number);
  if (m === 12) {
    calendarViewMonthRef.value = `${y + 1}-01`;
  } else {
    calendarViewMonthRef.value = `${y}-${String(m + 1).padStart(2, "0")}`;
  }
}

function selectChartDate(dateKey: string) {
  selectedChartDate.value = dateKey;
  calendarViewMonthRef.value = dateKey.slice(0, 7);
}

function goToToday() {
  selectedChartDate.value = todayDateKey();
  calendarViewMonthRef.value = todayDateKey().slice(0, 7);
}

/** Human-readable label for the selected chart date (for chart title). */
const selectedChartDateLabel = computed(() => {
  const key = selectedChartDate.value;
  if (!key || key === todayDateKey()) return "Today";
  const d = new Date(key + "T12:00:00");
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
});

/** Daily totals for approved entries, grouped by currency. Group by ApprovedDate. */
const dailyApprovedByCurrency = computed(() => {
  const byCurrency = new Map<string, Map<string, number>>();
  for (const item of approvedList.value) {
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const dateKey = toDateKey(getApprovedDate(item));
    if (!dateKey) continue;
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    if (!byCurrency.has(currency)) byCurrency.set(currency, new Map());
    const dateMap = byCurrency.get(currency)!;
    dateMap.set(dateKey, (dateMap.get(dateKey) ?? 0) + total);
  }
  const result: Record<string, { date: string; total: number }[]> = {};
  byCurrency.forEach((dateMap, currency) => {
    result[currency] = Array.from(dateMap.entries()).map(([date, total]) => ({
      date,
      total,
    }));
  });
  return result;
});

/** Primary currency for approved chart. */
const approvedCurrency = computed(() => {
  const byCur = dailyApprovedByCurrency.value;
  let best = "GHS";
  let maxSum = 0;
  for (const [currency, data] of Object.entries(byCur)) {
    const sum = data.reduce((s, d) => s + d.total, 0);
    if (sum > maxSum) {
      maxSum = sum;
      best = currency;
    }
  }
  return best;
});

/** Posted totals by vendor for the selected date only (x-axis = vendor name, bar = amount). */
const postedByVendor = computed(() => {
  const primary = primaryCurrency.value;
  const selected = selectedChartDate.value;
  const byVendor = new Map<
    string,
    { label: string; total: number; totalsByCurrency: Record<string, number> }
  >();
  for (const item of postedList.value) {
    const itemDate = toDateKey(getPostedDate(item));
    if (!itemDate || itemDate !== selected) continue;
    const vid = String(item.fieldData?.VendorID ?? "").trim();
    const name = String(item.fieldData?.VendorName ?? "").trim();
    const label = name || vid || "—";
    const key = vid || label;
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    if (!byVendor.has(key)) {
      byVendor.set(key, { label, total: 0, totalsByCurrency: {} });
    }
    const row = byVendor.get(key)!;
    row.totalsByCurrency[currency] =
      (row.totalsByCurrency[currency] ?? 0) + total;
    if (currency === primary) row.total += total;
  }
  return Array.from(byVendor.values())
    .filter((r) => r.total > 0 || Object.keys(r.totalsByCurrency).length > 0)
    .map((r) => ({
      date: r.label,
      label: r.label,
      total: r.total,
      totalsByCurrency: r.totalsByCurrency,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
});

/** Header label: one total per currency so we never mix USD and GHS (e.g. "GHS 1,064,354.65 · USD 2,500.00"). */
const postedCurrencyTotalsLabel = computed(() => {
  const byCur = dailyPostedByCurrency.value;
  const parts = Object.entries(byCur)
    .map(([currency, data]) => {
      const sum = data.reduce((s, d) => s + d.total, 0);
      return `${currency} ${formatNumberDisplay(sum) || "0.00"}`;
    })
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "";
});

/** Totals for the selected date's posted only (for the chart header). */
const postedTodayTotalsLabel = computed(() => {
  const selected = selectedChartDate.value;
  const byCur: Record<string, number> = {};
  for (const item of postedList.value) {
    const itemDate = toDateKey(getPostedDate(item));
    if (!itemDate || itemDate !== selected) continue;
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    byCur[currency] = (byCur[currency] ?? 0) + total;
  }
  const parts = Object.entries(byCur)
    .map(
      ([currency, sum]) => `${currency} ${formatNumberDisplay(sum) || "0.00"}`,
    )
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "";
});

/** Approved totals by vendor for the selected date only. */
const approvedByVendor = computed(() => {
  const primary = approvedCurrency.value;
  const selected = selectedChartDate.value;
  const byVendor = new Map<
    string,
    { label: string; total: number; totalsByCurrency: Record<string, number> }
  >();
  for (const item of approvedList.value) {
    const itemDate = toDateKey(getApprovedDate(item));
    if (!itemDate || itemDate !== selected) continue;
    const vid = String(item.fieldData?.VendorID ?? "").trim();
    const name = String(item.fieldData?.VendorName ?? "").trim();
    const label = name || vid || "—";
    const key = vid || label;
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    if (!byVendor.has(key)) {
      byVendor.set(key, { label, total: 0, totalsByCurrency: {} });
    }
    const row = byVendor.get(key)!;
    row.totalsByCurrency[currency] =
      (row.totalsByCurrency[currency] ?? 0) + total;
    if (currency === primary) row.total += total;
  }
  return Array.from(byVendor.values())
    .filter((r) => r.total > 0 || Object.keys(r.totalsByCurrency).length > 0)
    .map((r) => ({
      date: r.label,
      label: r.label,
      total: r.total,
      totalsByCurrency: r.totalsByCurrency,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
});

/** Totals for the selected date's approved only (for the chart header). */
const approvedTodayTotalsLabel = computed(() => {
  const selected = selectedChartDate.value;
  const byCur: Record<string, number> = {};
  for (const item of approvedList.value) {
    const itemDate = toDateKey(getApprovedDate(item));
    if (!itemDate || itemDate !== selected) continue;
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    byCur[currency] = (byCur[currency] ?? 0) + total;
  }
  const parts = Object.entries(byCur)
    .map(
      ([currency, sum]) => `${currency} ${formatNumberDisplay(sum) || "0.00"}`,
    )
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "";
});

const postedCurrency = computed(() => primaryCurrency.value);

const totalEntries = computed(
  () =>
    draftList.value.length +
    postedList.value.length +
    rejectedList.value.length +
    approvedList.value.length,
);

watch(
  () => [
    draftList.value.length,
    postedList.value.length,
    rejectedList.value.length,
    approvedList.value.length,
    vendorCount.value,
  ],
  ([draft, posted, rejected, approved, vendors]) => {
    animateValue(displayedDraft, Number(draft));
    animateValue(displayedPosted, Number(posted));
    animateValue(displayedRejected, Number(rejected));
    animateValue(displayedApproved, Number(approved));
    animateValue(displayedVendors, Number(vendors));
  },
  { immediate: true },
);

const filteredDraftList = computed(() =>
  draftList.value.filter((item) => matchesSearch(item, searchQuery.value)),
);
const filteredPostedList = computed(() =>
  postedList.value.filter((item) => matchesSearch(item, searchQuery.value)),
);
const filteredRejectedList = computed(() =>
  rejectedList.value.filter((item) => matchesSearch(item, searchQuery.value)),
);
const filteredApprovedList = computed(() =>
  approvedList.value.filter((item) => matchesSearch(item, searchQuery.value)),
);

const hasResultsInAnyTab = computed(
  () =>
    filteredDraftList.value.length > 0 ||
    filteredPostedList.value.length > 0 ||
    filteredRejectedList.value.length > 0 ||
    filteredApprovedList.value.length > 0,
);

const searchPlaceholder = computed(() => {
  const t = activeSegment.value;
  if (t === "draft") return "Search Draft (vendor, ref…)";
  if (t === "posted") return "Search Posted (vendor, ref…)";
  if (t === "rejected") return "Search Rejected (vendor, ref…)";
  return "Search Approved (vendor, ref…)";
});

const currentTabHasNoResults = computed(() => {
  if (!searchQuery.value) return false;
  const t = activeSegment.value;
  if (t === "draft") return filteredDraftList.value.length === 0;
  if (t === "posted") return filteredPostedList.value.length === 0;
  if (t === "rejected") return filteredRejectedList.value.length === 0;
  return filteredApprovedList.value.length === 0;
});

const totalPagesDraft = computed(() =>
  Math.max(1, Math.ceil(filteredDraftList.value.length / PAGE_SIZE)),
);
const totalPagesPosted = computed(() =>
  Math.max(1, Math.ceil(filteredPostedList.value.length / PAGE_SIZE)),
);
const totalPagesRejected = computed(() =>
  Math.max(1, Math.ceil(filteredRejectedList.value.length / PAGE_SIZE)),
);
const totalPagesApproved = computed(() =>
  Math.max(1, Math.ceil(filteredApprovedList.value.length / PAGE_SIZE)),
);

const draftListToShow = computed(() => {
  const start = (currentPageDraft.value - 1) * PAGE_SIZE;
  return filteredDraftList.value.slice(start, start + PAGE_SIZE);
});
const postedListToShow = computed(() => {
  const start = (currentPagePosted.value - 1) * PAGE_SIZE;
  return filteredPostedList.value.slice(start, start + PAGE_SIZE);
});
const rejectedListToShow = computed(() => {
  const start = (currentPageRejected.value - 1) * PAGE_SIZE;
  return filteredRejectedList.value.slice(start, start + PAGE_SIZE);
});
const approvedListToShow = computed(() => {
  const start = (currentPageApproved.value - 1) * PAGE_SIZE;
  return filteredApprovedList.value.slice(start, start + PAGE_SIZE);
});

/** Reset to page 1 when search changes. */
watch(searchQuery, () => {
  currentPageDraft.value = 1;
  currentPagePosted.value = 1;
  currentPageRejected.value = 1;
  currentPageApproved.value = 1;
});

/** Clamp page when total pages shrinks (e.g. after filter). */
watch(totalPagesDraft, (total) => {
  if (currentPageDraft.value > total)
    currentPageDraft.value = Math.max(1, total);
});
watch(totalPagesPosted, (total) => {
  if (currentPagePosted.value > total)
    currentPagePosted.value = Math.max(1, total);
});
watch(totalPagesRejected, (total) => {
  if (currentPageRejected.value > total)
    currentPageRejected.value = Math.max(1, total);
});
watch(totalPagesApproved, (total) => {
  if (currentPageApproved.value > total)
    currentPageApproved.value = Math.max(1, total);
});

/** Totals per currency for Draft (so Overview can show GHS · USD when vendors use different currencies). */
const draftTotalsByCurrency = computed(() => {
  const byCur: Record<string, number> = {};
  for (const item of draftList.value) {
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    byCur[currency] = (byCur[currency] ?? 0) + total;
  }
  return byCur;
});

/** Totals per currency for Posted. */
const postedTotalsByCurrency = computed(() => {
  const byCur: Record<string, number> = {};
  for (const item of postedList.value) {
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    byCur[currency] = (byCur[currency] ?? 0) + total;
  }
  return byCur;
});

/** Totals per currency for Rejected. */
const rejectedTotalsByCurrency = computed(() => {
  const byCur: Record<string, number> = {};
  for (const item of rejectedList.value) {
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    byCur[currency] = (byCur[currency] ?? 0) + total;
  }
  return byCur;
});

/** Totals per currency for Approved. */
const approvedTotalsByCurrency = computed(() => {
  const byCur: Record<string, number> = {};
  for (const item of approvedList.value) {
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    byCur[currency] = (byCur[currency] ?? 0) + total;
  }
  return byCur;
});

watch(
  [draftList, postedList, rejectedList, approvedList],
  () => {
    listSummary.setCounts(
      draftList.value.length,
      postedList.value.length,
      rejectedList.value.length,
      approvedList.value.length,
    );
  },
  { immediate: true },
);
watch(
  [
    draftTotalsByCurrency,
    postedTotalsByCurrency,
    rejectedTotalsByCurrency,
    approvedTotalsByCurrency,
  ],
  () => {
    listSummary.setTotalsByCurrency(
      draftTotalsByCurrency.value,
      postedTotalsByCurrency.value,
      rejectedTotalsByCurrency.value,
      approvedTotalsByCurrency.value,
    );
  },
  { immediate: true },
);

async function load() {
  if (!isConnected.value) {
    list.value = [];
    vendorCount.value = 0;
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const [mainRes, vendorRes] = await Promise.all([
      findRecordsWithIds<PayablesMainFieldData>(LAYOUTS.PAYABLES_MAIN, {
        limit: 500,
      }),
      findRecordsWithIds<Record<string, unknown>>(LAYOUTS.VENDOR_TBL, {
        limit: 5000,
      }),
    ]);
    if (mainRes.error) {
      error.value = mainRes.error;
      list.value = [];
    } else {
      list.value = mainRes.data;
    }
    vendorCount.value = vendorRes.error ? 0 : vendorRes.data.length;
  } finally {
    loading.value = false;
  }
}

onMounted(load);
watch(isConnected, (connected) => {
  if (connected) load();
});
</script>
