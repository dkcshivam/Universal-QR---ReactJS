import { useState, useEffect } from "react";
import Pagination from "../../Pagination";
import ProductCard from "./ProductCard";
import axios from "axios";
import Lottie from "lottie-react";
// import lottieSpinner from '../../../media/lottie-spinner.json'

const ProductGrid = ({ activeTab }) => {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    count: 0,
    total_pages: 1,
    current_page: 1,
  });

  const [loading, setLoading] = useState(true);
  const [lottieData, setLottieData] = useState(null);

  // in Vite (CRA), the public folder is not part of the module system. Files in 'public' are served as static assets, not imported as modules

  useEffect(() => {
    fetch("/media/lottie-spinner.json")
      .then((res) => res.json())
      .then((data) => setLottieData(data));

    fetchProducts(1);
  }, [activeTab]);

  // Number of products per page
  const [nextURL, setNextURL] = useState(null);
  const [previousURL, setPreviousURL] = useState(null);
  // Fetch products from API for a given page

  const fetchProducts = async (page = 1) => {
    setLoading(true);

    const token = localStorage.getItem("access_token");
    try {
      const url =
        activeTab === "mine"
          ? `${import.meta.env.VITE_API_URL}/qr/products/?page=${page}&q=mine`
          : `${import.meta.env.VITE_API_URL}/qr/products/?page=${page}`;
      const res = await axios.get(
        url,
        token && {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.status === 200) {
        const data = res.data.data;
        const productsArray = Array.isArray(data) ? data : data.results || [];
        setProducts(productsArray);
        setNextURL(data.next);
        setPreviousURL(data.previous);
        setPagination({
          count: Array.isArray(data) ? data.length : data.count,
          total_pages: Array.isArray(data) ? 1 : data.total_pages,
          current_page: Array.isArray(data) ? 1 : data.current_page,
        });
      }
    } catch (error) {
      setProducts([]);
    }
    setLoading(false);
  };

  // // Initial fetch on mount
  // useEffect(() => {
  //   fetchProducts(1);
  // }, [activeTab]);

  // Handle page change from Pagination component
  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  return (
    <div className="min-h-screen box-border">
      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Lottie
            animationData={lottieData}
            loop={true}
            style={{ width: 120, height: 120 }}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {products?.map((product, index) => (
              <ProductCard
                key={index}
                product={product}
                index={index}
                activeTab={activeTab}
              />
            ))}
          </div>
          {pagination?.total_pages > 1 ? (
            <Pagination
              totalItems={pagination.count}
              itemsPerPage={100}
              currentPage={pagination.current_page}
              totalPages={pagination.total_pages}
              onPageChange={handlePageChange}
            />
          ) : pagination?.total_pages === 1 ? (
            <div className="flex items-center justify-center py-4">
              <span className="text-gray-500">
                No more products to display.
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              <span className="text-gray-500">No products found.</span>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductGrid;
