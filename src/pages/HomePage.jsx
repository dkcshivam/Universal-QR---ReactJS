import SearchFilter from "../components/Core/Filter";
import ProductGrid from "../components/Core/Product/ProductDisplay";
import { useState, useEffect } from "react";
import axios from "axios";

const HomePage = ({ activeTab, setActiveTab }) => {
  const [product, setProduct] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL;

  return (
    <div>
      <SearchFilter activeTab={activeTab} setActiveTab={setActiveTab} />
      <ProductGrid activeTab={activeTab} />
    </div>
  );
};

export default HomePage;
