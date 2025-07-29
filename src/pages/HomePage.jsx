import SearchFilter from "../components/Core/Filter";
import ProductGrid from "../components/Core/Product/ProductDisplay";
import { useState, useEffect } from "react";
import axios from "axios";

const HomePage = ({ activeTab, setActiveTab }) => {
  const [product, setProduct] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL;

  const productList = async () => {
    let token = localStorage.getItem("access_token");
    try {
      const url =
        activeTab === "mine"
          ? `${BASE_URL}/qr/products/?q=mine`
          : `${BASE_URL}/qr/products/`;
      const { data } = await axios.get(
        url,
        token && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data?.status === 200) {
        setProduct(data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    productList();
  }, [activeTab]);
  return (
    <div>
      <SearchFilter activeTab={activeTab} setActiveTab={setActiveTab} />
      <ProductGrid product={product} activeTab={activeTab} />
    </div>
  );
};

export default HomePage;
