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
        "inline-flex items-center rounded px-2 py-1 text-xs font-medium",
        tone === "neutral" && "bg-stone-100 text-stone-700",
        tone === "good" && "bg-emerald-100 text-emerald-800",
        tone === "warn" && "bg-amber-100 text-amber-800",
        tone === "risk" && "bg-rose-100 text-rose-800",
        tone === "info" && "bg-sky-100 text-sky-800"
      )}
    >
      {children}
    </span>
  );
}
