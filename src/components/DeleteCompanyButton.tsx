"use client";

import { LoaderCircle, Trash2 } from "lucide-react";
import { useFormStatus } from "react-dom";

export function DeleteCompanyButton({ companyName }: { companyName: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(event) => {
        if (!confirm(`Radera ${companyName}? All historik, dokumentkopplingar och analyser tas bort.`)) {
          event.preventDefault();
        }
      }}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-transparent px-3 py-2 text-sm font-medium text-stone-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {pending ? "Raderar..." : "Radera"}
    </button>
  );
}
