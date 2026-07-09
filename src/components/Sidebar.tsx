"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  FileArchive,
  FileText,
  History,
  LayoutDashboard,
  Leaf,
  MessageSquareText,
  Scale,
  Upload
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "dashboard", icon: LayoutDashboard },
  { label: "Väsentliga områden", href: "materiality", icon: Building2 },
  { label: "Dokument", href: "documents", icon: FileArchive },
  { label: "Historik", href: "history", icon: History },
  { label: "Jämförelser", href: "compare", icon: Scale },
  { label: "Anteckningar", href: "notes", icon: MessageSquareText }
];

export function Sidebar({
  user,
  companyId
}: {
  user: { name: string; email: string; role: string };
  companyId?: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-stone-200/80 bg-[#fbfbf8] px-4 py-5 lg:flex">
      <div className="mb-9 flex items-center gap-3 px-2 pt-1">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-white shadow-[0_8px_20px_rgba(31,95,74,0.18)]">
          <Leaf className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">Movexum</p>
          <h1 className="mt-0.5 text-base font-semibold tracking-tight text-ink">Impact Navigator</h1>
        </div>
      </div>
      <nav className="space-y-1" aria-label="Huvudnavigation">
        <Link
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
            pathname === "/companies"
              ? "bg-emerald-50 text-forest shadow-[inset_0_0_0_1px_rgba(31,95,74,0.08)]"
              : "text-stone-600 hover:bg-stone-100/80 hover:text-ink"
          }`}
          href="/companies"
          aria-current={pathname === "/companies" ? "page" : undefined}
        >
          <Building2 className="h-4 w-4" aria-hidden="true" /> Alla bolag
        </Link>
        {companyId &&
          nav.map((item) => {
            const Icon = item.icon;
            const href = `/companies/${companyId}/${item.href}`;
            const active = pathname === href;
            return (
              <Link
                key={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  active
                    ? "bg-emerald-50 text-forest shadow-[inset_0_0_0_1px_rgba(31,95,74,0.08)]"
                    : "text-stone-600 hover:bg-stone-100/80 hover:text-ink"
                }`}
                href={href}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden="true" /> {item.label}
              </Link>
            );
          })}
      </nav>
      {companyId && (
        <div className="mt-6 space-y-2 border-t border-stone-200/80 pt-5">
          <a
            href="#update-company"
            className="flex items-center justify-center gap-2 rounded-xl bg-forest px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
          >
            <Upload className="h-4 w-4" /> Uppdatera bolag
          </a>
          <Link
            href={`/api/export/${companyId}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          >
            <FileText className="h-4 w-4" /> Exportera rapport
          </Link>
        </div>
      )}
      <div className="mt-auto flex items-center gap-3 border-t border-stone-200/80 px-2 pt-5 text-sm">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600">
          {user.name.charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-medium text-stone-800">{user.name}</p>
          <p className="truncate text-xs text-stone-500">{user.email}</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">{user.role}</p>
        </div>
      </div>
    </aside>
  );
}
