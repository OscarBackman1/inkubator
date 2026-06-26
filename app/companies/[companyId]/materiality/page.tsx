import { redirect } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Stepper } from "@/components/Stepper";
import { approveMaterialityAction } from "@/lib/actions/company";
import { prisma } from "@/lib/db/prisma";
import { categoryLabels, phaseLabels } from "@/lib/sustainability/labels";
import type { MaterialityResult } from "@/lib/ai/schemas";

export default async function MaterialityPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { assessments: { orderBy: { version: "desc" }, take: 1 } }
  });
  if (!company) redirect("/companies");
  const assessment = company.assessments[0];
  const materiality = assessment?.materialityJson as MaterialityResult | null;

  if (!assessment || !materiality) {
    return (
      <div className="rounded border border-amber-200 bg-amber-50 p-4 text-amber-900">
        Väsentlighetsanalysen saknas. Skapa bolaget på nytt eller kör om analysen.
      </div>
    );
  }

  return (
    <div>
      <Stepper current={1} />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Steg 1 av 3 – Sammanfattning och väsentliga områden</p>
        <h1 className="text-3xl font-semibold">{company.name}</h1>
        <p className="mt-1 text-sm text-stone-600">
          {phaseLabels[company.phase]} · {company.industry}
        </p>
      </div>

      <section className="mb-6 rounded border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Hållbarhetsperspektiv</h2>
        <p className="mt-3 leading-7 text-stone-700">{materiality.companySummary}</p>
        <p className="mt-3 leading-7 text-stone-700">{materiality.sustainabilityPerspectiveSummary}</p>
        <p className="mt-3 rounded bg-stone-50 p-3 text-sm text-stone-600">{materiality.materialityApproach}</p>
      </section>

      <form action={approveMaterialityAction.bind(null, company.id, assessment.id)} className="space-y-5">
        <section>
          <h2 className="mb-3 text-xl font-semibold">Vi kommer att bedöma följande väsentliga områden</h2>
          <div className="grid gap-4">
            {materiality.selectedAspects.map((aspect) => (
              <article key={aspect.code} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {aspect.code} {aspect.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="info">{categoryLabels[aspect.category]}</Badge>
                      <Badge>{aspect.status === "MATERIAL" ? "Väsentlig" : "Osäker"}</Badge>
                      <Badge>Confidence {aspect.confidence}</Badge>
                    </div>
                  </div>
                  <select
                    name={`status-${aspect.code}`}
                    defaultValue={aspect.status}
                    className="rounded border border-stone-300 px-3 py-2 text-sm"
                  >
                    <option value="MATERIAL">Väsentlig</option>
                    <option value="UNCERTAIN">Osäker</option>
                    <option value="NOT_MATERIAL">Ej väsentlig</option>
                  </select>
                </div>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium">Underliggande aspekter</p>
                    <p className="mt-1 text-sm text-stone-600">{aspect.underlyingAspects.join(", ")}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Drivare</p>
                    <p className="mt-1 text-sm text-stone-600">{aspect.materialityDrivers.join(", ")}</p>
                  </div>
                </div>
                <p className="mt-4 leading-7 text-stone-700">{aspect.rationale}</p>
                {aspect.uncertaintyNotes.length > 0 && (
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-stone-600">
                    {aspect.uncertaintyNotes.map((note) => (
                      <li key={note}>{note}</li>
                    ))}
                  </ul>
                )}
                <label className="mt-4 block text-sm font-medium">
                  Kommentar eller korrigering
                  <textarea name={`comment-${aspect.code}`} rows={2} className="mt-1 w-full rounded border border-stone-300 px-3 py-2" />
                </label>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Lägg till eget område</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input name="customName" placeholder="Områdesnamn" className="rounded border border-stone-300 px-3 py-2" />
            <input
              name="customUnderlying"
              placeholder="Underliggande aspekter, kommaseparerat"
              className="rounded border border-stone-300 px-3 py-2"
            />
          </div>
        </section>

        <details className="rounded border border-stone-200 bg-white p-5">
          <summary className="font-semibold">Följande områden bedöms inte vara väsentliga i nuläget</summary>
          <div className="mt-4 grid gap-3">
            {materiality.consideredButNotMaterial.map((aspect) => (
              <div key={aspect.code} className="rounded bg-stone-50 p-3 text-sm">
                <p className="font-medium">
                  {aspect.code} {aspect.name}
                </p>
                <p className="mt-1 text-stone-600">{aspect.rationale}</p>
              </div>
            ))}
          </div>
        </details>

        <button className="rounded bg-forest px-5 py-2.5 font-medium text-white hover:bg-emerald-800">
          Godkänn och fortsätt
        </button>
      </form>
    </div>
  );
}
