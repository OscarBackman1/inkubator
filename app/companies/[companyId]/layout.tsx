import { AppShell } from "@/components/AppShell";
import { requireUser } from "@/lib/auth/session";

export default async function CompanyLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const user = await requireUser();
  const { companyId } = await params;
  return (
    <AppShell user={user} companyId={companyId}>
      {children}
    </AppShell>
  );
}
