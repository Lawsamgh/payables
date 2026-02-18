<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <router-link
          to="/settings"
          class="inline-flex items-center gap-2 text-[var(--label-size)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] no-underline mb-4 transition-colors"
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
          Manage Users
        </h1>
        <p class="mt-1 text-[13px] text-[var(--color-text-muted)]">
          Add, edit, and remove user accounts.
        </p>
      </div>
      <button
        v-if="isConnected"
        type="button"
        class="pill-btn inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
        @click="openAdd"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Add User
      </button>
    </header>

    <!-- Search and filter -->
    <div
      v-if="!loading && !loadError && userList.length > 0"
      class="tax-search-bar mb-4"
    >
      <div class="tax-search-bar__row">
        <div
          class="search-bar__wrap tax-search-bar__search"
          :class="{ 'search-bar__wrap--has-value': searchQuery }"
        >
          <span class="search-bar__icon" aria-hidden="true">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            v-model.trim="searchQuery"
            type="search"
            class="search-bar__input"
            placeholder="Search by email, name, role…"
            autocomplete="off"
            aria-label="Search users"
          />
          <button
            v-if="searchQuery"
            type="button"
            class="search-bar__clear"
            aria-label="Clear search"
            @click="searchQuery = ''"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="tax-search-bar__filter-wrap">
          <span class="tax-search-bar__filter-icon" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </span>
          <select
            v-model="roleFilter"
            class="tax-search-bar__filter"
            aria-label="Filter by role"
          >
            <option value="">All roles</option>
            <option v-for="r in ROLE_OPTIONS" :key="r" :value="r">{{ r }}</option>
          </select>
          <span class="tax-search-bar__filter-chevron" aria-hidden="true">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
        <div class="tax-search-bar__filter-wrap">
          <span class="tax-search-bar__filter-icon" aria-hidden="true">
            <svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
            </svg>
          </span>
          <select
            v-model="statusFilter"
            class="tax-search-bar__filter"
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <span class="tax-search-bar__filter-chevron" aria-hidden="true">
            <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        </div>
      </div>
      <p v-if="searchQuery || roleFilter || statusFilter" class="tax-search-bar__hint">
        {{ filteredUserList.length }} result{{ filteredUserList.length === 1 ? '' : 's' }}
      </p>
    </div>

    <div class="tax-table-wrap">
      <template v-if="loading">
        <div class="tax-table-skeleton">
          <table class="tax-table">
            <thead>
              <tr>
                <th><Skeleton width="8rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="10rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="5rem" height="0.875rem" class="rounded" /></th>
                <th><Skeleton width="5rem" height="0.875rem" class="rounded" /></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="i in 5" :key="i" class="tax-table-skeleton__row">
                <td><Skeleton width="70%" height="0.875rem" class="rounded max-w-[12rem]" /></td>
                <td><Skeleton width="60%" height="0.875rem" class="rounded max-w-[10rem]" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
                <td><Skeleton width="4rem" height="0.875rem" class="rounded" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
      <div v-else-if="loadError" class="tax-table-error">
        {{ loadError }}
      </div>
      <div v-else-if="!isConnected" class="tax-table-empty">
        <p>Connect to FileMaker to view users.</p>
      </div>
      <div
        v-else-if="userList.length === 0"
        class="tax-table-empty"
      >
        <p>No users yet.</p>
        <button
          type="button"
          class="pill-btn mt-2 inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2.5 text-[var(--label-size)] font-semibold text-white shadow-md hover:bg-orange-600 transition-colors"
          @click="openAdd"
        >
          Add your first user
        </button>
      </div>
      <div
        v-else-if="filteredUserList.length === 0"
        class="tax-table-empty"
      >
        <p>No matching users.</p>
        <button
          type="button"
          class="pill-btn mt-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          @click="searchQuery = ''; roleFilter = ''; statusFilter = ''"
        >
          Clear filters
        </button>
      </div>
      <div v-else>
        <div class="tax-table-scroll">
          <table class="tax-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Full Name</th>
                <th>Role</th>
                <th>Status</th>
                <th class="tax-table__actions-th">Active</th>
                <th class="tax-table__actions-th"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in userListToShow" :key="row.recordId || index">
              <td>{{ getField(row, 'Email') }}</td>
              <td>{{ getField(row, 'FullName') }}</td>
              <td>{{ getField(row, 'Role') }}</td>
              <td>
                <span
                  class="status-badge"
                  :class="isActive(row) ? 'status-badge--active' : 'status-badge--inactive'"
                >
                  {{ getField(row, 'Status') || '—' }}
                </span>
              </td>
              <td class="tax-table__actions-td">
                <button
                  type="button"
                  class="user-toggle"
                  :class="{ 'user-toggle--on': isActive(row), 'user-toggle--busy': togglingRecordId === row.recordId }"
                  :aria-label="isActive(row) ? 'Disable user' : 'Enable user'"
                  :disabled="togglingRecordId === row.recordId"
                  @click="toggleActive(row)"
                >
                  <span class="user-toggle__track">
                    <span class="user-toggle__thumb" />
                  </span>
                </button>
              </td>
              <td class="tax-table__actions-td">
                <div class="tax-table__action-buttons">
                  <button
                    type="button"
                    class="tax-table__edit-btn"
                    aria-label="Edit"
                    @click="openEdit(row)"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    type="button"
                    class="tax-table__edit-btn tax-table__edit-btn--icon"
                    aria-label="Reset password"
                    @click.stop="openResetPassword(row)"
                  >
                    <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l11.964-11.964A6 6 0 1121 9z" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
        <div v-if="totalPagesUser > 1" class="pagination">
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPageUser <= 1"
            aria-label="Previous page"
            @click="currentPageUser = Math.max(1, currentPageUser - 1)"
          >
            <svg class="pagination__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span class="pagination__label">
            Page {{ currentPageUser }} of {{ totalPagesUser }}
          </span>
          <button
            type="button"
            class="pagination__btn"
            :disabled="currentPageUser >= totalPagesUser"
            aria-label="Next page"
            @click="currentPageUser = Math.min(totalPagesUser, currentPageUser + 1)"
          >
            <svg class="pagination__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Add / Edit User modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="tax-modal-backdrop">
        <div class="tax-modal" role="dialog" :aria-labelledby="editingRecordId ? 'edit-user-title' : 'add-user-title'" aria-modal="true">
          <header class="tax-modal__header">
            <h2 :id="editingRecordId ? 'edit-user-title' : 'add-user-title'" class="tax-modal__title">{{ editingRecordId ? 'Edit User' : 'Add User' }}</h2>
            <button type="button" class="tax-modal__close" aria-label="Close" @click="closeModal">
              <svg class="tax-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div v-if="formError" class="tax-modal__error" role="alert">
            <svg class="tax-modal__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="tax-modal__error-text">{{ formError }}</span>
          </div>
          <form class="tax-modal__form" @submit.prevent="submit">
            <section class="tax-modal__section">
              <h3 class="tax-modal__section-title">User details</h3>
              <label class="tax-modal__label">
                <span>Email</span>
                <input v-model="form.Email" type="email" class="glass-input w-full px-3 py-2.5 rounded-lg" placeholder="email@example.com" required />
              </label>
              <label class="tax-modal__label">
                <span>Full Name</span>
                <input v-model="form.FullName" type="text" class="glass-input w-full px-3 py-2.5 rounded-lg" placeholder="Full name" />
              </label>
              <label class="tax-modal__label">
                <span>Role</span>
                <div class="tax-modal__select-wrap">
                  <select
                    v-model="form.Role"
                    class="tax-modal__select"
                    aria-label="User role"
                  >
                    <option value="">Select role</option>
                    <option
                      v-for="opt in ROLE_OPTIONS"
                      :key="opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                  <span class="tax-modal__select-chevron" aria-hidden="true">
                    <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </div>
              </label>
            </section>
            <div class="tax-modal__actions">
              <button type="button" class="tax-modal__btn-cancel" @click="closeModal">Cancel</button>
              <button type="submit" class="tax-modal__btn-submit" :disabled="saving">
                {{ saving ? 'Saving…' : (editingRecordId ? 'Save' : 'Add User') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Reset password (admin) modal -->
    <Teleport to="body">
      <div v-if="showResetPasswordModal" class="tax-modal-backdrop">
        <div class="tax-modal" role="dialog" aria-labelledby="reset-password-user-title" aria-modal="true">
          <header class="tax-modal__header">
            <h2 id="reset-password-user-title" class="tax-modal__title">Reset password</h2>
            <button type="button" class="tax-modal__close" aria-label="Close" @click="closeResetPasswordModal">
              <svg class="tax-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          <div v-if="resetPasswordError" class="tax-modal__error" role="alert">
            <svg class="tax-modal__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="tax-modal__error-text">{{ resetPasswordError }}</span>
          </div>
          <form class="tax-modal__form" @submit.prevent="submitResetPassword">
            <section class="tax-modal__section">
              <p class="tax-modal__section-title text-[var(--color-text-muted)] mb-2">
                Set a new password for <strong class="text-[var(--color-text)]">{{ resetPasswordEmail }}</strong>
              </p>
              <label class="tax-modal__label">
                <span>New password</span>
                <input
                  v-model="resetPasswordNew"
                  type="password"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Enter new password"
                  autocomplete="new-password"
                />
              </label>
              <label class="tax-modal__label">
                <span>Confirm new password</span>
                <input
                  v-model="resetPasswordConfirm"
                  type="password"
                  class="glass-input w-full px-3 py-2.5 rounded-lg"
                  placeholder="Confirm new password"
                  autocomplete="new-password"
                />
              </label>
            </section>
            <div class="tax-modal__actions">
              <button type="button" class="tax-modal__btn-cancel" @click="closeResetPasswordModal">Cancel</button>
              <button type="submit" class="tax-modal__btn-submit" :disabled="resetPasswordSaving">
                {{ resetPasswordSaving ? 'Resetting…' : 'Reset password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useFileMaker } from "../composables/useFileMaker";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type { PayablesUsersFieldData } from "../utils/filemakerApi";
import { useToastStore } from "../stores/toastStore";
import Skeleton from "../components/Skeleton.vue";

const { findRecordsWithIds, createRecord, updateRecord, runScript, isConnected } = useFileMaker();

const DEFAULT_PASSWORD = "123456789";
const DEFAULT_RESET_PASSWORD = "123456789";
const ROLE_OPTIONS = ["Admin", "Manager", "Officer"] as const;
const toast = useToastStore();
const userList = ref<FindRecordWithId<PayablesUsersFieldData | Record<string, unknown>>[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);
const showAddModal = ref(false);
const editingRecordId = ref<string | null>(null);
const form = ref<PayablesUsersFieldData>({
  Email: "",
  FullName: "",
  Role: "",
  Status: "",
});
const formError = ref<string | null>(null);
const saving = ref(false);
const togglingRecordId = ref<string | null>(null);
const showResetPasswordModal = ref(false);
const resetPasswordEmail = ref("");
const resetPasswordNew = ref("");
const resetPasswordConfirm = ref("");
const resetPasswordError = ref<string | null>(null);
const resetPasswordSaving = ref(false);
const searchQuery = ref("");
const roleFilter = ref("");
const statusFilter = ref("");

const MIN_RESET_PASSWORD_LENGTH = 6;

/** FileMaker and Data API error codes → user-friendly messages for reset password flow. */
const RESET_PASSWORD_ERROR_MESSAGES: Record<string, string> = {
  "0": "",
  "-1": "An unexpected error occurred. Please try again.",
  "1": "Action was canceled.",
  "2": "A system error occurred. Please try again.",
  "3": "This operation is not available.",
  "4": "Unknown command or operation.",
  "5": "Invalid command or operation.",
  "6": "File is read-only; changes are not allowed.",
  "7": "Not enough memory to complete the operation.",
  "9": "You do not have permission to perform this action.",
  "10": "Required data is missing.",
  "11": "Name or value is not valid.",
  "12": "That name already exists.",
  "13": "File or resource is in use. Please try again later.",
  "14": "Value is out of range.",
  "15": "Invalid calculation or value.",
  "16": "Request failed; please try again.",
  "18": "Account information is required to proceed.",
  "19": "Value contains invalid characters.",
  "20": "Operation was canceled.",
  "21": "This request is not supported.",
  "100": "File is missing.",
  "101": "Record is missing.",
  "102": "Field is missing.",
  "103": "Relationship is missing.",
  "104": "Script is missing.",
  "105": "Layout is missing.",
  "106": "Table is missing.",
  "200": "Record access is denied.",
  "201": "This field cannot be modified.",
  "202": "Field access is denied.",
  "206": "You do not have permission to change passwords.",
  "208": "Password does not contain enough characters.",
  "209": "New password must be different from the current one.",
  "210": "User account is inactive.",
  "211": "Password has expired.",
  "212": "Invalid account or password.",
  "214": "Too many login attempts. Account is temporarily locked.",
  "217": "You do not have sufficient privileges to modify this account.",
  "218": "Password and confirmation do not match.",
  "300": "File is locked or in use. Please try again later.",
  "301": "Record is in use by another user.",
  "306": "Record was changed by another user. Please try again.",
  "307": "New password is not allowed. Please choose a different password.",
  "400": "Search criteria are empty.",
  "401": "No matching record found.",
  "500": "Entered value does not meet validation rules.",
  "509": "This field requires a valid value.",
  "714": "Your account does not have permission for this operation.",
  "718": "Password does not meet requirements.",
  "719": "You do not have permission to perform this operation.",
  "723": "You do not have permission to add or modify records in the target table.",
  "800": "Unable to create or access the file.",
  "803": "Host could not be found or file is single-user.",
  "805": "File is damaged. Contact your administrator.",
  "809": "Disk is full.",
  "812": "Server capacity exceeded. Please try again later.",
  "814": "Too many files are open. Please try again later.",
  "951": "An unexpected error occurred. Please try again.",
  "952": "Session expired or invalid. Please sign in again.",
  "953": "Data limit exceeded.",
  "954": "Unsupported request format.",
  "958": "A required parameter is missing.",
  "959": "Web publishing is disabled for this file.",
  "960": "Parameter is invalid.",
  "1700": "The requested resource was not found.",
  "1701": "Server is busy. Please try again later.",
  "1702": "Authentication format is invalid. Please sign in again.",
  "1703": "Invalid username, password, or token. Please sign in again.",
  "1705": "A required header was not specified.",
  "1707": "A required parameter was not specified.",
  "1708": "Parameter value is invalid.",
  "1710": "Request data is invalid. Please check your input.",
  "1711": "Server license has expired. Contact your administrator.",
};

function friendlyResetPasswordError(codeOrMessage: string): string {
  const trimmed = String(codeOrMessage ?? "").trim();
  if (!trimmed) return "Something went wrong. Please try again.";
  if (RESET_PASSWORD_ERROR_MESSAGES[trimmed] !== undefined) {
    return RESET_PASSWORD_ERROR_MESSAGES[trimmed];
  }
  const lower = trimmed.toLowerCase();
  if (lower.includes("212") || (lower.includes("invalid") && (lower.includes("password") || lower.includes("account")))) {
    return RESET_PASSWORD_ERROR_MESSAGES["212"];
  }
  if (lower.includes("213") || lower.includes("user account") && (lower.includes("exist") || lower.includes("lock"))) {
    return "User account does not exist or is locked.";
  }
  if (lower.includes("214") || lower.includes("too many login")) return RESET_PASSWORD_ERROR_MESSAGES["214"];
  if (lower.includes("307") || lower.includes("718") || lower.includes("password") && lower.includes("requirement")) {
    return RESET_PASSWORD_ERROR_MESSAGES["307"];
  }
  if (lower.includes("privilege") || lower.includes("permission")) return RESET_PASSWORD_ERROR_MESSAGES["9"];
  if (lower.includes("expired") || lower.includes("token")) return RESET_PASSWORD_ERROR_MESSAGES["952"];
  if (/^-?\d+$/.test(trimmed)) return "Something went wrong. Please try again.";
  return trimmed || "Something went wrong. Please try again.";
}

const filteredUserList = computed(() => {
  let list = userList.value;
  const q = searchQuery.value.trim().toLowerCase();
  const role = roleFilter.value.trim();
  const status = statusFilter.value.trim();

  if (role) {
    list = list.filter((r) => {
      const fd = r.fieldData as Record<string, unknown>;
      const rVal = String(fd.Role ?? "").trim();
      return rVal === role;
    });
  }
  if (status) {
    list = list.filter((r) => {
      const fd = r.fieldData as Record<string, unknown>;
      const sVal = String(fd.Status ?? "").trim();
      return sVal.toLowerCase() === status.toLowerCase();
    });
  }
  if (!q) return list;
  return list.filter((r) => {
    const fd = r.fieldData as Record<string, unknown>;
    const email = String(fd.Email ?? "").toLowerCase();
    const name = String(fd.FullName ?? fd["Full Name"] ?? "").toLowerCase();
    const rVal = String(fd.Role ?? "").toLowerCase();
    return (
      email.includes(q) ||
      name.includes(q) ||
      rVal.includes(q)
    );
  });
});

const PAGE_SIZE = 10;
const currentPageUser = ref(1);
const totalPagesUser = computed(() =>
  Math.max(1, Math.ceil(filteredUserList.value.length / PAGE_SIZE)),
);
const userListToShow = computed(() => {
  const start = (currentPageUser.value - 1) * PAGE_SIZE;
  return filteredUserList.value.slice(start, start + PAGE_SIZE);
});

watch(
  () => [searchQuery.value, roleFilter.value, statusFilter.value],
  () => {
    currentPageUser.value = 1;
  },
);
watch(totalPagesUser, (total) => {
  if (currentPageUser.value > total)
    currentPageUser.value = Math.max(1, total);
});

function getField(
  row: FindRecordWithId<PayablesUsersFieldData | Record<string, unknown>>,
  key: string
): string {
  const fd = row.fieldData as Record<string, unknown>;
  const v = fd[key] ?? fd[key.replace(/([A-Z])/g, " $1").trim()];
  if (v == null || v === "") return "—";
  return String(v).trim();
}

function isActive(row: FindRecordWithId<PayablesUsersFieldData | Record<string, unknown>>): boolean {
  const s = getField(row, "Status").toLowerCase();
  return s === "active";
}

async function toggleActive(row: FindRecordWithId<PayablesUsersFieldData | Record<string, unknown>>) {
  const email = getField(row, "Email");
  if (!email) return;
  const recordId = row.recordId;
  if (togglingRecordId.value) return;
  const currentlyActive = isActive(row);
  const action = currentlyActive ? "Disable" : "Enable";
  togglingRecordId.value = recordId;
  const scriptParam = JSON.stringify({ email, action });
  const { error: scriptErr } = await runScript(
    LAYOUTS.PAYABLES_USERS,
    "ActiveOrInactiveToggle",
    scriptParam
  );
  if (scriptErr) {
    toast.error("Toggle failed: " + scriptErr);
    togglingRecordId.value = null;
    return;
  }
  const newStatus = currentlyActive ? "Inactive" : "Active";
  const fd = row.fieldData as Record<string, unknown>;
  const { error: updateErr } = await updateRecord(
    LAYOUTS.PAYABLES_USERS,
    recordId,
    {
      Email: String(fd.Email ?? ""),
      FullName: String(fd.FullName ?? fd["Full Name"] ?? ""),
      Role: String(fd.Role ?? ""),
      Status: newStatus,
    }
  );
  togglingRecordId.value = null;
  if (updateErr) {
    toast.error("Account updated but status sync failed: " + updateErr);
  } else {
    toast.success(newStatus === "Active" ? "User enabled." : "User disabled.");
  }
  await loadUsers();
}

function openAdd() {
  resetForm();
  showAddModal.value = true;
}

function openEdit(row: FindRecordWithId<PayablesUsersFieldData | Record<string, unknown>>) {
  const fd = row.fieldData as Record<string, unknown>;
  form.value = {
    Email: String(fd.Email ?? ""),
    FullName: String(fd.FullName ?? fd["Full Name"] ?? ""),
    Role: String(fd.Role ?? ""),
    Status: String(fd.Status ?? ""),
  };
  editingRecordId.value = row.recordId;
  formError.value = null;
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingRecordId.value = null;
}

function openResetPassword(row: FindRecordWithId<PayablesUsersFieldData | Record<string, unknown>>) {
  const emailRaw = getField(row, "Email");
  const email = emailRaw === "—" || !emailRaw ? "" : emailRaw.trim();
  if (!email) {
    toast.error("Cannot reset password: no email for this user.");
    return;
  }
  resetPasswordEmail.value = email;
  resetPasswordNew.value = DEFAULT_RESET_PASSWORD;
  resetPasswordConfirm.value = DEFAULT_RESET_PASSWORD;
  resetPasswordError.value = null;
  showResetPasswordModal.value = true;
}

function closeResetPasswordModal() {
  showResetPasswordModal.value = false;
  resetPasswordEmail.value = "";
  resetPasswordNew.value = "";
  resetPasswordConfirm.value = "";
  resetPasswordError.value = null;
}

async function submitResetPassword() {
  if (resetPasswordSaving.value) return;
  resetPasswordError.value = null;
  if (!resetPasswordEmail.value) {
    resetPasswordError.value = "No user selected.";
    return;
  }
  if (!resetPasswordNew.value.trim()) {
    resetPasswordError.value = "Enter a new password.";
    return;
  }
  if (resetPasswordNew.value.length < MIN_RESET_PASSWORD_LENGTH) {
    resetPasswordError.value = `New password must be at least ${MIN_RESET_PASSWORD_LENGTH} characters.`;
    return;
  }
  if (resetPasswordNew.value !== resetPasswordConfirm.value) {
    toast.error("New password and confirmation do not match.");
    return;
  }
  resetPasswordSaving.value = true;
  try {
    const scriptParam = JSON.stringify({
      email: resetPasswordEmail.value,
      password: resetPasswordNew.value.trim(),
    });
    const { error, scriptResult, scriptError, messageCode } = await runScript(
      LAYOUTS.PAYABLES_USERS,
      "ResetPassword",
      scriptParam,
    );
    const code = (scriptError ?? "0").trim();
    const isSuccess = code === "0";
    if (!isSuccess) {
      const message =
        friendlyResetPasswordError(code) ||
        (messageCode ? friendlyResetPasswordError(messageCode) : "") ||
        (error ? friendlyResetPasswordError(error) : "") ||
        error ||
        `Script error: ${code}`;
      toast.error(message.trim() || "Something went wrong. Please try again.");
      return;
    }
    const customMessage = scriptResult?.trim();
    if (customMessage && customMessage !== "0") {
      const msg = friendlyResetPasswordError(customMessage);
      toast.error(msg);
      return;
    }
    toast.success("Password reset successfully.");
    closeResetPasswordModal();
  } finally {
    resetPasswordSaving.value = false;
  }
}

function resetForm() {
  editingRecordId.value = null;
  form.value = { Email: "", FullName: "", Role: "", Status: "" };
  formError.value = null;
}

function validateForm(): string | null {
  if (!form.value.Email?.trim()) return "Email is required.";
  if (!form.value.Role?.trim()) return "Role is required.";
  return null;
}

async function submit() {
  if (saving.value) return;
  if (!isConnected.value) {
    toast.error("Not connected to FileMaker.");
    formError.value = null;
    return;
  }
  const err = validateForm();
  if (err) {
    toast.error(err);
    formError.value = null;
    return;
  }
  saving.value = true;
  formError.value = null;
  const idToUpdate = editingRecordId.value ? String(editingRecordId.value).trim() : null;
  try {
    const fieldData: PayablesUsersFieldData = {
      Email: form.value.Email?.trim(),
      FullName: form.value.FullName?.trim() || undefined,
      Role: form.value.Role?.trim() || undefined,
      Status: idToUpdate ? (form.value.Status?.trim() || undefined) : "Active",
    };
    if (idToUpdate) {
      const { error } = await updateRecord(LAYOUTS.PAYABLES_USERS, idToUpdate, fieldData);
      if (error) {
        toast.error(error);
        formError.value = null;
        return;
      }
      toast.success("User updated successfully.");
    } else {
      const email = form.value.Email?.trim() ?? "";
      const role = form.value.Role?.trim() ?? "";
      const scriptParam = JSON.stringify({ email, password: DEFAULT_PASSWORD, role });
      const { error } = await createRecord(LAYOUTS.PAYABLES_USERS, fieldData, {
        script: "CreateSecurityAccount",
        scriptParam,
      });
      if (error) {
        toast.error(error);
        formError.value = null;
        return;
      }
      toast.success("User added successfully.");
    }
    closeModal();
    resetForm();
    await loadUsers();
  } finally {
    saving.value = false;
  }
}

async function loadUsers() {
  if (!isConnected.value) {
    userList.value = [];
    loading.value = false;
    return;
  }
  loading.value = true;
  loadError.value = null;
  const { data, error } = await findRecordsWithIds<
    PayablesUsersFieldData | Record<string, unknown>
  >(LAYOUTS.PAYABLES_USERS, { limit: 500 });
  loading.value = false;
  if (error) {
    toast.error(error);
    loadError.value = null;
    userList.value = [];
  } else {
    userList.value = data;
  }
}

onMounted(() => loadUsers());
watch(isConnected, (connected) => {
  if (connected) loadUsers();
});
watch(showAddModal, (open) => {
  if (!open) editingRecordId.value = null;
});
</script>

<style scoped>
.tax-table__action-buttons {
  display: inline-flex;
  flex-wrap: nowrap;
  align-items: center;
  gap: 0.5rem;
}

.tax-table__edit-btn--icon {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.user-toggle {
  display: inline-flex;
  align-items: center;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 9999px;
}
.user-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}
.user-toggle__track {
  display: flex;
  align-items: center;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
  border: 1px solid var(--color-border);
  transition: background-color 0.2s, border-color 0.2s;
}
.user-toggle--on .user-toggle__track {
  background: rgba(52, 211, 153, 0.35);
  border-color: rgba(52, 211, 153, 0.5);
}
.user-toggle__thumb {
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: var(--color-text-muted);
  margin-left: 0.125rem;
  transition: transform 0.2s, background-color 0.2s;
}
.user-toggle--on .user-toggle__thumb {
  transform: translateX(1rem);
  background: rgb(52, 211, 153);
}
.user-toggle--busy .user-toggle__thumb {
  opacity: 0.6;
}

.status-badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 6px;
  text-transform: capitalize;
}
.status-badge--active {
  background: rgba(34, 197, 94, 0.2);
  color: rgb(134, 239, 172);
}
.status-badge--inactive {
  background: rgba(239, 68, 68, 0.2);
  color: rgb(254, 202, 202);
}
</style>
