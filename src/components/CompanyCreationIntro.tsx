import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  Check,
  FileSearch2,
  SearchCheck,
  Sparkles,
  X
} from "lucide-react";

const creationSteps = [
  {
    number: "01",
    title: "Dela det ni vet",
    description: "Lägg in bolagsuppgifter, idébeskrivning och annat underlag som redan finns.",
    icon: Building2,
    current: true
  },
  {
    number: "02",
    title: "Granska bolagsbilden",
    description: "Verktyget sammanfattar bolaget och föreslår väsentliga områden som du kan korrigera.",
    icon: SearchCheck
  },
  {
    number: "03",
    title: "Komplettera underlaget",
    description: "Du ser vad som saknas eller är osäkert och kan fylla på med relevant information.",
    icon: FileSearch2
  },
  {
    number: "04",
    title: "Utforska analysen",
    description: "Du får en framåtblickande hållbarhetsanalys av bolagets påverkan, risker och möjligheter.",
    icon: ChartNoAxesCombined
  }
];

export function CompanyCreationIntro() {
  return (
    <dialog
      open
      aria-labelledby="creation-intro-title"
      aria-describedby="creation-intro-description"
      className="creation-modal-backdrop fixed inset-0 z-50 m-0 flex h-screen max-h-none w-screen max-w-none items-start justify-center overflow-y-auto border-0 bg-ink/65 p-4 backdrop-blur-sm sm:p-6 lg:items-center"
    >
      <section
        className="creation-intro creation-modal-panel relative max-h-[calc(100vh-2rem)] w-full max-w-6xl overflow-y-auto rounded-2xl bg-forest text-white shadow-2xl sm:max-h-[calc(100vh-3rem)]"
      >
        <form method="dialog" className="absolute right-4 top-4 z-20 sm:right-5 sm:top-5">
          <button
            type="submit"
            autoFocus
            aria-label="Stäng introduktionen och gå till steg 1"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/15 text-white transition hover:rotate-3 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-forest"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </form>

        <div
          aria-hidden="true"
          className="creation-intro-glow absolute -right-20 -top-24 h-72 w-72 rounded-full bg-moss/30 blur-3xl"
        />
        <div aria-hidden="true" className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-emerald-950/40 blur-3xl" />

        <div className="relative grid gap-10 px-6 py-8 pr-16 sm:px-8 sm:py-10 sm:pr-20 lg:px-12 lg:py-12 xl:grid-cols-[0.8fr_1.2fr] xl:gap-14 xl:pr-16">
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium tracking-wide text-emerald-50 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Välkommen till Impact Navigator
              </div>
              <h1
                id="creation-intro-title"
                className="max-w-xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl"
              >
                Från första underlag till tydligare beslut.
              </h1>
              <p id="creation-intro-description" className="mt-5 max-w-lg text-base leading-7 text-emerald-50/85">
                Vi guidar dig genom fyra steg. Börja med det ni vet i dag – det är helt okej att underlaget är tidigt,
                ofullständigt eller osäkert.
              </p>
            </div>

            <div className="mt-8">
              <div className="flex items-start gap-3 text-sm leading-6 text-emerald-50/90">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moss text-white">
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </span>
                <p>Du godkänner eller korrigerar alltid verktygets bild innan analysen går vidare.</p>
              </div>
              <form method="dialog" className="mt-7">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-forest shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-forest"
                >
                  Gå till steg 1
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>

          <ol className="relative grid gap-3 sm:grid-cols-2" aria-label="Så fungerar analysen">
            {creationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <li
                  key={step.number}
                  className="creation-step group relative rounded-xl border border-white/10 bg-white/[0.08] p-5 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.12]"
                  style={{ animationDelay: `${140 + index * 90}ms` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xs tracking-widest text-emerald-100/65">STEG {step.number}</span>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        step.current ? "bg-moss text-white" : "bg-white/10 text-emerald-50"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                    </span>
                  </div>
                  <h2 className="mt-5 text-base font-semibold">{step.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/75">{step.description}</p>
                  {step.current && (
                    <span className="mt-4 inline-flex rounded-full bg-moss/20 px-2.5 py-1 text-xs font-medium text-lime-100">
                      Du är här
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </section>
    </dialog>
  );
}
