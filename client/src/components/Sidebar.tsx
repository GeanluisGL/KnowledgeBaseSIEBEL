import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-indigo-50 text-indigo-700"
      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
  }`;

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { isAdmin, logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-gray-900/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-5">
         <div className="mb-3 flex h-12 w-12 items-center justify-center">
              <img
              src="/logo.png"
              alt="Logo"
              className="h-full w-full object-contain"
              />
            </div>  
          <span className="text-base font-semibold text-gray-900">Base de Conocimiento</span>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          <NavLink to="/" end className={linkClass}>
            Inicio
          </NavLink>

          {isAdmin && (
            <div className="pt-4">
              <p className="px-3 pb-2 text-xs font-semibold text-gray-400">Administración</p>
              <NavLink to="/admin/contents" className={linkClass}>
                Contenidos
              </NavLink>
              <NavLink to="/admin/users" className={linkClass}>
                Usuarios
              </NavLink>
            </div>
          )}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
