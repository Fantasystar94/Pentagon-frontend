import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { orderApi } from "../api/orderApi";
import Header from "../components/Header";
import { addOrderToHistory } from "../store/orderHistory";
import { setPendingPaymentV2 } from "../store/pendingPayment";
import "../styles/orderCreate.css";

export default function OrderCreate() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isPaying, setIsPaying] = useState(false);

  const { product, quantity } = (state as any) || {};

  useEffect(() => {
    if (!product || !quantity) {
      // avoid navigate during render
      setTimeout(() => navigate("/products"), 0);
    }
  }, [product, quantity, navigate]);

  if (!product || !quantity) return null;

  const totalPrice = (product.price ?? 0) * quantity;

  const pickNumber = (value: unknown): number | null => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() !== "") {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };

  const pickString = (value: unknown): string | null =>
    typeof value === "string" && value.trim() !== "" ? value : null;

  const pickStringOrNumber = (value: unknown): string | null => {
    const s = pickString(value);
    if (s) return s;
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
    return null;
  };

  const extractOrderNumber = (obj: any): string | null => {
    if (!obj) return null;
    return (
      pickStringOrNumber(obj.orderNumber) ||
      pickStringOrNumber(obj.order_number) ||
      pickStringOrNumber(obj.orderNo) ||
      pickStringOrNumber(obj.order_no) ||
      pickStringOrNumber(obj.orderNum) ||
      pickStringOrNumber(obj.order_num) ||
      pickStringOrNumber(obj?.order?.orderNumber) ||
      pickStringOrNumber(obj?.order?.order_number) ||
      null
    );
  };

  const handlePayment = async () => {
    if (isPaying) return;
    setIsPaying(true);

    try {
      const orderRes = await orderApi.createOrder({
        productId: product.productId,
        quantity,
      });

      const data = orderRes.data?.data;
      if (!data) {
        alert("주문 생성 응답이 올바르지 않습니다.");
        setIsPaying(false);
        return;
      }

      const orderPk =
        pickNumber((data as any).id) ??
        pickNumber((data as any).orderId) ??
        pickNumber((data as any).order_id);

      if (!orderPk) {
        alert("주문 정보를 확인할 수 없습니다.");
        setIsPaying(false);
        return;
      }

      addOrderToHistory(orderPk);

      const amount =
        pickNumber((data as any).totalPrice) ??
        pickNumber((data as any).total_price) ??
        pickNumber((data as any).totalAmount) ??
        pickNumber((data as any).total_amount) ??
        pickNumber((data as any).amount) ??
        totalPrice;

      let tossOrderId: string | null = extractOrderNumber(data);

      if (!tossOrderId) {
        try {
          const detailRes = await orderApi.getOrder(orderPk);
          const detail = detailRes.data?.data;
          tossOrderId = extractOrderNumber(detail);
        } catch (err) {
          // ignore
        }
      }

      if (!tossOrderId) {
        alert(
          "주문번호(orderNumber)를 응답에서 찾지 못했습니다.\n" +
            "토스 결제는 orderNumber가 반드시 필요합니다.\n" +
            "현재 백엔드 /api/orders 응답에 orderNumber가 포함되어 있지 않아 결제를 진행할 수 없습니다.\n" +
            "(createOrder/getOrder 응답 DTO에 orderNumber 필드 추가 필요)"
        );
        setIsPaying(false);
        return;
      }

      // success redirect에서 orderId(=tossOrderId)만 내려오므로, 주문 PK/금액을 저장해둠
      setPendingPaymentV2(tossOrderId, { orderPk, amount });

      const tossPayments = (window as any).TossPayments(
        import.meta.env.VITE_TOSS_CLIENT_KEY
      );

      try {
        await tossPayments.requestPayment("카드", {
          amount,
          orderId: tossOrderId,
          orderName: product.name,
          successUrl: `${window.location.origin}/payments/success`,
          failUrl: `${window.location.origin}/payments/fail`,
        });
      } catch (e: any) {
        const msg = e?.message || e?.code || "결제창 호출 중 오류가 발생했습니다.";
        alert(String(msg));
        setIsPaying(false);
      }
    } catch (e) {
      alert("결제 요청 실패");
      setIsPaying(false);
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
                <img
                  src={product.productImageUrl}
                  alt={product.name}
                  loading="lazy"
                />
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
                <span className="order-create-total">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>
          </div>

          <div className="order-create-actions">
            <button
              className="order-create-btn ghost"
              onClick={() => navigate(-1)}
              disabled={isPaying}
            >
              돌아가기
            </button>
            <button
              className="order-create-btn"
              onClick={handlePayment}
              disabled={isPaying}
            >
              {isPaying ? "결제 요청 중..." : "결제하기"}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
