import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import Login from "./components/Auth/Login"
import AddProductPage from "./components/Core/Product/AddNewProduct"
import ProductGrid from "./components/Core/Product/ProductDisplay"
function App() {
  return (
    <Routes>
      
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/product-display" element={<ProductGrid />} />
    </Routes>
  )
}

export default App
