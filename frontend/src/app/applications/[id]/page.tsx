"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AiToolsPanel } from "@/components/AiToolsPanel";
import { ApplicationForm } from "@/components/ApplicationForm";
import { RequireAuth } from "@/components/RequireAuth";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/api";
import {
  APPLICATION_STATUSES,
  type ApplicationStatus,
  type JobApplication,
  type JobApplicationInput,
} from "@/lib/types";

const toInput = (a: JobApplication): JobApplicationInput => ({
  jobTitle: a.jobTitle,
  company: a.company,
  location: a.location,
  jobLink: a.jobLink,
  jobDescription: a.jobDescription,
  status: a.status,
  appliedDate: a.appliedDate,
  notes: a.notes,
});

function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const appId = Number(id);
  const router = useRouter();
  const [app, setApp] = useState<JobApplication | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    api.getApplication(appId).then(setApp).catch((e) => setError(e.message));
  }, [appId]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!app) return <p className="text-slate-500">Loading…</p>;

  const changeStatus = async (status: ApplicationStatus) => {
    setApp(await api.updateApplication(app.id, toInput({ ...app, status })));
  };

  const remove = async () => {
    if (!confirm(`Delete the ${app.jobTitle} application at ${app.company}? Its generated documents go with it.`)) return;
    await api.deleteApplication(app.id);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-slate-500 hover:text-slate-900">
        ← All applications
      </Link>

      {editing ? (
        <div className="card">
          <h1 className="mb-6 text-2xl font-bold">Edit application</h1>
          <ApplicationForm
            initial={app}
            submitLabel="Save changes"
            onSubmit={async (data) => {
              setApp(await api.updateApplication(app.id, data));
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      ) : (
        <section className="card">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{app.jobTitle}</h1>
              <p className="text-slate-600">
                {app.company}
                {app.location && ` · ${app.location}`}
              </p>
              <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                <StatusBadge status={app.status} />
                {app.appliedDate && (
                  <span>Applied {new Date(app.appliedDate).toLocaleDateString(undefined, { timeZone: "UTC" })}</span>
                )}
                {app.jobLink && (
                  <a href={app.jobLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    View posting ↗
                  </a>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="rounded-md border-slate-300 text-sm"
                value={app.status}
                onChange={(e) => changeStatus(e.target.value as ApplicationStatus)}
                aria-label="Change status"
              >
                {APPLICATION_STATUSES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <button className="btn-secondary" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button className="btn-danger" onClick={remove}>
                Delete
              </button>
            </div>
          </div>

          {app.notes && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase text-slate-500">Notes</h2>
              <p className="mt-1 whitespace-pre-wrap">{app.notes}</p>
            </div>
          )}

          <details className="mt-6">
            <summary className="cursor-pointer text-sm font-semibold uppercase text-slate-500">Job description</summary>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
              {app.jobDescription || "No job description yet. Add one for much better AI results."}
            </p>
          </details>
        </section>
      )}

      <AiToolsPanel applicationId={app.id} />
    </div>
  );
}

export default function ApplicationPage() {
  return (
    <RequireAuth>
      <ApplicationDetail />
    </RequireAuth>
  );
}
