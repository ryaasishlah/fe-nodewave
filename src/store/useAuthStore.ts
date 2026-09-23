import { create } from "zustand";
import { apiClient } from "@/lib/axios";
import { Department, Role, type User } from "@/types";

export interface DemoAccount {
  label: string;
  role: Role;
  department: Department;
  email: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    label: "Product Manager",
    role: Role.PRODUCT_MANAGER,
    department: Department.PRODUCT_MANAGEMENT,
    email: "pm@nodewave.id",
    description: "Full management access, cannot directly mark Done",
  },
  {
    label: "UI/UX Designer",
    role: Role.UIUX_ENGINEER,
    department: Department.UIUX,
    email: "uiux@nodewave.id",
    description: "Design deliverable execution & attachments",
  },
  {
    label: "Frontend Engineer",
    role: Role.FRONTEND_ENGINEER,
    department: Department.FRONTEND,
    email: "fe@nodewave.id",
    description: "Client-side delivery & state updates",
  },
  {
    label: "Backend Engineer",
    role: Role.BACKEND_ENGINEER,
    department: Department.BACKEND,
    email: "be@nodewave.id",
    description: "API/Database architecture & execution",
  },
  {
    label: "Client Stakeholder",
    role: Role.CLIENT_GUEST,
    department: Department.CLIENT,
    email: "client@nodewave.id",
    description: "Isolated guest portal, progress metrics & masked data",
  },
];

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password?: string) => Promise<boolean>;
  logout: () => void;
  initAuth: () => void;
  quickSwitch: (email: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  initAuth: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("nodewave_auth_token");
    const userStr = localStorage.getItem("nodewave_auth_user");
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        localStorage.removeItem("nodewave_auth_token");
        localStorage.removeItem("nodewave_auth_user");
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  login: async (email: string, password = "password123") => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data.data;

      localStorage.setItem("nodewave_auth_token", token);
      localStorage.setItem("nodewave_auth_user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to authenticate";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  quickSwitch: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password: "password123",
      });

      const { token, user } = response.data.data;

      localStorage.setItem("nodewave_auth_token", token);
      localStorage.setItem("nodewave_auth_user", JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Role switch failed";
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("nodewave_auth_token");
    localStorage.removeItem("nodewave_auth_user");
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },
}));
