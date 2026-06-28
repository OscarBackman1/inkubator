import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAreaAssessmentItems } from "@/lib/sustainability/areaAssessments";
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
  const areaAssessments = getAreaAssessmentItems(dashboard);

  const html = `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(company.name)} - Impactrapport</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #17211f; margin: 40px; line-height: 1.6; }
    h1, h2 { line-height: 1.2; }
    .meta, .muted { color: #666; }
    .area { border: 1px solid #ddd; padding: 14px; border-radius: 6px; margin: 12px 0; }
    .area p { margin: 8px 0 0; }
    @media print { body { margin: 20mm; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(company.name)}</h1>
  <p class="meta">Analysversion ${assessment.version} · ${assessment.createdAt.toLocaleDateString("sv-SE")} · ${escapeHtml(company.industry)}</p>
  <h2>Områdesbedömningar</h2>
  ${areaAssessments.map(areaSection).join("")}
  <h2>Grundläggande affärsmodellbedömning</h2>
  <p><strong>Placering i bedömningsmatrisen: ${escapeHtml(dashboard.impactLevel.labelSv)}</strong></p>
  <p>${escapeHtml(dashboard.impactLevel.rationale)}</p>
  <p>${escapeHtml(dashboard.businessModelCompatibility.rationale)}</p>
  <h2>Riskbild</h2>
  <p><strong>${escapeHtml(dashboard.riskIndicator.labelSv)}</strong>: ${escapeHtml(dashboard.riskIndicator.rationale)}</p>
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

function areaSection(item: { title: string; potentialLabel: string; assessment: string; uncertaintyNotes: string[] }) {
  const uncertainties = item.uncertaintyNotes.length
    ? `<p class="muted"><strong>Osäkerheter:</strong> ${escapeHtml(item.uncertaintyNotes.join(" "))}</p>`
    : "";
  return `<div class="area"><h3>${escapeHtml(item.title)}</h3><p><strong>Potential: ${escapeHtml(item.potentialLabel)}</strong></p><p>${escapeHtml(item.assessment)}</p>${uncertainties}</div>`;
}

function safeFilename(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
