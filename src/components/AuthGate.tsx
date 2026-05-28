"use client";

import { useAuth } from "@/context/AuthContext";
import { useState, type ReactNode } from "react";
import { artist } from "@/data/artist";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { loggedIn, login } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <div className="relative flex-1 flex flex-col">
      {/* Page content — always rendered but blurred + non-interactive when logged out */}
      <div
        className="flex-1 flex flex-col transition-all duration-500"
        style={
          !loggedIn
            ? { filter: "blur(6px)", pointerEvents: "none", userSelect: "none" }
            : {}
        }
        aria-hidden={!loggedIn}
      >
        {children}
      </div>

      {/* Login overlay — only visible when logged out */}
      {!loggedIn && (
        <div className="fixed top-16 left-0 right-0 bottom-0 z-40 flex items-start justify-center pt-10 px-4 overflow-y-auto">
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl shadow-black/40 overflow-hidden mb-10"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center">
              {/* Logo mark */}
              <div className="w-14 h-14 rounded-full bg-[#C8813A] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-[#C8813A]/30">
                <span className="text-white font-extrabold text-2xl leading-none">B</span>
              </div>
              <h2 className="text-2xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                {mode === "signin" ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                {mode === "signin"
                  ? `Sign in to explore ${artist.name}'s full collection`
                  : "Join to access the full portfolio & shop"}
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex" style={{ borderBottom: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer"
                style={{
                  color: mode === "signin" ? "#C8813A" : "var(--text-muted)",
                  borderBottom: mode === "signin" ? "2px solid #C8813A" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="flex-1 py-3.5 text-sm font-bold transition-colors cursor-pointer"
                style={{
                  color: mode === "signup" ? "#C8813A" : "var(--text-muted)",
                  borderBottom: mode === "signup" ? "2px solid #C8813A" : "2px solid transparent",
                  marginBottom: "-1px",
                }}
              >
                Sign Up
              </button>
            </div>

            {/* Body */}
            <div className="px-8 py-6 flex flex-col gap-4">
              {/* Email field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8813A]/50 transition-all"
                  style={{
                    backgroundColor: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    color: "var(--text-base)",
                  }}
                />
              </div>

              {/* Password field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8813A]/50 transition-all"
                  style={{
                    backgroundColor: "var(--bg-base)",
                    border: "1px solid var(--border)",
                    color: "var(--text-base)",
                  }}
                />
              </div>

              {/* Confirm password — Sign Up only */}
              {mode === "signup" && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#C8813A]/50 transition-all"
                    style={{
                      backgroundColor: "var(--bg-base)",
                      border: "1px solid var(--border)",
                      color: "var(--text-base)",
                    }}
                  />
                </div>
              )}

              {/* Action button */}
              <button
                type="button"
                onClick={login}
                className="w-full mt-1 bg-[#C8813A] hover:bg-[#D4925A] active:bg-[#B8702A] text-white font-bold py-3 rounded-xl transition-colors cursor-pointer shadow-lg shadow-[#C8813A]/20"
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>

              {/* Mode switcher hint */}
              <p className="text-center text-xs" style={{ color: "var(--text-faint)" }}>
                {mode === "signin" ? (
                  <>No account?{" "}
                    <button type="button" onClick={() => setMode("signup")} className="underline cursor-pointer hover:text-[#C8813A] transition-colors" style={{ color: "var(--text-muted)" }}>
                      Sign up
                    </button>
                  </>
                ) : (
                  <>Already have an account?{" "}
                    <button type="button" onClick={() => setMode("signin")} className="underline cursor-pointer hover:text-[#C8813A] transition-colors" style={{ color: "var(--text-muted)" }}>
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
