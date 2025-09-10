import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Pagination from "../Pagination";

import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import PrintProductTableModal from "./PrintProductTable";
// Sample product data based on your image

function QRdownload() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectedProductsData, setSelectedProductsData] = useState(new Map()); // ID -> complete product data mapping
  const [currentPageProductIds, setCurrentPageProductIds] = useState(new Set());
  const [productCodeMap, setProductCodeMap] = useState(new Map()); // ID -> code mapping
  const [isDownloading, setIsDownloading] = useState(false); // Loading state for download
  const [printModal, setPrintModal] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    total_pages: 1,
    current_page: 1,
  });
  // fetch all products from the backend
  const fetchProducts = async (page = 1) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/qr/products/?page=${page}`
      );
      if (response.status === 200) {
        const productsData = Array.isArray(response.data.data.results)
          ? response.data.data.results
          : [];

        setProducts(productsData);

        // Pre-compute current page product IDs and code mapping for O(1) lookups
        const pageIds = new Set(productsData.map((p) => p.id));
        const codeMap = new Map(productsData.map((p) => [p.id, p.code]));

        setCurrentPageProductIds(pageIds);
        setProductCodeMap(codeMap);

        setPagination({
          count: response.data.data.count,
          total_pages: response.data.data.total_pages,
          current_page: response.data.data.current_page,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch all products");
    }
  };
  useEffect(() => {
    fetchProducts();
  }, []);
  const handlePageChange = (page) => {
    setSelectedProducts(new Set()); // Reset selection on page change
    setSelectedProductsData(new Map()); // Reset selected products data
    fetchProducts(page);
  };
  const handleSelectOne = (productId) => {
    const newSelection = new Set(selectedProducts);
    const newSelectedData = new Map(selectedProductsData);
    
    if (newSelection.has(productId)) {
      newSelection.delete(productId);
      newSelectedData.delete(productId);
    } else {
      newSelection.add(productId);
      // Find the complete product data and add it to the map
      const productData = products.find(product => product.id === productId);
      if (productData) {
        newSelectedData.set(productId, productData);
      }
    }
    
    setSelectedProducts(newSelection);
    setSelectedProductsData(newSelectedData);
  };

  const handleSelectAll = () => {
    const newSelection = new Set(selectedProducts);
    const newSelectedData = new Map(selectedProductsData);

    // O(1) check: compare set sizes instead of iterating
    const selectedFromCurrentPage = [...currentPageProductIds].filter((id) =>
      selectedProducts.has(id)
    ).length;
    const allCurrentPageSelected =
      selectedFromCurrentPage === currentPageProductIds.size;

    if (allCurrentPageSelected) {
      // Deselect all current page products - O(n) where n is current page size
      currentPageProductIds.forEach((id) => {
        newSelection.delete(id);
        newSelectedData.delete(id);
      });
    } else {
      // Select all current page products - O(n) where n is current page size
      currentPageProductIds.forEach((id) => {
        newSelection.add(id);
        // Find the complete product data and add it to the map
        const productData = products.find(product => product.id === id);
        if (productData) {
          newSelectedData.set(id, productData);
        }
      });
    }

    setSelectedProducts(newSelection);
    setSelectedProductsData(newSelectedData);
  };

  // Memoized calculation - O(1) amortized
  const isAllCurrentPageSelected = React.useMemo(() => {
    if (currentPageProductIds.size === 0) return false;

    // Count selected items from current page
    let selectedCount = 0;
    for (const id of currentPageProductIds) {
      if (selectedProducts.has(id)) {
        selectedCount++;
      }
    }

    return selectedCount === currentPageProductIds.size;
  }, [selectedProducts, currentPageProductIds]);

  const handleDownload = async () => {
    if (selectedProducts.size === 0) {
      toast("Please select at least one product to download QR codes.");
      return;
    }

    if (isDownloading) {
      return; // Prevent multiple downloads
    }

    setIsDownloading(true); // Disable button

    try {
      // O(n) mapping using pre-computed map instead of O(n*m) nested loops
      const selectedCodes = Array.from(selectedProducts)
        .map((id) => productCodeMap.get(id))
        .filter(Boolean);

      const payload = {
        product_codes: selectedCodes,
      };

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

      // Clear all selected checkboxes after successful download
      setSelectedProducts(new Set());
      setSelectedProductsData(new Map());
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsDownloading(false); // Re-enable button
    }
  };

  const handlePrintQRNavigation = () => {
    if (selectedProducts.size === 0) {
      toast.warning("Please select at least one product to print QR codes.");
      return;
    }

    // Convert selectedProductsData Map to array for easier handling
    const selectedProductsArray = Array.from(selectedProductsData.values());
    
    // Navigate to print page with selected products data
    navigate('/print-qr', { 
      state: { 
        selectedProducts: selectedProductsArray,
        totalSelected: selectedProducts.size
      } 
    });
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
    <>
    <div className="">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mr-4 mb-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
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
          <span>Home</span>
        </button>
      </div>
      <div className="table-header">
        <h1>Product List</h1>
        <button
          className="download-selected-btn"
          onClick={handlePrintQRNavigation}
          disabled={selectedProducts.size === 0}
        >
          Print QR CODE ({selectedProducts.size})
        </button>
         <button
          className="download-selected-btn"
          onClick={() => setPrintModal(true)}
        >
          Open Print
        </button>
      </div>
      <table className="product-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={isAllCurrentPageSelected}
                onChange={handleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th>Product Code</th>
            <th>Cover Image</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(products) &&
            products.map((product) => (
              <tr key={product.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(product.id)}
                    onChange={() => handleSelectOne(product.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td>{product.code}</td>
                <td>
                  {product.cover_image ? (
                    <img
                      src={product.cover_image}
                      alt={product.name}
                      className="product-table-img"
                      style={{
                        width: 100,
                        height: 100,
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
          <span className="text-gray-500">No more products to display.</span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-[60vh]">
          <span className="text-gray-500">No products found.</span>
        </div>
      )}
    </div>
      {printModal && (
        <PrintProductTableModal data={Array.from(selectedProductsData.values())} setPrintModal={setPrintModal} />
      )}

    </>
  );
}

export default QRdownload;
