import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../api/authApi";
import "../styles/signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    if (!email || !password || !username) {
      setError("모든 항목을 입력해주세요.");
      return;
    }

    try {
      await authApi.signup({
        email,
        password,
        username
      });

      // 회원가입 성공 → 로그인 페이지 이동
      navigate("/login");
    } catch (e) {
      setError("회원가입에 실패했습니다. 입력값을 확인해주세요.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h2 className="signup-title">회원가입</h2>

        <div className="input-group">
          <label>이름</label>
          <input
            type="text"
            placeholder="이름"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

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
            placeholder="영문, 숫자, 특수문자 포함 8자 이상"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>


        {error && <p className="error-text">{error}</p>}

        <button className="signup-button" onClick={handleSignup}>
          회원가입
        </button>

        <div className="signup-footer">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login">로그인</Link>
        </div>
      </div>
    </div>
  );
}
