import Link from "next/link";

export function Stepper({ current, companyId }: { current: 1 | 2 | 3; companyId: string }) {
  const steps = [
    { label: "Skapa bolag", description: "Bolagsinformation", completedLabel: "Bolagsinformation sparad", href: null },
    {
      label: "Bolagsöversikt",
      description: "Väsentliga områden",
      completedLabel: "Väsentliga områden granskade",
      href: "materiality"
    },
    { label: "Informationsgap", description: "Kompletteringar", completedLabel: "Kompletteringar klara", href: "analysis" },
    { label: "Hållbarhetsanalys", description: "Resultat", completedLabel: "Analys klar", href: "dashboard" }
  ];
  return (
    <div className="mb-6 grid gap-2 sm:grid-cols-2 xl:grid-cols-4" aria-label="Analysens fyra steg">
      {steps.map((step, index) => {
        const number = index + 1;
        const currentStep = current + 1;
        const completed = number < currentStep;
        const active = number === currentStep;
        const content = (
          <>
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${
                active || completed ? "bg-forest text-white" : "bg-stone-100 text-stone-500"
              }`}
            >
              {number}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-ink">{step.label}</span>
              <span className="block text-xs text-stone-500">
                {active
                  ? "Nuvarande steg"
                  : completed
                    ? step.completedLabel
                    : `Öppna ${step.description.toLowerCase()}`}
              </span>
            </span>
          </>
        );

        const className = `group flex items-center gap-3 rounded border p-3 transition ${
          active ? "border-forest bg-white shadow-soft" : "border-stone-200 bg-white"
        }`;

        return step.href ? (
          <Link
            key={step.label}
            href={`/companies/${companyId}/${step.href}`}
            aria-current={active ? "step" : undefined}
            className={`${className} hover:border-forest hover:bg-emerald-50`}
          >
            {content}
          </Link>
        ) : (
          <div key={step.label} className={className}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
