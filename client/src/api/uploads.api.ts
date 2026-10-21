import api from "./axiosInstance";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export const ACCEPT = `image/*,.pdf,.docx,application/pdf,${DOCX_MIME}`;
export const MAX_FILE_MB = 20;

export function isImageFile(file: File): boolean {
  return /^image\/(png|jpe?g|gif|webp)$/.test(file.type);
}

export function isAllowedFile(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    isImageFile(file) ||
    file.type === "application/pdf" ||
    name.endsWith(".pdf") ||
    file.type === DOCX_MIME ||
    name.endsWith(".docx")
  );
}

export async function uploadFile(file: File): Promise<string> {
  if (!isAllowedFile(file)) {
    throw new Error("Formato no permitido (imágenes, PDF o DOCX)");
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    throw new Error(`El archivo supera ${MAX_FILE_MB} MB`);
  }
  const form = new FormData();
  form.append("file", file);
  const { data } = await api.post<{ url: string }>("/api/uploads", form);
  // Guardamos la ruta relativa (/uploads/uuid.docx) para que funcione en cualquier entorno.
  // DocumentViewer la recupera vía api.get() que ya antepone VITE_API_URL.
  return data.url;
}
