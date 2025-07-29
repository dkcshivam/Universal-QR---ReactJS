import { useState, useEffect } from "react";
import Pagination from "../../Pagination";
import ProductCard from "./ProductCard";
import axios from "axios";

const ProductGrid = ({ product, activeTab }) => {
const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    total_pages: 1,
    current_page: 1,
  });
  const itemsPerPage = 20; // Number of products per page

  // Fetch products from API for a given page

  const fetchProducts = async (page = 1) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/qr/products/?page=${page}`
      );
      if (res.status === 200) {
        const data = res.data.data;
        const productsArray = Array.isArray(data) ? data : (data.results || []);
        setProducts(productsArray);
        setPagination({
          count: Array.isArray(data) ? data.length : data.count,
          total_pages: Array.isArray(data) ? 1 : data.total_pages,
          current_page: Array.isArray(data) ? 1 : data.current_page,
        });
      }
    } catch (error) {
      setProducts([]);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchProducts(1);
  }, []);

  // Handle page change from Pagination component
  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  return (
    <div className="min-h-screen box-border">
      {/* Render product cards for current page */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {products?.map((product, index) => (
          <ProductCard key={index} product={product} index={index} activeTab={activeTab} />
        ))}
      </div>
      {/* Show pagination if products exist, else show empty message */}
      {products?.length > 0 ? (
        <Pagination
          totalItems={pagination.count}
          itemsPerPage={products.length}
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={handlePageChange}
        />
      ) : (
        <div className="flex items-center justify-center py-4">
          <span className="text-gray-500">No products found.</span>
        </div>
      )}
    </div>
  );
};

export default ProductGrid