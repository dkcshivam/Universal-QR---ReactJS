import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import Layout from "./Layout";
import NotFound from "./pages/NotFound";
import Login from "./components/Auth/Login"
import AddProductPage from "./components/Core/Product/AddNewProduct"
import ProductGrid from "./components/Core/Product/ProductDisplay"
function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        
      <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/product-display" element={<ProductGrid />} />
    </Routes>
  );
}

export default App;
