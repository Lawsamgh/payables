<template>
  <Teleport to="body">
    <Transition name="right-sidebar-modal">
      <div
        v-if="visible"
        class="right-sidebar-modal-backdrop"
        role="dialog"
        :aria-labelledby="titleId"
        aria-modal="true"
        @click.self="close"
      >
        <aside
          class="right-sidebar-modal-panel"
          :style="{ width: panelWidth }"
        >
          <header class="right-sidebar-modal__header">
            <h2 :id="titleId" class="right-sidebar-modal__title">{{ title }}</h2>
            <button
              type="button"
              class="right-sidebar-modal__close"
              aria-label="Close"
              @click="close"
            >
              <svg
                class="right-sidebar-modal__close-icon"
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
          <div
            class="right-sidebar-modal__body"
            :class="props.contentClass"
          >
            <slot />
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title: string;
    width?: string;
    contentClass?: string;
  }>(),
  { width: "50vw", contentClass: "" },
);

const emit = defineEmits<{ close: [] }>();

const titleId = computed(
  () => "right-sidebar-modal-title-" + props.title.replace(/\s+/g, "-").toLowerCase(),
);

const panelWidth = computed(() => props.width);

function close() {
  emit("close");
}
</script>

<style scoped>
.right-sidebar-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 250;
  display: flex;
  justify-content: flex-end;
  background: rgba(15, 23, 42, 0.6);
}

.right-sidebar-modal-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgb(30, 41, 59);
  border-left: 1px solid var(--color-border);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.right-sidebar-modal__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: rgb(30, 41, 59);
}

.right-sidebar-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.right-sidebar-modal__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}

.right-sidebar-modal__close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.right-sidebar-modal__close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.right-sidebar-modal__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem 1.25rem;
}

/* Peek sidebar: no top padding so sticky block sits flush under header, no gap */
.right-sidebar-modal__body.right-sidebar-modal--tax,
.right-sidebar-modal__body.right-sidebar-modal--vendors {
  padding-top: 0;
}

/* Sticky header (hint + search bar) when scrolling in peek sidebar */
.right-sidebar-modal__body :deep(.peek-sidebar-sticky) {
  position: sticky;
  top: 0;
  z-index: 10;
  background: rgb(30, 41, 59);
  padding-top: 1rem;
  padding-bottom: 0.5rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
  margin-left: -1.25rem;
  margin-right: -1.25rem;
  padding-left: 1.25rem;
  padding-right: 1.25rem;
  border-bottom: 1px solid var(--color-border);
}

/* Vendors peek modal: remove separator lines outside vendor cards. */
.right-sidebar-modal--tax :deep(.peek-sidebar-sticky),
.right-sidebar-modal--vendors :deep(.peek-sidebar-sticky) {
  border-bottom: none;
}

.right-sidebar-modal--tax :deep(.logs-table-wrap),
.right-sidebar-modal--vendors :deep(.logs-table-wrap) {
  background: transparent;
  border: none;
  box-shadow: none;
}

.right-sidebar-modal__body :deep(.tax-search-bar) {
  margin-bottom: 0;
}
.right-sidebar-modal__body :deep(.logs-table thead th) {
  top: 5.5rem;
}
.right-sidebar-modal--tax :deep(.logs-table thead th) {
  top: 6.5rem;
}
.right-sidebar-modal__body :deep(.logs-table-wrap) {
  flex: 0 0 auto;
  min-height: fit-content;
}
.right-sidebar-modal__body :deep(.logs-table-body) {
  flex: 0 0 auto;
  min-height: fit-content;
}
.right-sidebar-modal__body :deep(.logs-table-scroll),
.right-sidebar-modal__body :deep(.tax-table-scroll) {
  flex: 0 0 auto;
  min-height: fit-content;
  overflow-y: visible;
  overflow-x: auto;
}

/* Tax/Vendors sidebar – card layout, full-width content */
.right-sidebar-modal--tax .content-area,
.right-sidebar-modal--tax .logs-table-wrap,
.right-sidebar-modal--vendors .content-area,
.right-sidebar-modal--vendors .logs-table-wrap {
  width: 100%;
}
.right-sidebar-modal--tax .tax-search-bar__row,
.right-sidebar-modal--vendors .tax-search-bar__row {
  flex-direction: column;
  align-items: stretch;
}
.right-sidebar-modal--tax .tax-search-bar__search,
.right-sidebar-modal--vendors .tax-search-bar__search {
  max-width: none;
}
.right-sidebar-modal--tax .logs-table-wrap,
.right-sidebar-modal--vendors .logs-table-wrap {
  border-radius: 10px;
}

/* Peek cards: subtle spacing in sidebar */
.right-sidebar-modal--tax .peek-cards,
.right-sidebar-modal--vendors .peek-cards {
  padding-top: 0.5rem;
}

/* Transition: backdrop fade + panel slide from right */
.right-sidebar-modal-enter-active,
.right-sidebar-modal-leave-active {
  transition: opacity 0.25s ease;
}

.right-sidebar-modal-enter-active .right-sidebar-modal-panel,
.right-sidebar-modal-leave-active .right-sidebar-modal-panel {
  transition: transform 0.25s ease;
}

.right-sidebar-modal-enter-from,
.right-sidebar-modal-leave-to {
  opacity: 0;
}

.right-sidebar-modal-enter-from .right-sidebar-modal-panel,
.right-sidebar-modal-leave-to .right-sidebar-modal-panel {
  transform: translateX(100%);
}
</style>
