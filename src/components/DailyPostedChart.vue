<template>
  <div class="daily-posted-chart">
    <header class="daily-posted-chart__header">
      <div class="daily-posted-chart__title-row">
        <h3 class="daily-posted-chart__title">{{ chartTitle }}</h3>
      </div>
      <p
        v-if="totalAmount === 0 && chartData.length === 0"
        class="daily-posted-chart__subtitle daily-posted-chart__subtitle--muted"
      >
        {{ isVendorMode ? `No vendors ${chartTypeLabel} today` : `No ${chartTypeLabel} amounts to show` }}
      </p>
      <p v-else-if="chartData.length > 0" class="daily-posted-chart__subtitle">
        {{ chartData.length }} {{ isVendorMode ? "vendor" : "day" }}{{ chartData.length === 1 ? "" : "s" }}{{ isVendorMode ? ` ${chartTypeLabel} today` : " with activity" }}
      </p>
    </header>
    <div
      v-if="chartData.length > 0"
      class="daily-posted-chart__wrap"
      ref="chartWrapRef"
    >
      <div class="daily-posted-chart__scroll" :style="chartScrollStyle">
        <svg
          class="daily-posted-chart__svg"
          :viewBox="`0 0 ${width} ${height}`"
          preserveAspectRatio="xMinYMid meet"
          aria-hidden="true"
        >
          <defs>
            <linearGradient
              id="daily-posted-bar-fill"
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0%" stop-color="rgba(52, 211, 153, 0.5)" />
              <stop offset="100%" stop-color="rgba(134, 239, 172, 0.92)" />
            </linearGradient>
            <linearGradient
              id="daily-posted-bar-fill-hover"
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0%" stop-color="rgba(52, 211, 153, 0.65)" />
              <stop offset="100%" stop-color="rgba(167, 243, 208, 1)" />
            </linearGradient>
            <linearGradient
              id="daily-posted-bar-other"
              x1="0"
              y1="1"
              x2="0"
              y2="0"
            >
              <stop offset="0%" stop-color="rgba(251, 191, 36, 0.5)" />
              <stop offset="100%" stop-color="rgba(253, 224, 71, 0.9)" />
            </linearGradient>
          </defs>
          <!-- Grid -->
          <g class="daily-posted-chart__grid">
            <line
              v-for="(tick, i) in yTicks"
              :key="'grid-' + i"
              :x1="padding.left"
              :y1="yScale(tick)"
              :x2="plotRight"
              :y2="yScale(tick)"
              class="daily-posted-chart__grid-line"
            />
          </g>
          <!-- Apple-style bars (rounded top) -->
          <g class="daily-posted-chart__bars">
            <path
              v-for="(d, i) in chartData"
              :key="barKey(d, i)"
              :d="barPath(d, i)"
              class="daily-posted-chart__bar"
              :class="{
                'daily-posted-chart__bar--hover': hoverIndex === i,
                'daily-posted-chart__bar--other': hasOtherCurrencyOnly(d),
              }"
              :style="{ animationDelay: `${i * 0.03}s` }"
              :fill="hasOtherCurrencyOnly(d) ? 'url(#daily-posted-bar-other)' : 'url(#daily-posted-bar-fill)'"
              @mouseenter="hoverIndex = i"
              @mouseleave="hoverIndex = -1"
            />
          </g>
          <!-- Y-axis labels -->
          <g class="daily-posted-chart__axis">
            <text
              v-for="(tick, i) in yTicks"
              :key="'y-' + i"
              :x="padding.left - 6"
              :y="yScale(tick) + 3"
              class="daily-posted-chart__axis-text"
              text-anchor="end"
            >
              {{ formatAxisLabel(tick) }}
            </text>
          </g>
          <!-- X-axis labels -->
          <g class="daily-posted-chart__axis daily-posted-chart__axis--x">
            <text
              v-for="(d, i) in chartData"
              :key="'x-' + barKey(d, i)"
              :x="barCenterX(i)"
              :y="height - padding.bottom + 10"
              class="daily-posted-chart__axis-text daily-posted-chart__axis-text--x"
              text-anchor="middle"
            >
              {{ getXAxisLabel(d) }}
            </text>
          </g>
        </svg>
      </div>
      <Transition name="daily-posted-tooltip">
        <div
          v-if="hoverIndex >= 0 && chartData[hoverIndex]"
          class="daily-posted-chart__tooltip"
          :style="tooltipStyle"
        >
          <span class="daily-posted-chart__tooltip-date">{{
            isVendorMode ? (chartData[hoverIndex].label ?? chartData[hoverIndex].date) : formatDateFull(chartData[hoverIndex].date)
          }}</span>
          <span class="daily-posted-chart__tooltip-value">
            {{ formatTooltipValue(chartData[hoverIndex]) }}
          </span>
        </div>
      </Transition>
    </div>
    <div v-else class="daily-posted-chart__empty">
      <div class="daily-posted-chart__empty-icon" aria-hidden="true">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 3v18h18" />
          <path d="M7 16v-5h4v5" />
          <path d="M13 16V9h4v7" />
        </svg>
      </div>
      <p class="daily-posted-chart__empty-text">
        No {{ chartTypeLabel }} entries with dates yet
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { formatNumberDisplay } from "../utils/formatNumber";

