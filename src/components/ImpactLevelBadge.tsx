import { Badge } from "./Badge";

export function ImpactLevelBadge({ label }: { label?: string }) {
  const tone = !label
    ? "neutral"
    : label.includes("Risk") || label.includes("Skad")
      ? "risk"
      : label.includes("Ansvars") ||
          label.includes("Påverkan") ||
          label.includes("Impact") ||
          label.includes("System")
        ? "good"
        : "info";
  return <Badge tone={tone}>{label ?? "Ej bedömt"}</Badge>;
}
