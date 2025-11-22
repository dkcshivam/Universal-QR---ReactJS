import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import ProductCard from "../Core/Product/ProductCard";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query && query.trim()) {
      setLoading(true);
      axios(
        `${import.meta.env.VITE_API_URL}/qr/search?q=${encodeURIComponent(
          query.trim()
        )}`
      )
        .then((res) => {
          setResults(
            Array.isArray(res.data.data.results) ? res.data.data.results : []
          );
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [query]);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-4">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
          aria-label="Go Back"
        >
          <FaArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
          aria-label="Go Back"
        >
          <FaArrowLeft className="w-4 h-4 " />
          <span>Home</span>
        </button>
      </div>
      <h2 className="text-xl font-bold mb-4">Search Results for {query}</h2>


      <p className="text-sm text-gray-600 mb-4">
        {loading
          ? "Searching"
          : `${results.length} result${results.length !== 1 ? "s" : ""} found`}
      </p>

      {loading && <p>Loading...</p>}
      {!loading && query && query.trim() && results.length === 0 && (
        <p>No products found.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {results.map((product, idx) => (
          <ProductCard key={product.id || idx} product={product} index={idx} />
        ))}
      </div>
    </div>
  );
};

export default SearchResults;
