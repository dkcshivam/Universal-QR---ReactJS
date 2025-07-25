/* eslint-disable no-unused-vars */
import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login";
import "./App.css"
// import AddProductPage from "./components/Core/Product/AddNewProduct";
import ProductGrid from "./components/Core/Product/ProductDisplay";
import ProductDetail from "./components/Core/ProductDetail";
import QRdownload from "./components/Core/QRdownload";
import CreateMultipleProduct from "./components/Core/CreateMultipleProduct";

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/product-display" element={<ProductGrid />} />
        <Route path="/download-qr" element={<QRdownload />} />
        <Route path="/upload-multiple-product" element={<CreateMultipleProduct />} />
        {/* ProductDetail */}
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
