import { redirect } from "next/navigation";
import { AiSubmitButton } from "@/components/AiSubmitButton";
import { AspectCodeBadge } from "@/components/AspectCodeBadge";
import { Badge } from "@/components/Badge";
import { FileDropInput } from "@/components/FileDropInput";
import { Stepper } from "@/components/Stepper";
import { finalizeAnalysisAction, uploadInformationAction } from "@/lib/actions/company";
import { prisma } from "@/lib/db/prisma";
import { createCategoryAspectDisplayCodes } from "@/lib/sustainability/aspectCodes";
import { getSufficiencyInformationComment } from "@/lib/sustainability/informationQuality";
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
  const analysisComplete = assessment.status === "COMPLETE" && Boolean(assessment.dashboardJson);
  const sufficiency = assessment.sufficiencyJson as SufficiencyResult | null;
  const aspectDisplayCodes = sufficiency ? createCategoryAspectDisplayCodes(sufficiency.aspectChecks) : [];

  return (
    <div>
      <Stepper current={2} companyId={company.id} />
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Steg 3 av 4 – Komplettera information</p>
        <h1 className="text-3xl font-semibold">Analys & informationsgap</h1>
        <p className="mt-2 max-w-3xl text-stone-600">
          {analysisComplete
            ? "Här ser du vilket informationsläge analysen byggde på och vilka kompletteringsfrågor som fanns innan resultatet skapades."
            : "Här granskas informationsläget utifrån underlaget som låg till grund för väsentligheten. Verktyget frågar bara efter sådant som behövs för nästa bedömning och låter dig gå vidare även om allt inte är besvarat."}
        </p>
      </div>

      {!sufficiency && (
        <form
          action={uploadInformationAction.bind(null, company.id, assessment.id)}
          className="rounded border border-stone-200 bg-white p-6 shadow-soft"
        >
          <h2 className="text-lg font-semibold">Kör informationsgapanalys</h2>
          <p className="mt-2 text-sm text-stone-600">
            Om informationsgapet saknas kan du köra analysen med befintligt underlag. Lägg bara till dokument här om du vill komplettera innan frågorna tas fram.
          </p>
          <FileDropInput
            name="documents"
            multiple
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
            title="Kompletterande underlag"
            description="Valfritt: dra en eller flera filer till ytan eller välj dem från datorn."
            className="mt-4"
          />
          <AiSubmitButton
            idleLabel="Kör informationsgapanalys"
            pendingLabel="Granskar informationsgap..."
            pendingTitle="Informationsgap granskas"
            pendingDescription="Underlaget analyseras för att identifiera eventuella informationsluckor. Om något viktigt saknas kan du få en kompletteringsfråga inom ett eller flera områden."
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
                <h2 className="text-lg font-semibold">Informationsläge</h2>
                <p className="mt-2 text-stone-600">{getSufficiencyInformationComment(sufficiency)}</p>
              </div>
              <Badge tone={sufficiency.readyForFinalAnalysis ? "good" : "warn"}>
                {sufficiency.readyForFinalAnalysis ? "Kan analyseras" : "Svagt underlag"}
              </Badge>
            </div>
          </section>

          {analysisComplete && (
            <section className="rounded border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Resultatet är redan skapat. Du kan läsa informationsgapet här, men kompletteringar görs genom att skapa en ny analysversion från dashboarden.
            </section>
          )}

          <form
            action={analysisComplete ? undefined : finalizeAnalysisAction.bind(null, company.id, assessment.id)}
            className="space-y-4"
          >
            {sufficiency.aspectChecks.map((check, index) => {
              const question = assessment.gapQuestions.find((item) => item.aspectCode === check.code);
              return (
                <article key={check.code} className="rounded border border-stone-200 bg-white p-5 shadow-soft">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                        <AspectCodeBadge category={check.category} code={aspectDisplayCodes[index]} />
                        <span>{check.name}</span>
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
                        defaultValue={question.answerText ?? ""}
                        disabled={analysisComplete}
                        placeholder="Svara med det ni vet. Det går att gå vidare även om svaret saknas."
                        className="mt-3 w-full rounded border border-stone-300 bg-white px-3 py-2 disabled:bg-stone-100 disabled:text-stone-600"
                      />
                      {!analysisComplete && (
                        <div className="mt-3 flex flex-wrap gap-3">
                          <select
                            name={`status-${question.id}`}
                            defaultValue={question.status}
                            className="rounded border border-stone-300 bg-white px-3 py-2 text-sm"
                          >
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
                      )}
                      {analysisComplete && (
                        <p className="mt-2 text-xs text-stone-500">
                          Status: {question.status === "ANSWERED" ? "Besvarad" : question.status === "NOT_AVAILABLE" ? "Ej tillgänglig" : "Obesvarad"}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
            {!analysisComplete && (
              <AiSubmitButton
                idleLabel="Jag har kompletterat det jag kan – fortsätt"
                pendingLabel="Skapar dashboard..."
                pendingTitle="Samlad bedömning skapas"
                pendingDescription="Affärsmodell, impactnivå, riskindikator, informationsläge, risker, möjligheter och diskussionsfrågor vägs samman."
                fallbackHref={`/companies/${company.id}/dashboard`}
                className="px-5 py-2.5"
              />
            )}
          </form>
        </div>
      )}
    </div>
  );
}
