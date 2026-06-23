import { redirect } from "next/navigation";
import { AiSubmitButton } from "@/components/AiSubmitButton";
import { Badge } from "@/components/Badge";
import { Stepper } from "@/components/Stepper";
import { finalizeAnalysisAction, uploadInformationAction } from "@/lib/actions/company";
import { prisma } from "@/lib/db/prisma";
import { categoryLabels } from "@/lib/sustainability/labels";
import type { SufficiencyResult } from "@/lib/ai/schemas";

export const maxDuration = 120;

export default async function AnalysisPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: {
      assessments: {
        orderBy: { version: "desc" },
        take: 1,
        include: { gapQuestions: true, documents: true }
      }
    }
  });
  if (!company) redirect("/companies");
  const assessment = company.assessments[0];
  if (!assessment) redirect(`/companies/${company.id}/materiality`);
  if (assessment.status === "COMPLETE" && assessment.dashboardJson) {
    redirect(`/companies/${company.id}/dashboard`);
  }
  const sufficiency = assessment.sufficiencyJson as SufficiencyResult | null;

  return (
    <div>
      <Stepper current={2} />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Steg 2 av 3 – Komplettera information</p>
        <h1 className="text-3xl font-semibold">Analys & informationsgap</h1>
        <p className="mt-2 max-w-3xl text-stone-600">
          Ladda upp det som faktiskt finns. Verktyget frågar bara efter sådant som behövs för nästa bedömning och
          låter dig gå vidare även om allt inte är besvarat.
        </p>
      </div>

      {!sufficiency && (
        <form
          action={uploadInformationAction.bind(null, company.id, assessment.id)}
          className="rounded border border-stone-200 bg-white p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold">Ladda upp ytterligare information</h2>
          <p className="mt-2 text-sm text-stone-600">
            Pitchdeck, affärsplan, marknadsanalys, teknisk beskrivning, kundunderlag eller andra dokument som redan finns.
          </p>
          <input
            name="documents"
            type="file"
            multiple
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
            className="mt-4 w-full rounded border border-stone-300 bg-white px-3 py-2"
          />
          <AiSubmitButton
            idleLabel="Kör informationsgapanalys"
            pendingLabel="Analyserar informationsgap..."
            pendingTitle="Informationsgap analyseras"
            pendingDescription="AI:n jämför underlaget med de väsentliga områdena och väljer högst en relevant kompletteringsfråga per område."
            fallbackHref={`/companies/${company.id}/analysis`}
            className="mt-5"
          />
        </form>
      )}

      {sufficiency && (
        <div id="gap" className="space-y-5">
          <section className="rounded border border-stone-200 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Informationskvalitet {sufficiency.overallInformationQuality}/100</h2>
                <p className="mt-2 text-stone-600">{sufficiency.generalComment}</p>
              </div>
              <Badge tone={sufficiency.readyForFinalAnalysis ? "good" : "warn"}>
                {sufficiency.readyForFinalAnalysis ? "Kan analyseras" : "Svagt underlag"}
              </Badge>
            </div>
          </section>

          <form action={finalizeAnalysisAction.bind(null, company.id, assessment.id)} className="space-y-4">
            {sufficiency.aspectChecks.map((check) => {
              const question = assessment.gapQuestions.find((item) => item.aspectCode === check.code);
              return (
                <article key={check.code} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {check.code} {check.name}
                      </h3>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge tone="info">{categoryLabels[check.category]}</Badge>
                        <Badge tone={check.informationStatus === "SUFFICIENT" ? "good" : check.informationStatus === "PARTIAL" ? "warn" : "risk"}>
                          {check.informationStatus === "SUFFICIENT" ? "Tillräckligt" : check.informationStatus === "PARTIAL" ? "Delvis" : "Saknas"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-stone-700">{check.rationale}</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-sm font-medium">Det vi vet</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                        {check.whatWeKnow.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Saknas eller osäkert</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
                        {check.missingInformation.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {question && (
                    <div className="mt-5 rounded bg-stone-50 p-4">
                      <p className="font-medium">{question.question}</p>
                      <p className="mt-2 text-sm text-stone-600">{check.question?.whyThisMattersForFinalAssessment}</p>
                      <textarea
                        name={`answer-${question.id}`}
                        rows={4}
                        placeholder="Svara med det ni vet. Det går att gå vidare även om svaret saknas."
                        className="mt-3 w-full rounded border border-stone-300 bg-white px-3 py-2"
                      />
                      <div className="mt-3 flex flex-wrap gap-3">
                        <select name={`status-${question.id}`} className="rounded border border-stone-300 bg-white px-3 py-2 text-sm">
                          <option value="ANSWERED">Besvarad</option>
                          <option value="OPEN">Obesvarad</option>
                          <option value="NOT_AVAILABLE">Ej tillgänglig</option>
                        </select>
                        <input
                          name={`file-${question.id}`}
                          type="file"
                          multiple
                          accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
                          className="rounded border border-stone-300 bg-white px-3 py-2 text-sm"
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
            <AiSubmitButton
              idleLabel="Jag har kompletterat det jag kan – fortsätt"
              pendingLabel="Skapar dashboard..."
              pendingTitle="Samlad bedömning skapas"
              pendingDescription="AI:n väger affärsmodell, impactnivå, riskindikator, informationskvalitet, risker, möjligheter och diskussionsfrågor."
              fallbackHref={`/companies/${company.id}/dashboard`}
              className="px-5 py-2.5"
            />
          </form>
        </div>
      )}
    </div>
  );
}
