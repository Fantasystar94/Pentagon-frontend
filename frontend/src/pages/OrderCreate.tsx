import { useLocation, useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import Header from "../components/Header";
import { paymentsApi } from "../api/paymentsApi";

export default function OrderCreate() {
  const { state } = useLocation();
  const navigate = useNavigate();

  console.log("토스 클라이언트 키 =", import.meta.env.VITE_TOSS_CLIENT_KEY);


  const { product, quantity } = state || {};

  if (!product || !quantity) {
    navigate("/products");
    return null;
  }
const handlePayment = async () => {
  try {
    // 1️⃣ 주문 생성
    const orderRes = await orderApi.createOrder({
      productId: product.productId,
      quantity,
    });

    const data = orderRes.data.data;

    const orderId = data.id; // ✅ PK
    const orderIdString = `order_${data.id}_${Date.now()}`;// ✅ 프론트에서 생성
    const amount = data.totalPrice; // ✅ totalPrice 사용

    console.log(orderId, orderIdString, amount);
    
    // 2️⃣ 결제 요청 (Payment 생성)
    await paymentsApi.createPayment({
      orderId,
      orderIdString,
    });

    // 3️⃣ 토스 결제창 호출
    const tossPayments = (window as any).TossPayments(
      import.meta.env.VITE_TOSS_CLIENT_KEY
    );
    console.log("tossPayments =", tossPayments);
    tossPayments.requestPayment("카드", {
      amount,
      orderId: orderIdString,
      orderName: product.name,
      successUrl: `${window.location.origin}/payments/success`,
      failUrl: `${window.location.origin}/payments/fail`,
    });

  } catch (e) {
    console.error(e);
    alert("결제 요청 실패");
  }
};



  return (
    <>
      <Header />
      <main>
        <h3>주문 확인</h3>
        <p>{product.name}</p>
        <p>수량: {quantity}</p>
        <p>총액: {(product.price * quantity).toLocaleString()}원</p>

        <button onClick={handlePayment}>결제하기</button>
      </main>
    </>
  );
}
