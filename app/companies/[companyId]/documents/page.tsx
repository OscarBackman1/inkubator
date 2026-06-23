import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { extractionStatusLabels, uploadStageLabels } from "@/lib/sustainability/labels";

export default async function DocumentsPage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    include: { documents: { orderBy: { createdAt: "desc" }, include: { uploadedBy: true } } }
  });
  if (!company) redirect("/companies");

  return (
    <div>
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-stone-500">Dokument</p>
        <h1 className="text-3xl font-semibold">{company.name}</h1>
      </div>
      <div className="overflow-hidden rounded border border-stone-200 bg-white shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="bg-stone-50 text-stone-600">
            <tr>
              <th className="px-4 py-3">Fil</th>
              <th className="px-4 py-3">Steg</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Uppladdad av</th>
              <th className="px-4 py-3">Datum</th>
            </tr>
          </thead>
          <tbody>
            {company.documents.map((document) => (
              <tr key={document.id} className="border-t border-stone-100 align-top">
                <td className="px-4 py-3">
                  <details>
                    <summary className="font-medium">{document.originalName}</summary>
                    <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap rounded bg-stone-50 p-3 text-xs text-stone-700">
                      {document.extractedText || document.extractionWarning || "Ingen extraherad text."}
                    </pre>
                  </details>
                </td>
                <td className="px-4 py-3">{uploadStageLabels[document.uploadStage]}</td>
                <td className="px-4 py-3">{extractionStatusLabels[document.extractionStatus]}</td>
                <td className="px-4 py-3">{document.uploadedBy.name}</td>
                <td className="px-4 py-3">{document.createdAt.toLocaleDateString("sv-SE")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
