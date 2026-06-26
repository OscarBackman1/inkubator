"use client";

import { clsx } from "clsx";
import { CheckCircle2, Upload } from "lucide-react";
import { useState } from "react";

type FileDropInputProps = {
  name: string;
  title: string;
  accept?: string;
  multiple?: boolean;
  required?: boolean;
  description?: string;
  actionLabel?: string;
  className?: string;
};

export function FileDropInput({
  name,
  title,
  accept,
  multiple = false,
  required = false,
  description,
  actionLabel = multiple ? "Välj filer" : "Välj fil",
  className
}: FileDropInputProps) {
  const fileWord = multiple ? "filer" : "fil";
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const hasSelection = selectedFiles.length > 0;
  const selectedLabel = multiple
    ? `${selectedFiles.length} ${selectedFiles.length === 1 ? "fil vald" : "filer valda"}`
    : selectedFiles[0];

  return (
    <div
      className={clsx(
        "relative rounded border border-dashed p-5 transition",
        hasSelection
          ? "border-emerald-400 bg-emerald-50/70"
          : "border-stone-300 bg-stone-50 hover:border-forest hover:bg-emerald-50/40",
        className
      )}
    >
      <input
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required}
        aria-label={`${title}. Dra ${fileWord} hit eller använd knappen ${actionLabel}.`}
        onChange={(event) => {
          setSelectedFiles(Array.from(event.currentTarget.files ?? []).map((file) => file.name));
        }}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
      />
      <div className="pointer-events-none flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-white text-forest shadow-sm">
            {hasSelection ? <CheckCircle2 className="h-5 w-5 text-emerald-700" /> : <Upload className="h-5 w-5" />}
          </span>
          <div>
            <p className="font-medium text-ink">
              {hasSelection ? "Uppladdning vald" : `Dra ${fileWord} hit eller använd knappen`}
            </p>
            <p className="mt-1 text-sm leading-6 text-stone-600">
              {description ?? "PDF, Word, PowerPoint, Excel, CSV, text eller Markdown fungerar."}
            </p>
            {hasSelection && (
              <div className="mt-3 rounded border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-900">
                <p className="font-medium">{selectedLabel}</p>
                {multiple && selectedFiles.length > 0 && (
                  <p className="mt-1 truncate text-emerald-800">{selectedFiles.join(", ")}</p>
                )}
              </div>
            )}
          </div>
        </div>
        <span className="inline-flex w-fit items-center justify-center rounded bg-white px-3 py-2 text-sm font-medium text-forest shadow-sm">
          {hasSelection ? (multiple ? "Byt filer" : "Byt fil") : actionLabel}
        </span>
      </div>
    </div>
  );
}
