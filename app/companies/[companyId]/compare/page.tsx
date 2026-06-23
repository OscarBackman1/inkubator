import { prisma } from "@/lib/db/prisma";
import { phaseLabels } from "@/lib/sustainability/labels";
import type { FinalAnalysisResult } from "@/lib/ai/schemas";

export default async function ComparePage() {
  const companies = await prisma.company.findMany({
    include: { assessments: { orderBy: { version: "desc" }, take: 1 } },
    orderBy: { name: "asc" }
  });

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Jämförelser</p>
        <h1 className="text-3xl font-semibold">Övergripande jämförelse</h1>
      </div>
      <div className="overflow-hidden rounded border border-stone-200 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-3">Bolag</th>
              <th className="px-4 py-3">Fas</th>
              <th className="px-4 py-3">Bransch</th>
              <th className="px-4 py-3">Impactnivå</th>
              <th className="px-4 py-3">Riskindikator</th>
              <th className="px-4 py-3">Overall</th>
              <th className="px-4 py-3">Miljö</th>
              <th className="px-4 py-3">Socialt</th>
              <th className="px-4 py-3">Styrning</th>
              <th className="px-4 py-3">Info</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => {
              const dashboard = company.assessments[0]?.dashboardJson as FinalAnalysisResult | null;
              return (
                <tr key={company.id} className="border-t border-stone-100">
                  <td className="px-4 py-3 font-medium">{company.name}</td>
                  <td className="px-4 py-3">{phaseLabels[company.phase]}</td>
                  <td className="px-4 py-3">{company.industry}</td>
                  <td className="px-4 py-3">{dashboard?.impactLevel.labelSv ?? "-"}</td>
                  <td className="px-4 py-3">{dashboard?.riskIndicator.labelSv ?? "-"}</td>
                  <td className="px-4 py-3">{dashboard?.scores.overall ?? "-"}</td>
                  <td className="px-4 py-3">{dashboard?.scores.environment ?? "-"}</td>
                  <td className="px-4 py-3">{dashboard?.scores.social ?? "-"}</td>
                  <td className="px-4 py-3">{dashboard?.scores.governance ?? "-"}</td>
                  <td className="px-4 py-3">{dashboard?.informationQualityScore ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
