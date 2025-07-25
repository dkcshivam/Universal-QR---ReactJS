/* eslint-disable no-unused-vars */
import { Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login";
import AddProductPage from "./components/Core/Product/AddNewProduct";
import ProductGrid from "./components/Core/Product/ProductDisplay";
import QRScanner from "./components/Core/Product/ScanQR";

import AddProduct from "./components/Core/Product/AddNewProduct";
import ProductDetail from "./components/Core/Product/ProductDetail";
function App() {
  const navigate = useNavigate();

  const handleQRResult = (result) => {
    console.log("QR Code detected:", result);
    alert(`QR Code detected at App.jsx: ${result}`);
    navigate(`/product-detail/${result}`);
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/scan" element={<QRScanner onResult={handleQRResult} />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/product-display" element={<ProductGrid />} />
        <Route path="/product-detail/:prod_code" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
