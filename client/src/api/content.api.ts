import api from "./axiosInstance";
import type { Content, ContentInput } from "../types";

export const contentApi = {
  async list(search?: string): Promise<Content[]> {
    const params = search && search.trim() ? { search: search.trim() } : undefined;
    const { data } = await api.get("/api/content", { params });
    if (Array.isArray(data)) return data as Content[];
    return (data?.contents ?? data?.data ?? []) as Content[];
  },

  async get(id: string | number): Promise<Content> {
    const { data } = await api.get(`/api/content/${id}`);
    return (data?.content ?? data) as Content;
  },

  async create(payload: ContentInput): Promise<Content> {
    const { data } = await api.post("/api/content", payload);
    return (data?.content ?? data) as Content;
  },

  async update(id: string | number, payload: ContentInput): Promise<Content> {
    const { data } = await api.put(`/api/content/${id}`, payload);
    return (data?.content ?? data) as Content;
  },

  async remove(id: string | number): Promise<void> {
    await api.delete(`/api/content/${id}`);
  },
};
