"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Link2, Plus, X } from "lucide-react";
import { useState } from "react";
import { type CreateTaskPayload, taskService } from "@/services/task.service";
import { Department, type Task } from "@/types";

interface CreateTaskModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  existingTasks: Task[];
}

export function CreateTaskModal({
  projectId,
  isOpen,
  onClose,
  existingTasks,
}: CreateTaskModalProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState<Department>(Department.FRONTEND);
  const [isClientVisible, setIsClientVisible] = useState(false);
  const [selectedPrereqIds, setSelectedPrereqIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
      setTitle("");
      setDescription("");
      setSelectedPrereqIds([]);
      setFormError(null);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to create deliverable";
      setFormError(msg);
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setFormError("Title and description are required");
      return;
    }

    mutation.mutate({
      projectId,
      title,
      description,
      department,
      isClientVisible,
      prerequisiteIds: selectedPrereqIds,
    });
  };

  const togglePrereq = (taskId: string) => {
    if (selectedPrereqIds.includes(taskId)) {
      setSelectedPrereqIds(selectedPrereqIds.filter((id) => id !== taskId));
    } else {
      setSelectedPrereqIds([...selectedPrereqIds, taskId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] rounded-2xl border border-[#2a2a38] bg-[#121217] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202029] bg-[#0e0e13]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#50B1D2]/10 text-[#50B1D2] border border-[#50B1D2]/30">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                New Deliverable
              </h3>
              <p className="text-xs text-zinc-400">
                Define task scope, department, and prerequisite dependencies
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1a1a24] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error message */}
        {formError && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <label
              htmlFor="create-title"
              className="text-xs font-semibold text-zinc-300"
            >
              Deliverable Title
            </label>
            <input
              id="create-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Optimistic Locking Modal"
              className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="create-desc"
              className="text-xs font-semibold text-zinc-300"
            >
              Description & Acceptance Criteria
            </label>
            <textarea
              id="create-desc"
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail the technical specifications and deliverable expectations..."
              className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="create-dep"
              className="text-xs font-semibold text-zinc-300"
            >
              Department
            </label>
            <select
              id="create-dep"
              value={department}
              onChange={(e) => setDepartment(e.target.value as Department)}
              className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white focus:border-[#50B1D2] focus:outline-none"
            >
              <option value={Department.PRODUCT_MANAGEMENT}>
                PRODUCT_MANAGEMENT
              </option>
              <option value={Department.UIUX}>UIUX</option>
              <option value={Department.FRONTEND}>FRONTEND</option>
              <option value={Department.BACKEND}>BACKEND</option>
            </select>
          </div>

          {/* Prerequisite Selection */}
          <div className="space-y-2 rounded-xl border border-[#242433] bg-[#0d0d12] p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5 text-[#50B1D2]" />
                Prerequisite Deliverables
              </span>
              <span className="text-[10px] text-zinc-400">
                {selectedPrereqIds.length} Selected
              </span>
            </div>
            <p className="text-[11px] text-zinc-500">
              Select tasks that must be DONE before this deliverable can start
              (Inter-Task Dependency rule).
            </p>

            {existingTasks.length > 0 ? (
              <div className="max-h-36 overflow-y-auto space-y-1 pt-1">
                {existingTasks.map((t) => {
                  const isChecked = selectedPrereqIds.includes(t.id);
                  return (
                    <label
                      key={t.id}
                      className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        isChecked
                          ? "bg-[#181824] border-[#50B1D2]/50 text-white"
                          : "border-[#1d1d28] hover:bg-[#14141c] text-zinc-400"
                      }`}
                    >
                      <span className="truncate pr-2">{t.title}</span>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePrereq(t.id)}
                        className="rounded border-zinc-700 bg-zinc-900 text-[#50B1D2] focus:ring-0"
                      />
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-zinc-500">
                No existing tasks in project yet.
              </p>
            )}
          </div>

          {/* Client Visibility Toggle */}
          <div className="flex items-center justify-between rounded-xl border border-[#242433] bg-[#0d0d12] p-3">
            <div>
              <span className="text-xs font-semibold text-white">
                Client Visible
              </span>
              <p className="text-[11px] text-zinc-400">
                Permit client guest stakeholders to inspect this deliverable
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isClientVisible}
                onChange={(e) => setIsClientVisible(e.target.checked)}
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
              {mutation.isPending ? "Creating..." : "Create Deliverable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
