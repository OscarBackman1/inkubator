import Link from "next/link";
import { ArrowUpRight, Plus, Search, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { DeleteCompanyButton } from "@/components/DeleteCompanyButton";
import { ImpactLevelBadge } from "@/components/ImpactLevelBadge";
import { RiskIndicatorBadge } from "@/components/RiskIndicatorBadge";
import { deleteCompanyAction } from "@/lib/actions/company";
import { requireUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { phaseLabels, statusLabels } from "@/lib/sustainability/labels";
import type { FinalAnalysisResult } from "@/lib/ai/schemas";

export default async function CompaniesPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; phase?: string }>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const q = query.q?.trim();
  const phase = query.phase?.trim();
  const companies = await prisma.company.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { industry: { contains: q } },
              { journeyText: { contains: q } }
            ]
          }
        : {}),
      ...(phase ? { phase: phase as never } : {})
    },
    include: {
      assessments: {
        orderBy: { version: "desc" },
        take: 1
      }
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <AppShell user={user}>
      <section className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between" aria-labelledby="companies-title">
        <div className="max-w-3xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-forest">
            <span className="h-1.5 w-1.5 rounded-full bg-moss" aria-hidden="true" />
            Bolagsöversikt
          </p>
          <h1 id="companies-title" className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Alla bolag
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">
            Hantera screening, risker, möjligheter och väsentlighetsbedömningar för portföljbolag och inkommande bolag.
          </p>
        </div>
        <Link
          href="/companies/new"
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(31,95,74,0.16)] transition hover:-translate-y-0.5 hover:bg-emerald-800 hover:shadow-[0_12px_26px_rgba(31,95,74,0.22)] focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Skapa nytt bolag
        </Link>
      </section>

      <form className="mb-7 grid gap-3 rounded-2xl border border-stone-200/80 bg-white/75 p-3 shadow-[0_8px_24px_rgba(23,33,31,0.035)] backdrop-blur-sm md:grid-cols-[minmax(0,1fr)_220px_auto]">
        <label className="relative block">
          <span className="sr-only">Sök bolag</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            aria-hidden="true"
          />
          <input
            name="q"
            defaultValue={q}
            placeholder="Sök på namn, bransch eller beskrivning"
            className="min-h-11 w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-forest focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        <label>
          <span className="sr-only">Filtrera på fas</span>
          <select
            name="phase"
            defaultValue={phase ?? ""}
            className="min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none transition hover:border-stone-300 focus:border-forest focus:ring-2 focus:ring-emerald-100"
          >
            <option value="">Alla faser</option>
            {Object.entries(phaseLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-forest focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-1">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Filtrera
        </button>
      </form>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {companies.map((company) => {
          const latest = company.assessments[0];
          const dashboard = latest?.dashboardJson as FinalAnalysisResult | null;
          const statusTone =
            company.status === "ANALYZED"
              ? "good"
              : company.status === "NEEDS_MORE_INFO"
                ? "warn"
                : company.status === "DRAFT"
                  ? "neutral"
                  : "info";
          return (
            <article
              key={company.id}
              className="group relative flex min-h-[270px] flex-col overflow-hidden rounded-2xl border border-stone-200/90 bg-white/90 p-5 shadow-[0_6px_20px_rgba(23,33,31,0.045)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-[0_16px_36px_rgba(23,33,31,0.10)] focus-within:border-emerald-300 focus-within:shadow-[0_16px_36px_rgba(23,33,31,0.08)] motion-reduce:transform-none motion-reduce:transition-none"
            >
              <span
                aria-hidden="true"
                className="absolute inset-x-8 top-0 h-px origin-center scale-x-0 bg-gradient-to-r from-transparent via-moss to-transparent transition-transform duration-300 group-hover:scale-x-100 group-focus-within:scale-x-100 motion-reduce:transition-none"
              />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold tracking-tight text-ink">{company.name}</h2>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-5 text-stone-500">{company.industry}</p>
                </div>
                <Badge tone={statusTone}>{statusLabels[company.status]}</Badge>
              </div>

              <div className="mt-6 border-t border-stone-100 pt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Analysområde</p>
                <div className="mt-2">
                  <Badge tone="info">{phaseLabels[company.phase]}</Badge>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-400">Analysbild</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <ImpactLevelBadge label={dashboard?.impactLevel.labelSv} />
                  <RiskIndicatorBadge label={dashboard?.riskIndicator.labelSv} />
                </div>
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-stone-100 pt-4">
                <Link
                  href={`/companies/${company.id}/${dashboard ? "dashboard" : "materiality"}`}
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-forest focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:ring-offset-2"
                >
                  Öppna
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <form action={deleteCompanyAction.bind(null, company.id)}>
                  <DeleteCompanyButton companyName={company.name} />
                </form>
              </div>
            </article>
          );
        })}
      </div>

      {companies.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
          <p className="font-medium text-stone-700">Inga bolag matchar filtret</p>
          <p className="mt-1 text-sm text-stone-500">Justera sökningen eller välj en annan fas.</p>
        </div>
      )}
    </AppShell>
  );
}
