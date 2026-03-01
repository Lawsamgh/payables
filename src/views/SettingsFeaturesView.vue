<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="mb-10">
      <router-link
        to="/settings"
        class="inline-flex items-center gap-2 text-[var(--label-size)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] mb-4 no-underline"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Settings
      </router-link>
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        Features
      </h1>
      <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
        Enable or disable features for your organisation.
      </p>
    </header>

    <section class="feature-options w-full">
      <p class="feature-options__label">Feature toggles</p>
      <div class="feature-options__grid">
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.bulkApproveEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Bulk approve</span>
            <span class="feature-option__desc">Allow managers to select and approve multiple Posted entries</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.bulkApproveEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.BulkApprove"
              @change="onFeatureFlagChange('BulkApprove', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.managerEditDraftEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Manager edit Draft</span>
            <span class="feature-option__desc">Allow managers to edit Draft and Rejected entries</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.managerEditDraftEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.ManagerEditDraft"
              @change="onFeatureFlagChange('ManagerEditDraft', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.sessionTimeoutWarningEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Session timeout warning</span>
            <span class="feature-option__desc">Show a pre-expiry warning with &quot;Stay signed in&quot; option</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.sessionTimeoutWarningEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.SessionTimeoutWarning"
              @change="onFeatureFlagChange('SessionTimeoutWarning', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.editRequestEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Edit request</span>
            <span class="feature-option__desc">Allow officers to request edits on posted entries (mistake posted)</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.editRequestEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.EditRequestEnabled"
              @change="onFeatureFlagChange('EditRequestEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.onboardingEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Onboarding</span>
            <span class="feature-option__desc">Show welcome onboarding modal for new users</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.onboardingEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.OnboardingEnabled"
              @change="onFeatureFlagChange('OnboardingEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.approvalEmailToOfficerEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Approval email to officer</span>
            <span class="feature-option__desc">Email poster + CC other officers when entry is approved</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.approvalEmailToOfficerEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.ApprovalEmailToOfficer"
              @change="onFeatureFlagChange('ApprovalEmailToOfficer', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option feature-option--number"
          :class="{ 'feature-option--enabled': documentSettings.overdueDays > 0 }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Overdue days</span>
            <span class="feature-option__desc">Days threshold for Posted entries to be marked overdue (1–365)</span>
            <input
              v-model.number="overdueDaysInput"
              type="number"
              min="1"
              max="365"
              class="glass-input mt-3 w-24 px-3 py-2 text-[var(--label-size)]"
              :disabled="savingOverdueDays"
              @blur="onOverdueDaysBlur"
            />
          </span>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.overdueIndicatorEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Overdue indicator</span>
            <span class="feature-option__desc">Show overdue badges, filter, and modal for Posted entries</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.overdueIndicatorEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.OverdueIndicatorEnabled"
              @change="onFeatureFlagChange('OverdueIndicatorEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.commandPaletteEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Command palette</span>
            <span class="feature-option__desc">Enable ⌘K / Ctrl+K search and quick navigation</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.commandPaletteEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.CommandPaletteEnabled"
              @change="onFeatureFlagChange('CommandPaletteEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.bookletEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Booklet</span>
            <span class="feature-option__desc">Enable multi-entry flip view (Draft selection, Rejected booklet)</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.bookletEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.BookletEnabled"
              @change="onFeatureFlagChange('BookletEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.chequeCollectionEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Cheque collection</span>
            <span class="feature-option__desc">Show Cheque collection section in sidebar</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.chequeCollectionEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.ChequeCollectionEnabled"
              @change="onFeatureFlagChange('ChequeCollectionEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.taxViewEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Tax view</span>
            <span class="feature-option__desc">Show Tax section in sidebar</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.taxViewEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.TaxViewEnabled"
              @change="onFeatureFlagChange('TaxViewEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
        <div
          class="feature-option"
          :class="{ 'feature-option--enabled': documentSettings.vendorsViewEnabled }"
        >
          <span class="feature-option__icon feature-option__icon--default">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </span>
          <span class="feature-option__content">
            <span class="feature-option__title">Vendors view</span>
            <span class="feature-option__desc">Show Vendors section in sidebar</span>
          </span>
          <label class="feature-option__toggle">
            <input
              :checked="documentSettings.vendorsViewEnabled"
              type="checkbox"
              class="feature-option__toggle-input"
              :disabled="savingFeatureFlags.VendorsViewEnabled"
              @change="onFeatureFlagChange('VendorsViewEnabled', ($event.target as HTMLInputElement).checked)"
            />
            <span class="feature-option__track" />
          </label>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useDocumentSettingsStore } from '../stores/documentSettingsStore'
import { useToastStore } from '../stores/toastStore'

const documentSettings = useDocumentSettingsStore()
const toast = useToastStore()

