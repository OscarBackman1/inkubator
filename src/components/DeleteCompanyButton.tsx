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
      className="inline-flex items-center gap-2 rounded border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      {pending ? "Raderar..." : "Radera"}
    </button>
  );
}
