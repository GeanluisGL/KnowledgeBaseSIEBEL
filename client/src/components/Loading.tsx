interface LoadingProps {
  label?: string;
  fullScreen?: boolean;
}

export default function Loading({ label = "Cargando...", fullScreen = false }: LoadingProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 text-gray-500 ${
        fullScreen ? "min-h-screen" : "py-16"
      }`}
      role="status"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function CardSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 h-5 w-20 rounded-full bg-gray-200" />
          <div className="mb-3 h-5 w-3/4 rounded bg-gray-200" />
          <div className="mb-2 h-3 w-full rounded bg-gray-100" />
          <div className="mb-5 h-3 w-5/6 rounded bg-gray-100" />
          <div className="h-3 w-1/2 rounded bg-gray-100" />
        </div>
      ))}
    </div>
  );
}
