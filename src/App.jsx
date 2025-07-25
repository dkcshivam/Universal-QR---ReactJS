/* eslint-disable no-unused-vars */
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login";
import "./App.css";
// import AddProductPage from "./components/Core/Product/AddNewProduct";
import ProductGrid from "./components/Core/Product/ProductDisplay";
import ProductDetail from "./components/Core/Product/ProductDetail";
import QRdownload from "./components/Core/QRdownload";
import CreateMultipleProduct from "./components/Core/CreateMultipleProduct";
import QRScanner from "./components/Core/Product/ScanQR";

import AddProduct from "./components/Core/Product/AddNewProduct";
import { useState } from "react";
function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mine");
  const handleQRResult = (result) => {
    console.log("QR Code detected:", result);
    alert(`QR Code detected at App.jsx: ${result}`);
    navigate(`/product-detail/${result}`);
  };

  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <HomePage activeTab={activeTab} setActiveTab={setActiveTab} />
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/scan"
            element={<QRScanner onResult={handleQRResult} />}
          />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/product-display" element={<ProductGrid />} />
          <Route path="/download-qr" element={<QRdownload />} />
          <Route
            path="/upload-multiple-product"
            element={<CreateMultipleProduct />}
          />
          {/* ProductDetail */}
          <Route path="/product-detail/:code" element={<ProductDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
