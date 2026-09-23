"use client";

import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Kanban,
  ListTodo,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import type { Project } from "@/types";
import { Role } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { user } = useAuthStore();
  const isClient = user?.role === Role.CLIENT_GUEST;

  const projectTitle = project.name || project.title || "Project";
  const total =
    project.metrics?.totalTasks ??
    project.stats?.totalTasks ??
    project._count?.tasks ??
    0;
  const completed =
    project.metrics?.completedTasks ?? project.stats?.completedTasks ?? 0;
  const inProgress = project.stats?.inProgressTasks ?? 0;
  const todo = project.stats?.todoTasks ?? 0;
  const percentage =
    project.metrics?.progressPercentage ??
    project.stats?.progressPercentage ??
    (total > 0 ? Math.round((completed / total) * 100) : 0);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#202029] bg-[#111116] p-6 hover:border-[#50B1D2]/40 hover:bg-[#14141c] transition-all shadow-lg">
      <div className="space-y-4">
        {/* Header: Title and Badges */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white group-hover:text-[#50B1D2] transition-colors">
              {projectTitle}
            </h3>
            <p className="text-xs text-zinc-400 line-clamp-2">
              {project.description || "No project description provided."}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 font-mono">
              {project.status || "ACTIVE"}
            </span>
            {project.clientVisible && (
              <span className="flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[9px] font-medium text-sky-300">
                <Eye className="h-2.5 w-2.5" />
                Client Visible
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar & Percentage */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-zinc-400">
              <TrendingUp className="h-3.5 w-3.5 text-[#50B1D2]" />
              Progress ({completed}/{total} deliverables)
            </span>
            <span className="font-bold text-white font-mono">
              {percentage}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#1e1e28]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#50B1D2] to-[#094C86] transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Task Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="flex flex-col rounded-xl border border-[#20202a] bg-[#0d0d12] p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
              <ListTodo className="h-3 w-3 text-zinc-400" /> Todo
            </span>
            <span className="text-sm font-bold text-white font-mono mt-0.5">
              {todo}
            </span>
          </div>

          <div className="flex flex-col rounded-xl border border-[#20202a] bg-[#0d0d12] p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
              <Clock className="h-3 w-3 text-blue-400" /> In Progress
            </span>
            <span className="text-sm font-bold text-blue-400 font-mono mt-0.5">
              {inProgress}
            </span>
          </div>

          <div className="flex flex-col rounded-xl border border-[#20202a] bg-[#0d0d12] p-2.5 text-center">
            <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-400" /> Done
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
              {completed}
            </span>
          </div>
        </div>

        {/* Team Members List (Hidden for Client to prevent identity leakage) */}
        {!isClient && project.members && project.members.length > 0 && (
          <div className="pt-1">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
              Assigned Team Members ({project.members.length})
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.members.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-1.5 rounded-lg border border-[#242433] bg-[#161620] px-2 py-1 text-[11px] text-zinc-300"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[#50B1D2]" />
                  <span>{m.user?.name || "Member"}</span>
                  <span className="text-[9px] text-zinc-400 font-mono">
                    [{m.user?.department}]
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="flex items-center justify-between gap-2.5 pt-5 mt-4 border-t border-[#1e1e28]">
        {!isClient ? (
          <>
            <Link
              href={`/projects/${project.id}/standup`}
              className="flex items-center gap-1.5 rounded-xl border border-[#262635] px-3 py-2 text-xs font-medium text-zinc-300 hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Daily Standup
            </Link>

            <Link
              href={`/projects/${project.id}/board`}
              className="flex items-center gap-1.5 rounded-xl bg-[#50B1D2] px-4 py-2 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-all group-hover:shadow-[0_0_15px_rgba(80,177,210,0.3)]"
            >
              <Kanban className="h-3.5 w-3.5" />
              Open Kanban
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </>
        ) : (
          <Link
            href={`/client-portal?projectId=${project.id}`}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/30 transition-all"
          >
            <Eye className="h-3.5 w-3.5" />
            View Client Deliverables
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </div>
  );
}
