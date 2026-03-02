<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="command-palette-overlay fixed inset-0 z-[300] flex items-start justify-center pt-[15vh] px-4"
      style="background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px)"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      @keydown="onKeydown"
      @click.self="paletteStore.close()"
    >
      <div
        class="command-palette glass w-full max-w-3xl rounded-2xl border border-[var(--color-border)] shadow-2xl overflow-hidden"
        @click.stop
      >
        <div
          class="command-palette__input-wrap flex items-center gap-3 px-4 py-3 border-b border-[var(--color-border)]"
        >
          <svg
            class="command-palette__search-icon h-5 w-5 shrink-0 text-[var(--color-text-muted)]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref="inputRef"
            v-model="query"
            type="text"
            class="command-palette__input flex-1 min-w-0 bg-transparent text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none"
            placeholder="Search commands or type TransRef (e.g. RF100000)…"
            autocomplete="off"
            spellcheck="false"
          />
          <kbd
            class="command-palette__kbd hidden sm:inline-flex items-center gap-0.5 px-2 py-1 rounded bg-white/10 text-[11px] font-medium text-[var(--color-text-muted)]"
          >
            {{ isMac ? "⌘" : "Ctrl" }}K
          </kbd>
        </div>

        <ul
          class="command-palette__list max-h-[min(60vh,400px)] overflow-y-auto py-2"
          role="listbox"
          :aria-activedescendant="selectedId"
        >
          <li
            v-for="(cmd, idx) in filteredCommands"
            :id="`cmd-${idx}`"
            :key="cmd.id"
            role="option"
            class="command-palette__item flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
            :class="{
              'command-palette__item--selected': idx === selectedIndex,
            }"
            :aria-selected="idx === selectedIndex"
            @click="executeCommand(cmd)"
          >
            <span
              class="command-palette__icon shrink-0 w-8 h-8 flex items-center justify-center rounded-lg"
              :class="cmd.iconClass"
            >
              <CommandIcon :name="cmd.icon" class="h-4 w-4" />
            </span>
            <div class="command-palette__label flex-1 min-w-0">
              <span class="block truncate text-[var(--color-text)]">{{
                cmd.label
              }}</span>
              <span
                v-if="cmd.description"
                class="block truncate text-[11px] text-[var(--color-text-muted)]"
                >{{ cmd.description }}</span
              >
            </div>
            <span
              v-if="cmd.shortcut"
              class="command-palette__shortcut shrink-0 text-[11px] text-[var(--color-text-muted)]"
              >{{ cmd.shortcut }}</span
            >
          </li>
          <li
            v-if="filteredCommands.length === 0"
            class="px-4 py-6 text-center text-[var(--color-text-muted)] text-sm"
          >
            No commands found
          </li>
        </ul>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useCommandPaletteStore } from "../stores/commandPaletteStore";
import { useFileMaker } from "../composables/useFileMaker";
import { useUserRole } from "../composables/useUserRole";
import { useToastStore } from "../stores/toastStore";
import { useRecentEntriesStore } from "../stores/recentEntriesStore";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useRoute } from "vue-router";
import { LAYOUTS } from "../utils/filemakerApi";
import { getHomeRoute } from "../utils/homeTab";
import CommandIcon from "./CommandPaletteIcon.vue";
import type { IconName } from "./CommandPaletteIcon.vue";

interface PaletteCommand {
  id: string;
  label: string;
  description?: string;
  shortcut?: string;
  icon: IconName;
  iconClass: string;
  execute: () => void | Promise<void>;
}

const router = useRouter();
const route = useRoute();
const paletteStore = useCommandPaletteStore();
const toast = useToastStore();
const recentEntries = useRecentEntriesStore();
const documentSettings = useDocumentSettingsStore();
const { isConnected, findRecordsByQueryWithIds } = useFileMaker();
const { showForManager, isAdmin, roleLoaded } = useUserRole();

const visible = computed(() => paletteStore.visible);
const query = ref("");
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPod|iPhone|iPad/.test(navigator.platform);

const showManageUsersAndDocuments = computed(
  () => roleLoaded.value && isAdmin.value,
);

