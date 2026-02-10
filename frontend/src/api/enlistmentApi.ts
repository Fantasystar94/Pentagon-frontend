// src/api/enlistmentApi.ts
import { api } from "./client";

/* =====================
   Types
===================== */
export interface EnlistmentCreateRequest {
  scheduleId: number;
}

export interface DefermentPostRequest {
  applicationId: number;
  defermentStatus:
    | "ILLNESS"
    | "STUDY"
    | "FAMILY"
    | "PERSONAL"
    | "SIMPLECHANGE"
    | "APPROVED"
    | "REJECTED";
  reasonDetail?: string;
  requestedUntil?: string;
}

export interface DefermentPatchRequest {
  decisionStatus:
    | "ILLNESS"
    | "STUDY"
    | "FAMILY"
    | "PERSONAL"
    | "SIMPLECHANGE"
    | "APPROVED"
    | "REJECTED";
}

/* =====================
   User API
===================== */
export const enlistmentApi = {
  getEnlistmentList: () =>
    api.get("/api/enlistment"),

  getEnlistment: (scheduleId: number) =>
    api.get(`/api/enlistment/${scheduleId}`),

  applyEnlistment: (data: EnlistmentCreateRequest) =>
    api.post("/api/enlistment", data),

  cancelApplication: (applicationId: number) =>
    api.patch(`/api/enlistment/${applicationId}/cancel`),

  /* =====================
     Deferment
  ===================== */
  getDeferments: (params?: any) =>
    api.get("/api/enlistment/deferments", { params }),

  getDeferment: (defermentsId: number) =>
    api.get(`/api/enlistment/deferments/${defermentsId}`),

  applyDeferment: (data: DefermentPostRequest) =>
    api.post("/api/enlistment/deferments", data),

  /* =====================
     Admin
  ===================== */
  approveApplication: (applicationId: number) =>
    api.patch(`/api/enlistment/admin/${applicationId}/approve`),

  processDeferment: (
    applicationId: number,
    data: DefermentPatchRequest
  ) =>
    api.patch(
      `/api/enlistment/admin/deferments/${applicationId}`,
      data
    ),

  processDefermentBulk: (data: DefermentPatchRequest) =>
    api.patch(
      "/api/enlistment/admin/deferments/bulk",
      data
    ),

  getPendingApplications: () =>
    api.get("/api/enlistment/pending"),

  getPendingApplication: (scheduleId: number) =>
    api.get(`/api/enlistment/pending/${scheduleId}`),
};
