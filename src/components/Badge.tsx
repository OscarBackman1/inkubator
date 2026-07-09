import { clsx } from "clsx";

export function Badge({
  children,
  tone = "neutral"
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warn" | "risk" | "info";
}) {
  return (
    <span
      className={clsx(
        "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold leading-none tracking-[0.01em]",
        tone === "neutral" && "border-stone-200 bg-stone-50 text-stone-600",
        tone === "good" && "border-emerald-200/80 bg-emerald-50 text-emerald-800",
        tone === "warn" && "border-amber-200/80 bg-amber-50 text-amber-800",
        tone === "risk" && "border-rose-200/80 bg-rose-50 text-rose-800",
        tone === "info" && "border-emerald-200/70 bg-[#edf5f1] text-forest"
      )}
    >
      {children}
    </span>
  );
}
