import api from "./axiosInstance";
import type { User, UserInput, UserUpdateInput } from "../types";

export const usersApi = {
  async list(): Promise<User[]> {
    const { data } = await api.get("/api/users");
    if (Array.isArray(data)) return data as User[];
    return (data?.users ?? data?.data ?? []) as User[];
  },

  async create(payload: UserInput): Promise<User> {
    const { data } = await api.post("/api/users", payload);
    return (data?.user ?? data) as User;
  },

  async update(id: string, payload: UserUpdateInput): Promise<User> {
    const { data } = await api.put(`/api/users/${id}`, payload);
    return (data?.user ?? data) as User;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/users/${id}`);
  },
};
