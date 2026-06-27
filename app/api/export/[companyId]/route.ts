import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { FinalAnalysisResult } from "@/lib/ai/schemas";

export async function GET(_request: Request, context: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await context.params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { assessments: { orderBy: { version: "desc" }, take: 1 } }
  });

  const assessment = company?.assessments[0];
  const dashboard = assessment?.dashboardJson as FinalAnalysisResult | null;

  if (!company || !assessment || !dashboard) {
    return new NextResponse("Rapport saknas.", { status: 404 });
  }

  const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(company.name)} - Impactrapport</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17211f; margin: 40px; line-height: 1.6; }
    h1, h2 { line-height: 1.2; }
    .meta, .muted { color: #666; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .box { border: 1px solid #ddd; padding: 14px; border-radius: 6px; }
    @media print { body { margin: 20mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(company.name)}</h1>
  <p class="meta">Analysversion ${assessment.version} · ${assessment.createdAt.toLocaleDateString("sv-SE")} · ${escapeHtml(company.industry)}</p>
  <h2>Sammanfattning</h2>
  <p>${escapeHtml(dashboard.executiveSummary)}</p>
  <h2>Grundläggande affärsmodellbedömning</h2>
  <p><strong>Placering i bedömningsmatrisen: ${escapeHtml(dashboard.impactLevel.labelSv)}</strong></p>
  <p>${escapeHtml(dashboard.impactLevel.rationale)}</p>
  <p>${escapeHtml(dashboard.businessModelCompatibility.rationale)}</p>
  <h2>Riskbild</h2>
  <p><strong>${escapeHtml(dashboard.riskIndicator.labelSv)}</strong>: ${escapeHtml(dashboard.riskIndicator.rationale)}</p>
  <h2>Poäng</h2>
  <div class="grid">
    <div class="box">Samlad<br><strong>${dashboard.scores.overall}</strong></div>
    <div class="box">Miljö<br><strong>${dashboard.scores.environment}</strong></div>
    <div class="box">Socialt<br><strong>${dashboard.scores.social}</strong></div>
    <div class="box">Styrning<br><strong>${dashboard.scores.governance}</strong></div>
  </div>
  ${section("Vad bolaget behöver arbeta med", dashboard.whatCompanyNeedsToWorkOn.map((item) => `${item.title}: ${item.realisticStartupNextStep}`))}
  ${section("Risker", dashboard.risks.map((item) => `${item.title}: ${item.mitigationSuggestion}`))}
  ${section("Möjligheter", dashboard.opportunities.map((item) => `${item.title}: ${item.recommendedAction}`))}
  ${section("Diskussionsfrågor", dashboard.discussionQuestions.map((item) => `${item.question} (${item.whyImportant})`))}
  ${section("Antaganden", dashboard.assumptions)}
  ${section("Begränsningar", dashboard.limitations)}
  <h2>Disclaimer</h2>
  <p class="muted">${escapeHtml(dashboard.disclaimer)}</p>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "content-disposition": `attachment; filename="${safeFilename(company.name)}-impactrapport.html"`
    }
  });
}

function section(title: string, items: string[]) {
  return `<h2>${escapeHtml(title)}</h2><ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return entities[char] ?? char;
  });
}

function safeFilename(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
