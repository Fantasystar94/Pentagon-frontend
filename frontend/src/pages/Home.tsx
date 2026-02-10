import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();


  return (
    <>
      <Header />

      <main style={styles.container}>
        {/* 인사 영역 */}
        <section style={styles.hero}>
          <h1 style={styles.title}>덕스 님, 안녕하세요?</h1>

          <div style={styles.searchBox}>
            <input
              placeholder="입영 일정, 공지사항 등을 검색해보세요."
              style={styles.input}
            />
            <button style={styles.searchBtn}>검색</button>
          </div>
        </section>

        {/* 카드 영역 */}
        <section style={styles.cardGrid}>
          <div style={styles.card}>
            <h4>오늘 날씨</h4>
            <p style={styles.bigText}>15°</p>
            <small>최고 20° / 최저 12°</small>
          </div>

          <div style={styles.cardCenter}>
            <h4>실시간 상담</h4>
            <div style={styles.robotIcon}>🤖</div>
            <button style={styles.primaryBtn}>상담 시작</button>
          </div>

          <div style={styles.card}>
            <h4>내 정보</h4>
            <p>로그인이 필요합니다</p>
            <button onClick={() => navigate("/login")}>
              로그인
            </button>
          </div>

          <div style={styles.card}>
            <h4>군장용품 구매</h4>
            <p>입영 전 필요한 물품을 준비하세요</p>
            <button onClick={() => navigate("/products")}>
              상품 보러가기
            </button>
          </div>
        </section>

        <div style={{ textAlign: "center" }}>
          <button
            style={styles.ctaButton}
            onClick={() => navigate("/enlistment")}
          >
            입영 일정 확인하기
          </button>
        </div>
      </main>
    </>
  );
}

const styles = {
  container: {
    padding: "40px",
    backgroundColor: "#f5f7fb",
    minHeight: "100vh",
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
  } as const,

  input: {
    width: "400px",
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  } as const,

  searchBtn: {
    padding: "12px 20px",
    borderRadius: "8px",
    backgroundColor: "#4b6bff",
    color: "white",
    border: "none",
    cursor: "pointer",
  } as const,

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
    marginBottom: "40px",
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
};

