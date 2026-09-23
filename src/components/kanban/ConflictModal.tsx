"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface ConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReload: () => void;
  taskTitle?: string;
}

export function ConflictModal({
  isOpen,
  onClose,
  onReload,
  taskTitle,
}: ConflictModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#121217] p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Concurrency Conflict (409)
              </h3>
              <p className="text-xs text-amber-400/90 font-medium">
                Version Token Mismatch
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

        {/* Content */}
        <div className="space-y-3 text-xs text-zinc-300">
          <p>
            Deliverable{" "}
            <span className="font-semibold text-white">
              &quot;{taskTitle || "Current Task"}&quot;
            </span>{" "}
            has been updated by another team member in the background.
          </p>
          <div className="rounded-xl border border-[#272736] bg-[#0c0c11] p-3 text-[11px] space-y-1 text-zinc-400">
            <p>
              Optimistic locking prevented an accidental overwrite of the recent
              state change.
            </p>
            <p className="text-zinc-500">
              Please reload to inspect the latest updates before reapplying your
              changes.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#272736] px-4 py-2 text-xs font-medium text-zinc-300 hover:bg-[#1a1a24] transition-colors"
          >
            Dismiss
          </button>
          <button
            type="button"
            onClick={() => {
              onReload();
              onClose();
            }}
            className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-colors shadow-[0_0_15px_rgba(245,158,11,0.3)]"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Latest Deliverable
          </button>
        </div>
      </div>
    </div>
  );
}
