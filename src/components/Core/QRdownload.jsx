import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
// Sample product data based on your image

function QRdownload() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());

  // fetch all products from the backend

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/qr/products`
        );

        setProducts(
          Array.isArray(response.data.data.results)
            ? response.data.data.results
            : []
        );
      } catch (error) {
        console.log("Error in fetching all products:", error);
        toast.error("Failed to fetch all products");
      }
    };
    fetchProducts();
  }, []);

  const handleSelectOne = (productId) => {
    const newSelection = new Set(selectedProducts);
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
    } else {
      newSelection.add(productId);
    }
    setSelectedProducts(newSelection);
  };

  const handleDownload = async () => {
    if (selectedProducts.size === 0) {
      toast("Please select at least one product to download QR codes.");
      return;
    }

    // Map selected IDs to product codes

    const selectedCodes = Array.from(selectedProducts)
      .map((id) => products.find((p) => p.id === id)?.code)
      .filter(Boolean);

    console.log("Selected IDs:", Array.from(selectedProducts));
    console.log("All products:", products);
    console.log("Selected codes:", selectedCodes);

    const payload = {
      product_codes: selectedCodes,
    };

    console.log("Payload sent to backend:", payload);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/qr/bulk-qr-download/`,
        payload,
        {
          responseType: "blob",
          headers: { "Content-Type": "application/json" },
        }
      );

      const blob = response.data;
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR codes downloaded successfully!");
    } catch (error) {
      console.log("handle download error: ", error);
      toast.error(error.message || "Something went wrong");
    }
  };

  const now = new Date();

  // formatted date and time for QR Zip naming

  const formattedDate = now
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
    .replace(/ /g, "-"); // e.g., 25-Jul-2025
  const formattedTime = now
    .toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    })
    .replace(/:/g, "-")
    .replace(/ /g, ""); // e.g., 04-02PM

  const fileName = `QR_Codes_${formattedDate}_${formattedTime}.zip`;

  return (
    <div className="">
      <button
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
                  aria-label="Go Back"
                >
                  <FaArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
      <div className="table-header">
        <h1>Product List</h1>
        <button
          className="download-selected-btn"
          onClick={handleDownload}
          disabled={selectedProducts.size === 0}
        >
          Download QR for Selected ({selectedProducts.size})
        </button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th></th>
            <th>Cover Image</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          { Array.isArray(products) && products.map((product) => (
            <tr key={product.id}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedProducts.has(product.id)}
                  onChange={() => handleSelectOne(product.id)}
                  className="cursor-pointer"
                />
              </td>
              <td>
                {product.cover_image ? (
                  <img
                    src={product.cover_image}
                    alt={product.name}
                    className="product-table-img"
                    style={{
                      width: 50,
                      height: 50,
                      objectFit: "cover",
                      borderRadius: 1,
                    }}
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </td>
              <td className="capitalize">{product.name}</td>
              <td>{product.quantity}</td>
              <td className="capitalize">
                {product.location || (
                  <span className="text-gray-400 text-xs">N/A</span>
                )}
              </td>
              <td className="capitalize">
                {product.belongs_to_department || (
                  <span className="text-gray-400 text-xs">N/A</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default QRdownload;