export interface DailyTotal {
  date: string;
  total: number;
  /** Optional label for x-axis (e.g. vendor name); when set, used instead of formatted date. */
  label?: string;
  /** Per-currency totals (for tooltip and "other currency" bar). */
  totalsByCurrency?: Record<string, number>;
}

const props = withDefaults(
  defineProps<{
    data: DailyTotal[];
    currency?: string;
    /** When set, shown in header instead of currency + total (e.g. "GHS 1,064.65 · USD 2,500.00"). */
    totalLabel?: string;
    /** 'date' = x-axis shows dates; 'vendor' = x-axis shows vendor names (label). */
    xAxisMode?: "date" | "vendor";
    /** Optional label for selected date (e.g. "Feb 9, 2025" or "Today") for chart title. */
    dateLabel?: string;
    /** 'posted' or 'approved' – affects chart title and empty state text. */
    chartType?: "posted" | "approved";
    chartWidth?: number;
    chartHeight?: number;
  }>(),
  {
    currency: "GHS",
    xAxisMode: "date",
    chartType: "posted",
    chartWidth: 360,
    chartHeight: 60,
  },
);

const isVendorMode = computed(() => props.xAxisMode === "vendor");

const typeLabel = computed(() => (props.chartType === "approved" ? "Approved" : "Posted"));
const chartTypeLabel = computed(() => typeLabel.value.toLowerCase());
const chartTitle = computed(() => {
  if (!isVendorMode.value) return `${typeLabel.value} by day`;
  const label = props.dateLabel?.trim();
  if (label && label.toLowerCase() !== "today") return `${typeLabel.value} on ${label} by vendor`;
  return `${typeLabel.value} today by vendor`;
});

const showTotalInHeader = computed(
  () =>
    totalAmount.value > 0 ||
    (props.totalLabel && props.totalLabel.length > 0),
);

/** Primary total line (first currency) – shown large. */
const primaryTotalLabel = computed(() => {
  const label = props.totalLabel ?? `${props.currency} ${formatNumberDisplay(totalAmount.value)}`;
  const parts = label.split(/\s*·\s*/).map((s) => s.trim()).filter(Boolean);
  return parts[0] ?? label;
});

/** Secondary total lines (other currencies) – shown below in smaller text. */
const secondaryTotalLabels = computed(() => {
  const label = props.totalLabel ?? "";
  if (!label) return [];
  const parts = label.split(/\s*·\s*/).map((s) => s.trim()).filter(Boolean);
  return parts.slice(1);
});

const chartWrapRef = ref<HTMLElement | null>(null);
const hoverIndex = ref(-1);

const height = computed(() => props.chartHeight);
const baseWidth = computed(() => props.chartWidth);

const padding = { top: 4, right: 8, bottom: 20, left: 36 };
const barGap = 6;
const barRadius = 6;
const minBarWidth = 24;

/** Chart width grows with more days so bars never get tiny; minimum bar width enforced. */
const width = computed(() => {
  const n = chartData.value.length;
  if (n === 0) return baseWidth.value;
  const plotArea = baseWidth.value - padding.left - padding.right;
  const needed = n * minBarWidth + (n - 1) * barGap;
  return needed > plotArea
    ? padding.left + padding.right + needed
    : baseWidth.value;
});

