// src/api/authApi.ts
import { api } from "./client";

/* =====================
   Types
===================== */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  username: string;
  admin?: boolean;
}

export interface TokenRequest {
  refreshToken: string;
}

/* =====================
   API
===================== */
export const authApi = {
  signup: (data: SignupRequest) =>
    api.post("/api/auth/signup", data),

  login: (data: LoginRequest) =>
    api.post("/api/auth/login", data),

  reissue: (data: TokenRequest) =>
    api.post("/api/auth/reissue", data),

  logout: () =>
    api.post("/api/auth/logout"),
};
