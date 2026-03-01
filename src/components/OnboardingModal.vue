<template>
  <Teleport to="body">
    <Transition name="onboarding">
      <div
        v-if="visible"
        class="onboarding-overlay"
        role="dialog"
        aria-labelledby="onboarding-title"
        aria-describedby="onboarding-desc"
      >
        <div class="onboarding-backdrop" aria-hidden="true" />
        <div class="onboarding-card">
          <!-- Progress dots -->
          <div class="onboarding-progress" aria-hidden="true">
            <button
              v-for="(_, idx) in slides"
              :key="idx"
              type="button"
              class="onboarding-dot"
              :class="{ 'onboarding-dot--active': currentSlide === idx }"
              :aria-label="`Slide ${idx + 1} of ${slides.length}`"
              @click="goToSlide(idx)"
            />
          </div>

          <!-- Slide track -->
          <div class="onboarding-track">
            <Transition name="slide" mode="out-in">
              <div :key="currentSlide" class="onboarding-slide">
                <!-- Slide 0: Welcome -->
                <template v-if="currentSlide === 0">
                  <div class="onboarding-header">
                    <div class="onboarding-icon onboarding-icon--large" :class="iconBgClass">
                      <svg class="onboarding-icon__svg" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 id="onboarding-title" class="onboarding-title">Welcome to Payables</h2>
                    <p id="onboarding-desc" class="onboarding-subtitle">
                      Get started as a <span class="onboarding-role">{{ roleLabel }}</span>
                    </p>
                    <p class="onboarding-intro">
                      {{ roleIntro }}
                    </p>
                  </div>
                </template>

                <!-- Slide 1: Role capabilities -->
                <template v-else-if="currentSlide === 1">
                  <h3 class="onboarding-slide-title">What you can do</h3>
                  <ul class="onboarding-list" role="list">
                    <li v-for="(item, i) in roleTips" :key="i" class="onboarding-list-item">
                      <span class="onboarding-list-check" :class="iconBgClass" aria-hidden="true">
                        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span class="onboarding-list-text">{{ item }}</span>
                    </li>
                  </ul>
                  <p v-if="roleExtra" class="onboarding-extra">{{ roleExtra }}</p>
                </template>

                <!-- Slide 2: Global shortcuts -->
                <template v-else-if="currentSlide === 2">
                  <h3 class="onboarding-slide-title">Keyboard shortcuts</h3>
                  <p class="onboarding-slide-desc">Global shortcuts available anywhere</p>
                  <div class="onboarding-shortcuts">
                    <div v-for="row in globalShortcuts" :key="row.action" class="onboarding-shortcut-row">
                      <span class="onboarding-shortcut-action">{{ row.action }}</span>
                      <div class="onboarding-shortcut-keys">
                        <kbd v-for="key in row.keys" :key="key" class="onboarding-kbd">{{ key }}</kbd>
                      </div>
                    </div>
                  </div>
                </template>

                <!-- Slide 3: Entry & grid shortcuts -->
                <template v-else-if="currentSlide === 3">
                  <h3 class="onboarding-slide-title">Entry & data grid</h3>
                  <p class="onboarding-slide-desc">Shortcuts when editing entries</p>
                  <div class="onboarding-shortcuts">
                    <div v-for="row in entryShortcuts" :key="row.action" class="onboarding-shortcut-row">
                      <span class="onboarding-shortcut-action">{{ row.action }}</span>
                      <div class="onboarding-shortcut-keys">
                        <kbd v-for="key in row.keys" :key="key" class="onboarding-kbd">{{ key }}</kbd>
                      </div>
                    </div>
                    <div class="onboarding-shortcut-group-label">Data grid (arrows, Tab, Enter, Esc)</div>
                    <div v-for="row in gridShortcuts" :key="row.action" class="onboarding-shortcut-row">
                      <span class="onboarding-shortcut-action">{{ row.action }}</span>
                      <div class="onboarding-shortcut-keys">
                        <kbd v-for="key in row.keys" :key="key" class="onboarding-kbd">{{ key }}</kbd>
                      </div>
                    </div>
                  </div>
                  <p class="onboarding-hint-footer">Right-click in the grid for Copy, Paste, Cut, Clear.</p>
                </template>

                <!-- Slide 4: Get started -->
                <template v-else-if="currentSlide === 4">
                  <div class="onboarding-header onboarding-header--center">
                    <div class="onboarding-icon onboarding-icon--large" :class="iconBgClass">
                      <svg class="onboarding-icon__svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 class="onboarding-slide-title">You're all set</h3>
                    <p class="onboarding-subtitle">Press <kbd class="onboarding-kbd-inline">?</kbd> anytime for a quick shortcuts panel, or visit Settings → Keyboard shortcuts for the full reference.</p>
                  </div>
                </template>
              </div>
            </Transition>
          </div>

          <!-- Footer: Prev / Next / Get started -->
          <div class="onboarding-footer">
            <button
              v-if="currentSlide > 0"
              type="button"
              class="onboarding-btn onboarding-btn--secondary"
              @click="prevSlide"
            >
              Back
            </button>
            <div class="onboarding-footer-spacer" />
            <template v-if="currentSlide < slides.length - 1">
              <button
                type="button"
                class="onboarding-btn onboarding-btn--primary"
                @click="nextSlide"
              >
                Next
              </button>
            </template>
            <button
              v-else
              type="button"
              class="onboarding-btn onboarding-btn--primary"
              :disabled="saving"
              @click="onGotIt"
            >
              {{ saving ? 'Saving…' : 'Get started' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  visible: boolean
  saving: boolean
  role: string
}>()

const emit = defineEmits<{
  dismiss: []
}>()

const currentSlide = ref(0)
const slides = [0, 1, 2, 3, 4] // Welcome, Role, Global shortcuts, Entry/grid shortcuts, Get started

const isMac =
  typeof navigator !== 'undefined' &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform)
