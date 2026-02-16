import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/userAuth";
import "../styles/header.css";

export default function Header() {
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="app-header">
      <div className="app-logo">
        <Link to="/"><div className="logo"><img src="../src/assets/logo.png" alt="병무청 로고" /></div>병무청</Link>
      </div>

      <nav className="app-nav">
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
          <div className="app-auth">
            <Link to="/mypage">마이페이지</Link>
            <button onClick={handleLogout} className="app-logoutBtn">
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
