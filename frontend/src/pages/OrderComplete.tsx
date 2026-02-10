import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../styles/orderComplete.css";

export default function OrderComplete() {
  const { state } = useLocation();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <main>
        <h2>구매가 완료되었습니다</h2>
        <p>주문번호: {state.order.id}</p>

        <button onClick={() => navigate("/orders")}>
          주문 목록
        </button>
        <button onClick={() => navigate("/")}>
          메인페이지
        </button>
      </main>
    </>
  );
}
