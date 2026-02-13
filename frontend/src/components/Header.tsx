import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/userAuth";

export default function Header() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <div style={styles.logo}>
        <Link to="/">병무청</Link>
      </div>

      <nav style={styles.nav}>
        <Link to="/products">상품</Link>
        <Link to="/enlistment">입영 일정</Link>
        <Link to="/deferments">연기 신청</Link>
        <Link to="/notices">공지사항</Link>
        <Link to="/qna">QnA</Link>
        {isLoggedIn && <Link to="/cart">장바구니</Link>}
        {isLoggedIn && <Link to="/orders">주문내역</Link>}
        {isLoggedIn && isAdmin && <Link to="/admin">어드민</Link>}
      </nav>

      <div>
        {isLoggedIn ? (
          <div style={styles.authBox}>
            <Link to="/mypage">마이페이지</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              로그아웃
            </button>
          </div>
        ) : (
          <Link to="/login">로그인</Link>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #ddd",
  },
  logo: {
    fontWeight: "bold",
    fontSize: "18px",
  },
  nav: {
    display: "flex",
    gap: "16px",
  },
  authBox: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  logoutBtn: {
    padding:0,
    margin:0,
    border: "none",
    background: "transparent",
    cursor: "pointer",
    color: "#4a6cf7",
  },
};
