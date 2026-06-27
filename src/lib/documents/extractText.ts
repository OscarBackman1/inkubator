import { readFile } from "fs/promises";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

export async function extractTextFromFile(storagePath: string, mimeType: string, originalName: string) {
  try {
    const buffer = await readFile(storagePath);
    const ext = originalName.split(".").pop()?.toLowerCase();

    if (mimeType.startsWith("text/") || ["txt", "md", "csv"].includes(ext ?? "")) {
      return { text: buffer.toString("utf8"), warning: null };
    }

    if (mimeType.includes("wordprocessingml") || ext === "docx") {
      const result = await mammoth.extractRawText({ buffer });
      return { text: result.value, warning: result.messages.length ? result.messages.map(String).join("; ") : null };
    }

    if (mimeType.includes("spreadsheetml") || ext === "xlsx") {
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const sheets = workbook.SheetNames.map((name) => {
        const rows = XLSX.utils.sheet_to_csv(workbook.Sheets[name]);
        return `Ark: ${name}\n${rows}`;
      });
      return { text: sheets.join("\n\n"), warning: "Tabeller har extraherats som textsammanfattning." };
    }

    if (mimeType.includes("presentationml") || ext === "pptx") {
      return {
        text: "",
        warning:
          "PowerPoint-text extraheras begränsat i prototypen. Exportera gärna pitchdeck som PDF eller TXT för bättre textanalys."
      };
    }

    if (mimeType === "application/pdf" || ext === "pdf") {
      const pdfParse = (await import("pdf-parse")).default;
      const parsed = await pdfParse(buffer);
      return {
        text: parsed.text,
        warning:
          "PDF-text har extraherats automatiskt. Bilder, diagram och skannade sidor kan ha missats."
      };
    }

    return { text: "", warning: "Filtypen kunde sparas men textutdrag stöds inte ännu." };
  } catch (error) {
    return {
      text: "",
      warning: error instanceof Error ? error.message : "Textutdrag misslyckades."
    };
  }
}
