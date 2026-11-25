"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import { APPLICATION_STATUSES, type ApplicationStatus, type JobApplication } from "@/lib/types";

function Dashboard() {
  const [apps, setApps] = useState<JobApplication[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<ApplicationStatus | "All">("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.listApplications().then(setApps).catch((e) => setError(e.message));
  }, []);

  const counts = useMemo(() => {
    const c = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as Record<ApplicationStatus, number>;
    apps?.forEach((a) => c[a.status]++);
    return c;
  }, [apps]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (apps ?? []).filter(
      (a) =>
        (filter === "All" || a.status === filter) &&
        (!q || a.jobTitle.toLowerCase().includes(q) || a.company.toLowerCase().includes(q)),
    );
  }, [apps, filter, search]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Applications</h1>
        <Link href="/applications/new" className="btn-primary">
          + New application
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {APPLICATION_STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(filter === s ? "All" : s)}
            className={`rounded-lg border bg-white p-3 text-left transition ${
              filter === s ? "border-primary ring-1 ring-primary" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="text-2xl font-semibold">{counts[s]}</div>
            <div className="text-xs text-slate-500">{s}</div>
          </button>
        ))}
      </div>

      <input
        className="input mt-6 max-w-sm"
        placeholder="Search by title or company…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && <p className="mt-6 text-red-600">{error}</p>}
      {!apps && !error && <p className="mt-6 text-slate-500">Loading…</p>}

      {apps && apps.length === 0 && (
        <div className="card mt-6 text-center">
          <p className="text-slate-600">No applications yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Add one to start tracking. Then fill in your{" "}
            <Link href="/profile" className="text-primary hover:underline">
              base resume
            </Link>{" "}
            to unlock the AI tools.
          </p>
        </div>
      )}

      {apps && apps.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">
                    <Link href={`/applications/${a.id}`} className="text-primary hover:underline">
                      {a.jobTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {a.company}
                    {a.location && <span className="text-slate-400"> · {a.location}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {a.appliedDate ? new Date(a.appliedDate).toLocaleDateString(undefined, { timeZone: "UTC" }) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{new Date(a.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    No applications match.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  );
}
