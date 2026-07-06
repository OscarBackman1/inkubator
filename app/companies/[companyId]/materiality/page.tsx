import { redirect } from "next/navigation";
import { AiSubmitButton } from "@/components/AiSubmitButton";
import { AspectCodeBadge } from "@/components/AspectCodeBadge";
import { Badge } from "@/components/Badge";
import { Stepper } from "@/components/Stepper";
import { approveMaterialityAction } from "@/lib/actions/company";
import { prisma } from "@/lib/db/prisma";
import { createCategoryAspectDisplayCodes } from "@/lib/sustainability/aspectCodes";
import {
  categoryLabels,
  confidenceLabels,
  materialityDriverDescriptions,
  materialityDriverLabels,
  phaseLabels
} from "@/lib/sustainability/labels";
import type { MaterialityResult } from "@/lib/ai/schemas";

export const maxDuration = 120;

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

  const allAspectDisplayCodes = createCategoryAspectDisplayCodes([
    ...materiality.selectedAspects,
    ...materiality.consideredButNotMaterial
  ]);
  const selectedAspectDisplayCodes = allAspectDisplayCodes.slice(0, materiality.selectedAspects.length);
  const consideredAspectDisplayCodes = allAspectDisplayCodes.slice(materiality.selectedAspects.length);

  return (
    <div>
      <Stepper current={1} companyId={company.id} />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Steg 1 av 3 – Sammanfattning och väsentliga områden</p>
        <h1 className="text-3xl font-semibold">{company.name}</h1>
        <p className="mt-1 text-sm text-stone-600">
          {phaseLabels[company.phase]} · {company.industry}
        </p>
      </div>

      <form action={approveMaterialityAction.bind(null, company.id, assessment.id)} className="space-y-5">
        <section className="rounded border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Hållbarhetsperspektiv</h2>
          <p className="mt-3 leading-7 text-stone-700">{materiality.companySummary}</p>
          <p className="mt-3 leading-7 text-stone-700">{materiality.sustainabilityPerspectiveSummary}</p>
          <p className="mt-3 rounded bg-stone-50 p-3 text-sm text-stone-600">{materiality.materialityApproach}</p>
          <label className="mt-4 block text-sm font-medium">
            Kommentar eller korrigering
            <textarea
              name="summaryComment"
              rows={3}
              className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
              placeholder="Skriv om något i summeringen behöver förtydligas, korrigeras eller kompletteras."
            />
          </label>
        </section>

        <section>
          <h2 className="mb-3 text-xl font-semibold">Identifierade väsentliga områden</h2>
          <div className="grid gap-4">
            {materiality.selectedAspects.map((aspect, index) => (
              <article key={aspect.code} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                      <AspectCodeBadge category={aspect.category} code={selectedAspectDisplayCodes[index]} />
                      <span>{aspect.name}</span>
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge tone="info">{categoryLabels[aspect.category]}</Badge>
                      <Badge>{aspect.status === "MATERIAL" ? "Väsentlig" : "Osäker"}</Badge>
                      <Badge>Säkerhet: {confidenceLabels[aspect.confidence]}</Badge>
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
                    <p className="text-sm font-medium">Skäl till prioritering</p>
                    <ul className="mt-2 space-y-2 text-sm text-stone-600">
                      {aspect.materialityDrivers.map((driver) => (
                        <li key={driver} className="flex gap-2">
                          <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-forest" />
                          <span>
                            <span className="font-medium text-stone-800">{materialityDriverLabels[driver]}:</span>{" "}
                            {materialityDriverDescriptions[driver]}
                          </span>
                        </li>
                      ))}
                    </ul>
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
            {materiality.consideredButNotMaterial.map((aspect, index) => (
              <div key={aspect.code} className="rounded bg-stone-50 p-3 text-sm">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  <AspectCodeBadge category={aspect.category} code={consideredAspectDisplayCodes[index]} />
                  <span>{aspect.name}</span>
                </p>
                <p className="mt-1 text-stone-600">{aspect.rationale}</p>
              </div>
            ))}
          </div>
        </details>

        <AiSubmitButton
          idleLabel="Godkänn och fortsätt"
          pendingLabel="Granskar informationsgap..."
          pendingTitle="Informationsgap granskas"
          pendingDescription="Underlaget analyseras för att identifiera eventuella informationsluckor. Om något viktigt saknas kan du få en kompletteringsfråga inom ett eller flera områden."
          fallbackHref={`/companies/${company.id}/analysis`}
        />
      </form>
    </div>
  );
}
