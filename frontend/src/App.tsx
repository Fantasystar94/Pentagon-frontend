import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Enlistment from "./pages/Enlistment";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import OrderCreate from "./pages/OrderCreate";
import OrderComplete from "./pages/OrderComplete";
import PaymentSuccess from "./pages/PaymentSuccess";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetail />} />
        <Route path="/orders/new" element={<OrderCreate />} />
        <Route path="/orders/complete" element={<OrderComplete />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/enlistment" element={<Enlistment />} />
        <Route path="/payments/success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
