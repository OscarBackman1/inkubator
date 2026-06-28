import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getAreaAssessmentItems } from "@/lib/sustainability/areaAssessments";
import { getDashboardInformationComment } from "@/lib/sustainability/informationQuality";
import { phaseLabels } from "@/lib/sustainability/labels";
import type { FinalAnalysisResult } from "@/lib/ai/schemas";

type SortKey =
  | "company"
  | "phase"
  | "industry"
  | "impact"
  | "risk"
  | "overall"
  | "environment"
  | "social"
  | "governance"
  | "information";

type SortDir = "asc" | "desc";

type CompareRow = {
  id: string;
  name: string;
  phase: keyof typeof phaseLabels;
  industry: string;
  dashboard: FinalAnalysisResult | null;
  impactLabel: string;
  riskLabel: string;
  overall: string;
  environment: string;
  social: string;
  governance: string;
  information: string;
};

const sortLabels: Record<SortKey, string> = {
  company: "Bolag",
  phase: "Fas",
  industry: "Bransch",
  impact: "Impactnivå",
  risk: "Riskindikator",
  overall: "Övergripande potential",
  environment: "Miljö",
  social: "Socialt",
  governance: "Styrning",
  information: "Informationsläge"
};

const impactRank: Record<FinalAnalysisResult["impactLevel"]["level"], number> = {
  HARMFUL_RISKY: 0,
  RISK_EXPOSED: 1,
  RESPONSIBLE: 2,
  SUSTAINABILITY_DRIVEN: 3,
  IMPACT_DRIVEN: 4,
  SYSTEM_CHANGING_IMPACT: 5
};

const riskRank: Record<FinalAnalysisResult["riskIndicator"]["level"], number> = {
  BALANCED: 1,
  SOME_IMBALANCE: 2,
  SIGNIFICANT_IMBALANCE: 3
};

const phaseRank = {
  SCREENING: 1,
  BOOST_CHAMBER: 2,
  INKUBATOR: 3,
  ACCELERATOR: 4
} as const;

export default async function ComparePage({
  searchParams
}: {
  searchParams: Promise<{ sort?: string; dir?: string }>;
}) {
  const query = await searchParams;
  const sort = parseSortKey(query.sort);
  const dir = parseSortDir(query.dir);
  const companies = await prisma.company.findMany({
    include: { assessments: { orderBy: { version: "desc" }, take: 1 } },
    orderBy: { name: "asc" }
  });
  const rows = companies
    .map((company) => {
      const dashboard = company.assessments[0]?.dashboardJson as FinalAnalysisResult | null;
      const areaAssessments = getAreaAssessmentItems(dashboard);
      return {
        id: company.id,
        name: company.name,
        phase: company.phase,
        industry: company.industry,
        dashboard,
        impactLabel: dashboard?.impactLevel.labelSv ?? "-",
        riskLabel: dashboard?.riskIndicator.labelSv ?? "-",
        overall: dashboard ? areaAssessments[0]?.potentialLabel ?? "-" : "-",
        environment: dashboard ? areaAssessments[1]?.potentialLabel ?? "-" : "-",
        social: dashboard ? areaAssessments[2]?.potentialLabel ?? "-" : "-",
        governance: dashboard ? areaAssessments[3]?.potentialLabel ?? "-" : "-",
        information: dashboard ? getDashboardInformationComment(dashboard) : "-"
      };
    })
    .sort((a, b) => compareRows(a, b, sort, dir));

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Jämförelser</p>
        <h1 className="text-3xl font-semibold">Övergripande jämförelse</h1>
        <p className="mt-2 text-sm text-stone-600">
          Sorterat på {sortLabels[sort].toLowerCase()} {dir === "desc" ? "fallande" : "stigande"}.
        </p>
      </div>
      <div className="overflow-hidden rounded border border-stone-200 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              {(Object.keys(sortLabels) as SortKey[]).map((key) => (
                <SortHeader key={key} sortKey={key} activeSort={sort} dir={dir}>
                  {sortLabels[key]}
                </SortHeader>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-stone-100">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3">{phaseLabels[row.phase]}</td>
                <td className="px-4 py-3">{row.industry}</td>
                <td className="px-4 py-3">{row.impactLabel}</td>
                <td className="px-4 py-3">{row.riskLabel}</td>
                <td className="px-4 py-3">{row.overall}</td>
                <td className="px-4 py-3">{row.environment}</td>
                <td className="px-4 py-3">{row.social}</td>
                <td className="px-4 py-3">{row.governance}</td>
                <td className="px-4 py-3">{row.information}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({
  sortKey,
  activeSort,
  dir,
  children
}: {
  sortKey: SortKey;
  activeSort: SortKey;
  dir: SortDir;
  children: React.ReactNode;
}) {
  const isActive = sortKey === activeSort;
  const nextDir: SortDir = isActive && dir === "asc" ? "desc" : "asc";
  return (
    <th className="px-4 py-3">
      <Link
        href={`?sort=${sortKey}&dir=${nextDir}`}
        className="inline-flex items-center gap-1 rounded px-1 py-0.5 font-medium hover:bg-stone-100"
      >
        {children}
        <span className="text-xs text-stone-400">{isActive ? (dir === "asc" ? "↑" : "↓") : "↕"}</span>
      </Link>
    </th>
  );
}

function parseSortKey(value?: string): SortKey {
  return value && value in sortLabels ? (value as SortKey) : "impact";
}

function parseSortDir(value?: string): SortDir {
  return value === "asc" || value === "desc" ? value : "desc";
}

function compareRows(a: CompareRow, b: CompareRow, sort: SortKey, dir: SortDir) {
  const direction = dir === "asc" ? 1 : -1;
  const result = compareSortValues(getSortValue(a, sort), getSortValue(b, sort));
  if (result !== 0) return result * direction;
  return a.name.localeCompare(b.name, "sv");
}

function getSortValue(row: CompareRow, sort: SortKey) {
  switch (sort) {
    case "company":
      return row.name;
    case "phase":
      return phaseRank[row.phase];
    case "industry":
      return row.industry;
    case "impact":
      return row.dashboard ? impactRank[row.dashboard.impactLevel.level] : -1;
    case "risk":
      return row.dashboard ? riskRank[row.dashboard.riskIndicator.level] : -1;
    case "overall":
      return potentialRank(row.overall);
    case "environment":
      return potentialRank(row.environment);
    case "social":
      return potentialRank(row.social);
    case "governance":
      return potentialRank(row.governance);
    case "information":
      return informationRank(row.information);
  }
}

function compareSortValues(a: string | number, b: string | number) {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), "sv", { sensitivity: "base" });
}

function potentialRank(label: string) {
  if (label.includes("System")) return 5;
  if (label.includes("Impact")) return 4;
  if (label.includes("Hållbarhetsdrivande")) return 3;
  if (label.includes("Ansvarsfull")) return 2;
  if (label.includes("Osäker") || label.includes("Risk") || label.includes("Behöver")) return 1;
  return 0;
}

function informationRank(label: string) {
  if (label.includes("Gott") || label.includes("bra grund")) return 3;
  if (label.includes("Första") || label.includes("räcker")) return 2;
  if (label.includes("Begränsat") || label.includes("svagt")) return 1;
  return 0;
}
