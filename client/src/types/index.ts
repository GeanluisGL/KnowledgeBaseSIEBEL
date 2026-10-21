export type Role = "admin" | "viewer";

export interface User {
  id: string | number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Content {
  id: string | number;
  title: string;
  category: string;
  summary: string;
  body?: string;
  authorId: string | number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentInput {
  title: string;
  category: string;
  summary: string;
  body: string;
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UserUpdateInput {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
}
