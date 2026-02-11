// src/api/qnaApi.ts
import { api } from "./client";

/* =====================
   Types
===================== */
export interface QnaResisterRequest {
  title: string;
  questionContent: string;
}

export interface QnaUpdateRequest {
  title: string;
  questionContent: string;
}

export interface QnaAdminAnswerRequest {
  askContent: string;
}

export interface QnaAdminAnswerUpdateRequest {
  askContent: string;
}

export interface QnaQuery {
  page?: number;
  size?: number;
  sort?: string;
  keyword?: string;
}

/* =====================
   API
===================== */
export const qnaApi = {
  // QnA 목록 조회
  getQnaList: (params?: QnaQuery) =>
    api.get("/api/qnas", { params }),

  // QnA 상세 조회
  getQna: (qnaId: number) =>
    api.get(`/api/qnas/${qnaId}`),

  // QnA 등록
  registerQna: (userId: number, data: QnaResisterRequest) =>
    api.post(`/api/qnas/${userId}`, data),

  // QnA 수정
  updateQna: (qnaId: number, data: QnaUpdateRequest) =>
    api.put(`/api/qnas/${qnaId}`, data),

  // QnA 삭제
  deleteQna: (qnaId: number) =>
    api.delete(`/api/qnas/${qnaId}`),

  // 관리자 답변 등록
  answerQna: (qnaId: number, data: QnaAdminAnswerRequest) =>
    api.post(`/api/admin/qna/${qnaId}`, data),

  // 관리자 답변 수정
  updateQnaAnswer: (qnaId: number, data: QnaAdminAnswerUpdateRequest) =>
    api.put(`/api/admin/qna/${qnaId}`, data),
};
