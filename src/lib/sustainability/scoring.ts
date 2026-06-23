export function scoreLabel(score?: number | null) {
  if (score == null) return "Ej bedömt";
  if (score < 40) return "Behöver utvecklas";
  if (score < 60) return "Låg/medel potential eller stora oklarheter";
  if (score < 80) return "God potential";
  return "Stark potential, beroende av validering";
}

export function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}
