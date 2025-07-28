import SearchFilter from "../components/Core/Filter";
import ProductGrid from "../components/Core/Product/ProductDisplay";
import { useState, useEffect } from "react";
import axios from "axios";

const HomePage = ({ activeTab, setActiveTab }) => {
  const [product, setProduct] = useState([]);

  const productList = async () => {
    let token = localStorage.getItem("access_token");
    try {
      const url =
        activeTab === "mine"
          ? "http://shivam-mac.local:8000/api/v1.0/qr/products/?q=mine"
          : "http://shivam-mac.local:8000/api/v1.0/qr/products/";
      const { data } = await axios.get(
        url,
        token && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data?.status === 200) {
        setProduct(data?.data?.results);
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
      <ProductGrid product={product} />
    </div>
  );
};

export default HomePage;
