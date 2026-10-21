export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es-DO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