const allCommands = computed<PaletteCommand[]>(() => {
  const commands: PaletteCommand[] = [];

  const navigate = (
    to: string | { path: string; query?: Record<string, string> },
  ) => {
    paletteStore.close();
    if (typeof to === "string") {
      router.push(to);
    } else {
      router.push(to);
    }
  };

  const emitConnect = () => {
    paletteStore.close();
    window.dispatchEvent(new CustomEvent("open-connection-modal"));
  };

  commands.push({
    id: "payables",
    label: "Payables",
    description: "View all payables",
    shortcut: "/home",
    icon: "list",
    iconClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    execute: () => navigate(getHomeRoute()),
  });

  if (showForManager.value) {
    commands.push({
      id: "new-entry",
      label: "New entry",
      description: "Create a new payable entry",
      shortcut: "/entry",
      icon: "plus",
      iconClass: "bg-orange-500/20 text-orange-400",
      execute: () => navigate("/entry"),
    });
  }

  if (showForManager.value) {
    commands.push({
      id: "invoices",
      label: "Invoices",
      description: "View invoice thumbnails",
      shortcut: "/invoices",
      icon: "document",
      iconClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
      execute: () => navigate("/invoices"),
    });
  }

  if (showForManager.value) {
    commands.push({
      id: "cheque-collection",
      label: "Cheque collection",
      description: "Log cheque collections",
      shortcut: "/cheque-collection",
      icon: "bank",
      iconClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
      execute: () => navigate("/cheque-collection"),
    });
  }

  commands.push({
    id: "vendors",
    label: "Vendors",
    description: "Manage vendors",
    shortcut: "/vendors",
    icon: "building",
    iconClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    execute: () => navigate("/vendors"),
  });

  commands.push({
    id: "tax",
    label: "Tax",
    description: "Manage tax codes",
    shortcut: "/tax",
    icon: "tag",
    iconClass: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
    execute: () => navigate("/tax"),
  });

  commands.push({
    id: "settings",
    label: "Settings",
    description: "Configure preferences",
    shortcut: "/settings",
    icon: "cog",
    iconClass: "bg-white/10 text-[var(--color-text-muted)]",
    execute: () => navigate("/settings"),
  });

  if (showManageUsersAndDocuments.value) {
    commands.push({
      id: "manage-users",
      label: "Manage Users",
      description: "Add, edit, remove users",
      shortcut: "/settings/users",
      icon: "users",
      iconClass: "bg-white/10 text-[var(--color-text-muted)]",
      execute: () => navigate("/settings/users"),
    });
    commands.push({
      id: "documents",
      label: "Documents",
      description: "View and manage documents",
      shortcut: "/settings/documents",
      icon: "document",
      iconClass: "bg-white/10 text-[var(--color-text-muted)]",
      execute: () => navigate("/settings/documents"),
    });
  }

  if (isAdmin.value) {
    commands.push({
      id: "activity-logs",
      label: "Activity Logs",
      description: "View audit trail",
      shortcut: "/settings/logs",
      icon: "log",
      iconClass: "bg-white/10 text-[var(--color-text-muted)]",
      execute: () => navigate("/settings/logs"),
    });
    commands.push({
      id: "notification-emails",
      label: "Notification emails",
      description: "Manage email recipients, toggle Active",
      shortcut: "/settings/emails",
      icon: "mail",
      iconClass: "bg-white/10 text-[var(--color-text-muted)]",
      execute: () => navigate("/settings/emails"),
    });
  }

  if (!isConnected.value) {
    commands.push({
      id: "connect",
      label: "Connect to FileMaker",
      description: "Sign in to FileMaker database",
      icon: "link",
      iconClass: "bg-emerald-500/20 text-emerald-400",
      execute: emitConnect,
    });
  }

  return commands;
});

/** Check if query looks like a TransRef (e.g. AP-2024-001). */
function looksLikeTransRef(q: string): boolean {
  const t = q.trim();
  if (t.length < 3 || t.startsWith("/")) return false;
  return /^[A-Za-z0-9_-]+$/.test(t);
}

const baseFilteredCommands = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return allCommands.value;
  return allCommands.value.filter((c) => {
    const label = c.label.toLowerCase();
    const desc = (c.description ?? "").toLowerCase();
    const shortcut = (c.shortcut ?? "").toLowerCase();
    const id = c.id.toLowerCase();
    return (
      label.includes(q) ||
      desc.includes(q) ||
      shortcut.includes(q) ||
      id.includes(q)
    );
  });
});

