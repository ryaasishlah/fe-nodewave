"use client";

import { useQuery } from "@tanstack/react-query";
import {
  FolderKanban,
  Plus,
  Search,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { projectService } from "@/services/project.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types";

export default function ProjectsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const {
    data: projects,
    isLoading: projectsLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getProjects,
    enabled: isAuthenticated,
  });

  const isPM = user?.role === Role.PRODUCT_MANAGER;
  const isClient = user?.role === Role.CLIENT_GUEST;

  const filteredProjects = (projects || []).filter((p) => {
    const title = p.name || p.title || "";
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Compute aggregate stats across projects
  const totalProjects = projects?.length || 0;
  const totalTasks =
    projects?.reduce(
      (acc, p) =>
        acc +
        (p.metrics?.totalTasks ?? p.stats?.totalTasks ?? p._count?.tasks ?? 0),
      0,
    ) || 0;
  const totalCompleted =
    projects?.reduce(
      (acc, p) =>
        acc + (p.metrics?.completedTasks ?? p.stats?.completedTasks ?? 0),
      0,
    ) || 0;
  const overallProgress =
    totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  if (authLoading || (!isAuthenticated && !error)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#50B1D2] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070607] py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Projects & Deliverables
              </h1>
              {isClient && (
                <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-400">
                  Client Portal View
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Track cross-functional milestones, dependencies, and real-time
              audit trails
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isPM && (
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-[#50B1D2] px-4 py-2.5 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-all shadow-[0_0_15px_rgba(80,177,210,0.25)]"
              >
                <Plus className="h-4 w-4" />
                New Project
              </button>
            )}
          </div>
        </div>

        {/* Global Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-[#202029] bg-[#111116] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                Active Projects
              </span>
              <FolderKanban className="h-4 w-4 text-[#50B1D2]" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white font-mono">
              {totalProjects}
            </div>
          </div>

          <div className="rounded-2xl border border-[#202029] bg-[#111116] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                Total Deliverables
              </span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white font-mono">
              {totalTasks}{" "}
              <span className="text-xs font-normal text-zinc-500">
                ({totalCompleted} done)
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#202029] bg-[#111116] p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-400">
                Overall Completion
              </span>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white font-mono">
              {overallProgress}%
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search projects by title or description..."
              className="w-full rounded-xl border border-[#242433] bg-[#111116] py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:border-[#50B1D2] focus:outline-none focus:ring-1 focus:ring-[#50B1D2] transition-colors"
            />
          </div>
        </div>

        {/* Project Grid */}
        {projectsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl border border-[#202029] bg-[#111116]/50 animate-pulse p-6"
              />
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#202029] bg-[#111116] p-12 text-center space-y-3">
            <FolderKanban className="mx-auto h-10 w-10 text-zinc-600" />
            <h3 className="text-sm font-semibold text-white">
              No Projects Found
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              {searchTerm
                ? "No projects match your search query."
                : "No active projects available in this workspace."}
            </p>
          </div>
        )}
      </div>

      {/* Create Project Modal (PM only) */}
      {isPM && (
        <CreateProjectModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
}
