"use client";

import {
  AlertCircle,
  ChevronRight,
  Eye,
  Lock,
  Paperclip,
  User as UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { Department, Role, type Task, TaskStatus } from "@/types";

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onQuickStatusChange: (task: Task, nextStatus: TaskStatus) => void;
}

export function TaskCard({
  task,
  onSelect,
  onQuickStatusChange,
}: TaskCardProps) {
  const { user } = useAuthStore();
  const isPM = user?.role === Role.PRODUCT_MANAGER;
  const isClient = user?.role === Role.CLIENT_GUEST;

  const getDepartmentColor = (dep: Department) => {
    switch (dep) {
      case Department.PRODUCT_MANAGEMENT:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case Department.UIUX:
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case Department.FRONTEND:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case Department.BACKEND:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    switch (current) {
      case TaskStatus.TODO:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.BLOCKED:
        return TaskStatus.IN_PROGRESS;
      case TaskStatus.IN_PROGRESS:
        return TaskStatus.DONE;
      case TaskStatus.DONE:
        return null;
    }
  };

  const nextStatus = getNextStatus(task.status);
  const isBlocked = task.isBlocked;

  // ABAC: PM cannot complete to DONE directly
  const isTransitionDisabled =
    isClient || (isPM && nextStatus === TaskStatus.DONE);

  return (
    <div className="group relative flex flex-col justify-between rounded-xl border border-[#22222f] bg-[#121218] p-4 hover:border-[#50B1D2]/50 hover:bg-[#151520] transition-all shadow-md space-y-3">
      {/* Top Badges */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`rounded-md border px-2 py-0.5 text-[9px] font-mono font-semibold uppercase ${getDepartmentColor(
              task.department,
            )}`}
          >
            {task.department}
          </span>

          <span className="rounded-md border border-[#28283a] bg-[#0d0d12] px-1.5 py-0.5 text-[9px] font-mono text-zinc-500">
            v{task.version}
          </span>
        </div>

        {isBlocked && (
          <span
            title="Prerequisite deliverable incomplete"
            className="flex items-center gap-1 rounded-md border border-red-500/40 bg-red-500/10 px-2 py-0.5 text-[9px] font-bold text-red-400"
          >
            <Lock className="h-2.5 w-2.5" />
            BLOCKED
          </span>
        )}
      </div>

      {/* Title & Description button trigger */}
      <button
        type="button"
        onClick={() => onSelect(task)}
        className="text-left w-full space-y-1 focus:outline-none cursor-pointer"
      >
        <h4 className="text-xs font-bold text-white group-hover:text-[#50B1D2] transition-colors line-clamp-2">
          {task.title}
        </h4>
        <p className="text-[11px] text-zinc-400 line-clamp-2">
          {task.description}
        </p>
      </button>

      {/* Blocking indicator message */}
      {isBlocked &&
        task.unmetPrerequisites &&
        task.unmetPrerequisites.length > 0 && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-2 text-[10px] text-red-300 flex items-start gap-1.5">
            <AlertCircle className="h-3 w-3 shrink-0 mt-0.5 text-red-400" />
            <span className="line-clamp-2">
              Blocked by:{" "}
              <span className="font-semibold text-white">
                {task.unmetPrerequisites.map((p) => p.title).join(", ")}
              </span>
            </span>
          </div>
        )}

      {/* Footer Info & Quick Actions */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#1c1c27] text-[10px]">
        {/* Assignee / Attachments */}
        <div className="flex items-center gap-2 text-zinc-400">
          <span className="flex items-center gap-1">
            <UserIcon className="h-3 w-3 text-zinc-500" />
            <span className="truncate max-w-[90px]">
              {task.assignee?.name ||
                (isClient ? "NodeWave Team" : "Unassigned")}
            </span>
          </span>

          {task.attachments && task.attachments.length > 0 && (
            <span className="flex items-center gap-0.5 text-zinc-500">
              <Paperclip className="h-3 w-3" />
              {task.attachments.length}
            </span>
          )}

          {task.isClientVisible && (
            <span
              title="Client Visible"
              className="flex items-center text-sky-400"
            >
              <Eye className="h-3 w-3" />
            </span>
          )}
        </div>

        {/* Quick Transition Button */}
        {nextStatus && !isClient && (
          <button
            type="button"
            disabled={isTransitionDisabled}
            title={
              isPM && nextStatus === TaskStatus.DONE
                ? "PM cannot mark tasks as DONE (ABAC rule)"
                : `Pindahkan status ke ${nextStatus}`
            }
            onClick={(e) => {
              e.stopPropagation();
              onQuickStatusChange(task, nextStatus);
            }}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
              isTransitionDisabled
                ? "opacity-30 cursor-not-allowed bg-zinc-800 text-zinc-500"
                : "bg-[#50B1D2]/10 border border-[#50B1D2]/30 text-[#50B1D2] hover:bg-[#50B1D2] hover:text-black shadow-[0_0_10px_rgba(80,177,210,0.15)]"
            }`}
          >
            <span>{nextStatus === TaskStatus.DONE ? "Selesai" : "Mulai"}</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
