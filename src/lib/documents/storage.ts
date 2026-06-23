import { mkdir, writeFile } from "fs/promises";
import os from "os";
import path from "path";

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/csv"
]);

export function sanitizeFilename(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 120);
}

export function validateUpload(file: File) {
  const maxMb = Number(process.env.MAX_UPLOAD_MB ?? 25);
  if (file.size > maxMb * 1024 * 1024) {
    throw new Error(`Filen är större än ${maxMb} MB.`);
  }
  if (!allowedMimeTypes.has(file.type) && !file.name.match(/\.(txt|md|csv)$/i)) {
    throw new Error("Filtypen stöds inte i prototypen.");
  }
}

export async function saveUploadedFile(file: File, companyId: string) {
  validateUpload(file);
  const safeName = sanitizeFilename(file.name || "upload");
  const uploadRoot = process.env.VERCEL ? os.tmpdir() : path.join(process.cwd(), "uploads");
  const dir = path.join(uploadRoot, companyId);
  await mkdir(dir, { recursive: true });
  const storagePath = path.join(dir, `${Date.now()}-${safeName}`);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(storagePath, buffer);
  return { storagePath, sizeBytes: buffer.byteLength, originalName: file.name || safeName };
}
