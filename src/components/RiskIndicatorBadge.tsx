import { Badge } from "./Badge";

export function RiskIndicatorBadge({ label }: { label?: string }) {
  const tone = !label ? "neutral" : label.includes("Betydande") ? "risk" : label.includes("Viss") ? "warn" : "good";
  return <Badge tone={tone}>{label ?? "Ej bedömt"}</Badge>;
}
