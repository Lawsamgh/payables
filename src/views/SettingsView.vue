<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="mb-10">
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        Settings
      </h1>
      <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
        Configure your preferences.
      </p>
    </header>

    <div class="flex flex-col gap-10">
      <!-- Account -->
      <section class="settings-section">
        <h2 class="settings-section__title">Account</h2>
        <div class="settings-list">
          <router-link to="/settings/users" class="settings-item no-underline">
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Manage Users</span>
              <span class="settings-item__desc"
                >Add, edit, and remove user accounts</span
              >
            </div>
            <svg
              class="settings-item__chevron"
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
          <button
            type="button"
            class="settings-item settings-item--btn"
            @click="showResetPasswordModal = true"
          >
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l11.964-11.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Reset password</span>
              <span class="settings-item__desc">Change your sign-in password</span>
            </div>
            <svg
              class="settings-item__chevron"
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
      </section>

      <!-- Documents -->
      <section class="settings-section">
        <h2 class="settings-section__title">Documents</h2>
        <div class="settings-list">
          <router-link to="/settings/documents" class="settings-item no-underline">
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Documents</span>
              <span class="settings-item__desc"
                >View and manage documents</span
              >
            </div>
            <svg
              class="settings-item__chevron"
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
      </section>

      <!-- General -->
      <section class="settings-section">
        <h2 class="settings-section__title">General</h2>
        <div class="settings-list">
          <div class="settings-item settings-item--disabled">
            <div class="settings-item__icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <div class="settings-item__content">
              <span class="settings-item__title">Notifications</span>
              <span class="settings-item__desc">Email and in-app alerts</span>
            </div>
            <span class="settings-item__badge">Coming soon</span>
          </div>
        </div>
      </section>
    </div>

    <ResetPasswordModal
      :visible="showResetPasswordModal"
      @close="showResetPasswordModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ResetPasswordModal from '../components/ResetPasswordModal.vue'

const showResetPasswordModal = ref(false)
</script>

<style scoped>
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.settings-section__title {
  margin: 0;
  padding: 0 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
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

.settings-item--btn {
  width: 100%;
  cursor: pointer;
  font: inherit;
  color: inherit;
  border: none;
}

.settings-item--btn:hover,
a.settings-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.settings-item--disabled {
  opacity: 0.65;
  cursor: default;
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

.settings-item__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--color-text);
}

.settings-item__desc {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.settings-item__chevron {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--color-text-muted);
}

.settings-item__badge {
  flex-shrink: 0;
  padding: 0.2rem 0.5rem;
  font-size: 0.625rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  background: rgba(255, 255, 255, 0.06);
  border-radius: 4px;
}
</style>
