import { useEffect, useState } from "react";

// JWT 토큰 디코드 함수
function decodeToken(token: string): any {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("토큰 디코드 실패:", e);
    return null;
  }
}

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    
    if (token) {
      setIsLoggedIn(true);
      
      // 토큰에서 userId 추출 (또는 localStorage에서)
      let id = parseInt(localStorage.getItem("userId") || "0", 10);
      
      if (!id) {
        // localStorage에 userId가 없으면 토큰에서 추출
        const decoded = decodeToken(token);
        const candidates = [
          decoded?.userId,
          decoded?.id,
          decoded?.user_id,
          decoded?.memberId,
          decoded?.accountId,
          decoded?.uid,
          decoded?.sub,
        ];

        for (const value of candidates) {
          const num = parseInt(String(value || ""), 10);
          if (!Number.isNaN(num) && num > 0) {
            id = num;
            break;
          }
        }

        if (id) {
          localStorage.setItem("userId", String(id));
        }
      }
      
      if (id) {
        setUserId(id);
      }

      // 어드민 여부 확인
      const decoded = decodeToken(token);
      const role = decoded?.userRole || decoded?.authorities || "";
      const isAdminUser = 
        role === "ADMIN" || 
        role === "ROLE_ADMIN" || 
        (Array.isArray(role) && role.some((r: string) => r.includes("ADMIN")));
      setIsAdmin(isAdminUser);
    } else {
      setIsLoggedIn(false);
    }
    
    setIsInitialized(true);
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    setIsLoggedIn(false);
    setUserId(null);
    setIsAdmin(false);
  };

  return {
    isLoggedIn,
    userId,
    isAdmin,
    isInitialized,
    logout,
  };
}
