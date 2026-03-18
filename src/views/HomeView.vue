<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <!-- Hero: Apple-style large title + CTA -->
    <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
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
        v-if="showDraftTab && list.length > 0"
        to="/entry"
        class="pill-btn new-entry-btn inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white no-underline shadow-md hover:bg-orange-600 transition-colors"
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
    <div v-if="loading" class="flex flex-col gap-6">
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
      <div
        v-if="isConnected"
        class="empty-state empty-state--connected"
        @mouseenter="emptyStateHover = true"
        @mouseleave="emptyStateHover = false"
      >
        <div class="empty-state__carousel">
          <Transition name="empty-slide" mode="out-in">
            <div
              :key="emptySlideIndex"
              class="empty-state__slide"
            >
              <div class="empty-state__icon" aria-hidden="true">
                <svg v-if="emptySlides[emptySlideIndex].iconKey === 'documents'" width="80" height="80" viewBox="0 0 80 80" fill="none" class="empty-state__illustration">
                  <rect x="12" y="8" width="48" height="64" rx="4" stroke="currentColor" stroke-width="2" stroke-opacity="0.2" fill="none" />
                  <rect x="18" y="14" width="48" height="64" rx="4" stroke="currentColor" stroke-width="2" stroke-opacity="0.35" fill="none" />
                  <rect x="24" y="20" width="48" height="64" rx="4" stroke="currentColor" stroke-width="2" stroke-opacity="0.5" fill="none" />
                  <path d="M32 36h24M32 44h18M32 52h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.4" />
                  <circle cx="56" cy="56" r="16" fill="var(--color-accent-soft)" stroke="var(--color-accent)" stroke-width="2" stroke-opacity="0.6" />
                  <path d="M56 50v12M50 56h12" stroke="var(--color-accent)" stroke-width="2" stroke-linecap="round" />
                </svg>
                <svg v-else-if="emptySlides[emptySlideIndex].iconKey === 'workflow'" width="80" height="80" viewBox="0 0 80 80" fill="none" class="empty-state__illustration">
                  <circle cx="16" cy="40" r="12" stroke="currentColor" stroke-width="2" stroke-opacity="0.4" fill="none" />
                  <circle cx="40" cy="40" r="12" stroke="currentColor" stroke-width="2" stroke-opacity="0.6" fill="none" />
                  <circle cx="64" cy="40" r="12" stroke="currentColor" stroke-width="2" fill="none" />
                  <path d="M28 40h8M52 40h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.6" />
                  <text x="16" y="44" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" opacity="0.7">1</text>
                  <text x="40" y="44" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor" opacity="0.8">2</text>
                  <text x="64" y="44" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">3</text>
                </svg>
                <svg v-else-if="emptySlides[emptySlideIndex].iconKey === 'features'" width="80" height="80" viewBox="0 0 80 80" fill="none" class="empty-state__illustration">
                  <rect x="14" y="12" width="36" height="48" rx="4" stroke="currentColor" stroke-width="2" stroke-opacity="0.5" fill="none" />
                  <path d="M24 28h16M24 36h12M24 44h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
                  <circle cx="56" cy="32" r="8" fill="var(--color-accent-soft)" stroke="var(--color-accent)" stroke-width="1.5" opacity="0.7" />
                  <path d="M52 32l3 3 6-6" stroke="var(--color-accent)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                </svg>
                <svg v-else width="80" height="80" viewBox="0 0 80 80" fill="none" class="empty-state__illustration">
                  <circle cx="40" cy="40" r="28" stroke="currentColor" stroke-width="2" stroke-opacity="0.3" fill="none" />
                  <path d="M40 24v16l8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.6" />
                  <circle cx="40" cy="40" r="4" fill="var(--color-accent)" opacity="0.8" />
                </svg>
              </div>
              <h2 class="empty-state__title">{{ emptySlides[emptySlideIndex].title }}</h2>
              <p class="empty-state__subtitle">{{ emptySlides[emptySlideIndex].subtitle }}</p>
              <ul v-if="emptySlides[emptySlideIndex].steps" class="empty-state__steps" aria-label="Quick start">
                <li v-for="(step, i) in emptySlides[emptySlideIndex].steps" :key="i">
                  <span class="empty-state__step-num">{{ i + 1 }}</span>
                  {{ step }}
                </li>
              </ul>
              <div v-else-if="emptySlides[emptySlideIndex].items" class="empty-state__tip-list">
                <div
                  v-for="(item, i) in emptySlides[emptySlideIndex].items"
                  :key="i"
                  class="empty-state__tip-item"
                >
                  <span
                    class="empty-state__tip-icon"
                    :class="{ 'empty-state__tip-icon--badge': 'badge' in item && item.badge }"
                  >{{ item.icon }}</span>
                  <span>{{ item.text }}</span>
                </div>
              </div>
            </div>
          </Transition>
        </div>
        <div class="empty-state__footer">
          <div class="empty-state__dots" role="tablist" aria-label="Slide navigation">
            <button
              v-for="(slide, i) in emptySlides"
              :key="i"
              type="button"
              role="tab"
              :aria-selected="emptySlideIndex === i"
              :aria-label="`Go to slide ${i + 1}: ${slide.title}`"
              class="empty-state__dot"
              :class="{ 'empty-state__dot--active': emptySlideIndex === i }"
              @click="emptySlideIndex = i"
            />
          </div>
          <router-link
            to="/entry"
            class="empty-state__cta pill-btn inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-[var(--label-size)] font-semibold no-underline shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all"
          >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create first entry
          </router-link>
        </div>
      </div>
      <div v-else class="empty-state empty-state--disconnected">
        <div class="empty-state__icon empty-state__icon--connect" aria-hidden="true">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" opacity="0.5">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          </svg>
        </div>
        <h2 class="empty-state__title">Connect to load payables</h2>
        <p class="empty-state__subtitle">
          Connect to FileMaker to see existing entries, or create a new one locally first.
        </p>
        <p class="empty-state__hint">
          Click <strong>Connect</strong> in the status bar below to sign in.
        </p>
      </div>
    </template>
    <div v-else class="flex flex-col gap-6">
      <!-- Overview skeleton: when role not yet loaded -->
      <div v-if="!roleLoaded" class="stats-dashboard" aria-busy="true">
        <div class="stats-dashboard__greeting-row">
          <Skeleton width="14rem" height="1.75rem" class="rounded" />
        </div>
        <div class="stats-dashboard__kpis">
          <div
            v-for="i in 4"
            :key="i"
            class="stat-card rounded-2xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
          >
            <Skeleton width="3.5rem" height="0.875rem" class="rounded mb-2" />
            <Skeleton width="2.5rem" height="1.5rem" class="rounded" />
            <Skeleton width="2rem" height="0.75rem" class="rounded mt-1" />
          </div>
        </div>
        <div class="stats-dashboard__charts">
          <div
            class="stat-card stat-card--vendors rounded-2xl border border-[var(--color-border)]/60 bg-white/[0.04] px-4 py-3"
          >
            <Skeleton width="4rem" height="0.875rem" class="rounded mb-2" />
            <Skeleton width="2.5rem" height="1.5rem" class="rounded" />
            <Skeleton width="2.5rem" height="0.75rem" class="rounded mt-1" />
          </div>
        </div>
      </div>

      <!-- Greeting + Stats dashboard: KPIs + Vendors (when role loaded) -->
      <div v-else class="stats-dashboard">
        <div class="stats-dashboard__greeting-row">
          <p class="stats-dashboard__greeting" aria-live="polite">
            {{ greeting }}
          </p>
          <span v-if="userRole" class="stats-dashboard__role">{{
            userRole
          }}</span>
        </div>
        <div class="stats-dashboard__kpis">
          <div v-if="showDraftTab" class="stat-card stat-card--draft">
            <span class="stat-card__label">Draft</span>
            <span class="stat-card__value">{{ displayedDraft }}</span>
            <span class="stat-card__sublabel">entries</span>
          </div>
          <div v-if="showPostedTab" class="stat-card stat-card--posted">
            <span class="stat-card__label">Posted</span>
            <span class="stat-card__value">{{ displayedPosted }}</span>
            <span class="stat-card__sublabel">entries</span>
          </div>
          <div
            v-if="showRejectedTab"
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

        <!-- Officer alerts: middle space between KPIs and Vendors card -->
        <div
          v-if="roleLoaded && isConnected"
          class="stats-dashboard__alerts"
          :class="{ 'stats-dashboard__alerts--all-clear': !officerAlerts.hasAny }"
        >
          <div v-if="officerAlerts.hasAny" class="officer-alerts-card">
            <div class="officer-alerts-card__header">
              <span class="officer-alerts-card__icon" aria-hidden="true">
                <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </span>
              <span class="officer-alerts-card__title">Attention needed</span>
            </div>
            <div class="officer-alerts-card__ticker-wrap" aria-label="Alerts scrolling">
              <div class="officer-alerts-card__ticker">
                <div class="officer-alerts-card__ticker-track">
                  <router-link
                    v-for="(item, idx) in officerAlertTickerItems"
                    :key="'a-' + idx"
                    :to="item.to"
                    class="officer-alerts-card__item"
                  >
                    <span class="officer-alerts-card__count">{{ item.count }}</span>
                    <span class="officer-alerts-card__label">{{ item.label }}</span>
                    <svg class="officer-alerts-card__arrow" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </router-link>
                </div>
                <div class="officer-alerts-card__ticker-track" aria-hidden="true">
                  <router-link
                    v-for="(item, idx) in officerAlertTickerItems"
                    :key="'b-' + idx"
                    :to="item.to"
                    class="officer-alerts-card__item"
                  >
                    <span class="officer-alerts-card__count">{{ item.count }}</span>
                    <span class="officer-alerts-card__label">{{ item.label }}</span>
                    <svg class="officer-alerts-card__arrow" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </router-link>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="officer-alerts-card officer-alerts-card--all-clear">
            <span class="officer-alerts-card__icon officer-alerts-card__icon--success" aria-hidden="true">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span class="officer-alerts-card__title">Vendor & tax compliance up to date</span>
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
            <span
              class="stat-card__action-icon stat-card__action-icon--vendors"
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
          </router-link>
        </div>
      </div>

      <!-- Calendar + chart skeleton (when role loading) -->
      <section
        v-if="!roleLoaded"
        class="daily-chart-section daily-chart-section--with-calendar"
        aria-busy="true"
      >
        <div class="chart-calendar">
          <div
            class="chart-calendar__header flex items-center justify-between gap-2"
          >
            <Skeleton width="2rem" height="2rem" class="rounded shrink-0" />
            <Skeleton width="10rem" height="1.25rem" class="rounded" />
            <Skeleton width="2rem" height="2rem" class="rounded shrink-0" />
          </div>
          <div class="chart-calendar__weekdays flex gap-1 mt-3">
            <Skeleton
              v-for="w in 7"
              :key="w"
              width="2.5rem"
              height="0.875rem"
              class="rounded"
            />
          </div>
          <div class="grid grid-cols-7 gap-1 mt-2">
            <Skeleton
              v-for="i in 35"
              :key="i"
              width="2rem"
              height="2rem"
              class="rounded"
            />
          </div>
          <Skeleton width="4.5rem" height="1.75rem" class="rounded mt-3" />
        </div>
        <div class="chart-calendar__chart">
          <div class="daily-chart-section__toggle flex gap-2 mb-2">
            <Skeleton width="5rem" height="2.25rem" class="rounded" />
            <Skeleton width="5.5rem" height="2.25rem" class="rounded" />
          </div>
          <div class="h-[220px] flex items-end justify-around gap-3 px-2">
            <Skeleton
              v-for="i in 6"
              :key="i"
              width="2.5rem"
              :height="`${Math.max(40, 100 - i * 12)}%`"
              class="rounded-t shrink-0"
            />
          </div>
        </div>
      </section>

      <!-- Calendar + Posted/Approved by vendor chart (select date to update chart) -->
      <section
        v-else
        class="daily-chart-section daily-chart-section--with-calendar"
      >
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

      <!-- Search + tabs + list skeleton (when role loading) -->
      <div v-if="!roleLoaded" class="home-lists" aria-busy="true">
        <div class="search-and-tabs space-y-3">
          <Skeleton width="100%" height="2.75rem" class="rounded-xl" />
          <div class="flex gap-2">
            <Skeleton width="5rem" height="2.5rem" class="rounded-full" />
            <Skeleton width="5.5rem" height="2.5rem" class="rounded-full" />
            <Skeleton width="6rem" height="2.5rem" class="rounded-full" />
            <Skeleton width="6.5rem" height="2.5rem" class="rounded-full" />
          </div>
        </div>
        <ul class="list-none p-0 m-0 flex flex-col gap-2 mt-4">
          <li
            v-for="i in 4"
            :key="i"
            class="list-row rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3.5 flex items-center gap-3"
          >
            <Skeleton width="1.5rem" height="1.5rem" circle />
            <Skeleton width="35%" height="0.875rem" class="max-w-[8rem]" />
            <Skeleton width="4rem" height="0.75rem" />
            <Skeleton width="4rem" height="0.75rem" />
            <Skeleton width="4rem" height="0.75rem" />
            <Skeleton width="4rem" height="2rem" class="rounded-full ml-auto" />
          </li>
        </ul>
      </div>

      <!-- Search + tab control + list (tight gap between tabs and list) -->
      <div v-else class="home-lists">
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
              v-if="showDraftTab"
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
              v-if="showPostedTab"
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
                searchQuery || postedQuickFilter !== 'all'
                  ? `${filteredPostedListFiltered.length} of ${postedList.length}`
                  : postedList.length
              }}</span>
            </button>
            <button
              v-if="showRejectedTab"
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
            v-if="documentSettings.bookletEnabled && booklet.selectedCount > 0"
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
              :class="[
                { 'list-row--draft-no-booklet': !documentSettings.bookletEnabled },
                booklet.isSelected(item.fieldData.TransRef ?? '')
                  ? 'bg-orange-500/5 border-l-4 border-l-orange-500'
                  : 'border-l-4 border-l-transparent',
              ]"
            >
              <button
                v-if="documentSettings.bookletEnabled"
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
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Created by</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="getCreatorFromItem(item) || ''"
                    >{{ formatCreatorDisplay(getCreatorFromItem(item)) || "—" }}</span
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
                @click="documentSettings.bookletEnabled && openInBooklet(item.fieldData.TransRef ?? '')"
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
          <!-- Quick filters (left) + Bulk approve (right) – same row -->
          <div
            v-if="showPostedTab"
            class="flex flex-wrap items-center justify-between gap-2"
          >
            <div
              class="flex flex-wrap items-center gap-2"
              role="group"
              aria-label="Filter Posted entries"
            >
              <button
                type="button"
                class="quick-filter-pill"
                :class="{ 'quick-filter-pill--active': postedQuickFilter === 'all' }"
                @click="postedQuickFilter = 'all'"
              >
                All
              </button>
              <button
                v-if="documentSettings.overdueIndicatorEnabled"
                type="button"
                class="quick-filter-pill"
                :class="{ 'quick-filter-pill--active': postedQuickFilter === 'overdue' }"
                :title="`${overdueList.length} entries past due`"
                @click="postedQuickFilter = 'overdue'"
              >
                Overdue
                <span v-if="overdueList.length > 0" class="quick-filter-pill__count"
                  >{{ overdueList.length }}</span
                >
              </button>
              <button
                type="button"
                class="quick-filter-pill"
                :class="{ 'quick-filter-pill--active': postedQuickFilter === 'this-week' }"
                title="Posted in the current week"
                @click="postedQuickFilter = 'this-week'"
              >
                This week
              </button>
            </div>
            <div
              v-if="filteredPostedListFiltered.length > 0 && documentSettings.bulkApproveEnabled"
              class="flex flex-wrap items-center gap-2"
            >
              <button
                type="button"
                class="pill-btn glass-input inline-flex items-center rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-text-muted)]/50 hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="bulkApproving"
                @click="allOnPageSelected ? deselectAllOnPage() : selectAllOnPage()"
              >
                {{ allOnPageSelected ? "Deselect page" : "Select page" }}
              </button>
              <button
                type="button"
                class="pill-btn glass-input inline-flex items-center rounded-lg border border-[var(--color-border)] px-3 py-2 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-text-muted)]/50 hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="bulkApproving"
                @click="clearPostedSelection"
              >
                Clear selection
              </button>
              <button
                type="button"
                class="pill-btn inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-emerald-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="bulkApproving || postedSelectedCount === 0"
                @click="onBulkApprove"
              >
                <svg
                  v-if="!bulkApproving"
                  class="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {{ bulkApproving ? "Approving…" : "Bulk approve" }}
                <span v-if="postedSelectedCount > 0">({{ postedSelectedCount }})</span>
              </button>
            </div>
          </div>
          <div class="list-area--fixed-height flex flex-col">
          <div v-if="filteredPostedListFiltered.length > 0" class="list-view--inset">
            <!-- Header row: checkbox column only when bulk approve enabled -->
            <div
              v-if="showPostedTab && postedListToShow.length > 0"
              class="list-view__header"
              :class="{ 'list-view__header--no-bulk': !documentSettings.bulkApproveEnabled }"
            >
              <span
                v-if="documentSettings.bulkApproveEnabled && postedSelectableOnPage.length > 0"
                class="flex items-center justify-center"
              >
                <button
                  type="button"
                  class="flex h-5 w-5 items-center justify-center rounded border transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-1"
                  :class="
                    allOnPageSelected
                      ? 'border-emerald-500 bg-emerald-500/30 text-emerald-400'
                      : 'border-[var(--color-border)] text-[var(--color-text-muted)]/60 hover:border-[var(--color-text-muted)]'
                  "
                  :aria-label="allOnPageSelected ? 'Deselect all on page' : 'Select all on page'"
                  @click="allOnPageSelected ? deselectAllOnPage() : selectAllOnPage()"
                >
                  <svg
                    v-if="allOnPageSelected"
                    class="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </span>
              <span>Vendor</span>
              <span>Vendor ID</span>
              <span>Ref</span>
              <span>Created by</span>
              <span>Total</span>
              <span aria-hidden="true"></span>
            </div>
            <div
              v-for="(item, index) in postedListToShow"
              :key="item.recordId || `p-${index}`"
              class="list-view__row list-row list-row--posted group px-4 py-3.5"
              :class="[
                { 'list-row--posted-no-bulk': !documentSettings.bulkApproveEnabled },
                isPostedSelected(item.fieldData.TransRef ?? '')
                  ? 'bg-emerald-500/5 border-l-4 border-l-emerald-500'
                  : 'border-l-4 border-l-transparent',
              ]"
            >
              <span
                v-if="showPostedTab && documentSettings.bulkApproveEnabled"
                class="flex h-6 w-6 shrink-0 items-center justify-center"
              >
                <button
                  v-if="!pendingEditTransRefs.has((item.fieldData?.TransRef ?? '').trim())"
                  type="button"
                  class="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:ring-offset-1"
                  :class="
                    isPostedSelected(item.fieldData.TransRef ?? '')
                      ? 'border-emerald-500 bg-emerald-500/30 text-emerald-400'
                      : 'border-[var(--color-border)]/80 bg-transparent text-transparent hover:border-emerald-500/50 hover:bg-white/5'
                  "
                  :aria-label="
                    isPostedSelected(item.fieldData.TransRef ?? '')
                      ? 'Remove from bulk approve'
                      : 'Add to bulk approve'
                  "
                  @click.stop="togglePostedSelected(item.fieldData.TransRef ?? '')"
                >
                  <svg
                    v-if="isPostedSelected(item.fieldData.TransRef ?? '')"
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
                </button>
                <span
                  v-else
                  class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-amber-500/40 text-amber-500/60 cursor-not-allowed"
                  title="Edit requested by officer – cannot bulk approve"
                  aria-label="Edit requested – cannot bulk approve"
                >
                  —
                </span>
              </span>
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
                <span
                  v-if="documentSettings.overdueIndicatorEnabled && overdueTransRefs.has((item.fieldData?.TransRef ?? '').trim())"
                  class="shrink-0 rounded-full bg-amber-500/25 px-2 py-0.5 text-[10px] font-semibold text-amber-400"
                  :title="`Overdue: awaiting approval for more than ${documentSettings.overdueDays} days`"
                >
                  Overdue
                </span>
                <span
                  v-if="pendingEditTransRefs.has((item.fieldData?.TransRef ?? '').trim())"
                  class="shrink-0 rounded-full bg-blue-500/25 px-2 py-0.5 text-[10px] font-semibold text-blue-400"
                  title="Officer requested to edit this entry"
                >
                  Edit requested
                </span>
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
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Created by</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="getCreatorFromItem(item) || ''"
                    >{{ formatCreatorDisplay(getCreatorFromItem(item)) || "—" }}</span
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
            v-if="filteredPostedListFiltered.length === 0"
            class="flex-1 rounded-2xl border border-dashed border-[var(--color-border)] py-8 px-4 text-center text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            {{
              postedQuickFilter === 'overdue'
                ? (searchQuery ? "No matching overdue entries." : "No overdue entries.")
                : postedQuickFilter === 'this-week'
                  ? (searchQuery ? "No matching entries posted this week." : "No entries posted this week.")
                  : searchQuery
                    ? "No matching posted entries."
                    : "No posted payables yet."
            }}
          </p>
          </div>
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
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Created by</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="getCreatorFromItem(item) || ''"
                    >{{ formatCreatorDisplay(getCreatorFromItem(item)) || "—" }}</span
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
          <div class="list-area--fixed-height flex flex-col">
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
                <div class="list-row__meta-col">
                  <span class="list-row__meta-label">Created by</span>
                  <span
                    class="list-row__meta-value truncate"
                    :title="getCreatorFromItem(item) || ''"
                    >{{ formatCreatorDisplay(getCreatorFromItem(item)) || "—" }}</span
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
            class="flex-1 rounded-2xl border border-dashed border-[var(--color-border)] py-8 px-4 text-center text-[var(--label-size)] text-[var(--color-text-muted)]"
          >
            {{
              searchQuery
                ? "No matching approved entries."
                : "No approved payables."
            }}
          </p>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { setHomeTab, getHomeTab, isValidHomeTab } from "../utils/homeTab";
