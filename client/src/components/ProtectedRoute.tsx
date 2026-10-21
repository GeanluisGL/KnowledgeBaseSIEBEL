import type { ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loading from "./Loading";

interface ProtectedRouteProps {
  requireAdmin?: boolean;
  children?: ReactNode;
}

export default function ProtectedRoute({ requireAdmin = false, children }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <Loading fullScreen label="Verificando sesión..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (requireAdmin && !isAdmin) return <Navigate to="/" replace />;

  return <>{children ?? <Outlet />}</>;
}
