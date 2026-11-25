"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "@/lib/api";
import type { DocumentType, GeneratedDocument } from "@/lib/types";

const TOOLS: { type: DocumentType; label: string; description: string }[] = [
  { type: "Resume", label: "Tailored resume", description: "Your base resume rewritten for this role" },
  { type: "CoverLetter", label: "Cover letter", description: "A specific, concise letter for this job" },
  { type: "InterviewPrep", label: "Interview prep", description: "Likely questions and how to answer them" },
];

const labelFor = (t: DocumentType) => TOOLS.find((x) => x.type === t)!.label;

export function AiToolsPanel({ applicationId }: { applicationId: number }) {
  const [docs, setDocs] = useState<GeneratedDocument[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [generating, setGenerating] = useState<DocumentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .listDocuments(applicationId)
      .then((d) => {
        setDocs(d);
        if (d.length) setActiveId(d[0].id);
      })
      .catch((e) => setError(e.message));
  }, [applicationId]);

  const generate = async (type: DocumentType) => {
    setGenerating(type);
    setError(null);
    try {
      const doc = await api.generateDocument(applicationId, type);
      setDocs((d) => [doc, ...d]);
      setActiveId(doc.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(null);
    }
  };

  const remove = async (id: number) => {
    await api.deleteDocument(id);
    setDocs((d) => {
      const next = d.filter((x) => x.id !== id);
      if (activeId === id) setActiveId(next[0]?.id ?? null);
      return next;
    });
  };

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const active = docs.find((d) => d.id === activeId);

  return (
    <section className="card">
      <h2 className="text-lg font-semibold">AI tools</h2>
      <p className="text-sm text-slate-500">
        Uses your base resume and this job&apos;s description. Generation can take up to a minute.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <button
            key={t.type}
            onClick={() => generate(t.type)}
            disabled={generating !== null}
            className="rounded-lg border border-slate-200 p-4 text-left transition hover:border-primary hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="font-medium">{generating === t.type ? "Generating…" : t.label}</div>
            <div className="mt-1 text-xs text-slate-500">{t.description}</div>
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {docs.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr]">
          <ul className="space-y-1 text-sm">
            {docs.map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => setActiveId(d.id)}
                  className={`w-full rounded-md px-3 py-2 text-left ${
                    d.id === activeId ? "bg-blue-50 font-medium text-primary" : "hover:bg-slate-50"
                  }`}
                >
                  {labelFor(d.type)}
                  <span className="block text-xs font-normal text-slate-500">
                    {new Date(d.createdAt).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {active && (
            <div className="min-w-0 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
                <span className="text-sm font-medium">{labelFor(active.type)}</span>
                <div className="flex gap-2">
                  <button className="btn-secondary px-3 py-1" onClick={() => copy(active.content)}>
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <button className="btn-danger px-3 py-1" onClick={() => remove(active.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <article className="prose prose-slate max-w-none p-4 prose-headings:mt-4">
                <ReactMarkdown>{active.content}</ReactMarkdown>
              </article>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
