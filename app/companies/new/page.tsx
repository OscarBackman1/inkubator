import { AppShell } from "@/components/AppShell";
import { AiSubmitButton } from "@/components/AiSubmitButton";
import { CompanyCreationIntro } from "@/components/CompanyCreationIntro";
import { FileDropInput } from "@/components/FileDropInput";
import { createCompanyAction } from "@/lib/actions/company";
import { requireUser } from "@/lib/auth/session";
import { phaseLabels } from "@/lib/sustainability/labels";
import { Building2, Files, Lightbulb } from "lucide-react";

export const maxDuration = 120;

export default async function NewCompanyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  return (
    <AppShell user={user}>
      <CompanyCreationIntro />

      <div id="company-form" className="scroll-mt-6 pt-10">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-forest text-sm font-semibold text-white">
              1
            </span>
            <p className="text-sm font-medium uppercase tracking-wide text-forest">Steg 1 av 4</p>
          </div>
          <h2
            id="company-form-heading"
            tabIndex={-1}
            className="mt-3 text-3xl font-semibold tracking-tight outline-none"
          >
            Berätta om bolaget
          </h2>
          <p className="mt-2 max-w-3xl leading-7 text-stone-600">
            Dela det underlag som finns redan nu. Verktyget använder informationen för att skapa en första bolagsbild och
            identifiera relevanta hållbarhetsområden.
          </p>
        </div>

        <form
          action={createCompanyAction}
          className="grid max-w-4xl gap-6 rounded-xl border border-stone-200 bg-white p-5 shadow-soft sm:p-7"
        >
          {query.error && (
            <p className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              Fyll i obligatoriska fält och välj en idébeskrivning.
            </p>
          )}
          <section aria-labelledby="company-basics-title">
            <div className="mb-4 flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-forest">
                <Building2 className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 id="company-basics-title" className="font-semibold">
                  Grunduppgifter
                </h3>
                <p className="text-sm text-stone-500">Hjälper verktyget att sätta bolaget i rätt sammanhang.</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm font-medium md:col-span-2">
                Bolagsnamn
                <input
                  name="name"
                  className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none transition focus:border-forest focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </label>
              <label className="text-sm font-medium">
                Movexumfas
                <select
                  name="phase"
                  className="mt-1.5 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 outline-none transition focus:border-forest focus:ring-2 focus:ring-emerald-100"
                >
                  {Object.entries(phaseLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium">
                Bransch
                <input
                  name="industry"
                  className="mt-1.5 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none transition focus:border-forest focus:ring-2 focus:ring-emerald-100"
                  required
                />
              </label>
            </div>
          </section>

          <section aria-labelledby="company-files-title">
            <div className="mb-4 flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-forest">
                <Files className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 id="company-files-title" className="font-semibold">
                  Befintligt underlag
                </h3>
                <p className="text-sm text-stone-500">
                  Ladda upp det ni har – verktyget markerar vad som fortfarande är osäkert.
                </p>
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Ifylld idébeskrivning</p>
                <span className="text-xs text-stone-500">Obligatorisk</span>
              </div>
              <FileDropInput
                name="ideaFile"
                accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
                required
                title="Ifylld idébeskrivning"
                description="Dra filen till ytan eller välj den från datorn."
              />
            </div>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <p className="text-sm font-medium">Övrigt befintligt underlag</p>
                <span className="text-xs text-stone-500">Valfritt</span>
              </div>
              <FileDropInput
                name="supportingFiles"
                accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
                multiple
                title="Övrigt befintligt underlag"
                description="Pitchdeck, affärsplan, marknadsanalys, teknisk beskrivning, kundunderlag eller andra dokument som redan finns."
              />
            </div>
          </section>

          <section aria-labelledby="company-ambitions-title">
            <div className="mb-4 flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-forest">
                <Lightbulb className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <div>
                <h3 id="company-ambitions-title" className="font-semibold">
                  Det ni redan ser
                </h3>
                <p className="text-sm text-stone-500">
                  Tidiga tankar och osäkerheter är lika välkomna som fattade beslut.
                </p>
              </div>
            </div>
            <label className="text-sm font-medium">
              Vad kan du berätta om bolagets hållbarhetsambitioner, viktiga vägval eller arbete med miljömässiga,
              sociala eller styrningsfrågor?
              <span className="mt-2 block rounded-lg bg-stone-50 p-3 text-sm font-normal leading-6 text-stone-600">
                Skriv fritt även om arbetet är tidigt eller osäkert. Nämn gärna nuläge, prioriteringar, affärsmodell,
                kundgrupp, teknik, geografi, produktion, leverantörer, data, team och frågor ni redan ser som viktiga.
              </span>
              <textarea
                name="journeyText"
                rows={8}
                className="mt-3 w-full rounded-lg border border-stone-300 px-3 py-2.5 outline-none transition focus:border-forest focus:ring-2 focus:ring-emerald-100"
                required
              />
            </label>
          </section>
          <AiSubmitButton
            idleLabel="Skapa bolag och sammanfattning"
            pendingLabel="Skapar bedömning..."
            pendingTitle="Väsentlighetsbedömning tas fram"
            pendingDescription="Idébeskrivningen, övrigt underlag, branschen och bolagets hållbarhetsambitioner vägs samman för att identifiera de mest relevanta områdena."
          />
        </form>
      </div>
    </AppShell>
  );
}
