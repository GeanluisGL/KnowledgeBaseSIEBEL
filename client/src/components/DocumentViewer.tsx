import { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import api from "../api/axiosInstance";
import { getErrorMessage } from "../utils/errors";
import Loading from "./Loading";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

interface DocumentViewerProps {
  url: string;
  name: string;
}

export default function DocumentViewer({ url, name }: DocumentViewerProps) {
  const isPdf = /\.pdf(\?.*)?$/i.test(url);
  const hostRef = useRef<HTMLDivElement>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setError(null);
    setBlobUrl(null);

    (async () => {
      try {
        const res = await api.get<Blob>(url, { responseType: "blob" });
        if (cancelled) return;
        const blob = new Blob([res.data], {
          type: isPdf ? "application/pdf" : DOCX_MIME,
        });
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);

        if (!isPdf && hostRef.current) {
          hostRef.current.innerHTML = "";
          await renderAsync(blob, hostRef.current, undefined, {
            className: "docx",
            inWrapper: true,
            breakPages: true,
          });
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, "No se pudo cargar el documento"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url, isPdf]);

  const downloadName = /\.(pdf|docx)$/i.test(name) ? name : `${name}.${isPdf ? "pdf" : "docx"}`;

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-sm">
        <span className="truncate font-medium text-gray-700">{name}</span>
        {blobUrl && (
          <a
            href={blobUrl}
            download={downloadName}
            className="shrink-0 font-medium text-indigo-600 hover:text-indigo-800"
          >
            Descargar
          </a>
        )}
      </div>

      {loading && <Loading label="Cargando documento..." />}
      {error && <p className="px-4 py-6 text-center text-sm text-red-600">{error}</p>}

      {isPdf ? (
        blobUrl && !error && <iframe src={blobUrl} title={name} className="h-[80vh] w-full" />
      ) : (
        <div
          ref={hostRef}
          className={`max-h-[80vh] overflow-auto bg-gray-100 ${loading || error ? "hidden" : ""}`}
        />
      )}
    </div>
  );
}
