import { apiClient } from "@/lib/axios";
import type { Project } from "@/types";

export interface CreateProjectPayload {
  title: string;
  description: string;
  clientVisible?: boolean;
}

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await apiClient.get("/api/projects");
    return response.data.data;
  },

  getProjectById: async (id: string): Promise<Project> => {
    const response = await apiClient.get(`/api/projects/${id}`);
    return response.data.data;
  },

  createProject: async (payload: CreateProjectPayload): Promise<Project> => {
    const response = await apiClient.post("/api/projects", payload);
    return response.data.data;
  },
};