import Skeleton from "../components/Skeleton.vue";
import DailyPostedChart from "../components/DailyPostedChart.vue";
import { useFileMaker } from "../composables/useFileMaker";
import { useEditRequest } from "../composables/useEditRequest";
import { useApprovalNotification } from "../composables/useApprovalNotification";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useListSummaryStore } from "../stores/listSummaryStore";
import { useBookletStore } from "../stores/bookletStore";
import { useToastStore } from "../stores/toastStore";
import { LAYOUTS } from "../utils/filemakerApi";
import { formatDateOnlyForFileMaker } from "../utils/filemakerMappers";
import {
  matchesSearch,
  getCreationTimestamp,
  getPostedDate,
  getApprovedDate,
  toDateKey,
  filterByStatusAndSort,
  isPostedRecord,
  animateValue,
  loadPostedFilter,
  savePostedFilter,
  type PostedQuickFilter,
} from "../utils/homeViewHelpers";
import { useUserRole } from "../composables/useUserRole";
import { writeActivityLog } from "../utils/activityLog";
import type {
  PayablesMainFieldData,
  TaxValueFieldData,
} from "../utils/filemakerApi";
import { formatNumberDisplay } from "../utils/formatNumber";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { useLoadingOverlayStore } from "../stores/loadingOverlayStore";

