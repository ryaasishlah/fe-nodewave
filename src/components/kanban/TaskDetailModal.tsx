"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  History,
  Info,
  Link as LinkIcon,
  Lock,
  Paperclip,
  Plus,
  Shield,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { auditService } from "@/services/audit.service";
import {
  type AddAttachmentPayload,
  taskService,
  type UpdateTaskPayload,
} from "@/services/task.service";
import { useAuthStore } from "@/store/useAuthStore";
import { Department, Role, type Task, TaskStatus } from "@/types";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onConflict: (taskTitle: string) => void;
  allTasks?: Task[];
}

export function TaskDetailModal({
  task,
  isOpen,
  onClose,
  onConflict,
  allTasks = [],
}: TaskDetailModalProps) {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<
    "overview" | "attachments" | "audit"
  >("overview");

  // Editable fields
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>(
    task?.status || TaskStatus.TODO,
  );
  const [department, setDepartment] = useState<Department>(
    task?.department || Department.FRONTEND,
  );
  const [isClientVisible, setIsClientVisible] = useState(
    task?.isClientVisible ?? false,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Attachment form
  const [attName, setAttName] = useState("");
  const [attUrl, setAttUrl] = useState("");
  const [attType, setAttType] = useState("FIGMA");

  // Keep state synced when task changes
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setStatus(task.status);
      setDepartment(task.department);
      setIsClientVisible(task.isClientVisible);
    }
  }, [task]);

  const isPM = user?.role === Role.PRODUCT_MANAGER;
  const isClient = user?.role === Role.CLIENT_GUEST;

  // Audit query
  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ["auditLogs", task?.id],
    queryFn: () =>
      auditService.getAuditLogs(task?.projectId || "", task?.id || ""),
    enabled: isOpen && !!task?.id && !isClient && activeTab === "audit",
  });

  // Update task mutation
  const updateMutation = useMutation({
    mutationFn: (payload: UpdateTaskPayload) =>
      taskService.updateTask(task?.id || "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task?.projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } }).response
        ?.status;
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to update task";

      if (status === 409) {
        onClose();
        onConflict(task?.title || "Task");
      } else if (status === 422) {
        setErrorMessage(`Dependency Lock (422): ${message}`);
      } else {
        setErrorMessage(message);
      }
    },
  });

  // Add attachment mutation
  const attachmentMutation = useMutation({
    mutationFn: (payload: AddAttachmentPayload) =>
      taskService.addAttachment(task?.id || "", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", task?.projectId] });
      setAttName("");
      setAttUrl("");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Failed to attach file";
      setErrorMessage(msg);
    },
  });

  if (!isOpen || !task) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const payload: UpdateTaskPayload = {
      version: task.version,
      status,
      isClientVisible,
    };

    // PM can update title, description, and department
    if (isPM) {
      payload.title = title;
      payload.description = description;
      payload.department = department;
    }

    updateMutation.mutate(payload);
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attName || !attUrl) return;
    attachmentMutation.mutate({
      name: attName,
      fileUrl: attUrl,
      fileType: attType,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] rounded-2xl border border-[#2a2a38] bg-[#121217] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#202029] bg-[#0e0e13]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 rounded-lg border border-[#2a2a3a] bg-[#161622] px-2.5 py-1 text-[11px] font-mono font-semibold text-[#50B1D2]">
              v{task.version}
            </span>
            <span className="rounded-lg border border-[#2a2a3a] bg-[#161622] px-2.5 py-1 text-[11px] font-mono text-zinc-400">
              {task.department}
            </span>
            {task.isBlocked && (
              <span className="flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-400">
                <Lock className="h-3 w-3" />
                BLOCKED
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-[#1a1a24] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-[#202029] bg-[#0e0e13]">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-[#50B1D2] text-[#50B1D2]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Deliverable Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("attachments")}
            className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === "attachments"
                ? "border-[#50B1D2] text-[#50B1D2]"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attachments ({task.attachments?.length || 0})
          </button>

          {!isClient && (
            <button
              type="button"
              onClick={() => setActiveTab("audit")}
              className={`flex items-center gap-1.5 pb-3 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === "audit"
                  ? "border-[#50B1D2] text-[#50B1D2]"
                  : "border-transparent text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <History className="h-3.5 w-3.5" />
              Audit Trail
            </button>
          )}
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === "overview" && (
            <form onSubmit={handleSave} className="space-y-5">
              {/* Title & Description */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="task-title"
                      className="text-xs font-semibold text-zinc-300"
                    >
                      Title
                    </label>
                    {!isPM && (
                      <span className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <Lock className="h-2.5 w-2.5" /> Locked (PM Only)
                      </span>
                    )}
                  </div>
                  <input
                    id="task-title"
                    type="text"
                    disabled={!isPM}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="task-description"
                    className="text-xs font-semibold text-zinc-300"
                  >
                    Description & Acceptance Criteria
                  </label>
                  <textarea
                    id="task-description"
                    rows={4}
                    disabled={!isPM}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed resize-none"
                  />
                </div>
              </div>

              {/* Status and Department Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="task-status"
                    className="text-xs font-semibold text-zinc-300"
                  >
                    Task Status
                  </label>
                  <select
                    id="task-status"
                    disabled={isClient}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white focus:border-[#50B1D2] focus:outline-none disabled:opacity-50"
                  >
                    <option value={TaskStatus.TODO}>TODO</option>
                    <option value={TaskStatus.IN_PROGRESS}>IN_PROGRESS</option>
                    <option value={TaskStatus.BLOCKED}>BLOCKED</option>
                    <option
                      value={TaskStatus.DONE}
                      disabled={isPM} // ABAC: PM cannot complete to DONE
                    >
                      DONE {isPM ? "(Disabled for PM role)" : ""}
                    </option>
                  </select>
                  {isPM && (
                    <p className="text-[10px] text-amber-400/90 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      ABAC Rule: PMs cannot mark tasks as DONE directly.
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="task-department"
                    className="text-xs font-semibold text-zinc-300"
                  >
                    Department
                  </label>
                  <select
                    id="task-department"
                    disabled={!isPM}
                    value={department}
                    onChange={(e) =>
                      setDepartment(e.target.value as Department)
                    }
                    className="w-full rounded-xl border border-[#262635] bg-[#0c0c11] px-3.5 py-2.5 text-xs text-white focus:border-[#50B1D2] focus:outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    <option value={Department.PRODUCT_MANAGEMENT}>
                      PRODUCT_MANAGEMENT
                    </option>
                    <option value={Department.UIUX}>UIUX</option>
                    <option value={Department.FRONTEND}>FRONTEND</option>
                    <option value={Department.BACKEND}>BACKEND</option>
                  </select>
                </div>
              </div>

              {/* Prerequisites Breakdown */}
              <div className="space-y-2 rounded-xl border border-[#242433] bg-[#0d0d12] p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-[#50B1D2]" />
                    Prerequisite Dependencies (Inter-task Rules)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {task.prerequisites?.length || 0} Prerequisites
                  </span>
                </div>

                {task.prerequisites && task.prerequisites.length > 0 ? (
                  <div className="space-y-1.5 pt-2">
                    {task.prerequisites.map((dep) => {
                      const depTask =
                        dep.dependsOnTask ||
                        allTasks.find((t) => t.id === dep.dependsOnTaskId);
                      const isDepDone = depTask?.status === TaskStatus.DONE;

                      return (
                        <div
                          key={dep.id}
                          className="flex items-center justify-between rounded-lg border border-[#1e1e28] bg-[#14141c] p-2.5 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            {isDepDone ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-400" />
                            )}
                            <span className="text-zinc-200 font-medium">
                              {depTask?.title || "Prerequisite Deliverable"}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                              isDepDone
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            }`}
                          >
                            {depTask?.status || "UNKNOWN"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 pt-1">
                    No prerequisites defined. This task can start immediately.
                  </p>
                )}
              </div>

              {/* Client Visibility Toggle */}
              {isPM && (
                <div className="flex items-center justify-between rounded-xl border border-[#242433] bg-[#0d0d12] p-3">
                  <div>
                    <span className="text-xs font-semibold text-white">
                      Client Visible Deliverable
                    </span>
                    <p className="text-[11px] text-zinc-400">
                      Include this deliverable in the external Client Guest
                      portal
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
              )}

              {/* Actions */}
              {!isClient && (
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
                    disabled={updateMutation.isPending}
                    className="rounded-xl bg-[#50B1D2] px-5 py-2 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-all disabled:opacity-50"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-6">
              {/* Add Attachment Form */}
              {!isClient && (
                <form
                  onSubmit={handleAddAttachment}
                  className="rounded-xl border border-[#242433] bg-[#0d0d12] p-4 space-y-3"
                >
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Plus className="h-3.5 w-3.5 text-[#50B1D2]" /> Add
                    Deliverable Attachment / Link
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Label (e.g. Figma Design Spec)"
                      value={attName}
                      onChange={(e) => setAttName(e.target.value)}
                      className="rounded-xl border border-[#262635] bg-[#14141c] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#50B1D2] focus:outline-none"
                    />

                    <input
                      type="url"
                      required
                      placeholder="URL (https://...)"
                      value={attUrl}
                      onChange={(e) => setAttUrl(e.target.value)}
                      className="rounded-xl border border-[#262635] bg-[#14141c] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#50B1D2] focus:outline-none"
                    />

                    <select
                      value={attType}
                      onChange={(e) => setAttType(e.target.value)}
                      className="rounded-xl border border-[#262635] bg-[#14141c] px-3 py-2 text-xs text-white focus:border-[#50B1D2] focus:outline-none"
                    >
                      <option value="FIGMA">Figma Link</option>
                      <option value="GITHUB">GitHub PR</option>
                      <option value="DOCS">Documentation</option>
                      <option value="OTHER">Other Artifact</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={attachmentMutation.isPending}
                      className="rounded-xl bg-[#50B1D2] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-colors"
                    >
                      {attachmentMutation.isPending ? "Attaching..." : "Attach"}
                    </button>
                  </div>
                </form>
              )}

              {/* Attachments List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Deliverable Artifacts
                </span>
                {task.attachments && task.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {task.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between rounded-xl border border-[#222230] bg-[#14141c] p-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <LinkIcon className="h-4 w-4 text-[#50B1D2]" />
                          <div>
                            <span className="font-semibold text-white">
                              {att.name}
                            </span>
                            <span className="ml-2 text-[10px] font-mono text-zinc-500">
                              [{att.fileType}]
                            </span>
                          </div>
                        </div>
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-[#50B1D2] hover:underline"
                        >
                          Open Link <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">
                    No attachments uploaded for this deliverable.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "audit" && !isClient && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#202029]">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Immutable Audit Trail
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    Chronological ledger of field modifications, actors, and
                    timestamps
                  </p>
                </div>
                <span className="rounded-full border border-[#28283a] bg-[#161622] px-2.5 py-0.5 text-[10px] font-mono text-zinc-400">
                  {auditLogs?.length || 0} Events
                </span>
              </div>

              {auditLoading ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  Loading audit events...
                </div>
              ) : auditLogs && auditLogs.length > 0 ? (
                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#20202d]">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-[#121217] bg-[#50B1D2]" />

                      <div className="rounded-xl border border-[#20202a] bg-[#0d0d12] p-3 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">
                              {log.user?.name || "System"}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-400">
                              [{log.user?.role || "SYSTEM"}]
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <div className="text-zinc-300">
                          Action:{" "}
                          <span className="font-semibold text-[#50B1D2]">
                            {log.action}
                          </span>
                          {log.changedColumn && (
                            <span className="text-zinc-400">
                              {" "}
                              on column{" "}
                              <code className="rounded bg-[#1a1a24] px-1 py-0.5 text-[#50B1D2] font-mono text-[10px]">
                                {log.changedColumn}
                              </code>
                            </span>
                          )}
                        </div>

                        {(log.oldValue !== null || log.newValue !== null) && (
                          <div className="mt-1 flex items-center gap-2 rounded-lg bg-[#14141c] p-2 text-[11px] font-mono">
                            <span className="text-red-400 line-through">
                              {log.oldValue || "null"}
                            </span>
                            <span className="text-zinc-500">→</span>
                            <span className="text-emerald-400">
                              {log.newValue || "null"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No audit log entries recorded for this task.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