const modPlus = (key: string) => (isMac ? `⌘${key}` : `Ctrl+${key}`)

const roleLower = computed(() => (props.role ?? '').trim().toLowerCase())

const roleLabel = computed(() => {
  const r = roleLower.value
  if (r === 'admin') return 'Administrator'
  if (r === 'manager') return 'Manager'
  if (r === 'officer') return 'Officer'
  return 'user'
})

const roleIntro = computed(() => {
  const r = roleLower.value
  if (r === 'officer') return 'You create and post entries for manager approval. Use the data grid to add invoice lines and submit drafts or rejected entries for review.'
  if (r === 'manager') return 'You create entries, approve or reject posted ones, and use the booklet view to navigate between entries. Bulk approve from Home when needed.'
  if (r === 'admin') return 'You manage users, documents, and features. You can approve entries like a Manager and access activity logs for the full audit trail.'
  return 'Create entries, use ⌘K to search, and explore the app. Visit Settings for more options.'
})

const roleTips = computed(() => {
  const r = roleLower.value
  const tips: string[] = []
  if (r === 'officer') {
    tips.push('Create entries with vendor details and invoice rows in the data grid')
    tips.push('Post entries to submit for manager approval')
    tips.push('Edit and repost draft or rejected entries')
    tips.push('Use Tab, arrows, and Enter to move between cells when editing')
    tips.push('Request edits on posted entries (if enabled)')
  } else if (r === 'manager') {
    tips.push('Create and post entries (same as Officer)')
    tips.push('Approve or reject posted entries from Home or entry view')
    tips.push('Navigate entries in booklet view with ⌘← / ⌘→')
    tips.push('Bulk approve multiple entries from Home')
    tips.push('Return entries to draft for officer edits')
  } else if (r === 'admin') {
    tips.push('Manage users: add, edit, activate/deactivate, reset passwords')
    tips.push('Configure documents (when to show Download Invoice)')
    tips.push('Enable or disable features (command palette, booklet, etc.)')
    tips.push('Approve or reject entries (same as Manager)')
    tips.push('View activity logs and audit trail')
  } else {
    tips.push('Create and post entries')
    tips.push('Use ⌘K to search by TransRef or navigate quickly')
    tips.push('Press ? anytime for the shortcuts cheatsheet')
    tips.push('Explore Settings for full shortcuts reference and preferences')
  }
  return tips
})

