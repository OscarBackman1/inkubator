import Link from "next/link";
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
    <div className="min-h-screen bg-paper text-ink">
      <div className="flex min-h-screen">
        <Sidebar user={user} companyId={companyId} />
        <main className="flex-1 overflow-x-hidden">
          <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
            <Link href="/companies" className="text-lg font-semibold">
              Movexum Impact Navigator
            </Link>
            <div className="flex items-center gap-3 text-sm text-stone-600">
              <form action={logoutAction}>
                <button className="rounded border border-stone-300 px-3 py-1.5 hover:bg-stone-50">
                  Logga ut
                </button>
              </form>
            </div>
          </header>
          <div className="mx-auto w-full max-w-7xl px-6 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
