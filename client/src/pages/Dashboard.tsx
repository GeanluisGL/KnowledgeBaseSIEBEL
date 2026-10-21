import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import CategoryFilter from "../components/CategoryFilter";
import ContentCard from "../components/ContentCard";
import EmptyState from "../components/EmptyState";
import ErrorState from "../components/ErrorState";
import { CardSkeletons } from "../components/Loading";
import SearchBar from "../components/SearchBar";
import { useContents } from "../hooks/useContents";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate } from "../utils/formatDate";

export default function Dashboard() {
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("");
  const debouncedSearch = useDebounce(searchInput, 300).trim();

  const { contents, all, loading, error, refetch } = useContents(debouncedSearch);

  const categories = useMemo(
    () => Array.from(new Set(all.map((c) => c.category))).sort((a, b) => a.localeCompare(b)),
    [all]
  );

  const latest = useMemo(
    () =>
      [...all]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 3),
    [all]
  );

  const filtered = useMemo(
    () => (category ? contents.filter((c) => c.category === category) : contents),
    [contents, category]
  );

  const clearFilters = () => {
    setSearchInput("");
    setCategory("");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Inicio</h1>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total de contenidos</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{all.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Categorías</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900">{categories.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Últimos añadidos</p>
          {latest.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400">Sin contenidos</p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {latest.map((c) => (
                <li key={c.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <Link
                    to={`/content/${c.id}`}
                    className="truncate font-medium text-gray-800 hover:text-indigo-600"
                  >
                    {c.title}
                  </Link>
                  <span className="shrink-0 text-xs text-gray-500">{formatDate(c.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <SearchBar value={searchInput} onChange={setSearchInput} />
        </div>
        <CategoryFilter value={category} onChange={setCategory} categories={categories} />
      </section>

      {error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : loading && contents.length === 0 ? (
        <CardSkeletons />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No se encontraron contenidos"
          message="Prueba con otros términos de búsqueda o categoría."
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
        />
      ) : (
        <div
          className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${
            loading ? "opacity-60 transition-opacity" : ""
          }`}
        >
          {filtered.map((c) => (
            <ContentCard key={c.id} content={c} />
          ))}
        </div>
      )}
    </div>
  );
}
