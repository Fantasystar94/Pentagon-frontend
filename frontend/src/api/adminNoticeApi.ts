import { api } from "./client";

export const adminNoticeApi = {
  // 공지 등록
  createNotice: (data: any) => api.post("/api/admin/notices", data),
  // 공지 수정
  updateNotice: (noticeId: number, data: any) =>
    api.put(`/api/admin/notices/${noticeId}`, data),
  // 공지 삭제
  deleteNotice: (noticeId: number) =>
    api.delete(`/api/admin/notices/${noticeId}`),
};
