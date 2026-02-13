import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/userAuth";
import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { userApi } from "../api/userApi";
import type { UserUpdateRequest } from "../api/userApi";
import { enlistmentApi } from "../api/enlistmentApi";
import "../styles/mypage.css";

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

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isLoggedIn || !userId) {
      navigate("/login");
      return;
    }

    setLoading(true);
    userApi
      .getProfile(userId)
      .then((res) => {
        const profile = res.data?.data;
        setUserInfo(profile);
        setFormData((prev) => ({
          ...prev,
          email: profile?.email || "",
        }));
      })
      .catch((err) => {
        console.error("사용자 정보 조회 실패:", err);
      })
      .finally(() => setLoading(false));
  }, [isInitialized, isLoggedIn, userId, navigate]);

  useEffect(() => {
    if (!isInitialized || !isLoggedIn || !userId) {
      return;
    }
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
      setMyApplications(filtered.length ? filtered : list);
    } catch (err) {
      console.error("입영 일정 조회 실패:", err);
    } finally {
      setEnlistLoading(false);
    }
  };

  const fetchScheduleOptions = async () => {
    try {
      const res = await enlistmentApi.getEnlistmentList(0, 50);
      const data = res.data?.data;
      const list = Array.isArray(data) ? data : data?.content || [];
      setScheduleOptions(list);
    } catch (err) {
      console.error("입영 일정 목록 조회 실패:", err);
    }
  };

  const handleCancelApplication = async (applicationId: number) => {
    try {
      await enlistmentApi.cancelApplication(applicationId);
      fetchMyApplications();
    } catch (err) {
      console.error("입영 신청 취소 실패:", err);
    }
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

  const handleSubmitDefer = async () => {
    if (!deferForm.applicationId || !deferForm.scheduleId) {
      return;
    }

    try {
      await enlistmentApi.applyDeferment({
        applicationId: deferForm.applicationId,
        defermentStatus: deferForm.defermentStatus as any,
        reasonDetail: deferForm.reasonDetail,
        scheduleId: deferForm.scheduleId,
      });
      setShowDeferModal(false);
      fetchMyApplications();
    } catch (err) {
      console.error("연기 신청 실패:", err);
    }
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setMessage({ type: "", text: "" });
  };

  const handleUpdateProfile = async () => {
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
    const updateData: UserUpdateRequest = {
      currentPassword: formData.currentPassword,
    };

    if (formData.email && formData.email !== userInfo?.email) {
      updateData.email = formData.email;
    }

    if (formData.newPassword) {
      updateData.newPassword = formData.newPassword;
    }

    userApi
      .updateProfile(userId!, updateData)
      .then(() => {
        setMessage({ type: "success", text: "정보가 성공적으로 수정되었습니다." });
        setTimeout(() => {
          setShowEditModal(false);
          if (userId) {
            userApi.getProfile(userId).then((res) => {
              const profile = res.data?.data;
              setUserInfo(profile);
              setFormData({
                email: profile?.email || "",
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              });
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
      .finally(() => setUpdateLoading(false));
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

      <main className="mypage-container">
        <div className="mypage-wrapper">
          {loading ? (
            <div className="mypage-loading">로딩 중...</div>
          ) : userInfo ? (
            <>
              <section className="mypage-card">
                <h1 className="mypage-title">내 정보</h1>

                <div className="mypage-info-list">
                  <div className="mypage-info-row">
                    <label className="mypage-info-label">이름</label>
                    <span className="mypage-info-value">{userInfo.username}</span>
                  </div>

                  <div className="mypage-info-row">
                    <label className="mypage-info-label">이메일</label>
                    <span className="mypage-info-value">{userInfo.email}</span>
                  </div>

                  <div className="mypage-info-row">
                    <label className="mypage-info-label">회원가입 날짜</label>
                    <span className="mypage-info-value">
                      {new Date(userInfo.createdAt).toLocaleDateString("ko-KR")}
                    </span>
                  </div>

                  {userInfo.lastLoginAt && (
                    <div className="mypage-info-row">
                      <label className="mypage-info-label">마지막 로그인</label>
                      <span className="mypage-info-value">
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

                <div className="mypage-button-group">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="mypage-primary-btn"
                  >
                    내 정보 수정
                  </button>
                  <button onClick={handleLogout} className="mypage-danger-btn">
                    로그아웃
                  </button>
                </div>
              </section>

              <section className="mypage-card">
                <h2 className="mypage-section-title">내 입영 일정</h2>
                {enlistLoading ? (
                  <div className="mypage-loading">로딩 중...</div>
                ) : myApplications.length === 0 ? (
                  <div className="mypage-empty">입영 신청 내역이 없습니다.</div>
                ) : (
                  <div className="mypage-table-wrapper">
                    <table className="mypage-table">
                      <thead>
                        <tr>
                          <th>신청ID</th>
                          <th>입영일</th>
                          <th>상태</th>
                          <th>신청일</th>
                          <th>처리</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myApplications.map((app) => (
                          <tr key={app.applicationId || app.id}>
                            <td>{app.applicationId || app.id}</td>
                            <td>
                              {app.enlistmentDate
                                ? new Date(app.enlistmentDate).toLocaleDateString("ko-KR")
                                : "-"}
                            </td>
                            <td>{app.status || "-"}</td>
                            <td>
                              {app.createdAt
                                ? new Date(app.createdAt).toLocaleDateString("ko-KR")
                                : "-"}
                            </td>
                            <td className="mypage-table-actions">
                              <button
                                className="mypage-secondary-btn"
                                onClick={() =>
                                  handleCancelApplication(app.applicationId || app.id)
                                }
                              >
                                취소
                              </button>
                              <button
                                className="mypage-ghost-btn"
                                onClick={() => handleOpenDeferModal(app.applicationId || app.id)}
                              >
                                연기 신청
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="mypage-empty">정보를 불러올 수 없습니다.</div>
          )}
        </div>
      </main>

      {showEditModal && (
        <div className="mypage-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="mypage-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mypage-modal-header">
              <h2 className="mypage-modal-title">내 정보 수정</h2>
              <button className="mypage-close-btn" onClick={() => setShowEditModal(false)}>
                ✕
              </button>
            </div>
            <div className="mypage-modal-content">
              <div className="mypage-form-group">
                <label className="mypage-form-label">이메일</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  className="mypage-form-input"
                  placeholder="이메일 주소"
                />
              </div>

              <div className="mypage-form-group">
                <label className="mypage-form-label">현재 비밀번호 *</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleFormChange}
                  className="mypage-form-input"
                  placeholder="현재 비밀번호"
                />
              </div>

              <div className="mypage-form-group">
                <label className="mypage-form-label">새 비밀번호</label>
                <input
                  type="password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleFormChange}
                  className="mypage-form-input"
                  placeholder="새 비밀번호 (변경하지 않으면 공백)"
                />
              </div>

              <div className="mypage-form-group">
                <label className="mypage-form-label">새 비밀번호 확인</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleFormChange}
                  className="mypage-form-input"
                  placeholder="새 비밀번호 확인"
                />
              </div>

              {message.text && (
                <div
                  className={`mypage-message ${message.type === "error" ? "error" : "success"}`}
                >
                  {message.text}
                </div>
              )}

              <div className="mypage-modal-footer">
                <button className="mypage-cancel-btn" onClick={() => setShowEditModal(false)}>
                  취소
                </button>
                <button
                  className="mypage-submit-btn"
                  onClick={handleUpdateProfile}
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
        <div className="mypage-modal-overlay" onClick={() => setShowDeferModal(false)}>
          <div className="mypage-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mypage-modal-header">
              <h2 className="mypage-modal-title">연기 신청</h2>
              <button className="mypage-close-btn" onClick={() => setShowDeferModal(false)}>
                ✕
              </button>
            </div>
            <div className="mypage-modal-content">
              <div className="mypage-form-group">
                <label className="mypage-form-label">연기 사유</label>
                <select
                  value={deferForm.defermentStatus}
                  onChange={(e) =>
                    setDeferForm((prev) => ({
                      ...prev,
                      defermentStatus: e.target.value,
                    }))
                  }
                  className="mypage-form-input"
                >
                  <option value="ILLNESS">질병</option>
                  <option value="STUDY">학업</option>
                  <option value="FAMILY">가족</option>
                  <option value="PERSONAL">개인 사정</option>
                  <option value="SIMPLECHANGE">단순 변경</option>
                </select>
              </div>

              <div className="mypage-form-group">
                <label className="mypage-form-label">변경할 입영 일정</label>
                <select
                  value={deferForm.scheduleId ?? ""}
                  onChange={(e) =>
                    setDeferForm((prev) => ({
                      ...prev,
                      scheduleId: Number(e.target.value) || null,
                    }))
                  }
                  className="mypage-form-input"
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

              <div className="mypage-form-group">
                <label className="mypage-form-label">상세 사유</label>
                <textarea
                  value={deferForm.reasonDetail}
                  onChange={(e) =>
                    setDeferForm((prev) => ({
                      ...prev,
                      reasonDetail: e.target.value,
                    }))
                  }
                  className="mypage-form-textarea"
                  placeholder="상세 사유를 입력하세요"
                />
              </div>

              <div className="mypage-modal-footer">
                <button className="mypage-cancel-btn" onClick={() => setShowDeferModal(false)}>
                  취소
                </button>
                <button className="mypage-submit-btn" onClick={handleSubmitDefer}>
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
