"use client";

import { ChevronDown, LogOut, Shield, UserCheck, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { DEMO_ACCOUNTS, useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout, quickSwitch, isLoading } =
    useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Do not render navbar on login page
  if (pathname === "/login") return null;

  const handleRoleSwitch = async (email: string) => {
    setDropdownOpen(false);
    const success = await quickSwitch(email);
    if (success) {
      router.refresh();
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case Role.PRODUCT_MANAGER:
        return "bg-amber-500/10 text-amber-400 border-amber-500/30";
      case Role.UIUX_ENGINEER:
        return "bg-purple-500/10 text-purple-400 border-purple-500/30";
      case Role.FRONTEND_ENGINEER:
        return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case Role.BACKEND_ENGINEER:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      case Role.CLIENT_GUEST:
        return "bg-rose-500/10 text-rose-400 border-rose-500/30";
      default:
        return "bg-zinc-800 text-zinc-400 border-zinc-700";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#202029] bg-[#070607]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-8">
          <Link href="/projects" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#50B1D2] to-[#094C86] text-black font-black text-lg shadow-[0_0_15px_rgba(80,177,210,0.3)] transition-transform group-hover:scale-105">
              N
            </div>
            <div className="flex flex-col">
              <span className="font-bold tracking-tight text-white text-base leading-tight">
                NodeWave
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#50B1D2] font-semibold">
                Deliverables Hub
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/projects"
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith("/projects") && !pathname.includes("client")
                  ? "bg-[#181822] text-[#50B1D2] border border-[#262633]"
                  : "text-zinc-400 hover:text-white hover:bg-[#121217]"
              }`}
            >
              Projects
            </Link>

            {user?.role === Role.CLIENT_GUEST && (
              <Link
                href="/client-portal"
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname === "/client-portal"
                    ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                    : "text-zinc-400 hover:text-rose-300 hover:bg-[#121217]"
                }`}
              >
                Client Portal
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions: Persona Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              {/* Persona Quick Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-lg border border-[#282836] bg-[#121218] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-[#50B1D2]/50 hover:bg-[#181822] transition-colors"
                >
                  <Users className="h-3.5 w-3.5 text-[#50B1D2]" />
                  <span className="hidden sm:inline">Role Switcher:</span>
                  <span className="font-semibold text-white">
                    {user.name.split(" ")[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 origin-top-right rounded-xl border border-[#2a2a38] bg-[#101016] p-2 shadow-2xl backdrop-blur-xl z-50">
                    <div className="px-2 py-1.5 border-b border-[#20202a] mb-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        Switch Persona (1-Click)
                      </p>
                    </div>

                    <div className="space-y-1">
                      {DEMO_ACCOUNTS.map((acc) => {
                        const isCurrent = user.email === acc.email;
                        return (
                          <button
                            key={acc.email}
                            type="button"
                            onClick={() => handleRoleSwitch(acc.email)}
                            className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors ${
                              isCurrent
                                ? "bg-[#1d1d28] border border-[#50B1D2]/30"
                                : "hover:bg-[#181822]"
                            }`}
                          >
                            <div className="mt-0.5">
                              {isCurrent ? (
                                <UserCheck className="h-4 w-4 text-[#50B1D2]" />
                              ) : (
                                <Shield className="h-4 w-4 text-zinc-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-white truncate">
                                  {acc.label}
                                </span>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded border font-mono ${getRoleBadgeColor(
                                    acc.role,
                                  )}`}
                                >
                                  {acc.role.replace("_ENGINEER", "")}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate">
                                {acc.email}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* User Identity Chip */}
              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#202029]">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-medium text-white">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full border font-mono ${getRoleBadgeColor(
                      user.role,
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                title="Log out"
                className="rounded-lg border border-[#262633] p-1.5 text-zinc-400 hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[#50B1D2] px-4 py-1.5 text-xs font-semibold text-black hover:bg-[#3ca2c4] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
