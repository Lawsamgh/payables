<template>
  <div class="payables-chart flex flex-col items-center gap-3">
    <div class="relative" :style="{ width: size + 'px', height: size + 'px' }">
      <svg
        :width="size"
        :height="size"
        viewBox="0 0 100 100"
        class="payables-chart__svg"
        aria-hidden="true"
      >
        <!-- Background ring -->
        <circle
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          stroke="rgba(148, 163, 184, 0.12)"
          :stroke-width="strokeWidth"
        />
        <!-- Draft segment -->
        <circle
          v-if="draftCount + postedCount > 0"
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          stroke="var(--chart-draft)"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          class="payables-chart__segment payables-chart__segment--draft"
          :style="draftSegmentStyle"
        />
        <!-- Posted segment -->
        <circle
          v-if="postedCount > 0"
          cx="50"
          cy="50"
          :r="radius"
          fill="none"
          stroke="var(--chart-posted)"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          class="payables-chart__segment payables-chart__segment--posted"
          :style="postedSegmentStyle"
        />
      </svg>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-4 text-[var(--label-size)]">
      <div class="flex items-center gap-2">
        <span
          class="h-2.5 w-2.5 rounded-full shrink-0"
          style="background: var(--chart-draft)"
        />
        <span class="text-[var(--color-text-muted)]">Draft</span>
        <span class="font-semibold text-[var(--color-text)]">{{ draftCount }}</span>
      </div>
      <div class="flex items-center gap-2">
        <span
          class="h-2.5 w-2.5 rounded-full shrink-0"
          style="background: var(--chart-posted)"
        />
        <span class="text-[var(--color-text-muted)]">Posted</span>
        <span class="font-semibold text-[var(--color-text)]">{{ postedCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    draftCount: number
    postedCount: number
    size?: number
  }>(),
  { size: 120 }
)

const radius = 42
const strokeWidth = 10
const circumference = 2 * Math.PI * radius

const total = computed(() => props.draftCount + props.postedCount)

const draftFraction = computed(() =>
  total.value > 0 ? props.draftCount / total.value : 0
)
const postedFraction = computed(() =>
  total.value > 0 ? props.postedCount / total.value : 0
)

const draftDashArray = computed(() => {
  const length = draftFraction.value * circumference
  return `${length} ${circumference - length}`
})

const draftSegmentStyle = computed(() => ({
  strokeDasharray: draftDashArray.value,
  strokeDashoffset: -circumference * 0.25,
}))

const postedSegmentStyle = computed(() => {
  const length = postedFraction.value * circumference
  const offset = -circumference * 0.25 + draftFraction.value * circumference
  return {
    strokeDasharray: `${length} ${circumference - length}`,
    strokeDashoffset: offset,
  }
})
</script>

<style scoped>
.payables-chart {
  --chart-draft: rgba(251, 146, 60, 0.9);
  --chart-posted: rgba(52, 211, 153, 0.9);
}

.payables-chart__svg {
  transform: rotate(-90deg);
}

.payables-chart__segment {
  transition: stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
