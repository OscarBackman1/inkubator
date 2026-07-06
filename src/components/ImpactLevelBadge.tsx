import { Badge } from "./Badge";

export function ImpactLevelBadge({ label }: { label?: string }) {
  const tone = label?.includes("Risk") || label?.includes("Skad") ? "risk" : label?.includes("Impact") || label?.includes("System") ? "good" : "info";
  return <Badge tone={tone}>{label ?? "Ej bedömt"}</Badge>;
}
