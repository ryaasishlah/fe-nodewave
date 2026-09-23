import { apiClient } from "@/lib/axios";
import type { Department, Task, TaskStatus } from "@/types";

export interface CreateTaskPayload {
  projectId: string;
  title: string;
  description: string;
  department: Department;
  assigneeId?: string | null;
  isClientVisible?: boolean;
  prerequisiteIds?: string[];
}

export interface UpdateTaskPayload {
  version: number;
  title?: string;
  description?: string;
  department?: Department;
  status?: TaskStatus;
  assigneeId?: string | null;
  isClientVisible?: boolean;
  prerequisiteIds?: string[];
}

export interface AddAttachmentPayload {
  name?: string;
  fileName?: string;
  fileUrl: string;
  fileSize?: number;
  fileType?: string;
}

export const taskService = {
  getTasks: async (
    projectId: string,
    filters?: Record<string, unknown>,
  ): Promise<Task[]> => {
    let url = `/api/tasks?projectId=${encodeURIComponent(projectId)}`;
    if (filters && Object.keys(filters).length > 0) {
      url += `&filters=${encodeURIComponent(JSON.stringify(filters))}`;
    }
    const response = await apiClient.get(url);
    return response.data.data;
  },

  getTaskById: async (id: string): Promise<Task> => {
    const response = await apiClient.get(`/api/tasks/${id}`);
    return response.data.data;
  },

  createTask: async (payload: CreateTaskPayload): Promise<Task> => {
    const response = await apiClient.post("/api/tasks", payload);
    return response.data.data;
  },

  updateTask: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const response = await apiClient.put(`/api/tasks/${id}`, payload);
    return response.data.data;
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/tasks/${id}`);
  },

  addAttachment: async (
    taskId: string,
    payload: AddAttachmentPayload,
  ): Promise<void> => {
    const body = {
      fileName: payload.fileName || payload.name || "Deliverable Artifact",
      fileUrl: payload.fileUrl,
      fileSize: payload.fileSize || 1024,
      fileType: payload.fileType || "LINK",
    };
    await apiClient.post(`/api/tasks/${taskId}/attachments`, body);
  },
};
