/* eslint-disable no-unused-vars */
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login";
import AddProductPage from "./components/Core/Product/AddNewProduct";
import ProductGrid from "./components/Core/Product/ProductDisplay";
import QRScanner from "./components/Core/Product/ScanQR";
import AddNewProduct from "./components/Core/Product/AddNewProduct";

function App() {
  const handleQRResult = (result) => {
    console.log("QR Code detected:", result);
    alert(`QR Code detected: ${result}`);
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/scan" element={<QRScanner onResult={handleQRResult} />} />
        <Route path="/add-new-product" element={<AddNewProduct />} />
        <Route path="/product-display" element={<ProductGrid />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
