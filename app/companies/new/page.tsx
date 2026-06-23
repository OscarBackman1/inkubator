import { AppShell } from "@/components/AppShell";
import { AiSubmitButton } from "@/components/AiSubmitButton";
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
        <label className="text-sm font-medium">
          Ifylld idébeskrivning
          <input
            name="ideaFile"
            type="file"
            accept=".pdf,.docx,.pptx,.xlsx,.csv,.txt,.md"
            className="mt-1 w-full rounded border border-stone-300 bg-white px-3 py-2"
            required
          />
        </label>
        <label className="text-sm font-medium">
          Berätta var bolaget är på sin egen resa
          <textarea
            name="journeyText"
            rows={8}
            className="mt-1 w-full rounded border border-stone-300 px-3 py-2"
            required
          />
          <span className="mt-2 block text-xs leading-5 text-stone-500">
            Beskriv bolagets nuläge, prioriteringar, framtidsplaner, affärsmodell, kundgrupp, teknik, geografi,
            produktion, leverantörer, data/AI-användning, personal och de frågor ni redan ser som viktiga.
          </span>
        </label>
        <AiSubmitButton
          idleLabel="Skapa företag"
          pendingLabel="Skapar och analyserar..."
          pendingTitle="Väsentlighetsanalys körs"
          pendingDescription="AI:n läser idébeskrivningen, branschen och bolagets resa för att identifiera de mest relevanta hållbarhetsområdena."
        />
      </form>
    </AppShell>
  );
}