const plotRight = computed(() => width.value - padding.right);
const plotBottom = computed(() => height.value - padding.bottom);

const chartData = computed(() => {
  if (props.xAxisMode === "vendor") {
    return props.data.slice(0, 10);
  }
  const sorted = props.data
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  return sorted.slice(-7);
});

const maxTotal = computed(() => {
  if (chartData.value.length === 0) return 0;
  const values = chartData.value.map((d) => Number(d.total)).filter((n) => Number.isFinite(n) && n >= 0);
  if (values.length === 0) return 0;
  const maxVal = Math.max(...values);
  return maxVal > 0 ? maxVal : 0;
});

const totalAmount = computed(() =>
  chartData.value.reduce((sum, d) => sum + d.total, 0),
);

const yTicks = computed(() => {
  const max = maxTotal.value;
  if (max <= 0) return [0];
  const step =
    max <= 5
      ? 1
      : max <= 20
        ? 5
        : max <= 100
          ? 20
          : max <= 500
            ? 100
            : Math.ceil(max / 5 / 100) * 100;
  const ticks: number[] = [];
  for (let v = 0; v <= max; v += step) ticks.push(v);
  if (ticks[ticks.length - 1] < max) ticks.push(max);
  return ticks;
});

function yScale(v: number): number {
  if (maxTotal.value <= 0) return plotBottom.value;
  const range = plotBottom.value - padding.top;
  return plotBottom.value - (v / maxTotal.value) * range;
}

const barWidth = computed(() => {
  const n = chartData.value.length;
  if (n === 0) return 0;
  const available = plotRight.value - padding.left - (n - 1) * barGap;
  return Math.max(minBarWidth, available / n);
});

function barCenterX(i: number): number {
  const n = chartData.value.length;
  if (n === 0) return 0;
  const totalW = n * barWidth.value + (n - 1) * barGap;
  const startX = padding.left + (plotRight.value - padding.left - totalW) / 2;
  return startX + barWidth.value / 2 + i * (barWidth.value + barGap);
}

/** Whether this day has activity only in non-primary currency (show small indicator bar). */
function hasOtherCurrencyOnly(d: DailyTotal): boolean {
  if (d.total > 0) return false;
  const byCur = d.totalsByCurrency;
  if (!byCur) return false;
  return Object.values(byCur).some((v) => v > 0);
}

/** Apple-style bar: rounded top corners, flat bottom. When primary total is 0 but other currency has amount, draw a small bar. */
function barPath(d: DailyTotal, i: number): string {
  const x = barCenterX(i) - barWidth.value / 2;
  let barH =
    maxTotal.value > 0
      ? (d.total / maxTotal.value) * (plotBottom.value - padding.top)
      : 0;
  if (barH < 0.5 && hasOtherCurrencyOnly(d)) {
    barH = Math.min(10, (plotBottom.value - padding.top) * 0.2);
  }
  const y = plotBottom.value - barH;
  if (barH < 0.5) return "";
  const r = Math.min(barRadius, barWidth.value / 2, barH / 2);
  const w = barWidth.value;
  return `M ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${plotBottom.value} L ${x} ${plotBottom.value} Z`;
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + "M";
  if (value >= 1_000) return (value / 1_000).toFixed(1) + "k";
  return String(Math.round(value));
}

