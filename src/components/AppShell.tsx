import Link from "next/link";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import { Sidebar } from "./Sidebar";

export function AppShell({
  children,
  user,
  companyId
}: {
  children: React.ReactNode;
  user: { name: string; email: string; role: string };
  companyId?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f6f5f0] text-ink">
      <div className="flex min-h-screen">
        <Sidebar user={user} companyId={companyId} />
        <main className="min-w-0 flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-stone-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6">
            <Link
              href="/companies"
              className="text-sm font-semibold tracking-tight text-ink transition hover:text-forest focus:outline-none focus:ring-2 focus:ring-emerald-200"
            >
              Movexum Impact Navigator
            </Link>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <form action={logoutAction}>
                <button className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-200">
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  Logga ut
                </button>
              </form>
            </div>
          </header>
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
