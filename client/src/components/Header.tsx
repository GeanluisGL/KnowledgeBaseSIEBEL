import { useAuth } from "../hooks/useAuth";
import RoleBadge from "./RoleBadge";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 md:hidden"
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="ml-auto flex items-center gap-3">
        {user && (
          <>
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
            <RoleBadge role={user.role} />
          </>
        )}
      </div>
    </header>
  );
}