function formatAxisLabel(value: number): string {
  if (maxTotal.value <= 100 && value === Math.round(value))
    return String(value);
  return formatCompact(value);
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return dateStr;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}`;
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Tooltip: show all currencies for this day (e.g. "GHS 0 · USD 2,500.00"). */
function formatTooltipValue(d: DailyTotal): string {
  const byCur = d.totalsByCurrency;
  if (byCur && Object.keys(byCur).length > 0) {
    return Object.entries(byCur)
      .map(([cur, val]) => `${cur} ${formatNumberDisplay(val)}`)
      .join(" · ");
  }
  return `${props.currency} ${formatNumberDisplay(d.total)}`;
}

function barKey(d: DailyTotal, i: number): string {
  return d.label ?? d.date ?? `i-${i}`;
}

/** X-axis label: vendor name (truncated) or formatted date. */
function getXAxisLabel(d: DailyTotal): string {
  const raw = d.label ?? formatDateLabel(d.date);
  if (props.xAxisMode === "vendor" && raw.length > 12) {
    return raw.slice(0, 10) + "…";
  }
  return raw;
}

/** Inner scroll width: when chart is wider than base, use % so it overflows and scrolls. */
const chartScrollStyle = computed(() => {
  if (width.value <= baseWidth.value) return {};
  return { width: `${(width.value / baseWidth.value) * 100}%` };
});

const tooltipStyle = computed(() => {
  if (hoverIndex.value < 0 || !chartWrapRef.value) return {};
  const el = chartWrapRef.value;
  const rect = el.getBoundingClientRect();
  const x = barCenterX(hoverIndex.value);
  const contentWidthPx = (width.value / baseWidth.value) * rect.width;
  const scaleX = contentWidthPx / width.value;
  const centerPx = x * scaleX - el.scrollLeft;
  const tooltipW = 110;
  let leftPx = centerPx - tooltipW / 2;
  leftPx = Math.max(6, Math.min(leftPx, rect.width - tooltipW - 6));
  return { left: `${leftPx}px`, top: "4px" };
});
</script>

<style scoped>
.daily-posted-chart__header {
  margin-bottom: 0.5rem;
}

.daily-posted-chart__title-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.125rem;
}

.daily-posted-chart__title {
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0;
}

.daily-posted-chart__totals {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.125rem;
}

.daily-posted-chart__total {
  font-size: 1.125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin: 0;
  font-variant-numeric: tabular-nums;
}

.daily-posted-chart__total-secondary {
  font-size: 1.125rem;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.daily-posted-chart__subtitle {
  font-size: 0.6875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.daily-posted-chart__subtitle--muted {
  font-style: italic;
}

.daily-posted-chart__wrap {
  position: relative;
  width: 100%;
  max-width: 100%;
  aspect-ratio: 360 / 60;
  min-height: 60px;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.45) 0%,
    rgba(15, 23, 42, 0.3) 100%
  );
  border: 1px solid rgba(148, 163, 184, 0.1);
  padding: 0.375rem;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
  overflow-x: auto;
  overflow-y: hidden;
}

.daily-posted-chart__scroll {
  min-width: 100%;
  height: 100%;
}

.daily-posted-chart__svg {
  width: 100%;
  height: 100%;
  display: block;
  min-height: 60px;
}

.daily-posted-chart__grid-line {
  stroke: rgba(148, 163, 184, 0.06);
  stroke-width: 1;
}

.daily-posted-chart__axis-text {
  font-size: 4px;
  font-weight: 500;
  fill: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.daily-posted-chart__axis-text--x {
  font-size: 4px;
  font-weight: 500;
}

.daily-posted-chart__bar {
  cursor: pointer;
  animation: daily-posted-bar-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  opacity: 0;
  transition:
    fill 0.2s ease,
    opacity 0.2s ease;
}

.daily-posted-chart__bar:hover,
.daily-posted-chart__bar--hover {
  fill: url(#daily-posted-bar-fill-hover);
}

.daily-posted-chart__bar--other:hover,
.daily-posted-chart__bar--other.daily-posted-chart__bar--hover {
  fill: url(#daily-posted-bar-other);
}

@keyframes daily-posted-bar-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.daily-posted-chart__tooltip {
  position: absolute;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.15);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(10px);
}

.daily-posted-chart__tooltip-date {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.daily-posted-chart__tooltip-value {
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.daily-posted-chart__empty {
  min-height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 12px;
  background: linear-gradient(
    180deg,
    rgba(15, 23, 42, 0.35) 0%,
    rgba(15, 23, 42, 0.2) 100%
  );
  border: 1px dashed rgba(148, 163, 184, 0.18);
  padding: 1rem;
}

.daily-posted-chart__empty-icon {
  color: var(--color-text-muted);
  opacity: 0.4;
}

.daily-posted-chart__empty-text {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  margin: 0;
}

.daily-posted-tooltip-enter-active,
.daily-posted-tooltip-leave-active {
  transition:
    opacity 0.12s ease,
    transform 0.12s ease;
}
.daily-posted-tooltip-enter-from,
.daily-posted-tooltip-leave-to {
  opacity: 0;
  transform: translateY(-2px);
}
</style>
