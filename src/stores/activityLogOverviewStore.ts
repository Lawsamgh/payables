/**
 * Activity log overview stats for the right sidebar when on the Activity Logs page.
 * Updated by SettingsLogsView when it loads.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useActivityLogOverviewStore = defineStore("activityLogOverview", () => {
  const logCount = ref(0);

  function setLogCount(count: number): void {
    logCount.value = count;
  }

  return {
    logCount: computed(() => logCount.value),
    setLogCount,
  };
});
