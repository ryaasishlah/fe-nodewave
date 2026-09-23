"use client";

import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Kanban,
  Lock,
  RefreshCw,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { projectService } from "@/services/project.service";
import { standupService } from "@/services/standup.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Department } from "@/types";

export default function StandupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => projectService.getProjectById(projectId),
    enabled: isAuthenticated && !!projectId,
  });

  const {
    data: standup,
    isLoading: standupLoading,
    refetch,
  } = useQuery({
    queryKey: ["standup", projectId],
    queryFn: () => standupService.getStandupSummary(projectId),
    enabled: isAuthenticated && !!projectId,
  });

  const departments = [
    {
      key: Department.UIUX,
      label: "UI/UX Design",
      color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
    },
    {
      key: Department.FRONTEND,
      label: "Frontend Engineering",
      color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    },
    {
      key: Department.BACKEND,
      label: "Backend Engineering",
      color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    },
    {
      key: Department.PRODUCT_MANAGEMENT,
      label: "Product Management",
      color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    },
  ];

  const handleCopyStandup = () => {
    if (!standup) return;

    let text = `*Daily Standup Summary - ${project?.title || "Project"}*\n`;
    text += `Generated: ${new Date().toLocaleDateString()}\n\n`;

    departments.forEach((d) => {
      const summary = standup.summaryByDepartment[d.key];
      text += `*${d.label}*\n`;

      if (summary?.completedYesterday.length > 0) {
        text += `  Completed (Last 24h):\n`;
        summary.completedYesterday.forEach((t) => {
          text += `   - ${t.title} (by ${t.completedBy})\n`;
        });
      } else {
        text += `  Completed (Last 24h): None\n`;
      }

      if (summary?.blockedToday.length > 0) {
        text += `  Blocked Today:\n`;
        summary.blockedToday.forEach((t) => {
          const blockers = t.blockedBy.map((b) => b.title).join(", ");
          text += `   - ${t.title} [Assignee: ${t.assignee}] (Blocked by: ${blockers})\n`;
        });
      } else {
        text += `  Blocked Today: None\n`;
      }

      text += "\n";
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070607] py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#202029]">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}/board`}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#242433] bg-[#111116] text-zinc-400 hover:border-[#50B1D2] hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Daily Standup Auto-Summary
                </h1>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-amber-400">
                  Last 24h Audit Sync
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {project?.title || "Project"} — Automated cross-department
                progress and blocker aggregation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => refetch()}
              title="Refresh summary"
              className="flex items-center justify-center h-8 w-8 rounded-xl border border-[#262635] bg-[#111116] text-zinc-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>

            <Link
              href={`/projects/${projectId}/board`}
              className="flex items-center gap-1.5 rounded-xl border border-[#262635] bg-[#111116] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-[#181822] transition-colors"
            >
              <Kanban className="h-3.5 w-3.5" />
              Kanban Board
            </Link>

            <button
              type="button"
              onClick={handleCopyStandup}
              disabled={standupLoading || !standup}
              className="flex items-center gap-1.5 rounded-xl bg-[#50B1D2] px-4 py-2 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-all shadow-[0_0_15px_rgba(80,177,210,0.25)] disabled:opacity-50"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-black" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  Copy Standup Text
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        {standupLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-[#202029] bg-[#111116]/50 animate-pulse p-6"
              />
            ))}
          </div>
        ) : standup ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {departments.map((dept) => {
              const summary = standup.summaryByDepartment[dept.key];
              const completedCount = summary?.completedYesterday?.length || 0;
              const blockedCount = summary?.blockedToday?.length || 0;

              return (
                <div
                  key={dept.key}
                  className="rounded-2xl border border-[#202029] bg-[#111116] p-6 space-y-5 shadow-lg"
                >
                  {/* Department Title */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#1c1c26]">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-zinc-400" />
                      <h3 className="text-sm font-bold text-white">
                        {dept.label}
                      </h3>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${dept.color}`}
                    >
                      {dept.key}
                    </span>
                  </div>

                  {/* Completed Yesterday Section */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Completed (Last
                        24h)
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {completedCount} items
                      </span>
                    </div>

                    {completedCount > 0 ? (
                      <div className="space-y-1.5">
                        {summary.completedYesterday.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs space-y-1"
                          >
                            <div className="font-semibold text-white">
                              {task.title}
                            </div>
                            <div className="flex items-center justify-between text-[10px] text-zinc-400">
                              <span>Completed by: {task.completedBy}</span>
                              <span className="font-mono text-zinc-500">
                                {new Date(task.timestamp).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c11] p-3 text-center text-xs text-zinc-500">
                        No deliverables completed in the last 24 hours.
                      </div>
                    )}
                  </div>

                  {/* Blocked Today Section */}
                  <div className="space-y-2 pt-2 border-t border-[#1c1c26]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5" /> Currently
                        Blocked
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        {blockedCount} items
                      </span>
                    </div>

                    {blockedCount > 0 ? (
                      <div className="space-y-1.5">
                        {summary.blockedToday.map((task) => (
                          <div
                            key={task.id}
                            className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-white">
                                {task.title}
                              </span>
                              <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 uppercase">
                                <Lock className="h-2.5 w-2.5" /> Blocked
                              </span>
                            </div>

                            <div className="text-[10px] text-zinc-400">
                              Assignee:{" "}
                              <span className="text-zinc-200">
                                {task.assignee}
                              </span>
                            </div>

                            <div className="text-[10px] text-red-300/90 rounded bg-red-950/20 p-1.5 border border-red-900/30">
                              Waiting on prerequisite:{" "}
                              <span className="font-semibold text-white">
                                {task.blockedBy.map((b) => b.title).join(", ")}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-[#1a1a24] bg-[#0c0c11] p-3 text-center text-xs text-zinc-500">
                        No blocked deliverables in this department.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#202029] bg-[#111116] p-12 text-center text-xs text-zinc-500">
            No standup data available for this project.
          </div>
        )}
      </div>
    </div>
  );
}
