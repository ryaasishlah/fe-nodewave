import { apiClient } from "@/lib/axios";
import type { StandupSummary } from "@/types";

export const standupService = {
  getStandupSummary: async (projectId: string): Promise<StandupSummary> => {
    const response = await apiClient.get(`/api/standup-summary/${projectId}`);
    const data = response.data.data;
    const summaryMap = data?.summary || data?.summaryByDepartment || {};
    return {
      ...data,
      summary: summaryMap,
      summaryByDepartment: summaryMap,
    };
  },
};
