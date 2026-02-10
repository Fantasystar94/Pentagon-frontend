import { useEffect, useState } from "react";
import { productApi } from "../api/productApi";
import ProductCard from "../components/ProductCard";
import Header from "../components/Header";

export default function Shop() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    productApi.getProductList().then(res => {
      setProducts(res.data.data);
    });
  }, []);

  return (
    <>
      <Header />
      <main className="shop-page">
        <h2>군용품 구매</h2>
        <div className="product-grid">
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </main>
    </>
  );
}
