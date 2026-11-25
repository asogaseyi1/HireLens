"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "./AuthProvider";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (isRegister) await register(email, password, fullName || undefined);
      else await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="card w-full max-w-sm">
        <Link href="/" className="text-lg font-bold text-primary">
          HireLens
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{isRegister ? "Create your account" : "Welcome back"}</h1>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {isRegister && (
            <label className="block">
              <span className="label">Full name</span>
              <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </label>
          )}
          <label className="block">
            <span className="label">Email</span>
            <input
              className="input"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="block">
            <span className="label">Password</span>
            <input
              className="input"
              type="password"
              required
              minLength={isRegister ? 8 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isRegister && <span className="text-xs text-slate-500">At least 8 characters, with a digit and both cases.</span>}
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="btn-primary w-full" disabled={submitting}>
            {submitting ? "Please wait…" : isRegister ? "Sign up" : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          {isRegister ? "Already have an account? " : "New to HireLens? "}
          <Link href={isRegister ? "/login" : "/register"} className="font-medium text-primary hover:underline">
            {isRegister ? "Log in" : "Create an account"}
          </Link>
        </p>
      </div>
    </main>
  );
}
