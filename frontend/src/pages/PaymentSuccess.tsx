import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { paymentsApi } from "../api/paymentsApi";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const calledRef = useRef(false);

  useEffect(() => {
    const paymentKey = params.get("paymentKey");
    const orderId = params.get("orderId");
    const amount = params.get("amount");

      if (calledRef.current) return;
  calledRef.current = true;

    console.log("결제 성공 파라미터", {
      paymentKey,
      orderId,
      amount,
    });

    // ❌ 파라미터 누락
    if (!paymentKey || !orderId || !amount) {
      alert("결제 정보가 올바르지 않습니다.");
      navigate("/");
      return;
    }

    const confirmPayment = async () => {
      try {
        const res = await paymentsApi.confirmPayment({
          paymentKey,
        });

        console.log("결제 승인 성공", res.data);

        // ✅ 결제 승인 성공 → 주문 완료 페이지
        navigate("/orders/complete", {
          state: {
            payment: res.data.data,
          },
        });
      } catch (error) {
        console.error("결제 승인 실패", error);
        alert("결제 승인에 실패했습니다.");
        navigate("/products");
      }
    };

    confirmPayment();
  }, [params, navigate]);

  return (
    <>
      <Header />
      <main style={{ padding: "40px", textAlign: "center" }}>
        <h2>결제 승인 처리 중입니다...</h2>
        <p>잠시만 기다려주세요.</p>
      </main>
    </>
  );
}
