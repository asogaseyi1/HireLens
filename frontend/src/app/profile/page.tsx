"use client";

import { useEffect, useState } from "react";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";

function ProfileEditor() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [baseResume, setBaseResume] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    api
      .getProfile()
      .then((p) => {
        setEmail(p.email);
        setFullName(p.fullName ?? "");
        setBaseResume(p.baseResume ?? "");
      })
      .catch((e) => setMessage({ kind: "error", text: e.message }))
      .finally(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await api.updateProfile({ fullName: fullName || null, baseResume: baseResume || null });
      setMessage({ kind: "ok", text: "Saved." });
    } catch (err) {
      setMessage({ kind: "error", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <form onSubmit={save} className="card max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Profile & base resume</h1>
      <p className="text-sm text-slate-600">
        Your base resume is the source the AI tailors for each job. Paste your full resume as plain text or Markdown,
        including experience, skills, education, and achievements. The more detail, the better the results.
      </p>
      <label className="block">
        <span className="label">Email</span>
        <input className="input bg-slate-50" value={email} disabled />
      </label>
      <label className="block">
        <span className="label">Full name</span>
        <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </label>
      <label className="block">
        <span className="label">Base resume</span>
        <textarea
          className="input min-h-96 font-mono text-sm"
          value={baseResume}
          onChange={(e) => setBaseResume(e.target.value)}
          placeholder={"Jane Doe\nSoftware Engineer\n\nExperience\n- Acme Corp, Senior Engineer (2021–present)\n  - Led ..."}
        />
      </label>
      {message && (
        <p className={message.kind === "ok" ? "text-sm text-green-700" : "text-sm text-red-600"}>{message.text}</p>
      )}
      <button type="submit" className="btn-primary" disabled={saving}>
        {saving ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileEditor />
    </RequireAuth>
  );
}
