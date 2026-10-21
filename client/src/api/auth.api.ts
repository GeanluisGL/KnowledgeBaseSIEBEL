import api from "./axiosInstance";
import type { AuthResponse, User } from "../types";

export const authApi = {
  async login(identifier: string, password: string): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>("/api/auth/login", {
      identifier,
      password,
    });
    return data;
  },

  async me(): Promise<User> {
    const { data } = await api.get("/api/auth/me");
    return (data?.user ?? data) as User;
  },
};
