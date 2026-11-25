"use client";

import { useState } from "react";
import { APPLICATION_STATUSES, type JobApplication, type JobApplicationInput } from "@/lib/types";

interface Props {
  initial?: JobApplication;
  submitLabel: string;
  onSubmit: (data: JobApplicationInput) => Promise<void>;
  onCancel?: () => void;
}

const empty: JobApplicationInput = {
  jobTitle: "",
  company: "",
  location: "",
  jobLink: "",
  jobDescription: "",
  status: "Applied",
  appliedDate: new Date().toISOString().slice(0, 10),
  notes: "",
};

export function ApplicationForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<JobApplicationInput>(
    initial ? { ...initial, appliedDate: initial.appliedDate?.slice(0, 10) ?? null } : empty,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof JobApplicationInput>(key: K, value: JobApplicationInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        ...form,
        // Send nulls rather than empty strings for optional fields.
        location: form.location || null,
        jobLink: form.jobLink || null,
        jobDescription: form.jobDescription || null,
        notes: form.notes || null,
        appliedDate: form.appliedDate || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label">Job title *</span>
          <input className="input" required value={form.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Company *</span>
          <input className="input" required value={form.company} onChange={(e) => set("company", e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Location</span>
          <input className="input" value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Job posting URL</span>
          <input
            className="input"
            type="url"
            value={form.jobLink ?? ""}
            onChange={(e) => set("jobLink", e.target.value)}
          />
        </label>
        <label className="block">
          <span className="label">Status</span>
          <select
            className="input"
            value={form.status}
            onChange={(e) => set("status", e.target.value as JobApplicationInput["status"])}
          >
            {APPLICATION_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="label">Date applied</span>
          <input
            className="input"
            type="date"
            value={form.appliedDate ?? ""}
            onChange={(e) => set("appliedDate", e.target.value)}
          />
        </label>
      </div>

      <label className="block">
        <span className="label">Job description</span>
        <span className="block text-xs text-slate-500">
          Paste the posting. The AI uses it to tailor your resume, cover letter, and interview prep.
        </span>
        <textarea
          className="input min-h-48 font-mono text-sm"
          value={form.jobDescription ?? ""}
          onChange={(e) => set("jobDescription", e.target.value)}
        />
      </label>

      <label className="block">
        <span className="label">Notes</span>
        <textarea className="input min-h-24" value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
