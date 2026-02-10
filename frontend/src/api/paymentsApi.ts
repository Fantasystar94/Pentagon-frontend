// src/api/paymentsApi.ts
import { api } from "./client";

/* =====================
   Types
===================== */

export interface PaymentCreateRequest {
  orderId: number;
  orderIdString: string;
}

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/* =====================
   Payments API
===================== */

export const paymentsApi = {
  /**
   * 결제 생성 (주문 → 결제 준비)
   * POST /api/payments
   */
  createPayment: (data: PaymentCreateRequest) =>
    api.post("/api/payments", data),

  /**
   * 결제 승인 (PG 결제 성공 후 호출)
   * POST /api/payments/confirm
   */
  confirmPayment: (data: PaymentConfirmRequest) =>
    api.post("/api/payments/confirm", data),

  /**
   * 결제 취소
   * POST /api/payments/{paymentKey}/cancel
   */
  cancelPayment: (paymentKey: string) =>
    api.post(`/api/payments/${paymentKey}/cancel`),

  /**
   * 결제 단건 조회 (paymentKey 기준)
   * GET /api/payments/{paymentKey}
   */
  getPaymentByPaymentKey: (paymentKey: string) =>
    api.get(`/api/payments/${paymentKey}`),

  /**
   * 주문 기준 결제 조회
   * GET /api/payments/orders/{orderIdString}
   */
  getPaymentByOrderId: (orderIdString: string) =>
    api.get(`/api/payments/orders/${orderIdString}`),
};
