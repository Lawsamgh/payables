<template>
  <aside
    class="flex w-[260px] md:w-[280px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-card)] backdrop-blur-[var(--blur-glass)] transition-[width] duration-200 ease-[var(--ease)]"
    style="min-height: 100vh"
  >
    <div class="flex flex-col flex-1 min-h-0">
      <!-- Brand: same height as main header so horizontal line aligns -->
      <div
        class="flex items-center gap-3 px-4 border-b border-[var(--color-border)] shrink-0"
        style="min-height: var(--app-header-height)"
      >
        <div
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style="background: rgba(59, 130, 246, 0.2)"
        >
          <svg
            class="h-5 w-5 text-[var(--color-accent)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div class="min-w-0">
          <span
            class="block truncate font-semibold text-[var(--color-text)] text-[15px]"
            >Finance Payables</span
          >
          <span
            class="block truncate text-[11px] text-[var(--color-text-muted)]"
            >Tracker</span
          >
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex flex-col gap-0.5 flex-1 p-4 pt-4">
        <router-link
          :to="getHomeRoute()"
          class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors"
          :class="
            route.name === 'home'
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
          "
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          <span>Payables</span>
        </router-link>
        <!-- Current entry (vendor name): only when an entry is open -->
        <router-link
          v-if="isEntryOpen"
          :to="currentEntryLink"
          class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span class="min-w-0 truncate" :title="entrySidebarLabel">{{
            entrySidebarLabel
          }}</span>
        </router-link>
        <!-- New entry: always visible, starts a blank entry -->
        <router-link
          to="/entry"
          class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors"
          :class="
            route.name === 'entry' && !route.query.transRef
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
          "
        >
          <svg
            class="h-5 w-5 shrink-0"
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
          <span>New entry</span>
        </router-link>
        <router-link
          to="/invoices"
          class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors"
          :class="
            route.name === 'invoices'
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
          "
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Invoices</span>
        </router-link>
        <router-link
          to="/cheque-collection"
          class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors"
          :class="
            route.name === 'cheque-collection'
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
          "
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Cheque collection</span>
        </router-link>
        <router-link
          to="/vendors"
          class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors"
          :class="
            route.name === 'vendors'
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
          "
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <span>Vendors</span>
        </router-link>
        <router-link
          to="/tax"
          class="sidebar-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors"
          :class="
            route.name === 'tax'
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
          "
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span>Tax</span>
        </router-link>
        <router-link
          to="/settings"
          class="sidebar-link mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-[var(--label-size)] font-medium no-underline transition-colors"
          :class="
            route.name === 'settings'
              ? 'bg-[var(--color-accent-soft)] text-[var(--color-accent)]'
              : 'text-[var(--color-text-muted)] hover:bg-white/5 hover:text-[var(--color-text)]'
          "
        >
          <svg
            class="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>Settings</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { getHomeRoute } from "../utils/homeTab";
import { usePayableStore } from "../stores/payableStore";
import { useVendorStore } from "../stores/vendorStore";

const route = useRoute();
const payableStore = usePayableStore();
const vendorStore = useVendorStore();

/** True when we're on the entry page with an existing entry (vendor) open. */
const isEntryOpen = computed(
  () => route.name === "entry" && !!route.query.transRef,
);

/** Vendor name for the open entry (only shown when isEntryOpen). */
const entrySidebarLabel = computed(() => {
  const name = (vendorStore.vendor?.vendor_name ?? "").trim();
  return name || "Entry";
});

/** Link for the current-entry item: current entry if we have one, else /entry. */
const currentEntryLink = computed(() => {
  const ref = payableStore.currentTransRef;
  if (ref) return { name: "entry", query: { transRef: ref } };
  return { name: "entry" };
});
</script>
