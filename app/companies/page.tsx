import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { DeleteCompanyButton } from "@/components/DeleteCompanyButton";
import { ImpactLevelBadge } from "@/components/ImpactLevelBadge";
import { RiskIndicatorBadge } from "@/components/RiskIndicatorBadge";
import { deleteCompanyAction } from "@/lib/actions/company";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { phaseLabels, statusLabels } from "@/lib/sustainability/labels";
import type { FinalAnalysisResult } from "@/lib/ai/schemas";

export default async function CompaniesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; phase?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const q = query.q?.trim();
  const phase = query.phase?.trim();
  const companies = await prisma.company.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { industry: { contains: q } },
              { journeyText: { contains: q } }
            ]
          }
        : {}),
      ...(phase ? { phase: phase as never } : {})
    },
    include: {
      assessments: {
        orderBy: { version: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <AppShell user={user}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-stone-500">Bolagsöversikt</p>
          <h1 className="text-3xl font-semibold">Alla bolag</h1>
        </div>
        <Link href="/companies/new" className="rounded bg-forest px-4 py-2 text-sm font-medium text-white">
          Skapa nytt bolag
        </Link>
      </div>

      <form className="mb-5 grid gap-3 rounded border border-stone-200 bg-white p-4 md:grid-cols-[1fr_220px_auto]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Sök på namn, bransch eller beskrivning"
          className="rounded border border-stone-300 px-3 py-2"
        />
        <select name="phase" defaultValue={phase ?? ""} className="rounded border border-stone-300 px-3 py-2">
          <option value="">Alla faser</option>
          {Object.entries(phaseLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <button className="rounded border border-stone-300 px-4 py-2 font-medium hover:bg-stone-50">Filtrera</button>
      </form>

      <div className="grid gap-4 lg:grid-cols-3">
        {companies.map((company) => {
          const latest = company.assessments[0];
          const dashboard = latest?.dashboardJson as FinalAnalysisResult | null;
          return (
            <article key={company.id} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{company.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">{company.industry}</p>
                </div>
                <Badge>{statusLabels[company.status]}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="info">{phaseLabels[company.phase]}</Badge>
                <ImpactLevelBadge label={dashboard?.impactLevel.labelSv} />
                <RiskIndicatorBadge label={dashboard?.riskIndicator.labelSv} />
              </div>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-stone-500">Poäng</dt>
                  <dd className="text-xl font-semibold">{dashboard?.scores.overall ?? "-"}</dd>
                </div>
                <div>
                  <dt className="text-stone-500">Informationskvalitet</dt>
                  <dd className="text-xl font-semibold">{dashboard?.informationQualityScore ?? "-"}</dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/companies/${company.id}/${dashboard ? "dashboard" : "materiality"}`}
                  className="inline-flex rounded border border-stone-300 px-3 py-2 text-sm font-medium hover:bg-stone-50"
                >
                  Öppna
                </Link>
                <form action={deleteCompanyAction.bind(null, company.id)}>
                  <DeleteCompanyButton companyName={company.name} />
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
