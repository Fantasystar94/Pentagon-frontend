// src/api/productApi.ts
import { api } from "./client";

/* =====================
   Types
===================== */
export interface ProductRequest {
  name: string;
  description: string;
  price: number;
  stock: number;
}

export interface ProductQuery {
  page?: number;
  size?: number;
  sort?: string;
  direction?: "asc" | "desc";
  keyword?: string;
}

/* =====================
   User API
===================== */
export const productApi = {
  getProducts: (params?: ProductQuery) =>
    api.get("/api/products", { params }),

  getProduct: (productId: number) =>
    api.get(`/api/products/${productId}`),

  /* =====================
     Admin API
  ===================== */
  createProduct: (data: ProductRequest) =>
    api.post("/api/admin/products", data),

  updateProduct: (productId: number, data: ProductRequest) =>
    api.put(`/api/admin/products/${productId}`, data),

  deleteProduct: (productId: number) =>
    api.delete(`/api/admin/products/${productId}`),

  // 상품 이미지 업로드
  uploadProductImage: (productId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post(`/api/admin/products/${productId}/image`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