const roleExtra = computed(() => {
  const r = roleLower.value
  if (r === 'officer') return 'Need changes after posting? Use "Request to edit" — a manager will review.'
  if (r === 'manager') return 'Use the booklet sidebar to select entries and jump between them with keyboard shortcuts.'
  if (r === 'admin') return 'Activity logs show who did what and when. Export to Excel for records.'
  return null
})

const iconBgClass = computed(() => {
  const r = roleLower.value
  if (r === 'admin') return 'onboarding-icon--admin'
  if (r === 'manager') return 'onboarding-icon--manager'
  if (r === 'officer') return 'onboarding-icon--officer'
  return 'onboarding-icon--default'
})

const globalShortcuts = computed(() => [
  { action: 'Command palette (search, TransRef, navigate)', keys: [modPlus('K')] },
  { action: 'Shortcuts cheatsheet (quick reference panel)', keys: ['?'] },
  { action: 'New entry', keys: [modPlus('N')] },
  { action: 'Previous entry in booklet', keys: [modPlus('←')] },
  { action: 'Next entry in booklet', keys: [modPlus('→')] },
])

const entryShortcuts = computed(() => [
  { action: 'Save', keys: [modPlus('S')] },
  { action: 'Save and Post / Repost', keys: [modPlus('P')] },
])

const gridShortcuts = computed(() => [
  { action: 'Move between cells', keys: ['↑', '↓', '←', '→'] },
  { action: 'Next / previous cell', keys: ['Tab', 'Shift+Tab'] },
  { action: 'Move down / commit', keys: ['Enter'] },
  { action: 'Cancel edit', keys: ['Escape'] },
])

function goToSlide(idx: number) {
  currentSlide.value = idx
}

function nextSlide() {
  if (currentSlide.value < slides.length - 1) {
    currentSlide.value++
  }
}

function prevSlide() {
  if (currentSlide.value > 0) {
    currentSlide.value--
  }
}

function onGotIt() {
  emit('dismiss')
}
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.onboarding-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 100% 80% at 50% 0%,
    rgba(59, 130, 246, 0.06) 0%,
    transparent 50%
  ),
  rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(28px);
  -webkit-backdrop-filter: blur(28px);
}

.onboarding-card {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 680px;
  min-height: 560px;
  padding: 2rem 2.5rem;
  background: rgba(30, 41, 59, 0.7);
  backdrop-filter: blur(48px);
  -webkit-backdrop-filter: blur(48px);
  border: 1px solid rgba(148, 163, 184, 0.12);
  border-radius: 28px;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05) inset,
    0 32px 64px -16px rgba(0, 0, 0, 0.5);
}

.onboarding-progress {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.onboarding-dot {
  width: 8px;
  height: 8px;
  padding: 0;
  background: rgba(148, 163, 184, 0.3);
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.25s ease, transform 0.2s ease;
}

.onboarding-dot:hover {
  background: rgba(148, 163, 184, 0.5);
}

.onboarding-dot--active {
  background: var(--color-accent);
  transform: scale(1.25);
}

.onboarding-track {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.onboarding-slides {
  position: relative;
  height: 100%;
}

.onboarding-slide {
  min-height: 340px;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.onboarding-header--center {
  margin-top: 1rem;
}

.onboarding-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.3);
}

.onboarding-icon--large {
  width: 64px;
  height: 64px;
  border-radius: 18px;
}

.onboarding-icon__svg {
  width: 28px;
  height: 28px;
}

.onboarding-icon--large .onboarding-icon__svg {
  width: 32px;
  height: 32px;
}

.onboarding-icon--admin {
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.28) 0%, rgba(245, 158, 11, 0.16) 100%);
  color: rgb(253, 224, 71);
}

