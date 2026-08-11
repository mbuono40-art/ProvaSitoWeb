import "server-only";
import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 5 * 1024 * 1024;

const ESTENSIONI: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Salva un'immagine caricata dall'admin in public/uploads e ne restituisce l'URL pubblico. */
export async function saveUploadedImage(file: File, prefisso: string): Promise<string> {
  const estensione = ESTENSIONI[file.type];
  if (!estensione) {
    throw new Error("Formato immagine non supportato: usa JPG, PNG, WEBP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("L'immagine supera i 5 MB consentiti.");
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const nomeFile = `${prefisso}-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${estensione}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await fs.writeFile(path.join(UPLOAD_DIR, nomeFile), buffer);

  return `/uploads/${nomeFile}`;
}

/** Estrae dal FormData un file caricato, solo se presente e non vuoto. */
export function fileFromForm(formData: FormData, campo: string): File | null {
  const value = formData.get(campo);
  return value instanceof File && value.size > 0 ? value : null;
}
