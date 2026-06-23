export function Stepper({ current }: { current: 1 | 2 | 3 }) {
  const steps = ["Sammanfattning", "Analys", "Resultat"];
  return (
    <div className="mb-6 grid gap-2 sm:grid-cols-3">
      {steps.map((step, index) => {
        const number = index + 1;
        const active = number <= current;
        return (
          <div key={step} className="flex items-center gap-3 rounded border border-stone-200 bg-white p-3">
            <span className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${active ? "bg-forest text-white" : "bg-stone-100 text-stone-500"}`}>
              {number}
            </span>
            <span className="text-sm font-medium">{step}</span>
          </div>
        );
      })}
    </div>
  );
}
