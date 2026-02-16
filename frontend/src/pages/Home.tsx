import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/userAuth";
import { useEffect, useState } from "react";
import { userApi } from "../api/userApi";
import { weatherApi } from "../api/weatherApi";
import { enlistmentApi } from "../api/enlistmentApi";
import { noticeApi } from "../api/noticeApi";
import "../styles/home.css";

export default function Home() {
  const navigate = useNavigate();
  const { isLoggedIn, userId } = useAuth();
  const [detailedUserInfo, setDetailedUserInfo] = useState<any>(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [thisWeekSchedules, setThisWeekSchedules] = useState<any>(null);
  const [thisWeekLoading, setThisWeekLoading] = useState(false);
  const [notices, setNotices] = useState<any[]>([]);
  const [noticesLoading, setNoticesLoading] = useState(false);

  const NX = 36;
  const NY = 127;

  // 로그인된 경우 상세 사용자 정보 가져오기
  useEffect(() => {
    if (isLoggedIn && userId) {
      setLoading(true);
      userApi
        .getProfile(userId)
        .then((res) => {
          setDetailedUserInfo(res.data?.data);
        })
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isLoggedIn, userId]);

  // 날씨 정보 가져오기
  useEffect(() => {
    setWeatherLoading(true);
    weatherApi
      .getTodayWeather()
      .then((res) => {
        setWeather(res.data?.data);
      })
      .catch(() => {})
      .finally(() => {
        setWeatherLoading(false);
      });
  }, []);

  const handleSearch = () => {
    const q = searchKeyword.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
  };

  // 이번주 입영 일정 가져오기
  useEffect(() => {
    setThisWeekLoading(true);
    enlistmentApi
      .getThisWeekSummary(NX, NY)
      .then((res) => {
        setThisWeekSchedules(res.data?.data);
      })
      .catch(() => {})
      .finally(() => {
        setThisWeekLoading(false);
      });
  }, []);

  // 공지사항 가져오기
  useEffect(() => {
    setNoticesLoading(true);
    noticeApi
      .getNoticeList({ page: 0, size: 5 })
      .then((res) => {
        const data = res.data?.data;
        setNotices(Array.isArray(data) ? data : data?.content || []);
      })
      .catch(() => {})
      .finally(() => {
        setNoticesLoading(false);
      });
  }, []);


  return (
    <>
      <Header />

      <main style={styles.container}>
        {/* 인사 영역 */}
        <section style={styles.hero}>
          <h1 style={styles.title}>
            {isLoggedIn && detailedUserInfo ? `${detailedUserInfo.username} 님, 안녕하세요?` : "안녕하세요?"}
          </h1>

          <div style={styles.searchBox} className="searchBox">
            <input
              placeholder="입영 일정, 공지사항 등을 검색해보세요."
              className="home-searchInput"
              style={styles.input}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
            <button className="home-searchBtn" style={styles.searchBtn} onClick={handleSearch}>
              검색
            </button>
          </div>
        </section>

        {/* 카드 영역 */}
        <section className="home-cardGrid" style={styles.cardGrid}>
          <div style={styles.card}>
            <h4>오늘 날씨</h4>
            {weatherLoading ? (
              <p style={{ fontSize: "14px", color: "#999" }}>로딩 중...</p>
            ) : weather ? (
              <>
                <p style={styles.bigText}>
                  {weather.temperature || weather.temp || "N/A"}°
                </p>
                <small>
                  하늘 상태 : <strong>{weather.skyStatus || weather.description || "정보 없음"}</strong>
                </small>
              </>
            ) : (
              <>
                <p style={styles.bigText}>--°</p>
                <small>날씨 정보를 불러올 수 없습니다</small>
              </>
            )}
          </div>

          <div style={styles.cardCenter}>
            <h4>실시간 상담</h4>
            <div style={styles.robotIcon}>🤖</div>
            <button style={styles.primaryBtn} onClick={() => navigate("/chat")}>
              상담 시작
            </button>
          </div>

          <div style={styles.card}>
            <h4>내 정보</h4>
            {isLoggedIn && detailedUserInfo ? (
              <>
                {loading ? (
                  <p style={{ fontSize: "14px", color: "#999" }}>
                    로딩 중...
                  </p>
                ) : (
                  <>
                    <p style={{ fontSize: "14px", margin: "8px 0" }}>
                      <strong>이름:</strong> {detailedUserInfo.username}
                    </p>
                    <p style={{ fontSize: "14px", margin: "8px 0" }}>
                      <strong>이메일:</strong> {detailedUserInfo.email}
                    </p>
                  </>
                )}
                {/* <button
                  onClick={() => navigate("/profile")}
                  style={styles.cardBtn}
                >
                  프로필 관리
                </button> */}
              </>
            ) : (
              <>
                <p>로그인이 필요합니다</p>
                <button onClick={() => navigate("/login")} style={styles.cardBtn}>
                  로그인
                </button>
              </>
            )}
          </div>

          <div style={styles.card}>
            <h4>군장용품 구매</h4>
            <p>입영 전 필요한 물품을 준비하세요</p>
            <button onClick={() => navigate("/products")}>
              상품 보러가기
            </button>
          </div>

          <div style={styles.card}>
            <h4>이번주 입영 일정</h4>
            {thisWeekLoading ? (
              <p style={{ fontSize: "14px", color: "#999" }}>로딩 중...</p>
            ) : thisWeekSchedules && Array.isArray(thisWeekSchedules) && thisWeekSchedules.length > 0 ? (
              <>
                <div style={{ marginBottom: "12px" }}>
                  {thisWeekSchedules.map((schedule: any, index: number) => (
                    <div
                      key={index}
                      style={{
                        fontSize: "13px",
                        padding: "8px 0",
                        borderBottom: index < thisWeekSchedules.length - 1 ? "1px solid #eee" : "none",
                      }}
                    >
                      <p style={{ margin: "4px 0", fontWeight: "600" }}>
                        {schedule.enlistmentDate || "날짜 미정"}
                      </p>
                      <p style={{ margin: "2px 0", fontSize: "12px", color: "#666" }}>
                        잔여: {schedule.remainingSlots || 0}명
                      </p>
                      {schedule.weather && (
                        <p style={{ margin: "2px 0", fontSize: "12px", color: "#999" }}>
                          {schedule.weather.temp}° | {schedule.weather.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => navigate("/enlistment")}
                  style={styles.cardBtn}
                >
                  일정 확인하기
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: "14px", color: "#999" }}>이번주 일정이 없습니다</p>
                <button
                  onClick={() => navigate("/enlistment")}
                  style={styles.cardBtn}
                >
                  전체 일정 보기
                </button>
              </>
            )}
          </div>
        </section>

        {/* 공지사항 섹션 */}
        <section style={styles.noticeSection}>
          <h2 style={styles.sectionTitle}>공지사항</h2>
          {noticesLoading ? (
            <p style={{ fontSize: "14px", color: "#999" }}>로딩 중...</p>
          ) : notices.length > 0 ? (
            <>
              <div style={styles.noticeList}>
                {notices.map((notice: any) => (
                  <div
                    key={notice.id}
                    style={styles.noticeItem}
                    onClick={() => navigate(`/notices/${notice.id}`)}
                  >
                    <h3 style={styles.noticeTitle}>{notice.title}</h3>
                    <p style={styles.noticePreview}>
                      {notice.content?.substring(0, 60)}
                      {notice.content?.length > 60 ? "..." : ""}
                    </p>
                    <p style={styles.noticeDate}>
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => navigate("/notices")}
                style={styles.cardBtn}
              >
                전체 공지사항 보기
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize: "14px", color: "#999" }}>공지사항이 없습니다</p>
              <button
                onClick={() => navigate("/notices")}
                style={styles.cardBtn}
              >
                공지사항 보기
              </button>
            </>
          )}
        </section>

      </main>
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

  hero: {
    textAlign: "center" as const,
    marginBottom: "40px",
  } as const,

  title: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "20px",
  } as const,

  searchBox: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap" as const,
  } as const,

  input: {
    width: "min(400px, 100%)",
    borderRadius: "8px",
    border: "1px solid #ccc",
  } as const,

  searchBtn: {
    borderRadius: "8px",
    backgroundColor: "#4b6bff",
    color: "white",
    border: "none",
    cursor: "pointer",
  } as const,

  cardGrid: {
    gap: "20px",
    marginBottom: "40px",
    width: "100%",
  } as const,

  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  } as const,

  cardCenter: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    textAlign: "center" as const,
  } as const,

  robotIcon: {
    fontSize: "40px",
    margin: "16px 0",
  } as const,

  primaryBtn: {
    backgroundColor: "#4b6bff",
    color: "white",
    border: "none",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  } as const,

  bigText: {
    fontSize: "28px",
    fontWeight: "bold",
  } as const,

  ctaButton: {
    backgroundColor: "#4b6bff",
    color: "white",
    padding: "14px 28px",
    borderRadius: "10px",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
  } as const,

  cardBtn: {
    backgroundColor: "#4b6bff",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "8px",
  } as const,

  noticeSection: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "40px",
  } as const,

  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "16px",
    color: "#222",
    margin: "0 0 16px 0",
  } as const,

  noticeList: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
    marginBottom: "12px",
  } as const,

  noticeItem: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #eee",
    backgroundColor: "#f9fafb",
    cursor: "pointer",
    transition: "all 0.2s ease",
  } as const,

  noticeTitle: {
    fontSize: "14px",
    fontWeight: "600",
    margin: "0 0 6px 0",
    color: "#222",
  } as const,

  noticePreview: {
    fontSize: "12px",
    color: "#666",
    margin: "0 0 6px 0",
    lineHeight: "1.4",
  } as const,

  noticeDate: {
    fontSize: "11px",
    color: "#999",
    margin: "0",
  } as const
}