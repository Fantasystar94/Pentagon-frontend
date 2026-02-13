import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/Header";
import { paymentsApi } from "../api/paymentsApi";
import { clearPendingPayment, getPendingPayment } from "../store/pendingPayment";

function getErrorMessage(error: unknown) {
  const anyErr = error as any;
  return (
    anyErr?.response?.data?.message ||
    anyErr?.response?.data?.error ||
    anyErr?.message ||
    "요청 처리 중 오류가 발생했습니다."
  );
}

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
        if (!orderId || !paymentKey) {
          alert("결제 정보가 올바르지 않습니다.");
          navigate("/products");
          return;
        }

        // Toss success의 orderId는 우리가 Toss에 보낸 값(orderNumber) 그대로 들어옴
        // 백엔드 createPayment는 주문 PK(Long)가 필요하므로, redirect 전에 저장해둔 매핑을 사용
        let orderPk: number | null = null;

        const pending = getPendingPayment(orderId);
        if (pending) {
          orderPk = pending.orderPk;
        } else if (orderId.startsWith("order_")) {
          // 레거시 fallback: order_123 형태면 PK로 간주
          const numericOrderId = parseInt(orderId.replace("order_", ""), 10);
          if (!Number.isNaN(numericOrderId)) {
            orderPk = numericOrderId;
          }
        }

        if (!orderPk) {
          console.error("pendingPayment 매핑 없음. orderId=", orderId);
          alert("주문 정보를 찾지 못했습니다. 주문 페이지에서 다시 시도해주세요.");
          navigate("/orders");
          return;
        }

        // 1️⃣ paymentKey를 DB에 저장
        try {
          const createRes = await paymentsApi.createPayment({
            orderId: orderPk,
            paymentKey,
          });

          console.log("createPayment success:", createRes.data);
        } catch (e) {
          console.error("createPayment failed:", e);
          alert(getErrorMessage(e));
          navigate("/products");
          return;
        }

        // 2️⃣ 결제 승인
        const res = await paymentsApi.confirmPayment({
          paymentKey,
        });

        console.log("결제 승인 성공:", res.data);
        clearPendingPayment(orderId);

        // 3️⃣ 주문 완료 페이지 이동
        navigate("/orders/complete", {
          state: {
            payment: res.data.data,
          },
        });
      } catch (error) {
        console.error("결제 승인 실패:", error);
        alert(getErrorMessage(error));
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
