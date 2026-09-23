import { apiClient } from "@/lib/axios";
import type { AuditLog } from "@/types";

export const auditService = {
  getAuditLogs: async (
    projectId: string,
    taskId?: string,
  ): Promise<AuditLog[]> => {
    let url = `/api/audit-logs?projectId=${encodeURIComponent(projectId)}`;
    if (taskId) {
      url += `&taskId=${encodeURIComponent(taskId)}`;
    }
    const response = await apiClient.get(url);
    return response.data.data;
  },
};
