import { redirect } from "next/navigation";
import { AiSubmitButton } from "@/components/AiSubmitButton";
import { Badge } from "@/components/Badge";
import { FileDropInput } from "@/components/FileDropInput";
import { ImpactLevelBadge } from "@/components/ImpactLevelBadge";
import { Stepper } from "@/components/Stepper";
import { updateCompanyAction } from "@/lib/actions/company";
import { prisma } from "@/lib/db/prisma";
import { getAreaAssessmentItems, type AreaAssessmentItem } from "@/lib/sustainability/areaAssessments";
import { getDashboardInformationComment } from "@/lib/sustainability/informationQuality";
import {
  businessModelCompatibilityDescriptions,
  businessModelCompatibilityLabels,
  phaseLabels,
  priorityLabels
} from "@/lib/sustainability/labels";
import type { FinalAnalysisResult } from "@/lib/ai/schemas";

export const maxDuration = 120;

export default async function DashboardPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { assessments: { orderBy: { version: "desc" }, take: 1 } }
  });
  if (!company) redirect("/companies");
  const assessment = company.assessments[0];
  const dashboard = assessment?.dashboardJson as FinalAnalysisResult | null;
  if (!assessment || !dashboard) redirect(`/companies/${company.id}/analysis`);
  const areaAssessments = getAreaAssessmentItems(dashboard);
  const overallAssessment = areaAssessments[0];
  const categoryAssessments = areaAssessments.slice(1);

  return (
    <div>
      <Stepper current={3} companyId={company.id} />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-stone-500">Dashboard · Version {assessment.version}</p>
          <h1 className="text-3xl font-semibold">{company.name}</h1>
          <p className="mt-1 text-sm text-stone-600">
            {phaseLabels[company.phase]} · {company.industry} · Senast analyserad {assessment.completedAt?.toLocaleDateString("sv-SE") ?? "pågående"}
          </p>
        </div>
      </div>

      <AreaAssessmentCard item={overallAssessment} featured />

      <div className="mb-5 grid gap-4 xl:grid-cols-3">
        {categoryAssessments.map((item) => (
          <AreaAssessmentCard key={item.key} item={item} />
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Grundläggande affärsmodellbedömning</h2>
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-stone-500">Placering i bedömningsmatrisen</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <ImpactLevelBadge label={dashboard.impactLevel.labelSv} />
                <span className="text-sm text-stone-600">Bolagets samlade potential och inriktning.</span>
              </div>
              <p className="mt-2 leading-7 text-stone-700">{dashboard.impactLevel.rationale}</p>
            </div>
            <div className="border-t border-stone-100 pt-4">
              <p className="text-sm font-medium text-stone-500">Affärsmodellens riktning</p>
              <div className="mt-2">
                <Badge tone={businessModelCompatibilityTone(dashboard.businessModelCompatibility.status)}>
                  {businessModelCompatibilityLabels[dashboard.businessModelCompatibility.status]}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-stone-600">
                {businessModelCompatibilityDescriptions[dashboard.businessModelCompatibility.status]}
              </p>
              <p className="mt-3 leading-7 text-stone-700">{dashboard.businessModelCompatibility.rationale}</p>
              <p className="mt-2 text-sm text-stone-600">{dashboard.businessModelCompatibility.consequencesIfScaled}</p>
            </div>
          </div>
        </section>

        <section className="rounded border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-lg font-semibold">Riskbild</h2>
          <p className="mt-3 leading-7 text-stone-700">{dashboard.riskIndicator.rationale}</p>
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <Panel title="Vad bolaget behöver arbeta med">
          {dashboard.whatCompanyNeedsToWorkOn.map((item) => (
            <div key={item.title} className="border-b border-stone-100 py-3 last:border-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{item.title}</h3>
                <Badge tone={item.priority === "HIGH" ? "risk" : item.priority === "MEDIUM" ? "warn" : "neutral"}>
                  {priorityLabels[item.priority]}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-stone-600">{item.description}</p>
              <p className="mt-1 text-sm font-medium text-forest">{item.realisticStartupNextStep}</p>
            </div>
          ))}
        </Panel>
        <Panel title="Viktigaste risker">
          {dashboard.risks.map((risk) => (
            <div key={risk.title} className="border-b border-stone-100 py-3 last:border-0">
              <h3 className="font-medium">{risk.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{risk.description}</p>
              <p className="mt-1 text-sm text-stone-600">{risk.mitigationSuggestion}</p>
            </div>
          ))}
        </Panel>
        <Panel title="Potential och möjligheter">
          {dashboard.opportunities.map((opportunity) => (
            <div key={opportunity.title} className="border-b border-stone-100 py-3 last:border-0">
              <h3 className="font-medium">{opportunity.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{opportunity.description}</p>
              <p className="mt-1 text-sm font-medium text-forest">{opportunity.recommendedAction}</p>
            </div>
          ))}
        </Panel>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Panel title="Frågor att diskutera med bolaget">
          <ol className="space-y-3">
            {dashboard.discussionQuestions.map((question, index) => (
              <li key={question.question} className="text-sm">
                <span className="font-semibold">{index + 1}. {question.question}</span>
                <p className="mt-1 text-stone-600">{question.whyImportant}</p>
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="Greenwashingrisker">
          {dashboard.greenwashingRisks.map((risk) => (
            <div key={risk.claimOrRisk} className="border-b border-stone-100 py-3 last:border-0">
              <h3 className="font-medium">{risk.claimOrRisk}</h3>
              <p className="mt-1 text-sm text-stone-600">{risk.whyRisky}</p>
              <p className="mt-1 text-sm text-stone-600">{risk.howToSubstantiate}</p>
            </div>
          ))}
        </Panel>
      </div>

      <section className="mt-5 rounded border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Informationsläge och begränsningar</h2>
        <p className="mt-3 text-stone-700">{getDashboardInformationComment(dashboard)}</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <List title="Antaganden" items={dashboard.assumptions} />
          <List title="Begränsningar" items={dashboard.limitations} />
        </div>
        <p className="mt-4 rounded bg-stone-50 p-3 text-sm text-stone-600">{dashboard.disclaimer}</p>
      </section>

      <section id="update-company" className="mt-5 rounded border border-stone-200 bg-white p-5 shadow-soft">
        <h2 className="text-lg font-semibold">Uppdatera bolag</h2>
        <form action={updateCompanyAction.bind(null, company.id)} className="mt-4 grid gap-4">
          <label className="text-sm font-medium">
            Vad har hänt sedan sist?
            <textarea name="narrative" rows={5} className="mt-1 w-full rounded border border-stone-300 px-3 py-2" required />
          </label>
          <div>
            <p className="text-sm font-medium">Nya dokument</p>
            <FileDropInput
              name="documents"
              multiple
              accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
              title="Nya dokument"
              description="Dra nya filer till ytan eller välj dem från datorn."
            />
          </div>
          <AiSubmitButton
            idleLabel="Skapa ny analysversion"
            pendingLabel="Uppdaterar analys..."
            pendingTitle="Ny analysversion skapas"
            pendingDescription="Tidigare dashboard jämförs med ny information för att markera förändrade risker, möjligheter, bedömningstexter och diskussionsfrågor."
            fallbackHref={`/companies/${company.id}/dashboard`}
          />
        </form>
      </section>
    </div>
  );
}

function businessModelCompatibilityTone(
  status: FinalAnalysisResult["businessModelCompatibility"]["status"]
): "good" | "warn" | "risk" {
  if (status === "COMPATIBLE_WITH_LONG_TERM_SUSTAINABILITY") return "good";
  if (status === "HARMFUL_OR_RISKY") return "risk";
  return "warn";
}

function AreaAssessmentCard({ item, featured = false }: { item: AreaAssessmentItem; featured?: boolean }) {
  return (
    <section className={`${featured ? "mb-5" : ""} rounded border border-stone-200 bg-white p-5 shadow-soft`}>
      <p className="text-sm font-medium uppercase tracking-wide text-stone-500">{item.title}</p>
      <p className={`${featured ? "text-xl" : "text-base"} mt-2 font-semibold text-ink`}>
        Potential: {item.potentialLabel}
      </p>
      <p className="mt-3 leading-7 text-stone-700">{item.assessment}</p>
      {!featured && <UncertaintyNotes notes={item.uncertaintyNotes} />}
    </section>
  );
}

function UncertaintyNotes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div className="mt-4 rounded bg-stone-50 p-3 text-sm text-stone-600">
      <p className="font-medium text-stone-700">Osäkerheter och saknad information</p>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-stone-200 bg-white p-5 shadow-soft">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="font-medium">{title}</h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
