import SearchFilter from "../components/Core/Filter";
import ProductGrid from "../components/Core/Product/ProductDisplay";
import { useState, useEffect } from "react";
import axios from "axios";

const HomePage = () => {
  const [product, setProduct] = useState([]);

  const productList = async () => {
    try {
      const { data } = await axios.get(
        "http://shivam-mac.local:8000/api/v1.0/qr/products/"
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
  }, []);
  return (
    <div>
      <SearchFilter />
      <ProductGrid product={product} />
    </div>
  );
};

export default HomePage;
