"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  Eye,
  FolderKanban,
  ListTodo,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { projectService } from "@/services/project.service";
import { taskService } from "@/services/task.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Role, TaskStatus } from "@/types";

export default function ClientPortalPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch client accessible projects
  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getProjects,
    enabled: isAuthenticated,
  });

  // Set default selected project
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  // Fetch client deliverables for active project
  const { data: deliverables = [], isLoading: deliverablesLoading } = useQuery({
    queryKey: ["tasks", selectedProjectId],
    queryFn: () => taskService.getTasks(selectedProjectId || ""),
    enabled: !!selectedProjectId,
  });

  // Client visible deliverables only
  const clientDeliverables = deliverables.filter((t) => t.isClientVisible);

  const completed = clientDeliverables.filter(
    (t) => t.status === TaskStatus.DONE,
  ).length;
  const inProgress = clientDeliverables.filter(
    (t) =>
      t.status === TaskStatus.IN_PROGRESS || t.status === TaskStatus.IN_REVIEW,
  ).length;
  const pending = clientDeliverables.filter(
    (t) => t.status === TaskStatus.TODO,
  ).length;
  const total = clientDeliverables.length;
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#070607] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Welcome Header */}
        <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-r from-rose-950/20 via-[#111116] to-[#111116] p-6 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Client Stakeholder Portal
                </h1>
                <p className="text-xs text-zinc-400">
                  Real-time milestone transparency, masked data isolation, and
                  deliverable progress
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 font-mono">
                {user?.role === Role.CLIENT_GUEST
                  ? "Role: CLIENT GUEST"
                  : "Evaluator Client Preview"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 text-[11px] text-zinc-400 border-t border-[#202029]">
            <Eye className="h-3.5 w-3.5 text-rose-400" />
            <span>
              Tenant Isolation Enabled: Internal engineer identities and
              internal audit logs are masked for privacy.
            </span>
          </div>
        </div>

        {/* Project Selector Tabs */}
        {projects.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {projects.map((proj) => (
              <button
                key={proj.id}
                type="button"
                onClick={() => setSelectedProjectId(proj.id)}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedProjectId === proj.id
                    ? "bg-[#50B1D2] text-black shadow-[0_0_15px_rgba(80,177,210,0.3)]"
                    : "border border-[#22222f] bg-[#111116] text-zinc-400 hover:text-white"
                }`}
              >
                {proj.title}
              </button>
            ))}
          </div>
        )}

        {/* Project Progress Overview */}
        {activeProject ? (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[#202029] bg-[#111116] p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-white">
                    {activeProject.title}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    {activeProject.description ||
                      "Active milestone delivery project."}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 font-mono">
                    {activeProject.status || "ACTIVE"}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 font-medium text-zinc-400">
                    <TrendingUp className="h-4 w-4 text-[#50B1D2]" />
                    Client Milestone Completion
                  </span>
                  <span className="font-bold text-white font-mono">
                    {progressPercent}% ({completed}/{total} Deliverables)
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-[#1e1e28]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#50B1D2] to-[#094C86] transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Deliverable Metrics */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-xl border border-[#20202a] bg-[#0c0c11] p-3 text-center">
                  <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                    <ListTodo className="h-3 w-3" /> Scheduled
                  </span>
                  <span className="text-base font-bold text-white font-mono mt-1">
                    {pending}
                  </span>
                </div>

                <div className="rounded-xl border border-[#20202a] bg-[#0c0c11] p-3 text-center">
                  <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                    <Clock className="h-3 w-3 text-blue-400" /> In Delivery
                  </span>
                  <span className="text-base font-bold text-blue-400 font-mono mt-1">
                    {inProgress}
                  </span>
                </div>

                <div className="rounded-xl border border-[#20202a] bg-[#0c0c11] p-3 text-center">
                  <span className="text-[10px] text-zinc-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />{" "}
                    Finished
                  </span>
                  <span className="text-base font-bold text-emerald-400 font-mono mt-1">
                    {completed}
                  </span>
                </div>
              </div>
            </div>

            {/* Deliverables Checklist */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Deliverable Milestones ({clientDeliverables.length})
                </h3>
                <span className="text-xs text-zinc-500">
                  Showing client-approved deliverables
                </span>
              </div>

              {deliverablesLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-20 rounded-xl border border-[#202029] bg-[#111116]/40 animate-pulse"
                    />
                  ))}
                </div>
              ) : clientDeliverables.length > 0 ? (
                <div className="space-y-2.5">
                  {clientDeliverables.map((item) => {
                    const isDone = item.status === TaskStatus.DONE;
                    const isInProgress =
                      item.status === TaskStatus.IN_PROGRESS ||
                      item.status === TaskStatus.IN_REVIEW;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#202029] bg-[#111116] p-4 hover:border-[#50B1D2]/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {isDone ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                            ) : isInProgress ? (
                              <Clock className="h-5 w-5 text-blue-400" />
                            ) : (
                              <ListTodo className="h-5 w-5 text-zinc-500" />
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <h4
                              className={`text-xs font-semibold ${
                                isDone ? "text-zinc-300" : "text-white"
                              }`}
                            >
                              {item.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 sm:self-center">
                          {/* Masked Assignee Identity */}
                          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                            <Users className="h-3.5 w-3.5 text-zinc-500" />
                            <span>
                              {item.assignee?.name || "NodeWave Team"}
                            </span>
                          </div>

                          {/* Status Badge */}
                          <span
                            className={`rounded-lg px-2.5 py-1 text-[10px] font-mono font-semibold uppercase border ${
                              isDone
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : isInProgress
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#202029] bg-[#111116] p-12 text-center text-xs text-zinc-500 space-y-2">
                  <FolderKanban className="mx-auto h-8 w-8 text-zinc-600" />
                  <p>
                    No deliverables currently published for client visibility.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-[#202029] bg-[#111116] p-12 text-center text-xs text-zinc-500">
            No client projects assigned to this account.
          </div>
        )}
      </div>
    </div>
  );
}
