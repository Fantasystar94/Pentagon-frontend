import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentFail() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const message = params.get("message");

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>결제에 실패했습니다</h2>
      <p>{message}</p>

      <button onClick={() => navigate("/products")}>
        다시 시도하기
      </button>
    </div>
  );
}