.onboarding-icon--manager {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.28) 0%, rgba(37, 99, 235, 0.16) 100%);
  color: rgb(96, 165, 250);
}

.onboarding-icon--officer {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.16) 100%);
  color: rgb(52, 211, 153);
}

.onboarding-icon--default {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.28) 0%, rgba(37, 99, 235, 0.16) 100%);
  color: rgb(96, 165, 250);
}

.onboarding-title {
  margin: 0 0 0.25rem;
  font-size: 1.625rem;
  font-weight: 600;
  letter-spacing: -0.03em;
  line-height: 1.2;
  color: var(--color-text);
}

.onboarding-subtitle {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: var(--color-text-muted);
}

.onboarding-role {
  font-weight: 600;
  color: var(--color-text);
}

.onboarding-intro {
  margin: 0;
  max-width: 480px;
  margin-left: auto;
  margin-right: auto;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-text-muted);
}

.onboarding-slide-title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.onboarding-slide-desc {
  margin: 0 0 1rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.onboarding-list {
  margin: 0 0 1rem;
  padding: 0;
  list-style: none;
}

.onboarding-list-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  margin-bottom: 0.375rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  transition: background 0.2s ease;
}

.onboarding-list-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.onboarding-list-check {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin-top: 0.1rem;
  border-radius: 6px;
}

.onboarding-list-text {
  font-size: 0.9375rem;
  line-height: 1.45;
  color: var(--color-text-muted);
}

.onboarding-extra {
  margin: 0;
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--color-text-muted);
  background: rgba(59, 130, 246, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(59, 130, 246, 0.15);
}

.onboarding-shortcuts {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1rem;
}

.onboarding-shortcut-group-label {
  margin-top: 0.75rem;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
}

.onboarding-shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 10px;
}

.onboarding-shortcut-action {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.onboarding-shortcut-keys {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.onboarding-kbd {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 6px;
}

.onboarding-kbd-inline {
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.375rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 4px;
}

.onboarding-hint-footer {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.onboarding-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: auto;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(148, 163, 184, 0.08);
}

.onboarding-footer-spacer {
  flex: 1;
}

.onboarding-btn {
  min-width: 100px;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.onboarding-btn--primary {
  color: white;
  background: linear-gradient(180deg, #3b82f6 0%, #2563eb 100%);
  box-shadow: 0 2px 10px -2px rgba(59, 130, 246, 0.5);
}

.onboarding-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px -2px rgba(59, 130, 246, 0.5);
}

.onboarding-btn--secondary {
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(148, 163, 184, 0.15);
}

.onboarding-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.09);
  color: var(--color-text);
}

.onboarding-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.onboarding-list-check.onboarding-icon--admin { background: rgba(251, 191, 36, 0.2); color: rgb(253, 224, 71); }
.onboarding-list-check.onboarding-icon--manager { background: rgba(59, 130, 246, 0.2); color: rgb(96, 165, 250); }
.onboarding-list-check.onboarding-icon--officer { background: rgba(16, 185, 129, 0.2); color: rgb(52, 211, 153); }
.onboarding-list-check.onboarding-icon--default { background: rgba(59, 130, 246, 0.2); color: rgb(96, 165, 250); }

/* Slide transitions */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(32px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-32px);
}

/* Overlay transition */
.onboarding-enter-active,
.onboarding-leave-active {
  transition: opacity 0.3s ease;
}

.onboarding-enter-active .onboarding-card,
.onboarding-leave-active .onboarding-card {
  transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.onboarding-enter-from,
.onboarding-leave-to {
  opacity: 0;
}

.onboarding-enter-from .onboarding-card,
.onboarding-leave-to .onboarding-card {
  transform: scale(0.94);
  opacity: 0;
}
</style>
