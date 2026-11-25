"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "./AuthProvider";

const links = [
  { href: "/dashboard", label: "Applications" },
  { href: "/profile", label: "Profile & Resume" },
];

export function NavBar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="text-lg font-bold text-primary">
            HireLens
          </Link>
          <nav className="flex gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={
                  pathname.startsWith(l.href)
                    ? "font-medium text-slate-900"
                    : "text-slate-500 hover:text-slate-900"
                }
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden text-slate-500 sm:inline">{user?.fullName || user?.email}</span>
          <button onClick={logout} className="btn-secondary">
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
