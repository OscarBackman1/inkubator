export function combineDocumentText(documents: Array<{ originalName: string; extractedText: string | null }>) {
  return documents
    .filter((document) => document.extractedText)
    .map((document) => `Dokument: ${document.originalName}\n${document.extractedText}`)
    .join("\n\n---\n\n")
    .slice(0, 60000);
}
