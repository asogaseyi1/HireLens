"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { NavBar } from "./NavBar";

// Wraps signed-in pages: redirects to /login when there's no session, and adds the nav bar.
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="p-10 text-center text-slate-500">Loading…</div>;
  }

  return (
    <>
      <NavBar />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </>
  );
}
