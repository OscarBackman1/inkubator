import Link from "next/link";
import { redirect } from "next/navigation";
import { ImpactLevelBadge } from "@/components/ImpactLevelBadge";
import { RiskIndicatorBadge } from "@/components/RiskIndicatorBadge";
import { prisma } from "@/lib/db/prisma";
import { getAreaAssessmentItems } from "@/lib/sustainability/areaAssessments";
import type { FinalAnalysisResult } from "@/lib/ai/schemas";

export default async function HistoryPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { assessments: { orderBy: { version: "desc" }, include: { createdBy: true } } }
  });
  if (!company) redirect("/companies");

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Historik</p>
        <h1 className="text-3xl font-semibold">{company.name}</h1>
      </div>
      <div className="grid gap-4">
        {company.assessments.map((assessment) => {
          const dashboard = assessment.dashboardJson as FinalAnalysisResult | null;
          const delta = assessment.updateDeltaJson as { newRisks?: string[]; reducedRisks?: string[]; newOpportunities?: string[] } | null;
          const areaAssessments = getAreaAssessmentItems(dashboard);
          return (
            <article key={assessment.id} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Version {assessment.version}</h2>
                  <p className="text-sm text-stone-600">
                    {assessment.type === "INITIAL" ? "Initial analys" : "Uppdatering"} · {assessment.createdAt.toLocaleDateString("sv-SE")} · {assessment.createdBy.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <ImpactLevelBadge label={dashboard?.impactLevel.labelSv} />
                  <RiskIndicatorBadge label={dashboard?.riskIndicator.labelSv} />
                </div>
              </div>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                {areaAssessments.map((item) => (
                  <div key={item.key}>
                    <dt className="text-stone-500">{item.title}</dt>
                    <dd className="font-semibold leading-snug">{dashboard ? item.potentialLabel : "-"}</dd>
                  </div>
                ))}
              </dl>
              {delta && (
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-3">
                  <DeltaList title="Nya risker" items={delta.newRisks ?? []} />
                  <DeltaList title="Minskade risker" items={delta.reducedRisks ?? []} />
                  <DeltaList title="Nya möjligheter" items={delta.newOpportunities ?? []} />
                </div>
              )}
              <Link href={`/companies/${company.id}/dashboard`} className="mt-4 inline-flex rounded border border-stone-300 px-3 py-2 text-sm hover:bg-stone-50">
                Öppna senaste dashboard
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function DeltaList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded bg-stone-50 p-3">
      <p className="font-medium">{title}</p>
      <ul className="mt-1 list-disc pl-5 text-stone-600">
        {items.length ? items.map((item) => <li key={item}>{item}</li>) : <li>Inget markerat.</li>}
      </ul>
    </div>
  );
}
