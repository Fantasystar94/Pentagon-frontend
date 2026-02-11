import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Enlistment from "./pages/Enlistment";
import Deferments from "./pages/Deferments";
import QnA from './pages/QnA';
import AdminDashboard from './pages/AdminDashboard';
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import OrderCreate from "./pages/OrderCreate";
import OrderComplete from "./pages/OrderComplete";
import PaymentSuccess from "./pages/PaymentSuccess";
import Notices from "./pages/Notices";
import NoticeDetail from "./pages/NoticeDetail";
import MyPage from "./pages/MyPage";

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
        <Route path="/deferments" element={<Deferments />} />
          <Route path="/qna" element={<QnA />} />
          <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/notices/:id" element={<NoticeDetail />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/payments/success" element={<PaymentSuccess />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
