import { api } from "./client";

export const dashboardApi = {
  // 대시보드 전체 요약
  getSummary: () => api.get("/api/admin/dashboard/summary"),
  // 대시보드 요청 대기 요약
  getRequested: () => api.get("/api/admin/dashboard/requested"),
  // 대시보드 연기 요약
  getDeferments: () => api.get("/api/admin/dashboard/deferments"),
};
