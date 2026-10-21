import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

export default function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
      <div className="mb-4 text-gray-400">
        {icon ?? (
          <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V7a2 2 0 00-2-2h-3.5L12.5 3h-1L9.5 5H6a2 2 0 00-2 2v6m16 0v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4m16 0h-4.5l-1 2h-5l-1-2H4" />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-gray-500">{message}</p>}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
