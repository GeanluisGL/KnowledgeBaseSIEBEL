import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import FormField, { inputClass } from "../components/FormField";
import Loading from "../components/Loading";
import { useAuth } from "../hooks/useAuth";
import { getErrorMessage, getFieldErrors, type FieldErrors } from "../utils/errors";

export default function Login() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <Loading fullScreen label="Verificando sesión..." />;
  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const v: FieldErrors = {};
    if (!identifier.trim()) v.identifier = "El nombre de usuario es obligatorio";
    if (!password) v.password = "La contraseña es obligatoria";
    setErrors(v);
    if (Object.keys(v).length > 0) return;

    setSubmitting(true);
    try {
      await login(identifier.trim(), password);
      navigate("/", { replace: true });
    } catch (err) {
      const fe = getFieldErrors(err);
      if (Object.keys(fe).length > 0) setErrors(fe);
      setApiError(getErrorMessage(err, "No se pudo iniciar sesión"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md">
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center">
              <img
              src="/logo.png"
              alt="Logo"
              className="h-full w-full object-contain"
              />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Base de Conocimiento BPD</h1>
            <p className="mt-1 text-sm text-gray-500">Inicia sesión para continuar</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <FormField label="Nombre de usuario" htmlFor="identifier" error={errors.identifier}>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={inputClass(!!errors.identifier)}
              />
            </FormField>

            <FormField label="Contraseña" htmlFor="password" error={errors.password}>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass(!!errors.password)}
              />
            </FormField>

            {apiError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                {apiError}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-60"
            >
              {submitting && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {submitting ? "Ingresando..." : "Iniciar sesión"}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          <p className="font-medium">Credenciales de prueba</p>
          {/* <p>admin@empresa.com / Admin123!</p> */}
          <p>CRMUSERTEST / CRMUSERTEST</p>
        </div>
      </div>
    </div>
  );
}
