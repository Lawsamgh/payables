<template>
  <Teleport to="body">
    <Transition name="peek-modal">
      <div
        v-if="visible"
        class="peek-modal-backdrop tax-modal-backdrop"
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
        @click.self="close"
      >
        <div class="peek-modal tax-modal">
          <header class="tax-modal__header">
            <h2 :id="titleId" class="tax-modal__title">{{ title }}</h2>
            <button
              type="button"
              class="tax-modal__close"
              aria-label="Close"
              @click="close"
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
          <div class="peek-modal__body">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  visible: boolean;
  title: string;
}>();

const emit = defineEmits<{ close: [] }>();

const titleId = computed(() => "peek-modal-title-" + props.title.replace(/\s+/g, "-").toLowerCase());

function close() {
  emit("close");
}
</script>

<style scoped>
.peek-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.peek-modal {
  width: 100%;
  max-width: min(56rem, calc(100vw - 2rem));
  max-height: calc(100vh - 2rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.peek-modal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 1.5rem 1.5rem;
}

/* Transition */
.peek-modal-enter-active,
.peek-modal-leave-active {
  transition: opacity 0.2s ease;
}

.peek-modal-enter-active .peek-modal,
.peek-modal-leave-active .peek-modal {
  transition: transform 0.2s ease;
}

.peek-modal-enter-from,
.peek-modal-leave-to {
  opacity: 0;
}

.peek-modal-enter-from .peek-modal,
.peek-modal-leave-to .peek-modal {
  transform: scale(0.97) translateY(-8px);
}
</style>
