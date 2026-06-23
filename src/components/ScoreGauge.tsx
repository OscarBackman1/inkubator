import { scoreLabel } from "@/lib/sustainability/scoring";

export function ScoreGauge({ label, score }: { label: string; score?: number | null }) {
  const value = score ?? 0;
  return (
    <div className="rounded border border-stone-200 bg-white p-4 shadow-soft">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <span className="text-2xl font-semibold text-ink">{score ?? "-"}</span>
      </div>
      <div className="h-2 rounded bg-stone-100">
        <div
          className="h-2 rounded bg-forest"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-stone-500">{scoreLabel(score)}</p>
    </div>
  );
}