const router = useRouter();
const route = useRoute();

function isValidTab(
  t: unknown,
): t is "draft" | "posted" | "rejected" | "approved" {
  return isValidHomeTab(t);
}
const {
  findRecordsWithIds,
  isConnected,
  createRecord,
  updateRecord,
} = useFileMaker();
const { fetchPendingEditRequestTransRefs } = useEditRequest();
const { notifyApprovalToOfficer } = useApprovalNotification();
const { userFullName, userRole, roleLoaded } = useUserRole();
const documentSettings = useDocumentSettingsStore();
const listSummary = useListSummaryStore();
const booklet = useBookletStore();
const toast = useToastStore();

/** Selected draft refs in list order (for Apple Books–style booklet). */
const selectedDraftRefsInOrder = computed(() =>
  draftList.value
    .map((item) => (item.fieldData.TransRef ?? "").trim())
    .filter((ref) => ref && booklet.isSelected(ref)),
);

function openInBooklet(transRef: string) {
  booklet.addOpenEntry(transRef);
}

function getCreatorFromItem(
  item: FindRecordWithId<PayablesMainFieldData | Record<string, unknown>>,
): string {
  const fd = item.fieldData as Record<string, unknown>;
  const v =
    fd?.CreatedName ??
    fd?.CreatorFullName ??
    fd?.CreatedByFullName ??
    fd?.CreatedBy ??
    fd?.["Creator Full Name"] ??
    fd?.["Created By"] ??
    fd?.["Created By Full Name"];
  if (v == null || v === "") return "";
  return String(v).trim();
}

