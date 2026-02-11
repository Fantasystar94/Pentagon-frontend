import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/userAuth";
import { useEffect, useState } from "react";
import { userApi } from "../api/userApi";
import { enlistmentApi } from "../api/enlistmentApi";

export default function MyPage() {
  const navigate = useNavigate();
  const { isLoggedIn, userId, isInitialized, logout } = useAuth();
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [myApplications, setMyApplications] = useState<any[]>([]);
  const [enlistLoading, setEnlistLoading] = useState(false);
  const [showDeferModal, setShowDeferModal] = useState(false);
  const [deferForm, setDeferForm] = useState({
    applicationId: null as number | null,
    defermentStatus: "ILLNESS",
    reasonDetail: "",
    scheduleId: null as number | null,
  });
  const [scheduleOptions, setScheduleOptions] = useState<any[]>([]);

  // 사용자 정보 조회
  useEffect(() => {
    console.log("isInitialized:", isInitialized, "isLoggedIn:", isLoggedIn, "userId:", userId);
    
    // 초기화가 완료되지 않았으면 기다림
    if (!isInitialized) {
      return;
    }

    // 초기화 완료 후 로그인 상태 확인
    if (!isLoggedIn || !userId) {
      navigate("/login");
      return;
    }

    setLoading(true);
    userApi
      .getProfile(userId)
      .then((res) => {
        console.log("사용자 정보:", res.data?.data);
        setUserInfo(res.data?.data);
        setFormData((prev) => ({
          ...prev,
          email: res.data?.data?.email || "",
        }));
      })
      .catch((err) => {
        console.error("사용자 정보 조회 실패:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isInitialized, isLoggedIn, userId, navigate]);

  useEffect(() => {
    if (!isInitialized || !isLoggedIn || !userId) return;
    fetchMyApplications();
  }, [isInitialized, isLoggedIn, userId]);

  const fetchMyApplications = async () => {
    setEnlistLoading(true);
    try {
      const res = await enlistmentApi.getApplicationList();
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      const filtered = list.filter((app: any) => {
        const appUserId = app.userId ?? app.user_id ?? app.memberId ?? app.accountId;
        return appUserId === userId;
      });
      console.log(filtered);
      setMyApplications(filtered.length ? filtered : list);
      console.log(myApplications)
    } catch (e) {
      // error handling
    }
    setEnlistLoading(false);
  };

  const handleCancelApplication = async (applicationId: number) => {
    try {
      await enlistmentApi.cancelApplication(applicationId);
      fetchMyApplications();
    } catch (e) {}
  };

  const handleOpenDeferModal = (applicationId: number) => {
    setDeferForm({
      applicationId,
      defermentStatus: "ILLNESS",
      reasonDetail: "",
      scheduleId: null,
    });
    fetchScheduleOptions();
    setShowDeferModal(true);
  };

  const fetchScheduleOptions = async () => {
    try {
      const res = await enlistmentApi.getEnlistmentList(0, 50);
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      setScheduleOptions(list);
    } catch (e) {}
  };

  const handleSubmitDefer = async () => {
    if (!deferForm.applicationId || !deferForm.scheduleId) return;
    try {
      await enlistmentApi.applyDeferment({
        applicationId: deferForm.applicationId,
        defermentStatus: deferForm.defermentStatus as any,
        reasonDetail: deferForm.reasonDetail,
        scheduleId: deferForm.scheduleId,
      });
      setShowDeferModal(false);
      fetchMyApplications();
    } catch (e) {}
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage({ type: "", text: "" });
  };

  const handleUpdateProfile = async () => {
    // 유효성 검사
    if (!formData.currentPassword) {
      setMessage({ type: "error", text: "현재 비밀번호를 입력해주세요." });
      return;
    }

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setMessage({ type: "error", text: "새 비밀번호는 최소 6자 이상이어야 합니다." });
      return;
    }

    setUpdateLoading(true);
    const updateData: any = {
      currentPassword: formData.currentPassword,
    };

    if (formData.email && formData.email !== userInfo.email) {
      updateData.email = formData.email;
    }

    if (formData.newPassword) {
      updateData.newPassword = formData.newPassword;
    }

    userApi
      .updateProfile(userId!, updateData)
      .then((res) => {
        console.log("프로필 수정 성공:", res.data);
        setMessage({ type: "success", text: "정보가 성공적으로 수정되었습니다." });
        
        // 2초 후 모달 닫기
        setTimeout(() => {
          setShowEditModal(false);
          // 사용자 정보 다시 조회
          if (userId) {
            userApi.getProfile(userId).then((res) => {
              setUserInfo(res.data?.data);
              setFormData((prev) => ({
                ...prev,
                email: res.data?.data?.email || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              }));
            });
          }
        }, 1500);
      })
      .catch((err) => {
        console.error("프로필 수정 실패:", err);
        setMessage({
          type: "error",
          text: err.response?.data?.message || "정보 수정에 실패했습니다.",
        });
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <Header />

      <main style={styles.container}>
        <div style={styles.wrapper}>
          {loading ? (
            <div style={styles.loadingMessage}>로딩 중...</div>
          ) : userInfo ? (
            <>
              <section style={styles.profileSection}>
                <h1 style={styles.title}>내 정보</h1>

                <div style={styles.infoContainer}>
                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>이름</label>
                    <span style={styles.infoValue}>{userInfo.username}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>이메일</label>
                    <span style={styles.infoValue}>{userInfo.email}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <label style={styles.infoLabel}>회원가입 날짜</label>
                    <span style={styles.infoValue}>
                      {new Date(userInfo.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>

                  {userInfo.lastLoginAt && (
                    <div style={styles.infoRow}>
                      <label style={styles.infoLabel}>마지막 로그인</label>
                      <span style={styles.infoValue}>
                        {new Date(userInfo.lastLoginAt).toLocaleDateString("ko-KR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div style={styles.buttonGroup}>
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={styles.primaryBtn}
                  >
                    내 정보 수정
                  </button>
                  <button onClick={handleLogout} style={styles.dangerBtn}>
                    로그아웃
                  </button>
                </div>
              </section>

              <section style={styles.enlistSection}>
                <h2 style={styles.sectionTitle}>내 입영 일정</h2>
                {enlistLoading ? (
                  <div style={styles.loadingMessage}>로딩 중...</div>
                ) : myApplications.length === 0 ? (
                  <div style={styles.notFoundMessage}>입영 신청 내역이 없습니다.</div>
                ) : (
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>신청ID</th>
                        <th style={styles.th}>입영일</th>
                        <th style={styles.th}>상태</th>
                        <th style={styles.th}>신청일</th>
                        <th style={styles.th}>처리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myApplications.map((app) => (
                        <tr key={app.applicationId || app.id}>
                          <td style={styles.td}>{app.applicationId || app.id}</td>
                          <td style={styles.td}>
                            {app.enlistmentDate
                              ? new Date(app.enlistmentDate).toLocaleDateString("ko-KR")
                              : "-"}
                          </td>
                          <td style={styles.td}>{app.status || "-"}</td>
                          <td style={styles.td}>
                            {app.createdAt
                              ? new Date(app.createdAt).toLocaleDateString("ko-KR")
                              : "-"}
                          </td>
                          <td style={styles.td}>
                            <button
                              style={styles.secondaryBtn}
                              onClick={() => handleCancelApplication(app.applicationId || app.id)}
                            >
                              취소
                            </button>
                            <button
                              style={styles.ghostBtn}
                              onClick={() => handleOpenDeferModal(app.applicationId || app.id)}
                            >
                              연기 신청
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          ) : (
            <div style={styles.notFoundMessage}>정보를 불러올 수 없습니다.</div>
          )}
        </div>
      </main>

      {/* 수정 모달 */}
      {showEditModal && (
        <div style={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>내 정보 수정</h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="이메일 주소"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>현재 비밀번호 *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="현재 비밀번호"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>새 비밀번호</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="새 비밀번호 (변경하지 않으면 공백)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>새 비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  style={styles.formInput}
                  placeholder="새 비밀번호 확인"
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
                  onClick={() => setShowEditModal(false)}
                  style={styles.cancelBtn}
                >
                  취소
                </button>
                <button
                  onClick={handleUpdateProfile}
                  style={styles.submitBtn}
                  disabled={updateLoading}
                >
                  {updateLoading ? "처리 중..." : "저장"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeferModal && (
        <div style={styles.modalOverlay} onClick={() => setShowDeferModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}
            >
              <h2 style={styles.modalTitle}>연기 신청</h2>
              <button
                onClick={() => setShowDeferModal(false)}
                style={styles.closeBtn}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>연기 사유</label>
                <select
                  value={deferForm.defermentStatus}
                  onChange={(e) =>
                    setDeferForm((prev) => ({
                      ...prev,
                      defermentStatus: e.target.value,
                    }))
                  }
                  style={styles.formInput}
                >
                  <option value="ILLNESS">질병</option>
                  <option value="STUDY">학업</option>
                  <option value="FAMILY">가족</option>
                  <option value="PERSONAL">개인 사정</option>
                  <option value="SIMPLECHANGE">단순 변경</option>
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>변경할 입영 일정</label>
                <select
                  value={deferForm.scheduleId ?? ""}
                  onChange={(e) =>
                    setDeferForm((prev) => ({
                      ...prev,
                      scheduleId: Number(e.target.value) || null,
                    }))
                  }
                  style={styles.formInput}
                >
                  <option value="">입영 일정을 선택하세요</option>
                  {scheduleOptions.map((s) => (
                    <option key={s.scheduleId || s.id} value={s.scheduleId || s.id}>
                      {s.enlistmentDate
                        ? new Date(s.enlistmentDate).toLocaleDateString("ko-KR")
                        : s.date || s.title || `일정 ${s.scheduleId || s.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.formLabel}>상세 사유</label>
                <textarea
                  value={deferForm.reasonDetail}
                  onChange={(e) =>
                    setDeferForm((prev) => ({
                      ...prev,
                      reasonDetail: e.target.value,
                    }))
                  }
                  style={styles.formTextarea}
                  placeholder="상세 사유를 입력하세요"
                />
              </div>
              <div style={styles.modalFooter}>
                <button
                  onClick={() => setShowDeferModal(false)}
                  style={styles.cancelBtn}
                >
                  취소
                </button>
                <button onClick={handleSubmitDefer} style={styles.submitBtn}>
                  신청
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

  wrapper: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "20px",
    maxWidth: "600px",
    margin: "0 auto",
  } as const,

  profileSection: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  } as const,

  enlistSection: {
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  } as const,

  sectionTitle: {
    fontSize: "20px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#222",
  } as const,



  title: {
    fontSize: "24px",
    fontWeight: "700",
    marginBottom: "24px",
    color: "#222",
  } as const,

  infoContainer: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px",
    marginBottom: "24px",
  } as const,

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #eee",
  } as const,

  infoLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#666",
  } as const,

  infoValue: {
    fontSize: "14px",
    color: "#222",
    fontWeight: "500",
  } as const,

  buttonGroup: {
    display: "flex",
    gap: "12px",
  } as const,

  primaryBtn: {
    flex: 1,
    backgroundColor: "#4a6cf7",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  } as const,

  dangerBtn: {
    flex: 1,
    backgroundColor: "#f5222d",
    color: "white",
    border: "none",
    padding: "12px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background-color 0.2s ease",
  } as const,

  loadingMessage: {
    textAlign: "center" as const,
    padding: "40px",
    color: "#999",
  } as const,

  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  } as const,

  th: {
    textAlign: "left" as const,
    fontSize: "13px",
    padding: "10px",
    borderBottom: "1px solid #eee",
    backgroundColor: "#f8f9fb",
    color: "#444",
  } as const,

  td: {
    fontSize: "13px",
    padding: "10px",
    borderBottom: "1px solid #f0f0f0",
    color: "#222",
  } as const,

  secondaryBtn: {
    backgroundColor: "#f5f5f5",
    color: "#333",
    border: "1px solid #ddd",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
    marginRight: "6px",
  } as const,

  ghostBtn: {
    backgroundColor: "#fff",
    color: "#4a6cf7",
    border: "1px solid #4a6cf7",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: "600",
  } as const,

  notFoundMessage: {
    textAlign: "center" as const,
    padding: "40px",
    color: "#999",
  } as const,

  // Modal styles
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  formTextarea: {
    width: "100%",
    minHeight: "80px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box" as const,
    resize: "vertical" as const,
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
