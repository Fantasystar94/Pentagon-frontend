// src/api/orderApi.ts
import { api } from "./client";

/* =====================
   Types
===================== */
export interface OrderCreateRequest {
  productId: number;
  quantity: number;
}

export interface OrderUpdateRequest {
  productId: number;
  quantity: number;
}

/* =====================
   API
===================== */
export const orderApi = {
  createOrder: (data: OrderCreateRequest) =>
    api.post("/api/orders", data),

  getOrder: (orderId: number) =>
    api.get(`/api/orders/${orderId}`),

  deleteOrder: (orderId: number) =>
    api.delete(`/api/orders/${orderId}`),

  getOrderItem: (orderId: number, orderItemId: number) =>
    api.get(`/api/orders/${orderId}/orderItems/${orderItemId}`),

  updateOrderItem: (
    orderId: number,
    orderItemId: number,
    data: OrderUpdateRequest
  ) =>
    api.patch(
      `/api/orders/${orderId}/orderItems/${orderItemId}`,
      data
    ),
};
