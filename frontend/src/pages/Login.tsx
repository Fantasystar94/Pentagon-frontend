import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import "../styles/login.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleLogin = async () => {
  try {
    const res = await authApi.login({ email, password });

    const accessToken = res.data?.data?.accessToken;
    const username = res.data?.data?.username ?? res.data?.data?.userName;
    const userId = res.data?.data?.userId ?? res.data?.data?.userID ?? res.data?.data?.id;

    if (!accessToken) {
      setError("로그인에 실패했습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    localStorage.setItem("accessToken", accessToken);
    if (username) {
      localStorage.setItem("username", username);
    }
    if (userId) {
      localStorage.setItem("userId", userId.toString());
    }
    localStorage.setItem("email", email);
    window.location.href = "/"; // 이 줄 하나만 남긴다
  } catch (e) {
    setError("이메일 또는 비밀번호가 올바르지 않습니다.");
  }
};

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">로그인</h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >

          <div className="input-group">
            <label>이메일</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>비밀번호</label>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="login-button" type="submit">
            로그인
          </button>

          <div className="login-footer">
            <span>아직 계정이 없으신가요?</span>
            <Link to="/signup">회원가입</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
