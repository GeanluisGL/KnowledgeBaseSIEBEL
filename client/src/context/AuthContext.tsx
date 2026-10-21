import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api/auth.api";
import { UNAUTHORIZED_EVENT } from "../api/axiosInstance";
import type { User } from "../types";
import { clearToken, getToken, setToken } from "../utils/storage";

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(getToken());
  const [loading, setLoading] = useState<boolean>(!!getToken());

  // Al montar: valida el token guardado con GET /api/auth/me
  useEffect(() => {
    const stored = getToken();
    if (!stored) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    authApi
      .me()
      .then((me) => {
        if (cancelled) return;
        setUser(me);
        setTokenState(stored);
      })
      .catch(() => {
        if (cancelled) return;
        clearToken();
        setTokenState(null);
        setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // 401 recibido por el interceptor de axios
  useEffect(() => {
    const onUnauthorized = () => {
      clearToken();
      setTokenState(null);
      setUser(null);
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      loading,
      isAdmin: user?.role === "admin",
      login,
      logout,
    }),
    [user, token, loading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
