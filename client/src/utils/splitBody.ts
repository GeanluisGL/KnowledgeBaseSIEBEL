export type BodySegment =
  | { type: "markdown"; text: string }
  | { type: "file"; name: string; url: string };

// Línea que contiene SOLO un enlace a un .pdf o .docx: [nombre.pdf](url)
const FILE_LINE = /^\s*\[([^\]]*)\]\((\S+?\.(?:pdf|docx)(?:\?\S*)?)\)\s*$/i;

export function splitBody(body: string): BodySegment[] {
  const out: BodySegment[] = [];
  let buf: string[] = [];
  let fence = false;

  const flush = () => {
    const text = buf.join("\n");
    if (text.trim()) out.push({ type: "markdown", text });
    buf = [];
  };

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const m = fence ? null : line.match(FILE_LINE);
    if (m) {
      flush();
      out.push({ type: "file", name: m[1] || "documento", url: m[2] });
    } else {
      buf.push(line);
    }
  }
  flush();
  return out;
}