const savingFeatureFlags = ref<Record<string, boolean>>({
  BulkApprove: false,
  ManagerEditDraft: false,
  SessionTimeoutWarning: false,
  EditRequestEnabled: false,
  ApprovalEmailToOfficer: false,
  OnboardingEnabled: false,
  OverdueIndicatorEnabled: false,
  CommandPaletteEnabled: false,
  BookletEnabled: false,
  ChequeCollectionEnabled: false,
  TaxViewEnabled: false,
  VendorsViewEnabled: false,
})

const overdueDaysInput = ref(7)
const savingOverdueDays = ref(false)

watch(
  () => documentSettings.overdueDays,
  (v) => { overdueDaysInput.value = v },
  { immediate: true },
)

async function onOverdueDaysBlur() {
  const val = Math.max(1, Math.min(365, Math.round(overdueDaysInput.value) || 7))
  if (val === documentSettings.overdueDays) return
  overdueDaysInput.value = val
  savingOverdueDays.value = true
  const { error } = await documentSettings.saveOverdueDays(val)
  savingOverdueDays.value = false
  if (error) {
    toast.error(error)
    overdueDaysInput.value = documentSettings.overdueDays
  }
}

async function onFeatureFlagChange(
  field:
    | 'BulkApprove'
    | 'ManagerEditDraft'
    | 'SessionTimeoutWarning'
    | 'EditRequestEnabled'
    | 'ApprovalEmailToOfficer'
    | 'OnboardingEnabled'
    | 'OverdueIndicatorEnabled'
    | 'CommandPaletteEnabled'
    | 'BookletEnabled'
    | 'ChequeCollectionEnabled'
    | 'TaxViewEnabled'
    | 'VendorsViewEnabled',
  value: boolean
) {
  savingFeatureFlags.value[field] = true
  const { error } = await documentSettings.saveFeatureFlag(field, value)
  savingFeatureFlags.value[field] = false
  if (error) {
    toast.error(error)
    await documentSettings.loadFromFileMaker()
  }
}
</script>

<style scoped>
.feature-options__label {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.feature-options__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.feature-option {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: 14px;
  text-align: left;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.feature-option:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.12);
}

.feature-option--enabled {
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(59, 130, 246, 0.05);
}

.feature-option--enabled:hover {
  background: rgba(59, 130, 246, 0.08);
}

.feature-option__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
}

.feature-option__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.feature-option__icon--default {
  background: rgba(148, 163, 184, 0.2);
  color: rgb(148, 163, 184);
}

.feature-option__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feature-option__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.feature-option__desc {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--color-text-muted);
}

.feature-option__toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.feature-option__toggle-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.feature-option__toggle-input:disabled + .feature-option__track {
  opacity: 0.6;
  cursor: not-allowed;
}

.feature-option__track {
  display: flex;
  align-items: center;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
  border: 1px solid var(--color-border);
  transition: background-color 0.2s, border-color 0.2s;
}

.feature-option__track::after {
  content: '';
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-text-muted);
  margin-left: 0.125rem;
  transition: transform 0.2s, background-color 0.2s;
}

.feature-option__toggle-input:checked + .feature-option__track {
  background: rgba(59, 130, 246, 0.25);
  border-color: rgba(59, 130, 246, 0.5);
}

.feature-option__toggle-input:checked + .feature-option__track::after {
  transform: translateX(1rem);
  background: var(--color-accent);
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--color-border);
  border-radius: 12px;
  overflow: hidden;
}

.settings-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--color-bg-card);
  text-align: left;
  transition: background-color 0.2s ease;
}

.settings-item--form {
  flex-wrap: wrap;
  align-items: flex-start;
}

.settings-item__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  background: rgba(59, 130, 246, 0.12);
  border-radius: 8px;
  color: var(--color-accent);
}

.settings-item__icon svg {
  width: 1.125rem;
  height: 1.125rem;
}

.settings-item__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.settings-item__content--full {
  flex: 1;
}

.settings-item__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
}

.settings-item__desc {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.settings-toggle {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.settings-toggle__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.settings-toggle__input:disabled + .settings-toggle__track {
  opacity: 0.6;
  cursor: not-allowed;
}

.settings-toggle__track {
  display: flex;
  align-items: center;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
  border: 1px solid var(--color-border);
  transition: background-color 0.2s, border-color 0.2s;
}

.settings-toggle__track::after {
  content: '';
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-text-muted);
  margin-left: 0.125rem;
  transition: transform 0.2s, background-color 0.2s;
}

.settings-toggle__input:checked + .settings-toggle__track {
  background: rgba(251, 146, 60, 0.25);
  border-color: rgba(251, 146, 60, 0.5);
}

.settings-toggle__input:checked + .settings-toggle__track::after {
  transform: translateX(1rem);
  background: var(--color-accent);
}
</style>
