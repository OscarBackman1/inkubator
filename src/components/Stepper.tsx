import Link from "next/link";

export function Stepper({ current, companyId }: { current: 1 | 2 | 3; companyId: string }) {
  const steps = [
    { label: "Bolagsöversikt", description: "Väsentliga områden", href: "materiality" },
    { label: "Informationsgap", description: "Kompletteringar", href: "analysis" },
    { label: "Resultat", description: "Dashboard", href: "dashboard" }
  ];
  return (
    <div className="mb-6 grid gap-2 sm:grid-cols-3">
      {steps.map((step, index) => {
        const number = index + 1;
        const completed = number < current;
        const active = number === current;
        return (
          <Link
            key={step.href}
            href={`/companies/${companyId}/${step.href}`}
            aria-current={active ? "step" : undefined}
            className={`group flex items-center gap-3 rounded border p-3 transition hover:border-forest hover:bg-emerald-50 ${
              active ? "border-forest bg-white shadow-soft" : "border-stone-200 bg-white"
            }`}
          >
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
                {active ? "Nuvarande steg" : `Öppna ${step.description.toLowerCase()}`}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
