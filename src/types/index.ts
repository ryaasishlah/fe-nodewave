export enum Role {
  PRODUCT_MANAGER = "PRODUCT_MANAGER",
  INTERNAL_TEAM = "INTERNAL_TEAM",
  UIUX_ENGINEER = "UIUX_ENGINEER",
  FRONTEND_ENGINEER = "FRONTEND_ENGINEER",
  BACKEND_ENGINEER = "BACKEND_ENGINEER",
  CLIENT_GUEST = "CLIENT_GUEST",
}

export enum Department {
  PRODUCT_MANAGEMENT = "PRODUCT_MANAGEMENT",
  UIUX = "UIUX",
  FRONTEND = "FRONTEND",
  BACKEND = "BACKEND",
  CLIENT = "CLIENT",
}

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  BLOCKED = "BLOCKED",
  DONE = "DONE",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  department: Department;
  avatarUrl?: string | null;
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  user: User;
}

export interface Project {
  id: string;
  name?: string;
  title?: string;
  description?: string | null;
  status?: string;
  clientVisible?: boolean;
  clientGuestId?: string | null;
  members?: ProjectMember[];
  _count?: {
    tasks: number;
    members: number;
  };
  metrics?: {
    totalTasks: number;
    completedTasks: number;
    progressPercentage: number;
  };
  stats?: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    progressPercentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName?: string;
  name?: string;
  fileUrl: string;
  fileSize?: number;
  fileType: string;
  createdAt: string;
}

export interface TaskDependency {
  id: string;
  taskId: string;
  prerequisiteTaskId?: string;
  dependsOnTaskId?: string;
  prerequisiteTask?: {
    id: string;
    title: string;
    status: TaskStatus;
    department: Department;
  };
  dependsOnTask?: {
    id: string;
    title: string;
    status: TaskStatus;
    department: Department;
  };
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  department: Department;
  status: TaskStatus;
  assigneeId?: string | null;
  assignee?: User | null;
  isClientVisible: boolean;
  version: number;
  prerequisites?: TaskDependency[];
  attachments?: TaskAttachment[];
  isBlocked?: boolean;
  unmetPrerequisites?: Array<{
    id: string;
    title: string;
    status: TaskStatus;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  projectId: string;
  taskId?: string | null;
  userId: string;
  user?: {
    name: string;
    email: string;
    role: Role;
    department: Department;
  };
  action: string;
  changedColumn?: string | null;
  oldValue?: string | null;
  newValue?: string | null;
  timestamp: string;
}

export interface StandupDepartmentSummary {
  completedYesterday: Array<{
    taskId?: string;
    id?: string;
    title: string;
    completedBy: string;
    timestamp: string;
  }>;
  blockedToday: Array<{
    taskId?: string;
    id?: string;
    title: string;
    assignee: string;
    waitingOn?: Array<{ title: string; status: TaskStatus }>;
    blockedBy?: Array<{ id?: string; title: string; status?: TaskStatus }>;
  }>;
}

export interface StandupSummary {
  projectId: string;
  generatedAt?: string;
  timestamp?: string;
  summary?: Record<string, StandupDepartmentSummary>;
  summaryByDepartment?: Record<string, StandupDepartmentSummary>;
}
