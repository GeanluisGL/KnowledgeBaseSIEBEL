import { useCallback, useEffect, useState } from "react";
import { contentApi } from "../api/content.api";
import type { Content } from "../types";
import { getErrorMessage } from "../utils/errors";

/**
 * Carga contenidos (GET /api/content?search=...).
 * `all` conserva el último resultado SIN búsqueda: sirve para el resumen
 * y para poblar las categorías aunque haya un término de búsqueda activo.
 */
export function useContents(search = "") {
  const [contents, setContents] = useState<Content[]>([]);
  const [all, setAll] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const refetch = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    contentApi
      .list(search)
      .then((data) => {
        if (cancelled) return;
        setContents(data);
        if (!search) setAll(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err, "No se pudieron cargar los contenidos"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [search, tick]);

  return { contents, all, loading, error, refetch };
}