/** Display-friendly creator (full value for title, shorthand for compact display) */
function formatCreatorDisplay(raw: string): string {
  const s = raw.trim();
  if (!s) return "";
  const at = s.indexOf("@");
  if (at > 0) return s.slice(0, at);
  return s;
}

function openBookletWithSelected() {
  const refs = selectedDraftRefsInOrder.value;
  if (refs.length === 0) return;
  booklet.openBookletWithRefs(refs, "draft");
  router.push({ name: "entry", query: { transRef: refs[0] } });
}

const list = ref<FindRecordWithId<PayablesMainFieldData>[]>([]);
const vendorCount = ref(0);
const vendorList = ref<FindRecordWithId<Record<string, unknown>>[]>([]);
const taxList = ref<FindRecordWithId<TaxValueFieldData>[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

/** Empty state carousel: slides with tips and instructions when no payables. */
const emptySlideIndex = ref(0);
const emptyStateHover = ref(false);
const emptySlides = [
  {
    iconKey: "documents",
    title: "Your workspace is empty",
    subtitle: "Create your first payable entry to get started.",
    steps: [
      "Select a vendor from the dropdown",
      "Add invoice lines and amounts",
      "Post the entry for manager approval",
    ],
  },
  {
    iconKey: "workflow",
    title: "How the workflow works",
    subtitle: "Entries move through statuses as they’re processed.",
    items: [
      { icon: "Draft", text: "New or in-progress entries. Edit freely.", badge: true },
      { icon: "Posted", text: "Submitted for approval. Manager reviews.", badge: true },
      { icon: "Approved", text: "Ready for cheque. Or Rejected if changes needed.", badge: true },
    ],
  },
  {
    iconKey: "features",
    title: "Handy features",
    subtitle: "Things you can do once you have entries.",
    items: [
      { icon: "📄", text: "Invoices view – Thumbnails and list of all payables" },
      { icon: "📖", text: "Booklet – Flip between entries like pages" },
      { icon: "⬇️", text: "PDF download – Approved invoices as PDF" },
      { icon: "✉️", text: "Send mail – Email invoices to vendors" },
    ],
  },
  {
    iconKey: "tips",
    title: "Quick tips",
    subtitle: "Speed up your workflow.",
    items: [
      { icon: "⌘", text: "Use the command palette (Cmd/Ctrl + K) for quick actions" },
      { icon: "🔍", text: "Search by PO, ref, vendor, or amount" },
      { icon: "📌", text: "Vendor details auto-fill when you select from the list" },
      { icon: "🔄", text: "Refresh the page to sync with FileMaker" },
    ],
  },
];

const PAGE_SIZE = 5;
const searchQuery = ref("");
const activeSegment = ref<"draft" | "posted" | "rejected" | "approved">(
  isValidTab(route.query.tab)
    ? route.query.tab
    : isValidTab(getHomeTab())
      ? (getHomeTab() as "draft" | "posted" | "rejected" | "approved")
      : "draft",
);

/** Sync tab to URL on change; persist for when returning from EntryView. */
watch(
  () => route.query.tab,
  (tab) => {
    if (isValidTab(tab) && tab !== activeSegment.value) {
      activeSegment.value = tab;
    }
  },
);
watch(activeSegment, (tab) => {
  setHomeTab(tab);
  if (route.name !== "home") return;
  const current = route.query.tab;
  if (current === tab) return;
  router.replace({ path: "/home", query: { ...route.query, tab } });
});
const currentPageDraft = ref(1);
const currentPagePosted = ref(1);
const currentPageRejected = ref(1);
const currentPageApproved = ref(1);

/** Bulk approve (Posted tab): selection state. */
const postedSelectedTransRefs = ref<Set<string>>(new Set());
const pendingEditTransRefs = ref<Set<string>>(new Set());
const bulkApproving = ref(false);

function togglePostedSelected(transRef: string) {
  const ref = (transRef ?? "").trim();
  if (!ref || pendingEditTransRefs.value.has(ref)) return;
  const next = new Set(postedSelectedTransRefs.value);
  if (next.has(ref)) next.delete(ref);
  else next.add(ref);
  postedSelectedTransRefs.value = next;
}

function isPostedSelected(transRef: string) {
  return postedSelectedTransRefs.value.has((transRef ?? "").trim());
}

function clearPostedSelection() {
  postedSelectedTransRefs.value = new Set();
}

const postedSelectedCount = computed(() => postedSelectedTransRefs.value.size);

/** Selectable items on current page (exclude those with pending edit request). */
const postedSelectableOnPage = computed(() =>
  postedListToShow.value
    .map((item) => (item.fieldData?.TransRef ?? "").trim())
    .filter((ref) => ref && !pendingEditTransRefs.value.has(ref)),
);

const allOnPageSelected = computed(() => {
  const selectable = postedSelectableOnPage.value;
  if (selectable.length === 0) return false;
  return selectable.every((ref) => postedSelectedTransRefs.value.has(ref));
});

function selectAllOnPage() {
  const selectable = postedSelectableOnPage.value;
  if (selectable.length === 0) return;
  const next = new Set(postedSelectedTransRefs.value);
  for (const ref of selectable) next.add(ref);
  postedSelectedTransRefs.value = next;
}

function deselectAllOnPage() {
  const selectable = postedSelectableOnPage.value;
  if (selectable.length === 0) return;
  const next = new Set(postedSelectedTransRefs.value);
  for (const ref of selectable) next.delete(ref);
  postedSelectedTransRefs.value = next;
}

/** Quick filter for Posted tab (Manager/Admin). Persisted to sessionStorage. */
const postedQuickFilter = ref<PostedQuickFilter>(loadPostedFilter());
watch(postedQuickFilter, (v) => savePostedFilter(v));

/** Greeting with user's FullName from Payables_Users (time-based). Falls back to "there" if no record. */
const greeting = computed(() => {
  const name = userFullName.value || "there";
  const h = new Date().getHours();
  const timeGreeting =
    h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${timeGreeting}, ${name}`;
});

/** Tab visibility by role: Manager hides Draft and Rejected. Requires roleLoaded to avoid flash on refresh. */
const roleLower = computed(() => (userRole.value ?? "").trim().toLowerCase());
const showDraftTab = computed(() => {
  if (!roleLoaded.value) return false;
  if (!roleLower.value) return true;
  return roleLower.value !== "manager";
});
const showPostedTab = computed(() => {
  if (!roleLoaded.value) return false;
  return true;
});
const showRejectedTab = computed(() => {
  if (!roleLoaded.value) return false;
  if (!roleLower.value) return true;
  return roleLower.value !== "manager";
});

/** Fetch pending edit-request TransRefs when Posted tab is active (for bulk approve). */
watch(
  [() => activeSegment.value, showPostedTab],
  async ([tab, show]) => {
    if (tab !== "posted" || !show) {
      pendingEditTransRefs.value = new Set();
      return;
    }
    const set = await fetchPendingEditRequestTransRefs();
    pendingEditTransRefs.value = set;
  },
  { immediate: true },
);

/** Redirect to first visible tab when current tab becomes hidden (role change). Only when role is loaded to avoid overriding saved tab on initial mount. */
watch(
  [showDraftTab, showPostedTab, showRejectedTab, activeSegment, roleLoaded],
  () => {
    if (!roleLoaded.value) return;
    const cur = activeSegment.value;
    if (cur === "draft" && !showDraftTab.value) {
      activeSegment.value = showPostedTab.value ? "posted" : "approved";
    } else if (cur === "posted" && !showPostedTab.value) {
      activeSegment.value = showDraftTab.value ? "draft" : "approved";
    } else if (cur === "rejected" && !showRejectedTab.value) {
      activeSegment.value = showDraftTab.value ? "draft" : "posted";
    }
  },
  { immediate: true },
);

/** Animated display values for stat cards (count-up). */
const displayedDraft = ref(0);
const displayedPosted = ref(0);
const displayedRejected = ref(0);
const displayedApproved = ref(0);
const displayedVendors = ref(0);

const draftList = computed(() => filterByStatusAndSort(list.value, "Draft"));
const postedList = computed(() => filterByStatusAndSort(list.value, "Posted"));

/** For the chart only: entries with Posted = "Yes" (and PostedDate used for selected date). Tab still uses Status. */
const chartPostedList = computed(() =>
  list.value.filter((item) => isPostedRecord(item)),
);
const rejectedList = computed(() =>
  filterByStatusAndSort(list.value, "Rejected"),
);
const approvedList = computed(() =>
  filterByStatusAndSort(list.value, "Approved"),
);

/** Posted entries awaiting approval for more than overdueDays (based on PostedDate or CreationTimestamp). */
const overdueList = computed(() => {
  const days = documentSettings.overdueDays;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffKey = toDateKey(cutoff.toISOString().slice(0, 10));
  if (!cutoffKey) return [];
  return postedList.value.filter((item) => {
    const postedKey = toDateKey(getPostedDate(item));
    const createdKey = toDateKey(getCreationTimestamp(item));
    const refKey = postedKey || createdKey;
    return refKey && refKey < cutoffKey;
  });
});

/** Top vendors by total payment volume (approved + posted). Per-vendor: sum by primary currency. */
const topVendorsByVolume = computed(() => {
  const byVendor = new Map<
    string,
    { name: string; byCurrency: Record<string, number> }
  >();
  for (const item of [...approvedList.value, ...postedList.value]) {
    const vid = String(item.fieldData?.VendorID ?? "").trim();
    const name = String(item.fieldData?.VendorName ?? "").trim();
    const key = vid || name || "—";
    const label = name || vid || "—";
    const total = Number(item.fieldData?.Total);
    if (!Number.isFinite(total)) continue;
    const currency = String(item.fieldData?.Currency ?? "").trim() || "GHS";
    if (!byVendor.has(key)) {
      byVendor.set(key, { name: label, byCurrency: {} });
    }
    const row = byVendor.get(key)!;
    row.byCurrency[currency] = (row.byCurrency[currency] ?? 0) + total;
  }
  return Array.from(byVendor.values())
    .map((r) => {
      const entries = Object.entries(r.byCurrency);
      if (entries.length === 0) return null;
      const [currency, total] = entries.reduce((a, b) =>
        (a[1] > b[1] ? a : b),
      );
      return { vendorName: r.name, total, currency };
    })
    .filter((x): x is NonNullable<typeof x> => x != null && x.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);
});

/** Top vendors by entry count (approved + posted). */
const topVendorsByEntryCount = computed(() => {
  const byVendor = new Map<string, { name: string; count: number }>();
  for (const item of [...approvedList.value, ...postedList.value]) {
    const vid = String(item.fieldData?.VendorID ?? "").trim();
    const name = String(item.fieldData?.VendorName ?? "").trim();
    const key = vid || name || "—";
    const label = name || vid || "—";
    if (!byVendor.has(key)) byVendor.set(key, { name: label, count: 0 });
    byVendor.get(key)!.count += 1;
  }
  return Array.from(byVendor.values())
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((r) => ({ vendorName: r.name, count: r.count }));
});

/** Rejected entry TransRefs in list order (for opening single entry or booklet). */
const rejectedRefsInOrder = computed(() =>
  rejectedList.value
    .map((item) => (item.fieldData.TransRef ?? "").trim())
    .filter(Boolean),
);

function openRejectedCard() {
  const refs = rejectedRefsInOrder.value;
  if (refs.length === 0) return;
  if (refs.length === 1 || !documentSettings.bookletEnabled) {
    router.push({ name: "entry", query: { transRef: refs[0] } });
    return;
  }
  booklet.openBookletWithRefs(refs, "rejected");
  router.push({ name: "entry", query: { transRef: refs[0] } });
}

/** Daily totals for posted entries (chart only: Posted = Yes), grouped by currency. Group by PostedDate. */
const dailyPostedByCurrency = computed(() => {
  const byCurrency = new Map<string, Map<string, number>>();
  for (const item of chartPostedList.value) {
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
const _allPostedDateKeys = computed(() => {
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
  const cells: Array<{ dateKey: string; day: number; isSelected: boolean; isToday: boolean } | null> = [];
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

/** Posted totals by vendor for the selected date only (chart: Posted = Yes and PostedDate = selected). */
const postedByVendor = computed(() => {
  const primary = primaryCurrency.value;
  const selected = selectedChartDate.value;
  const byVendor = new Map<
    string,
    { label: string; total: number; totalsByCurrency: Record<string, number> }
  >();
  for (const item of chartPostedList.value) {
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
const _postedCurrencyTotalsLabel = computed(() => {
  const byCur = dailyPostedByCurrency.value;
  const parts = Object.entries(byCur)
    .map(([currency, data]) => {
      const sum = data.reduce((s, d) => s + d.total, 0);
      return `${currency} ${formatNumberDisplay(sum) || "0.00"}`;
    })
    .filter(Boolean);
  return parts.length > 0 ? parts.join(" · ") : "";
});

/** Totals for the selected date's posted only (chart header: Posted = Yes and PostedDate = selected). */
const postedTodayTotalsLabel = computed(() => {
  const selected = selectedChartDate.value;
  const byCur: Record<string, number> = {};
  for (const item of chartPostedList.value) {
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

const _totalEntries = computed(
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

/** Expiry check is "valid" (GRA/WHT up to date) if value is valid, ok, yes, or good. */
function isExpiryValid(check: string | undefined): boolean {
  const s = (check ?? "").trim().toLowerCase();
  return ["valid", "ok", "yes", "good"].includes(s);
}

/** Officer alerts: vendors needing GRA update, WHT update, and tax expiring within 30 days. */
const officerAlerts = computed(() => {
  const vendors = vendorList.value;
  const graNeedingUpdate = vendors.filter(
    (r) => !isExpiryValid((r.fieldData?.Expiry_Check ?? r.fieldData?.["Expiry Check"]) as string),
  ).length;
  const whtNeedingUpdate = vendors.filter(
    (r) => !isExpiryValid((r.fieldData?.WHT_Expiry_Check ?? r.fieldData?.["WHT Expiry Check"]) as string),
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);

  function parseEndDate(raw: string | undefined): Date | null {
    const s = (raw ?? "").trim();
    if (!s) return null;
    const us = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
    if (us) {
      const d = new Date(parseInt(us[3], 10), parseInt(us[1], 10) - 1, parseInt(us[2], 10));
      return isNaN(d.getTime()) ? null : d;
    }
    const iso = /^\d{4}-\d{2}-\d{2}/.exec(s);
    if (iso) {
      const d = new Date(s);
      return isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  const taxExpiringSoon = taxList.value.filter((r) => {
    const status = (r.fieldData?.Status ?? "").trim().toLowerCase();
    if (status !== "valid") return false;
    const endDate = parseEndDate(r.fieldData?.End_Date as string);
    if (!endDate) return false;
    endDate.setHours(0, 0, 0, 0);
    return endDate >= today && endDate <= in30Days;
  }).length;

  return {
    graNeedingUpdate,
    whtNeedingUpdate,
    taxExpiringSoon,
    hasAny: graNeedingUpdate > 0 || whtNeedingUpdate > 0 || taxExpiringSoon > 0,
  };
});

/** Alert items for the ticker (only those with count > 0). */
const officerAlertTickerItems = computed(() => {
  const a = officerAlerts.value;
  const items: { type: string; count: number; label: string; to: string }[] = [];
  if (a.graNeedingUpdate > 0) {
    items.push({
      type: "gra",
      count: a.graNeedingUpdate,
      label:
        a.graNeedingUpdate === 1
          ? "Vendor requiring GRA (Ghana Revenue Authority) certificate update"
          : "Vendors requiring GRA (Ghana Revenue Authority) certificate update",
      to: "/vendors",
    });
  }
  if (a.whtNeedingUpdate > 0) {
    items.push({
      type: "wht",
      count: a.whtNeedingUpdate,
      label:
        a.whtNeedingUpdate === 1
          ? "Vendor requiring WHT (Withholding Tax) certificate update"
          : "Vendors requiring WHT (Withholding Tax) certificate update",
      to: "/vendors",
    });
  }
  if (a.taxExpiringSoon > 0) {
    items.push({
      type: "tax",
      count: a.taxExpiringSoon,
      label:
        a.taxExpiringSoon === 1
          ? "Tax code due to expire within the next thirty days"
          : "Tax codes due to expire within the next thirty days",
      to: "/tax",
    });
  }
  return items;
});

const filteredDraftList = computed(() =>
  draftList.value.filter((item) => matchesSearch(item, searchQuery.value)),
);
const filteredPostedList = computed(() =>
  postedList.value.filter((item) => matchesSearch(item, searchQuery.value)),
);

/** Check if a YYYY-MM-DD date key falls within the current calendar week (Mon–Sun). */
function isInCurrentWeek(dateKey: string | null): boolean {
  if (!dateKey) return false;
  const d = new Date(dateKey + "T12:00:00");
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + diffToMonday);
  mon.setHours(0, 0, 0, 0);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return d >= mon && d <= sun;
}

/** Apply quick filter (Overdue / This week) to Posted list. Only when showPostedTab (Manager/Admin). */
const filteredPostedListFiltered = computed(() => {
  const filtered = filteredPostedList.value;
  if (!showPostedTab.value) return filtered;
  const filter = postedQuickFilter.value;
  if (filter === "all") return filtered;
  const overdueRefs = new Set(
    overdueList.value.map((i) => (i.fieldData?.TransRef ?? "").trim()),
  );
  if (filter === "overdue") {
    return filtered.filter((i) =>
      overdueRefs.has((i.fieldData?.TransRef ?? "").trim()),
    );
  }
  if (filter === "this-week") {
    return filtered.filter((i) =>
      isInCurrentWeek(toDateKey(getPostedDate(i))),
    );
  }
  return filtered;
});

/** Posted list with overdue entries first (for visibility in Posted tab). */
const filteredPostedListSorted = computed(() => {
  const filtered = filteredPostedListFiltered.value;
  const overdueRefs = new Set(
    overdueList.value.map((i) => (i.fieldData?.TransRef ?? "").trim()),
  );
  const overdue = filtered.filter((i) =>
    overdueRefs.has((i.fieldData?.TransRef ?? "").trim()),
  );
  const rest = filtered.filter(
    (i) => !overdueRefs.has((i.fieldData?.TransRef ?? "").trim()),
  );
  return [...overdue, ...rest];
});
/** TransRefs of overdue entries (for row badge). */
const overdueTransRefs = computed(() =>
  new Set(overdueList.value.map((i) => (i.fieldData?.TransRef ?? "").trim())),
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
    filteredPostedListFiltered.value.length > 0 ||
    filteredRejectedList.value.length > 0 ||
    filteredApprovedList.value.length > 0,
);

const searchPlaceholder = computed(() => {
  const t = activeSegment.value;
  if (t === "draft") return "Search Draft (PO, vendor, ref…)";
  if (t === "posted") return "Search Posted (PO, vendor, ref…)";
  if (t === "rejected") return "Search Rejected (PO, vendor, ref…)";
  return "Search Approved (PO, vendor, ref…)";
});

const currentTabHasNoResults = computed(() => {
  if (!searchQuery.value) return false;
  const t = activeSegment.value;
  if (t === "draft") return filteredDraftList.value.length === 0;
  if (t === "posted") return filteredPostedListFiltered.value.length === 0;
  if (t === "rejected") return filteredRejectedList.value.length === 0;
  return filteredApprovedList.value.length === 0;
});

const totalPagesDraft = computed(() =>
  Math.max(1, Math.ceil(filteredDraftList.value.length / PAGE_SIZE)),
);
const totalPagesPosted = computed(() =>
  Math.max(1, Math.ceil(filteredPostedListFiltered.value.length / PAGE_SIZE)),
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
  return filteredPostedListSorted.value.slice(start, start + PAGE_SIZE);
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
watch(postedQuickFilter, () => {
  currentPagePosted.value = 1;
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
  [draftList, postedList, rejectedList, approvedList, overdueList, loading],
  () => {
    listSummary.setCounts(
      draftList.value.length,
      postedList.value.length,
      rejectedList.value.length,
      approvedList.value.length,
    );
    if (!loading.value) {
      listSummary.setOverdueCount(overdueList.value.length);
      listSummary.setOverdueEntries(
        overdueList.value.map((item) => {
        const posted = getPostedDate(item);
        const postedKey = toDateKey(posted);
        let daysOverdue: number | undefined;
        if (postedKey) {
          const postedTime = new Date(postedKey + "T12:00:00").getTime();
          const todayTime = new Date().setHours(12, 0, 0, 0);
          daysOverdue = Math.max(0, Math.floor((todayTime - postedTime) / 86400000) - documentSettings.overdueDays);
        }
        return {
          transRef: String(item.fieldData?.TransRef ?? "").trim(),
          vendorName: String(item.fieldData?.VendorName ?? "").trim() || "—",
          total: Number(item.fieldData?.Total),
          currency: String(item.fieldData?.Currency ?? "").trim() || undefined,
          postedDate: posted || undefined,
          daysOverdue,
        };
      }),
      );
    }
    listSummary.setVendorStats(
      topVendorsByVolume.value,
      topVendorsByEntryCount.value,
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

async function onBulkApprove() {
  if (bulkApproving.value) return;
  const selected = [...postedSelectedTransRefs.value];
  if (selected.length === 0 || !isConnected.value) return;
  const pending = pendingEditTransRefs.value;
  const toApprove = selected.filter((ref) => !pending.has(ref));
  const skipped = selected.length - toApprove.length;
  if (toApprove.length === 0) {
    toast.error(
      skipped > 0
        ? "None of the selected entries can be approved. They have pending edit requests."
        : "No entries selected.",
    );
    return;
  }
  const listItems = filteredPostedListFiltered.value;
  const itemByRef = new Map(
    listItems.map((item) => [
      (item.fieldData?.TransRef ?? "").trim(),
      item,
    ]),
  );
  bulkApproving.value = true;
  const loadingOverlay = useLoadingOverlayStore();
  loadingOverlay.show("Approving…", "Please don't navigate away");
  let approved = 0;
  let failed = 0;
  const approvedBy = (userFullName.value || "").trim() || "Manager";
  try {
    for (const transRef of toApprove) {
      const item = itemByRef.get(transRef);
      if (!item?.recordId) {
        failed++;
        continue;
      }
      const { error: updateErr } = await updateRecord(
        LAYOUTS.PAYABLES_MAIN,
        item.recordId,
        {
          Approved: "Yes",
          ApprovedDate: formatDateOnlyForFileMaker(),
          ApprovedBy: approvedBy,
        },
      );
      if (updateErr) {
        toast.error(`Approve failed for ${transRef}: ${updateErr}`);
        failed++;
        continue;
      }
      const itemFd = item.fieldData as Record<string, unknown> | undefined;
      const amount = (itemFd?.Total ?? itemFd?.["Total"]) as
        | string
        | number
        | null
        | undefined;
      const activityErr = await writeActivityLog(
        createRecord,
        transRef,
        "Approved",
        approvedBy,
        undefined,
        amount,
      );
      if (activityErr) {
        toast.error(`Approved ${transRef} but activity log failed: ${activityErr}`);
      }
      if (documentSettings.approvalEmailToOfficerEnabled) {
        const postedName =
          (itemFd?.PostedName ?? itemFd?.["Posted Name"] ?? "").toString().trim() || "";
        const vendorName =
          (itemFd?.VendorName ?? itemFd?.["Vendor Name"] ?? "").toString().trim() || "—";
        const { error: notifyErr } = await notifyApprovalToOfficer({
          transRef,
          postedName,
          approvedBy,
          vendorName,
        });
        if (notifyErr) {
          toast.info(`Approval notification for ${transRef} could not be sent: ${notifyErr}`);
        }
      }
      approved++;
    }
    clearPostedSelection();
    await load();
    if (skipped > 0) {
      toast.success(
        `Approved ${approved}. Skipped ${skipped} (officer requested to edit).`,
      );
    } else {
      toast.success(`Approved ${approved} ${approved === 1 ? "entry" : "entries"}.`);
    }
    if (failed > 0) {
      toast.error(`${failed} ${failed === 1 ? "entry" : "entries"} failed.`);
    }
  } finally {
    bulkApproving.value = false;
    loadingOverlay.hide();
  }
}

async function load() {
  if (!isConnected.value) {
    list.value = [];
    vendorCount.value = 0;
    vendorList.value = [];
    taxList.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  listSummary.setOverdueLoading(true);
  error.value = null;
  try {
    const [mainRes, vendorRes, taxRes] = await Promise.all([
      findRecordsWithIds<PayablesMainFieldData>(LAYOUTS.PAYABLES_MAIN, {
        limit: 500,
        sort: JSON.stringify([{ fieldName: "CreationTimestamp", sortOrder: "descend" }]),
      }),
      findRecordsWithIds<Record<string, unknown>>(LAYOUTS.VENDOR_TBL, {
        limit: 5000,
      }),
      findRecordsWithIds<TaxValueFieldData>(LAYOUTS.TAX_VALUE, { limit: 500 }),
    ]);
    if (mainRes.error) {
      toast.error(mainRes.error);
      error.value = null;
      list.value = [];
    } else {
      list.value = mainRes.data;
    }
    if (vendorRes.error) {
      toast.error(vendorRes.error);
      vendorCount.value = 0;
      vendorList.value = [];
    } else {
      vendorList.value = vendorRes.data;
      vendorCount.value = vendorRes.data.length;
    }
    if (taxRes.error) {
      taxList.value = [];
    } else {
      taxList.value = taxRes.data;
    }
  } finally {
    loading.value = false;
    listSummary.setOverdueLoading(false);
  }
}

let emptySlideInterval: ReturnType<typeof setInterval> | null = null;

function startEmptySlideInterval() {
  if (emptySlideInterval) return;
  emptySlideInterval = setInterval(() => {
    if (emptyStateHover.value) return;
    emptySlideIndex.value =
      (emptySlideIndex.value + 1) % emptySlides.length;
  }, 4500);
}

function stopEmptySlideInterval() {
  if (emptySlideInterval) {
    clearInterval(emptySlideInterval);
    emptySlideInterval = null;
  }
}

watch(
  () => list.value.length === 0 && isConnected.value,
  (showEmpty) => {
    if (showEmpty) {
      startEmptySlideInterval();
    } else {
      stopEmptySlideInterval();
    }
  },
  { immediate: true },
);

onUnmounted(stopEmptySlideInterval);

onMounted(load);
watch(isConnected, (connected) => {
  if (connected) load();
});
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  height: 500px;
  padding: 0;
  overflow: hidden;
  background: linear-gradient(
    165deg,
    rgba(30, 41, 59, 0.7) 0%,
    rgba(15, 23, 42, 0.85) 100%
  );
  border: 1px solid var(--color-border);
  border-radius: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
}

.empty-state__icon {
  margin-bottom: 1rem;
  color: var(--color-text-muted);
}

.empty-state__illustration {
  opacity: 0.8;
}

.empty-state__icon--connect {
  opacity: 0.6;
}

.empty-state__title {
  margin: 0 0 0.375rem;
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--color-text);
}

.empty-state__subtitle {
  margin: 0 0 1.25rem;
  max-width: 26rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-text-muted);
}

.empty-state__steps {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  padding: 0;
  list-style: none;
  text-align: left;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.empty-state__step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-accent);
  background: var(--color-accent-soft);
  border-radius: 50%;
  flex-shrink: 0;
}

.empty-state__carousel {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
  padding: 2rem 2rem 1rem;
}

.empty-state__slide {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 280px;
}

.empty-slide-enter-active,
.empty-slide-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}

.empty-slide-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.empty-slide-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}

.empty-state__footer {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 1rem 2rem 1.75rem;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.empty-state__dots {
  display: flex;
  gap: 0.5rem;
}

.empty-state__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(148, 163, 184, 0.4);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s, transform 0.2s;
}

.empty-state__dot:hover {
  background: rgba(148, 163, 184, 0.6);
}

.empty-state__dot--active {
  background: var(--color-accent);
  transform: scale(1.2);
}

.empty-state__tip-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  max-width: 22rem;
  text-align: left;
}

.empty-state__tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.empty-state__tip-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  font-size: 0.8125rem;
  padding: 0.2rem 0.4rem;
  border-radius: 6px;
}

.empty-state__tip-icon--badge {
  font-weight: 600;
  background: var(--color-accent-soft);
  color: var(--color-accent);
}

.empty-state__tip-icon:not(.empty-state__tip-icon--badge) {
  background: rgba(148, 163, 184, 0.15);
  font-size: 1rem;
}

.empty-state__cta {
  color: white !important;
}

.empty-state__cta svg {
  color: white;
}

.empty-state__hint {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  opacity: 0.9;
}

.empty-state--disconnected {
  padding: 2.5rem 1.5rem;
  justify-content: center;
}

.empty-state--disconnected .empty-state__hint {
  margin-top: 0.5rem;
}

html.theme-light .empty-state {
  background: linear-gradient(
    165deg,
    rgba(248, 250, 252, 0.95) 0%,
    rgba(241, 245, 249, 0.9) 100%
  );
  border-color: rgba(148, 163, 184, 0.35);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}

html.theme-light .empty-state__footer {
  border-top-color: rgba(148, 163, 184, 0.2);
}

html.theme-light .empty-state__cta {
  color: white !important;
}

html.theme-light .empty-state__cta:hover {
  background: rgb(234 88 12) !important;
  box-shadow: 0 6px 20px rgba(234, 88, 12, 0.35);
}

html.theme-light .empty-state__cta svg {
  color: white;
}
</style>
