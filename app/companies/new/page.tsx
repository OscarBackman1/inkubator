import { AppShell } from "@/components/AppShell";
import { AiSubmitButton } from "@/components/AiSubmitButton";
import { FileDropInput } from "@/components/FileDropInput";
import { createCompanyAction } from "@/lib/actions/company";
import { requireUser } from "@/lib/auth/session";
import { phaseLabels } from "@/lib/sustainability/labels";

export const maxDuration = 120;

export default async function NewCompanyPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const query = await searchParams;
  return (
    <AppShell user={user}>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Nytt bolag</p>
        <h1 className="text-3xl font-semibold">Skapa nytt bolag</h1>
        <p className="mt-2 max-w-3xl text-stone-600">
          Ladda upp det underlag som finns redan nu, så att de väsentliga områdena bedöms mot hela bilden från start.
        </p>
      </div>
      <form action={createCompanyAction} className="grid max-w-3xl gap-5 rounded border border-stone-200 bg-white p-6 shadow-soft">
        {query.error && (
          <p className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
            Fyll i obligatoriska fält och välj en idébeskrivning.
          </p>
        )}
        <label className="text-sm font-medium">
          Bolagsnamn
          <input name="name" className="mt-1 w-full rounded border border-stone-300 px-3 py-2" required />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="text-sm font-medium">
            Movexumfas
            <select name="phase" className="mt-1 w-full rounded border border-stone-300 px-3 py-2">
              {Object.entries(phaseLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Bransch
            <input name="industry" className="mt-1 w-full rounded border border-stone-300 px-3 py-2" required />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium">Ifylld idébeskrivning</p>
          <FileDropInput
            name="ideaFile"
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
            required
            title="Ifylld idébeskrivning"
            description="Dra filen till ytan eller välj den från datorn."
          />
        </div>
        <div>
          <p className="text-sm font-medium">Övrigt befintligt underlag</p>
          <FileDropInput
            name="supportingFiles"
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
            multiple
            title="Övrigt befintligt underlag"
            description="Pitchdeck, affärsplan, marknadsanalys, teknisk beskrivning, kundunderlag eller andra dokument som redan finns."
          />
        </div>
        <label className="text-sm font-medium">
          Vad kan du berätta om bolagets hållbarhetsambitioner, viktiga vägval eller arbete med miljömässiga, sociala eller styrningsfrågor?
          <span className="mt-2 block rounded bg-stone-50 p-3 text-sm font-normal leading-6 text-stone-600">
            Skriv fritt även om arbetet är tidigt eller osäkert. Nämn gärna nuläge, prioriteringar, affärsmodell,
            kundgrupp, teknik, geografi, produktion, leverantörer, data, team och frågor ni redan ser som viktiga.
          </span>
          <textarea
            name="journeyText"
            rows={8}
            className="mt-3 w-full rounded border border-stone-300 px-3 py-2"
            required
          />
        </label>
        <AiSubmitButton
          idleLabel="Skapa företag"
          pendingLabel="Skapar bedömning..."
          pendingTitle="Väsentlighetsbedömning tas fram"
          pendingDescription="Idébeskrivningen, övrigt underlag, branschen och bolagets hållbarhetsambitioner vägs samman för att identifiera de mest relevanta områdena."
        />
      </form>
    </AppShell>
  );
}
