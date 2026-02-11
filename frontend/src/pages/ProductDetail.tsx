import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { productApi } from "../api/productApi";
import Header from "../components/Header";
import QuantitySelector from "../components/QuantitySelector";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>();
  const [qty, setQty] = useState(1);

  useEffect(() => {
    productApi.getProduct(Number(productId)).then(res => {
      setProduct(res.data.data);
    });
  }, [productId]);

  const handleBuy = () => {
    if (qty > product.stock) {
      alert("재고 수량이 충분하지 않습니다.");
      return;
    }

    navigate("/orders/new", {
      state: {
        product,
        quantity: qty,
      },
    });
  };

  if (!product) return null;

  return (
    <>
      <Header />
      <main className="product-detail">
        {product.productImageUrl && (
          <img
            src={product.productImageUrl}
            alt={product.name}
            style={{ width: "100%", maxWidth: 480, borderRadius: 8, marginBottom: 16 }}
          />
        )}
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <p>가격: {product.price.toLocaleString()}원</p>

        <QuantitySelector value={qty} onChange={setQty} />

        <button onClick={handleBuy}>구매하기</button>
      </main>
    </>
  );
}
