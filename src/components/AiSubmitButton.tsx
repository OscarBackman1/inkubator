"use client";

import { FileSearch, LoaderCircle, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { clsx } from "clsx";

export function AiSubmitButton({
  idleLabel,
  pendingLabel = "Analyserar...",
  pendingTitle,
  pendingDescription,
  fallbackHref,
  className
}: {
  idleLabel: string;
  pendingLabel?: string;
  pendingTitle: string;
  pendingDescription: string;
  fallbackHref?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  const [submitStarted, setSubmitStarted] = useState(false);
  const showPending = pending || submitStarted;

  return (
    <>
      <button
        type="submit"
        disabled={showPending}
        aria-busy={showPending}
        onClick={(event) => {
          const form = event.currentTarget.form;
          if (!form || form.checkValidity()) {
            window.setTimeout(() => setSubmitStarted(true), 0);
          }
        }}
        className={clsx(
          "inline-flex w-fit items-center justify-center gap-2 rounded bg-forest px-4 py-2 font-medium text-white transition hover:bg-emerald-800 disabled:cursor-wait disabled:bg-stone-500",
          className
        )}
      >
        {showPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {showPending ? pendingLabel : idleLabel}
      </button>
      {showPending && <AiAnalysisOverlay title={pendingTitle} description={pendingDescription} fallbackHref={fallbackHref} />}
    </>
  );
}

function AiAnalysisOverlay({
  title,
  description,
  fallbackHref
}: {
  title: string;
  description: string;
  fallbackHref?: string;
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const showFallback = elapsedSeconds >= 75;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/30 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded border border-stone-200 bg-white p-6 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded bg-forest text-white">
            <span className="absolute h-14 w-14 animate-ping rounded bg-forest/30" />
            <FileSearch className="relative h-7 w-7" />
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">Analys pågår</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p>
          </div>
        </div>
        <div className="mt-6 space-y-3">
          <LoadingStep label="Läser in bolagets underlag" delay="delay-0" />
          <LoadingStep label="Väger risker, möjligheter och osäkerheter" delay="delay-150" />
          <LoadingStep label="Formulerar coachande slutsatser på svenska" delay="delay-300" />
        </div>
        <p className="mt-5 rounded bg-stone-50 p-3 text-xs leading-5 text-stone-500">
          Behåll fliken öppen medan bedömningen tas fram. Det kan ta upp till någon minut beroende på underlagets
          omfattning.
        </p>
        {showFallback && (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-medium">Det här tar längre tid än väntat.</p>
            <p className="mt-1">
              Ibland hinner servern spara analysen men browsern väntar kvar på sidbytet. Kontrollera om resultatet
              finns genom att öppna målsidan eller ladda om sidan.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {fallbackHref && (
                <Link href={fallbackHref} className="rounded bg-amber-900 px-3 py-2 text-xs font-medium text-white">
                  Öppna resultat
                </Link>
              )}
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded border border-amber-300 px-3 py-2 text-xs font-medium hover:bg-amber-100"
              >
                Ladda om
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingStep({ label, delay }: { label: string; delay: string }) {
  return (
    <div className="flex items-center gap-3 rounded border border-stone-100 bg-stone-50 px-3 py-2">
      <span className={clsx("h-2.5 w-2.5 animate-pulse rounded-full bg-forest", delay)} />
      <span className="text-sm text-stone-700">{label}</span>
    </div>
  );
}
