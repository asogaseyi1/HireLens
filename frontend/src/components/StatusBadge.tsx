import type { ApplicationStatus } from "@/lib/types";

const styles: Record<ApplicationStatus, string> = {
  Wishlist: "bg-slate-100 text-slate-700",
  Applied: "bg-blue-100 text-blue-800",
  Interviewing: "bg-amber-100 text-amber-800",
  Offer: "bg-green-100 text-green-800",
  Rejected: "bg-red-100 text-red-800",
  Withdrawn: "bg-zinc-200 text-zinc-700",
};

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}
