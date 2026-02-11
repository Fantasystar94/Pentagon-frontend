import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/userAuth";
import { useEffect, useState } from "react";
import { enlistmentApi } from "../api/enlistmentApi";

const DEFERMENT_REASONS = ["ILLNESS", "STUDY", "FAMILY", "PERSONAL", "SIMPLECHANGE"];
const DEFERMENT_LABELS: { [key: string]: string } = {
  ILLNESS: "질병",
  STUDY: "학업",
  FAMILY: "가정",
  PERSONAL: "개인",
  SIMPLECHANGE: "복무형태변경",
  APPROVED: "승인",
  REJECTED: "반려",
  PENDING: "대기중",
};

export default function Deferments() {
  const navigate = useNavigate();
  const { isLoggedIn, userId, isAdmin, isInitialized } = useAuth();
  const [deferments, setDeferments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 어드민용 상태
  const [adminDeferments, setAdminDeferments] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);

  // 유저 연기 신청용 상태
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyData, setApplyData] = useState({
    applicationId: "",
    defermentStatus: "ILLNESS",
    reasonDetail: "",
  });
  const [applyLoading, setApplyLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 어드민 처리용 상태
  const [processingLoading, setProcessingLoading] = useState(false);

  // 초기화 및 권한 확인
  useEffect(() => {
    if (!isInitialized) return;

    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    if (isAdmin) {
      fetchAdminDeferments();
    } else {
      fetchUserDeferments();
    }
  }, [isInitialized, isLoggedIn, isAdmin, userId, navigate]);

  // 유저: 본인의 연기 신청 조회
  const fetchUserDeferments = () => {
    setLoading(true);
    enlistmentApi
      .getDeferment(userId!)
      .then((res) => {
        console.log("연기 신청 정보:", res.data?.data);
        setDeferments(Array.isArray(res.data?.data) ? res.data?.data : [res.data?.data]);
      })
      .catch((err) => {
        console.error("연기 신청 조회 실패:", err);
        setDeferments([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 어드민: 모든 연기 신청 조회
  const fetchAdminDeferments = () => {
    setAdminLoading(true);
    enlistmentApi
      .getDefermentList({ page: 0, size: 50 })
      .then((res) => {
        console.log("어드민 연기 신청 목록:", res.data?.data);
        const data = res.data?.data;
        setAdminDeferments(Array.isArray(data) ? data : data?.content || []);
      })
      .catch((err) => {
        console.error("연기 신청 목록 조회 실패:", err);
        setAdminDeferments([]);
      })
      .finally(() => {
        setAdminLoading(false);
      });
  };

  // 유저: 연기 신청
  const handleApplyDeferment = () => {
    if (!applyData.applicationId) {
      setMessage({ type: "error", text: "입영 신청을 선택해주세요." });
      return;
    }

    if (!applyData.reasonDetail.trim()) {
      setMessage({ type: "error", text: "신청 사유를 입력해주세요." });
      return;
    }

    setApplyLoading(true);
    enlistmentApi
      .applyDeferment({
        applicationId: parseInt(applyData.applicationId, 10),
        defermentStatus: applyData.defermentStatus as any,
        reasonDetail: applyData.reasonDetail,
      })
      .then((res) => {
        console.log("연기 신청 성공:", res.data);
        setMessage({ type: "success", text: "연기 신청이 완료되었습니다." });
        setShowApplyModal(false);
        setApplyData({ applicationId: "", defermentStatus: "ILLNESS", reasonDetail: "" });
        
        setTimeout(() => {
          fetchUserDeferments();
        }, 1000);
      })
      .catch((err) => {
        console.error("연기 신청 실패:", err);
        setMessage({
          type: "error",
          text: err.response?.data?.message || "연기 신청에 실패했습니다.",
        });
      })
      .finally(() => {
        setApplyLoading(false);
      });
  };

  // 어드민: 연기 신청 처리
  const handleProcessDeferment = (defermentsId: number, decision: string) => {
    setProcessingLoading(true);
    enlistmentApi
      .processDeferment(defermentsId, { decisionStatus: decision as any })
      .then((res) => {
        console.log("연기 처리 완료:", res.data);
        setMessage({
          type: "success",
          text: `연기 신청이 ${decision === "APPROVED" ? "승인" : "반려"}되었습니다.`,
        });
        fetchAdminDeferments();
      })
      .catch((err) => {
        console.error("연기 처리 실패:", err);
        setMessage({
          type: "error",
          text: err.response?.data?.message || "처리에 실패했습니다.",
        });
      })
      .finally(() => {
        setProcessingLoading(false);
      });
  };

  return (
    <>
      <Header />

      <main style={styles.container}>
        {isAdmin ? (
          // ========== 어드민 페이지 ==========
          <section style={styles.section}>
            <h1 style={styles.title}>연기 신청 관리</h1>

            {adminLoading ? (
              <p style={styles.loadingMessage}>로딩 중...</p>
            ) : adminDeferments.length > 0 ? (
              <div style={styles.table}>
                <div style={styles.tableHeader}>
                  <div style={styles.tableCol1}>신청자</div>
                  <div style={styles.tableCol2}>신청 사유</div>
                  <div style={styles.tableCol3}>상세 사유</div>
                  <div style={styles.tableCol4}>상태</div>
                  <div style={styles.tableCol5}>처리</div>
                </div>

                {adminDeferments.map((deferment: any, index: number) => (
                  <div key={index} style={styles.tableRow}>
                    <div style={styles.tableCol1}>{deferment.userId}</div>
                    <div style={styles.tableCol2}>
                      {DEFERMENT_LABELS[deferment.defermentStatus] || deferment.defermentStatus}
                    </div>
                    <div style={styles.tableCol3}>
                      {deferment.reasonDetail?.substring(0, 30)}
                      {deferment.reasonDetail?.length > 30 ? "..." : ""}
                    </div>
                    <div style={styles.tableCol4}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(deferment.decisionStatus === "APPROVED"
                            ? styles.statusApproved
                            : deferment.decisionStatus === "REJECTED"
                            ? styles.statusRejected
                            : styles.statusPending),
                        }}
                      >
                        {DEFERMENT_LABELS[deferment.decisionStatus] ||
                          deferment.decisionStatus ||
                          "대기중"}
                      </span>
                    </div>
                    <div style={styles.tableCol5}>
                      {!deferment.decisionStatus || deferment.decisionStatus === "PENDING" ? (
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() =>
                              handleProcessDeferment(deferment.id, "APPROVED")
                            }
                            style={styles.approveBtn}
                            disabled={processingLoading}
                          >
                            승인
                          </button>
                          <button
                            onClick={() =>
                              handleProcessDeferment(deferment.id, "REJECTED")
                            }
                            style={styles.rejectBtn}
                            disabled={processingLoading}
                          >
                            반려
                          </button>
                        </div>
                      ) : (
                        <span style={styles.processed}>완료</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyMessage}>연기 신청이 없습니다.</p>
            )}
          </section>
        ) : (
          // ========== 유저 페이지 ==========
          <section style={styles.section}>
            <div style={styles.userHeader}>
              <h1 style={styles.title}>연기 신청</h1>
              <button
                onClick={() => setShowApplyModal(true)}
                style={styles.primaryBtn}
              >
                새로운 연기 신청
              </button>
            </div>

            {loading ? (
              <p style={styles.loadingMessage}>로딩 중...</p>
            ) : deferments.length > 0 ? (
              <div style={styles.defermentList}>
                {deferments.map((deferment: any, index: number) => (
                  <div key={index} style={styles.card}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>
                        {DEFERMENT_LABELS[deferment.defermentStatus] ||
                          deferment.defermentStatus}
                      </h3>
                      <span
                        style={{
                          ...styles.statusBadge,
                          ...(deferment.decisionStatus === "APPROVED"
                            ? styles.statusApproved
                            : deferment.decisionStatus === "REJECTED"
                            ? styles.statusRejected
                            : styles.statusPending),
                        }}
                      >
                        {DEFERMENT_LABELS[deferment.decisionStatus] ||
                          deferment.decisionStatus ||
                          "대기중"}
                      </span>
                    </div>

                    <div style={styles.cardContent}>
                      <p>
                        <strong>신청 사유:</strong> {deferment.reasonDetail}
                      </p>
                      <p>
                        <strong>신청 날짜:</strong>{" "}
                        {new Date(deferment.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                      {deferment.decisionStatus && (
                        <p>
                          <strong>처리 날짜:</strong>{" "}
                          {new Date(deferment.updatedAt).toLocaleDateString(
                            "ko-KR"
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={styles.emptyMessage}>연기 신청 기록이 없습니다.</p>
            )}
          </section>
        )}
      </main>

      {/* 연기 신청 모달 (유저용) */}
      {showApplyModal && !isAdmin && (
        <div style={styles.modalOverlay} onClick={() => setShowApplyModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>연기 신청</h2>
              <button
                onClick={() => setShowApplyModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>입영 신청 ID *</label>
                <input
                  type="number"
                  value={applyData.applicationId}
                  onChange={(e) =>
                    setApplyData((prev) => ({
                      ...prev,
                      applicationId: e.target.value,
                    }))
                  }
                  style={styles.formInput}
                  placeholder="입영 신청 ID"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>신청 사유 *</label>
                <select
                  value={applyData.defermentStatus}
                  onChange={(e) =>
                    setApplyData((prev) => ({
                      ...prev,
                      defermentStatus: e.target.value,
                    }))
                  }
                  style={styles.formInput}
                >
                  {DEFERMENT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {DEFERMENT_LABELS[reason]}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>상세 사유 *</label>
                <textarea
                  value={applyData.reasonDetail}
                  onChange={(e) =>
                    setApplyData((prev) => ({
                      ...prev,
                      reasonDetail: e.target.value,
                    }))
                  }
                  style={{ ...styles.formInput, minHeight: "100px" }}
                  placeholder="연기 신청 사유를 상세히 입력해주세요"
                />
              </div>

              {message.text && (
                <div
                  style={{
                    ...styles.message,
                    ...(message.type === "error"
                      ? styles.errorMessage
                      : styles.successMessage),
                  }}
                >
                  {message.text}
                </div>
              )}

              <div style={styles.modalFooter}>
                <button
                  onClick={() => setShowApplyModal(false)}
                  style={styles.cancelBtn}
                >
                  취소
                </button>
                <button
                  onClick={handleApplyDeferment}
                  style={styles.submitBtn}
                  disabled={applyLoading}
                >
                  {applyLoading ? "처리 중..." : "신청"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  container: {
    padding: "40px",
    width: "inherit",
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
    color: "#213547",
  } as const,

  section: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    maxWidth: "1000px",
    margin: "0 auto",
  } as const,

  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "#222",
  } as const,

  userHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  } as const,

  primaryBtn: {
    backgroundColor: "#4a6cf7",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
  } as const,

  // 테이블 스타일
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  } as const,

  tableHeader: {
    display: "grid",
    gridTemplateColumns: "100px 100px 200px 100px 150px",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "8px 8px 0 0",
    fontWeight: "600",
    fontSize: "13px",
    color: "#666",
  } as const,

  tableRow: {
    display: "grid",
    gridTemplateColumns: "100px 100px 200px 100px 150px",
    gap: "12px",
    padding: "12px",
    borderBottom: "1px solid #eee",
    alignItems: "center",
  } as const,

  tableCol1: { minWidth: "100px" } as const,
  tableCol2: { minWidth: "100px" } as const,
  tableCol3: { minWidth: "200px", fontSize: "12px" } as const,
  tableCol4: { minWidth: "100px" } as const,
  tableCol5: { minWidth: "150px" } as const,

  actionButtons: {
    display: "flex",
    gap: "6px",
  } as const,

  approveBtn: {
    backgroundColor: "#52c41a",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  } as const,

  rejectBtn: {
    backgroundColor: "#f5222d",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  } as const,

  processed: {
    color: "#999",
    fontSize: "12px",
  } as const,

  statusBadge: {
    display: "inline-block",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "600",
  } as const,

  statusApproved: {
    backgroundColor: "#f6ffed",
    color: "#274e2d",
  } as const,

  statusRejected: {
    backgroundColor: "#fef2f0",
    color: "#c5192d",
  } as const,

  statusPending: {
    backgroundColor: "#e6f7ff",
    color: "#0050b3",
  } as const,

  // 카드 스타일
  defermentList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
  } as const,

  card: {
    border: "1px solid #eee",
    borderRadius: "8px",
    padding: "16px",
    backgroundColor: "#f9fafb",
  } as const,

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  } as const,

  cardTitle: {
    fontSize: "16px",
    fontWeight: "600",
    margin: 0,
    color: "#222",
  } as const,

  cardContent: {
    fontSize: "13px",
    color: "#555",
    lineHeight: "1.6",
  } as const,

  loadingMessage: {
    textAlign: "center" as const,
    padding: "40px",
    color: "#999",
  } as const,

  emptyMessage: {
    textAlign: "center" as const,
    padding: "40px",
    color: "#999",
  } as const,

  // 모달 스타일
  modalOverlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  } as const,

  modal: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "90vh",
    overflow: "auto",
  } as const,

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px",
    borderBottom: "1px solid #eee",
  } as const,

  modalTitle: {
    fontSize: "18px",
    fontWeight: "700",
    margin: 0,
    color: "#222",
  } as const,

  closeBtn: {
    background: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#999",
    padding: 0,
    width: "30px",
    height: "30px",
  } as const,

  modalContent: {
    padding: "20px",
  } as const,

  formGroup: {
    marginBottom: "16px",
  } as const,

  formLabel: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "6px",
    color: "#333",
  } as const,

  formInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
  } as const,

  message: {
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "16px",
    fontSize: "13px",
    textAlign: "center" as const,
  } as const,

  errorMessage: {
    backgroundColor: "#fef2f0",
    color: "#c5192d",
  } as const,

  successMessage: {
    backgroundColor: "#f6ffed",
    color: "#274e2d",
  } as const,

  modalFooter: {
    display: "flex",
    gap: "12px",
    justifyContent: "flex-end",
    paddingTop: "16px",
    borderTop: "1px solid #eee",
  } as const,

  cancelBtn: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  } as const,

  submitBtn: {
    backgroundColor: "#4a6cf7",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  } as const,
};
