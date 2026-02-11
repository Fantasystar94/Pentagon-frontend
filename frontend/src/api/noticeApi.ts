// src/api/noticeApi.ts
import { api } from "./client";

/* =====================
   Types
===================== */
export interface NoticeResisterRequest {
  title: string;
  content: string;
}

export interface NoticeQuery {
  page?: number;
  size?: number;
  sort?: string;
}

/* =====================
   API
===================== */
export const noticeApi = {
  // 공지사항 목록 조회
  getNoticeList: (params?: NoticeQuery) =>
    api.get("/api/notices", { params }),

  // 공지사항 상세 조회
  getNotice: (noticeId: number) =>
    api.get(`/api/notices/${noticeId}`),

  // 공지사항 등록 (관리자)
  registerNotice: (data: NoticeResisterRequest) =>
    api.post("/api/admin/notices", data),

  // 공지사항 수정 (관리자)
  updateNotice: (noticeId: number, data: NoticeResisterRequest) =>
    api.put(`/api/admin/notices/${noticeId}`, data),

  // 공지사항 삭제 (관리자)
  deleteNotice: (noticeId: number) =>
    api.delete(`/api/admin/notices/${noticeId}`),
};
