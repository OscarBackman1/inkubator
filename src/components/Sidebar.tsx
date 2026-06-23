import Link from "next/link";
import {
  BarChart3,
  Building2,
  FileArchive,
  FileText,
  History,
  LayoutDashboard,
  MessageSquareText,
  PenLine,
  Scale,
  Upload
} from "lucide-react";

const nav = [
  { label: "Dashboard", href: "dashboard", icon: LayoutDashboard },
  { label: "Bolagsinformation", href: "materiality", icon: Building2 },
  { label: "Analys & bedömning", href: "analysis", icon: PenLine },
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
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-stone-200 bg-white px-4 py-5">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wide text-stone-500">Internt beslutsstöd</p>
        <h1 className="mt-1 text-xl font-semibold text-ink">Impact Navigator</h1>
      </div>
      <nav className="space-y-1">
        <Link className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-stone-100" href="/companies">
          <Building2 className="h-4 w-4" /> Bolag
        </Link>
        {companyId &&
          nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-stone-100"
                href={`/companies/${companyId}/${item.href}`}
              >
                <Icon className="h-4 w-4" /> {item.label}
              </Link>
            );
          })}
      </nav>
      {companyId && (
        <div className="mt-6 space-y-2">
          <a
            href="#update-company"
            className="flex items-center justify-center gap-2 rounded bg-forest px-3 py-2 text-sm font-medium text-white hover:bg-emerald-800"
          >
            <Upload className="h-4 w-4" /> Uppdatera bolag
          </a>
          <Link
            href={`/api/export/${companyId}`}
            className="flex items-center justify-center gap-2 rounded border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
          >
            <FileText className="h-4 w-4" /> Exportera rapport
          </Link>
        </div>
      )}
      <div className="mt-auto border-t border-stone-200 pt-4 text-sm">
        <p className="font-medium">{user.name}</p>
        <p className="text-xs text-stone-500">{user.email}</p>
        <p className="mt-1 text-xs text-stone-500">{user.role}</p>
      </div>
    </aside>
  );
}