const goToEntryCommand = computed<PaletteCommand | null>(() => {
  const q = query.value.trim();
  if (!looksLikeTransRef(q) || !isConnected.value) return null;
  return {
    id: `go-to-entry-${q}`,
    label: `Go to entry ${q}`,
    description: "Open this payable entry",
    shortcut: undefined,
    icon: "document",
    iconClass: "bg-orange-500/20 text-orange-400",
    execute: async () => {
      let result = await findRecordsByQueryWithIds(
        LAYOUTS.PAYABLES_MAIN,
        { TransRef: q },
        1,
      );
      if (!result.data?.length && q !== q.toUpperCase()) {
        result = await findRecordsByQueryWithIds(
          LAYOUTS.PAYABLES_MAIN,
          { TransRef: q.toUpperCase() },
          1,
        );
      }
      const { data, error } = result;
      if (error) {
        toast.error("Could not check entry: " + error);
        paletteStore.close();
        return;
      }
      if (!data || data.length === 0) {
        toast.error(`Entry not found: ${q}`);
        paletteStore.close();
        return;
      }
      const fd = data[0]?.fieldData as Record<string, unknown> | undefined;
      const canonicalRef = String(fd?.TransRef ?? q).trim();
      paletteStore.close();
      router.push({ name: "entry", query: { transRef: canonicalRef || q } });
    },
  };
});

function entryQuery(transRef: string) {
  const q: { transRef: string; from?: string } = { transRef };
  const from = route.query.from;
  if (
    from === "invoices" ||
    from === "cheque-collection" ||
    from === "settings-logs" ||
    from === "overdue"
  ) {
    q.from = from;
  }
  return { name: "entry" as const, query: q };
}

const recentEntryCommands = computed<PaletteCommand[]>(() => {
  if (!isConnected.value || recentEntries.refs.length === 0) return [];
  const q = query.value.trim().toLowerCase();
  const currentRef =
    (route.name === "entry" && typeof route.query.transRef === "string"
      ? route.query.transRef.trim()
      : null) || null;
  return recentEntries.refs
    .filter((ref) => ref !== currentRef)
    .filter((ref) => !q || ref.toLowerCase().includes(q))
    .slice(0, 8)
    .map((ref) => ({
      id: `recent-${ref}`,
      label: ref,
      description: "Recently viewed",
      shortcut: undefined,
      icon: "document" as const,
      iconClass: "bg-white/5 text-[var(--color-text-muted)]",
      execute: () => {
        paletteStore.close();
        router.push(entryQuery(ref));
      },
    }));
});

const filteredCommands = computed(() => {
  const goTo = goToEntryCommand.value;
  const recent = recentEntryCommands.value;
  const base = baseFilteredCommands.value;
  const goToRef = goTo ? query.value.trim() : null;
  const recentFiltered = goToRef
    ? recent.filter((c) => c.id !== `recent-${goToRef}`)
    : recent;
  const parts: PaletteCommand[] = [];
  if (goTo) parts.push(goTo);
  if (recentFiltered.length > 0) parts.push(...recentFiltered);
  parts.push(...base);
  return parts;
});

const selectedId = computed(() => {
  const cmd = filteredCommands.value[selectedIndex.value];
  if (!cmd) return undefined;
  const idx = filteredCommands.value.indexOf(cmd);
  return idx >= 0 ? `cmd-${idx}` : undefined;
});

watch(visible, (v) => {
  if (v) {
    query.value = "";
    selectedIndex.value = 0;
    setTimeout(() => inputRef.value?.focus(), 50);
  }
});

watch(filteredCommands, () => {
  selectedIndex.value = Math.min(
    selectedIndex.value,
    Math.max(0, filteredCommands.value.length - 1),
  );
});

function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return;
  if (e.key === "Escape") {
    e.preventDefault();
    paletteStore.close();
    return;
  }
  if (e.key === "ArrowDown") {
    e.preventDefault();
    selectedIndex.value =
      (selectedIndex.value + 1) % Math.max(1, filteredCommands.value.length);
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    selectedIndex.value =
      (selectedIndex.value - 1 + filteredCommands.value.length) %
      Math.max(1, filteredCommands.value.length);
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    executeSelected();
  }
}

async function executeSelected() {
  const cmd = filteredCommands.value[selectedIndex.value];
  if (cmd) await executeCommand(cmd);
}

async function executeCommand(cmd: PaletteCommand) {
  const result = cmd.execute();
  if (result instanceof Promise) await result;
}
</script>

<style scoped>
.command-palette-overlay {
  animation: command-palette-in 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.command-palette {
  animation: command-palette-slide 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.command-palette__input {
  font-size: var(--input-size);
}

.command-palette__item {
  --item-bg: transparent;
}

.command-palette__item:hover,
.command-palette__item--selected {
  --item-bg: rgba(255, 255, 255, 0.06);
  background: var(--item-bg);
}

.command-palette__list {
  scroll-behavior: smooth;
}

@keyframes command-palette-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes command-palette-slide {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
