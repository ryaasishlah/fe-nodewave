"use client";

import {
  ArrowRight,
  Code2,
  Eye,
  KeyRound,
  Layout,
  Lock,
  Mail,
  Palette,
  Server,
  ShieldAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DEMO_ACCOUNTS, useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error } = useAuthStore();
  const [email, setEmail] = useState("pm@nodewave.id");
  const [password, setPassword] = useState("password123");

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/projects");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      router.push("/projects");
    }
  };

  const handleQuickLogin = async (targetEmail: string) => {
    setEmail(targetEmail);
    const success = await login(targetEmail, "password123");
    if (success) {
      router.push("/projects");
    }
  };

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case Role.PRODUCT_MANAGER:
        return <Layout className="h-4 w-4 text-amber-400" />;
      case Role.UIUX_ENGINEER:
        return <Palette className="h-4 w-4 text-purple-400" />;
      case Role.FRONTEND_ENGINEER:
        return <Code2 className="h-4 w-4 text-cyan-400" />;
      case Role.BACKEND_ENGINEER:
        return <Server className="h-4 w-4 text-emerald-400" />;
      case Role.CLIENT_GUEST:
        return <Eye className="h-4 w-4 text-rose-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070607] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-[#50B1D2]/10 via-[#094C86]/10 to-transparent blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-8">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#50B1D2] to-[#094C86] text-black font-black text-2xl shadow-[0_0_25px_rgba(80,177,210,0.4)] mb-2">
            N
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            NodeWave Deliverables
          </h1>
          <p className="text-xs text-zinc-400">
            Sign in to access state-machine deliverable boards & audit logs
          </p>
        </div>

        {/* 1-Click Persona Switcher for Evaluators */}
        <div className="rounded-2xl border border-[#23232f] bg-[#111116]/80 p-5 backdrop-blur-xl shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#20202a]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#50B1D2]">
              Quick Demo Access (1-Click)
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Evaluator Mode
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickLogin(acc.email)}
                disabled={isLoading}
                className="group flex items-center justify-between p-2.5 rounded-xl border border-[#1f1f2b] bg-[#15151e]/60 hover:bg-[#1a1a26] hover:border-[#50B1D2]/40 transition-all text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#0d0d12] border border-[#262635]">
                    {getRoleIcon(acc.role)}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white group-hover:text-[#50B1D2] transition-colors">
                      {acc.label}
                    </div>
                    <div className="text-[10px] text-zinc-400">{acc.email}</div>
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-[#50B1D2] group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Credentials Form */}
        <div className="rounded-2xl border border-[#23232f] bg-[#111116]/60 p-6 backdrop-blur-xl space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
            Manual Sign In
          </h2>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium text-zinc-300"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@nodewave.id"
                  className="w-full rounded-xl border border-[#282837] bg-[#0c0c11] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none focus:ring-1 focus:ring-[#50B1D2] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-[#282837] bg-[#0c0c11] py-2.5 pl-9 pr-3 text-xs text-white placeholder-zinc-600 focus:border-[#50B1D2] focus:outline-none focus:ring-1 focus:ring-[#50B1D2] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#50B1D2] py-2.5 text-xs font-semibold text-black hover:bg-[#3ca2c4] active:scale-[0.99] transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(80,177,210,0.25)]"
            >
              <KeyRound className="h-4 w-4" />
              {isLoading ? "Authenticating..." : "Sign In to Workspace"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
