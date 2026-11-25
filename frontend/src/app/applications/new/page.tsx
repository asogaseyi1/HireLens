"use client";

import { useRouter } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { RequireAuth } from "@/components/RequireAuth";
import { api } from "@/lib/api";

function NewApplication() {
  const router = useRouter();
  return (
    <div className="card max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">New application</h1>
      <ApplicationForm
        submitLabel="Save application"
        onSubmit={async (data) => {
          const created = await api.createApplication(data);
          router.push(`/applications/${created.id}`);
        }}
        onCancel={() => router.back()}
      />
    </div>
  );
}

export default function NewApplicationPage() {
  return (
    <RequireAuth>
      <NewApplication />
    </RequireAuth>
  );
}
