import { clsx } from "clsx";
import { categoryCodePrefixes } from "@/lib/sustainability/labels";

type AspectCodeCategory = keyof typeof categoryCodePrefixes;

export function AspectCodeBadge({ category, code }: { category: AspectCodeCategory; code: string }) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center rounded border px-2 py-0.5 font-mono text-xs font-semibold",
        category === "ENVIRONMENT" && "border-emerald-200 bg-emerald-50 text-emerald-800",
        category === "SOCIAL" && "border-sky-200 bg-sky-50 text-sky-800",
        category === "GOVERNANCE" && "border-amber-200 bg-amber-50 text-amber-800",
        category === "CUSTOM" && "border-stone-200 bg-stone-50 text-stone-700"
      )}
    >
      {code}
    </span>
  );
}
