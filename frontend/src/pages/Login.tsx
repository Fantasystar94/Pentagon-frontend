import { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import "../styles/login.css";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

const handleLogin = async () => {
  console.log("email:", email);
  console.log("password:", password);

  try {
    const res = await authApi.login({ email, password });
    console.log("login response:", res);

    const accessToken = res.data?.data?.accessToken;
    const username = res.data?.data?.username;
    const userId = res.data?.data?.userId;
    console.log("accessToken:", accessToken);

    if (!accessToken) {
      console.error("❌ accessToken이 없음. 응답 구조 확인 필요");
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
    console.error("login error:", e);
    setError("이메일 또는 비밀번호가 올바르지 않습니다.");
  }
};

  return (
    <div className="login-page">
      <div className="login-box">
        <h2 className="login-title">로그인</h2>

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

        <button className="login-button" onClick={handleLogin}>
          로그인
        </button>

        <div className="login-footer">
          <span>아직 계정이 없으신가요?</span>
          <Link to="/signup">회원가입</Link>
        </div>
      </div>
    </div>
  );
}
