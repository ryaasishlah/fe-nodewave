"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  ListTodo,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { ConflictModal } from "@/components/kanban/ConflictModal";
import { CreateTaskModal } from "@/components/kanban/CreateTaskModal";
import { TaskCard } from "@/components/kanban/TaskCard";
import { TaskDetailModal } from "@/components/kanban/TaskDetailModal";
import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Role, type Task, TaskStatus } from "@/types";

export default function KanbanBoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [conflictTaskTitle, setConflictTaskTitle] = useState<string | null>(
    null,
  );
  const [isConflictOpen, setIsConflictOpen] = useState(false);
  const [violationAlert, setViolationAlert] = useState<string | null>(null);
  const [deptFilter, setDeptFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch Project
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: isAuthenticated && !!projectId,
  });

  // Fetch Tasks
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    refetch: refetchTasks,
  } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: () => taskService.getTasks(projectId),
    enabled: isAuthenticated && !!projectId,
  });

  // Quick Status Transition Mutation
  const statusMutation = useMutation({
    mutationFn: ({
      task,
      nextStatus,
    }: {
      task: Task;
      nextStatus: TaskStatus;
    }) =>
      taskService.updateTask(task.id, {
        version: task.version,
        status: nextStatus,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setViolationAlert(null);
    },
    onError: (err: unknown, variables) => {
      const status = (err as { response?: { status?: number } }).response
        ?.status;
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to update deliverable status";

      if (status === 409) {
        // Concurrency conflict
        setConflictTaskTitle(variables.task.title);
        setIsConflictOpen(true);
      } else if (status === 422) {
        // Inter-task dependency lock violation
        setViolationAlert(`Dependency Lock (422): ${message}`);
      } else {
        setViolationAlert(message);
      }
    },
  });

  const handleQuickStatusChange = (task: Task, nextStatus: TaskStatus) => {
    setViolationAlert(null);
    statusMutation.mutate({ task, nextStatus });
  };

  const isPM = user?.role === Role.PRODUCT_MANAGER;
  const isClient = user?.role === Role.CLIENT_GUEST;

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesDept = deptFilter === "ALL" || t.department === deptFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesDept && matchesSearch;
  });

  const columns: Array<{
    status: TaskStatus;
    label: string;
    icon: React.ReactNode;
    badgeColor: string;
  }> = [
    {
      status: TaskStatus.TODO,
      label: "To Do",
      icon: <ListTodo className="h-4 w-4 text-zinc-400" />,
      badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    },
    {
      status: TaskStatus.IN_PROGRESS,
      label: "In Progress",
      icon: <Clock className="h-4 w-4 text-blue-400" />,
      badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    {
      status: TaskStatus.BLOCKED,
      label: "Blocked",
      icon: <AlertCircle className="h-4 w-4 text-red-400" />,
      badgeColor: "bg-red-500/10 text-red-400 border-red-500/30",
    },
    {
      status: TaskStatus.DONE,
      label: "Done",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070607] py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#202029]">
          <div className="flex items-center gap-4">
            <Link
              href="/projects"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#242433] bg-[#111116] text-zinc-400 hover:border-[#50B1D2] hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  {project?.name || project?.title || "Deliverable Board"}
                </h1>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-400">
                  {project?.status || "ACTIVE"}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                State-machine dependency resolution & optimistic locking board
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {!isClient && (
              <Link
                href={`/projects/${projectId}/standup`}
                className="flex items-center gap-1.5 rounded-xl border border-[#262635] bg-[#111116] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Daily Standup
              </Link>
            )}

            <button
              type="button"
              onClick={() => refetchTasks()}
              title="Refresh deliverables"
              className="flex items-center justify-center h-8 w-8 rounded-xl border border-[#262635] bg-[#111116] text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            {isPM && (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#50B1D2] px-4 py-2 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-all shadow-[0_0_15px_rgba(80,177,210,0.25)]"
              >
                <Plus className="h-4 w-4" />
                New Deliverable
              </button>
            )}
          </div>
        </div>

        {/* Violation / Error Alert (422 Dependency Lock) */}
        {violationAlert && (
          <div className="flex items-center justify-between rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-300">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span>{violationAlert}</span>
            </div>
            <button
              type="button"
              onClick={() => setViolationAlert(null)}
              className="text-zinc-400 hover:text-white text-xs underline font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search deliverables..."
              className="w-full rounded-xl border border-[#242433] bg-[#111116] py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-[#50B1D2] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-medium text-zinc-500 flex items-center gap-1 mr-1">
              <Filter className="h-3 w-3" /> Dept:
            </span>
            {["ALL", "PRODUCT_MANAGEMENT", "UIUX", "FRONTEND", "BACKEND"].map(
              (dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => setDeptFilter(dept)}
                  className={`rounded-lg px-2.5 py-1 text-[10px] font-mono font-medium transition-colors whitespace-nowrap ${
                    deptFilter === dept
                      ? "bg-[#50B1D2]/20 border border-[#50B1D2]/40 text-[#50B1D2]"
                      : "border border-[#20202a] bg-[#101016] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {dept === "PRODUCT_MANAGEMENT" ? "PM" : dept}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Kanban Board Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
          {columns.map((col) => {
            const columnTasks = filteredTasks.filter(
              (t) => t.status === col.status,
            );

            return (
              <div
                key={col.status}
                className="flex flex-col rounded-2xl border border-[#1f1f2a] bg-[#0e0e14] p-3 space-y-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1 border-b border-[#1c1c26] pb-2.5">
                  <div className="flex items-center gap-2">
                    {col.icon}
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {col.label}
                    </span>
                  </div>
                  <span
                    className={`rounded-full border px-2 py-0.2 text-[10px] font-mono font-bold ${col.badgeColor}`}
                  >
                    {columnTasks.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="flex-1 space-y-2.5">
                  {tasksLoading ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-28 rounded-xl border border-[#202029] bg-[#121218]/40 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : columnTasks.length > 0 ? (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onSelect={(t) => {
                          setSelectedTask(t);
                          setIsDetailOpen(true);
                        }}
                        onQuickStatusChange={handleQuickStatusChange}
                      />
                    ))
                  ) : (
                    <div className="h-32 flex flex-col items-center justify-center rounded-xl border border-dashed border-[#1e1e28] text-center p-4">
                      <span className="text-[11px] text-zinc-600">
                        No deliverables
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          isOpen={isDetailOpen}
          allTasks={tasks}
          onClose={() => {
            setIsDetailOpen(false);
            setSelectedTask(null);
          }}
          onConflict={(title) => {
            setConflictTaskTitle(title);
            setIsConflictOpen(true);
          }}
        />
      )}

      {/* Create Task Modal */}
      {isPM && (
        <CreateTaskModal
          projectId={projectId}
          isOpen={isCreateOpen}
          existingTasks={tasks}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      {/* 409 Concurrency Conflict Modal */}
      <ConflictModal
        isOpen={isConflictOpen}
        taskTitle={conflictTaskTitle || undefined}
        onClose={() => setIsConflictOpen(false)}
        onReload={() => refetchTasks()}
      />
    </div>
  );
}
