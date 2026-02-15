<template>
  <span
    class="skeleton inline-block"
    :class="[
      circle ? 'skeleton--circle' : '',
      $attrs.class,
    ]"
    :style="skeletonStyle"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Width: CSS value (e.g. '100%', '12rem') or number (px). */
    width?: string | number
    /** Height: CSS value or number (px). */
    height?: string | number
    /** Round shape (e.g. for avatars). */
    circle?: boolean
  }>(),
  {
    width: undefined,
    height: undefined,
    circle: false,
  }
)

const skeletonStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width != null) {
    style.width = typeof props.width === 'number' ? `${props.width}px` : props.width
  }
  if (props.height != null) {
    style.height = typeof props.height === 'number' ? `${props.height}px` : props.height
  }
  return style
})
</script>
