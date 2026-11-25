"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const features = [
  { title: "Track applications", body: "Keep every role, status, and note in one place, from wishlist to offer." },
  { title: "Tailored resumes & cover letters", body: "Generate a resume and cover letter matched to each job description." },
  { title: "AI interview prep", body: "Get likely questions for the specific role, plus guidance on how to answer them." },
];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-20">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        <span className="text-primary">HireLens</span>: your job search HQ
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate-600">
        Track your applications, generate tailored resumes and cover letters, and prepare for interviews with AI.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/register" className="btn-primary">
          Get started
        </Link>
        <Link href="/login" className="btn-secondary">
          Log in
        </Link>
      </div>
      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="card">
            <h2 className="font-semibold">{f.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{f.body}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
