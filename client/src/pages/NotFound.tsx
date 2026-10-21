import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <p className="text-5xl font-bold text-indigo-600">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-gray-900">Página no encontrada</h1>
      <p className="mt-2 text-sm text-gray-500">La página que buscas no existe.</p>
      <Link
        to="/"
        className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
