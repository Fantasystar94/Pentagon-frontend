import { useLocation, useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import Header from "../components/Header";
import { addOrderToHistory } from "../store/orderHistory";
import { setPendingPayment } from "../store/pendingPayment";
import "../styles/orderCreate.css";

export default function OrderCreate() {
  const { state } = useLocation();
  const navigate = useNavigate();

  console.log("토스 클라이언트 키 =", import.meta.env.VITE_TOSS_CLIENT_KEY);


  const { product, quantity } = state || {};

  if (!product || !quantity) {
    navigate("/products");
    return null;
  }

  const totalPrice = (product.price ?? 0) * quantity;

const handlePayment = async () => {
  try {
    // 1️⃣ 주문 생성
    const orderRes = await orderApi.createOrder({
      productId: product.productId,
      quantity,
    });

    const data = orderRes.data.data;

    const orderId = data.id; // ✅ PK
    addOrderToHistory(orderId);
    const amount = data.totalPrice; // ✅ totalPrice 사용

    console.log(orderId, amount);

    // 2️⃣ Toss orderId는 백엔드 Order.orderNumber와 동일해야 함
    // (서버 confirm에서 payment.getOrderNumber()를 Toss orderId로 사용)
    let tossOrderId: string | null =
      typeof data?.orderNumber === "string" ? data.orderNumber : null;
    if (!tossOrderId) {
      try {
        const detailRes = await orderApi.getOrder(orderId);
        const detail = detailRes.data?.data;
        tossOrderId =
          typeof detail?.orderNumber === "string"
            ? detail.orderNumber
            : typeof detail?.order_number === "string"
              ? detail.order_number
              : null;
      } catch {
        // ignore
      }
    }

    // orderNumber를 못 얻으면 기존 fallback(규칙 충족용) 사용
    // (단, 이 경우 백엔드 orderNumber 규칙과 다르면 confirm이 실패할 수 있음)
    if (!tossOrderId) {
      tossOrderId = `order_${orderId}`;
    }

    // success redirect에서 orderId(=tossOrderId)만 내려오므로, 주문 PK를 저장해둠
    setPendingPayment(tossOrderId, orderId);

    // 2️⃣ 토스 결제창 호출
    const tossPayments = (window as any).TossPayments(
      import.meta.env.VITE_TOSS_CLIENT_KEY
    );
    console.log("tossPayments =", tossPayments);
    tossPayments.requestPayment("카드", {
      amount,
      orderId: tossOrderId,
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
      <main className="order-create-page">
        <h2 className="order-create-title">주문 확인</h2>
        <p className="order-create-subtitle">결제 전 주문 정보를 확인해주세요.</p>

        <section className="order-create-card">
          <div className="order-create-item">
            <div className="order-create-thumb">
              {product.productImageUrl ? (
                <img src={product.productImageUrl} alt={product.name} loading="lazy" />
              ) : (
                <div className="order-create-thumb-placeholder" />
              )}
            </div>
            <div className="order-create-info">
              <h3 className="order-create-name">{product.name}</h3>
              {product.description && (
                <p className="order-create-desc">{product.description}</p>
              )}

              <div className="order-create-row">
                <span className="order-create-label">수량</span>
                <span className="order-create-value">{quantity}</span>
              </div>
              <div className="order-create-row">
                <span className="order-create-label">상품 금액</span>
                <span className="order-create-value">
                  {(product.price ?? 0).toLocaleString()}원
                </span>
              </div>
              <div className="order-create-row total">
                <span className="order-create-label">총 결제금액</span>
                <span className="order-create-total">{totalPrice.toLocaleString()}원</span>
              </div>
            </div>
          </div>

          <div className="order-create-actions">
            <button className="order-create-btn ghost" onClick={() => navigate(-1)}>
              돌아가기
            </button>
            <button className="order-create-btn" onClick={handlePayment}>
              결제하기
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
