"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, FolderPlus, X } from "lucide-react";
import { useState } from "react";
import { projectService } from "@/services/project.service";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
}: CreateProjectModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientVisible, setClientVisible] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: projectService.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
      setTitle("");
      setDescription("");
      setClientVisible(true);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to create project";
      setFormError(msg);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Project title is required");
      return;
    }
    mutation.mutate({ title, description, clientVisible });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#2a2a38] bg-[#121218] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#202029]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#50B1D2]/10 text-[#50B1D2] border border-[#50B1D2]/30">
              <FolderPlus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Create New Project
              </h2>
              <p className="text-xs text-zinc-400">
                Define deliverable scope and client visibility
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-[#1a1a24] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="title"
              className="text-xs font-semibold text-zinc-300"
            >
              Project Title
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next-Gen Mobile Banking Redesign"
              className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none focus:ring-1 focus:ring-[#50B1D2] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="description"
              className="text-xs font-semibold text-zinc-300"
            >
              Description & Scope
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of deliverables, milestone deadlines, and team objectives..."
              className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none focus:ring-1 focus:ring-[#50B1D2] transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[#262635] bg-[#0e0e14] p-3">
            <div>
              <div className="text-xs font-semibold text-white">
                Client Guest Portal Access
              </div>
              <p className="text-[11px] text-zinc-400">
                Make project and client-flagged deliverables visible to client
                stakeholders
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={clientVisible}
                onChange={(e) => setClientVisible(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-5 bg-[#262635] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#50B1D2]" />
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#202029]">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#262635] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-[#1a1a24] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="rounded-xl bg-[#50B1D2] px-5 py-2 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-all disabled:opacity-50"
            >
              {mutation.isPending ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
