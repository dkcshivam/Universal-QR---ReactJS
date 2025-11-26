import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Pagination from "../Pagination";
import * as XLSX from "xlsx";

import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaFileExcel } from "react-icons/fa";
import PrintProductTableModal from "./PrintProductTable";

function QRdownload() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [selectedProductsData, setSelectedProductsData] = useState(new Map());

  const [productCodeMap, setProductCodeMap] = useState(new Map());
  const [printModal, setPrintModal] = useState(false);

  const [pagination, setPagination] = useState({
    count: 0,
    total_pages: 1,
    current_page: 1,
  });

  // --- 1. Modified: Added time fields to filter state ---
  const [filters, setFilters] = useState({
    code: "",
    name: "",
    quantity: "",
    location: "",
    dateFrom: "",
    timeFrom: "", // New
    dateTo: "",
    timeTo: "", // New
    department: "",
  });
  const isFilterActive = useMemo(() => {
    return Object.values(filters).some((val) => val !== "");
  }, [filters]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [tempDateFrom, setTempDateFrom] = useState("");
  const [tempDateTo, setTempDateTo] = useState("");
  // --- 2. Modified: Added temp states for time inputs ---
  const [tempTimeFrom, setTempTimeFrom] = useState("");
  const [tempTimeTo, setTempTimeTo] = useState("");

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

        const codeMap = new Map(productsData.map((p) => [p.id, p.code]));
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

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCode = product.code
        .toLowerCase()
        .includes(filters.code.toLowerCase());

      const matchesName = product.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());

      const matchesQuantity = product.quantity
        .toString()
        .includes(filters.quantity);

      const matchesLocation = (product.location || "")
        .toLowerCase()
        .includes(filters.location.toLowerCase());

      // --- 3. Modified: Date & Time Logic ---
      const productDateObj = new Date(product.created_at);

      // Construct Start Date object
      let dateFrom = null;
      if (filters.dateFrom) {
        const timeString = filters.timeFrom ? filters.timeFrom : "00:00:00";
        dateFrom = new Date(`${filters.dateFrom}T${timeString}`);
      }

      // Construct End Date object
      let dateTo = null;
      if (filters.dateTo) {
        const timeString = filters.timeTo ? filters.timeTo : "23:59:59.999";
        dateTo = new Date(`${filters.dateTo}T${timeString}`);
      }

      let matchesDate = true;
      if (dateFrom && !dateTo) {
        matchesDate = productDateObj >= dateFrom;
      }
      if (!dateFrom && dateTo) {
        matchesDate = productDateObj <= dateTo;
      }
      if (dateFrom && dateTo) {
        matchesDate = productDateObj >= dateFrom && productDateObj <= dateTo;
      }
      // ----------------------------------------

      const matchesDepartment = (product.belongs_to_department || "")
        .toLowerCase()
        .includes(filters.department.toLowerCase());

      return (
        matchesCode &&
        matchesName &&
        matchesQuantity &&
        matchesLocation &&
        matchesDate &&
        matchesDepartment
      );
    });
  }, [products, filters]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handlePageChange = (page) => {
    setSelectedProducts(new Set());
    setSelectedProductsData(new Map());
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
      const productData = products.find((product) => product.id === productId);
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
    const visibleIds = filteredProducts.map((p) => p.id);
    const allVisibleSelected =
      visibleIds.length > 0 && visibleIds.every((id) => newSelection.has(id));

    if (allVisibleSelected) {
      visibleIds.forEach((id) => {
        newSelection.delete(id);
        newSelectedData.delete(id);
      });
    } else {
      visibleIds.forEach((id) => {
        newSelection.add(id);
        const productData = filteredProducts.find((p) => p.id === id);
        if (productData) {
          newSelectedData.set(id, productData);
        }
      });
    }

    setSelectedProducts(newSelection);
    setSelectedProductsData(newSelectedData);
  };

  const isAllVisibleSelected = useMemo(() => {
    if (filteredProducts.length === 0) return false;
    return filteredProducts.every((p) => selectedProducts.has(p.id));
  }, [filteredProducts, selectedProducts]);

  const handleExcelDownload = () => {
    if (selectedProducts.size === 0) {
      toast.warning("Please select at least one product to download Excel.");
      return;
    }

    const dataToExport = Array.from(selectedProductsData.values()).map(
      (product) => ({
        custom_text: product.name,
        quantity: product.quantity,
        qr_code: product.code,
        created_at: product.created_at, // Optional: useful to see date in excel
      })
    );

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const wscols = [{ wch: 30 }, { wch: 10 }, { wch: 20 }, { wch: 25 }];
    worksheet["!cols"] = wscols;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Selected Products");

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-GB").replace(/\//g, "-");
    const timeStr = now
      .toLocaleTimeString("en-US", { hour12: false })
      .replace(/:/g, "-");

    XLSX.writeFile(workbook, `Products_Export_${dateStr}_${timeStr}.xlsx`);
    toast.success("Excel downloaded successfully!");
  };

  const handlePrintQRNavigation = () => {
    if (selectedProducts.size === 0) {
      toast.warning("Please select at least one product to print QR codes.");
      return;
    }
    const selectedProductsArray = Array.from(selectedProductsData.values());
    navigate("/print-qr", {
      state: {
        selectedProducts: selectedProductsArray,
        totalSelected: selectedProducts.size,
      },
    });
  };

  // Helper to open modal and sync state
  const openDateModal = () => {
    setTempDateFrom(filters.dateFrom);
    setTempTimeFrom(filters.timeFrom);
    setTempDateTo(filters.dateTo);
    setTempTimeTo(filters.timeTo);
    setShowDateModal(true);
  };

  return (
    <>
      <div className="">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mr-4 mb-3 inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg shadow-sm font-semibold text-sm lg:text-base cursor-pointer transition-all duration-200"
          >
            <span>Home</span>
          </button>
        </div>
        <div className="table-header flex gap-3 items-center flex-wrap">
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

          <button
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors shadow-sm
              ${
                selectedProducts.size > 0
                  ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                  : "bg-gray-400 cursor-not-allowed"
              }
            `}
            onClick={handleExcelDownload}
            disabled={selectedProducts.size === 0}
          >
            <FaFileExcel />
            Export Excel ({selectedProducts.size})
          </button>
        </div>

        <table className="product-table">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={isAllVisibleSelected}
                  onChange={handleSelectAll}
                  className="cursor-pointer"
                />
              </th>

              <th className="min-w-[130px]">
                <span className="block font-semibold">Product Code</span>
                <input
                  placeholder="Search code..."
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={filters.code}
                  onChange={(e) =>
                    setFilters({ ...filters, code: e.target.value })
                  }
                />
              </th>

              <th>Cover Image</th>

              <th className="min-w-[140px]">
                <span className="block font-semibold">Product Name</span>
                <input
                  placeholder="Search name..."
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={filters.name}
                  onChange={(e) =>
                    setFilters({ ...filters, name: e.target.value })
                  }
                />
              </th>

              <th className="min-w-[90px]">
                <span className="block font-semibold">Quantity</span>
                <input
                  placeholder="Qty..."
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={filters.quantity}
                  onChange={(e) =>
                    setFilters({ ...filters, quantity: e.target.value })
                  }
                />
              </th>

              <th className="min-w-[120px]">
                <span className="block font-semibold">Location</span>
                <input
                  placeholder="Search location..."
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters({ ...filters, location: e.target.value })
                  }
                />
              </th>

              {/* Date Column */}
              <th className="min-w-[150px] align-top">
                <span className="block font-semibold">Date & Time</span>
                <button
                  onClick={() => {
                    if (filters.dateFrom || filters.dateTo) {
                      setFilters({
                        ...filters,
                        dateFrom: "",
                        timeFrom: "",
                        dateTo: "",
                        timeTo: "",
                      });
                    } else {
                      openDateModal();
                    }
                  }}
                  className={`mt-1 w-full px-2 py-1 text-xs rounded border transition cursor-pointer
                  ${
                    filters.dateFrom || filters.dateTo
                      ? "bg-red-500 hover:bg-red-600 text-white border-red-600"
                      : "bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-300"
                  }`}
                >
                  {filters.dateFrom || filters.dateTo
                    ? "Reset Filter"
                    : "Filter Date/Time"}
                </button>
              </th>

              <th className="min-w-[140px]">
                <span className="block font-semibold">Department</span>
                <input
                  placeholder="Search..."
                  className="mt-1 w-full px-2 py-1 text-xs border border-gray-300 rounded 
                   focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                  value={filters.department}
                  onChange={(e) =>
                    setFilters({ ...filters, department: e.target.value })
                  }
                />
              </th>
            </tr>
          </thead>

          <tbody>
            {Array.isArray(filteredProducts) &&
              filteredProducts.map((product) => (
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

                  {/* Date Display */}
                  <td>
                    {product.created_at ? (
                      <div className="flex flex-col text-xs">
                        <span>
                          {new Date(product.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                        <span className="text-gray-500">
                          {new Date(product.created_at).toLocaleTimeString(
                            "en-US",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            }
                          )}
                        </span>
                      </div>
                    ) : (
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

        {!isFilterActive && pagination?.total_pages > 1 ? (
          <Pagination
            totalItems={pagination.count}
            itemsPerPage={1000}
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={handlePageChange}
          />
        ) : isFilterActive ? (
          // Logic specifically for when filters are ON
          filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-[60vh]">
              <span className="text-gray-500">No matching records found.</span>
            </div>
          ) : (
            <div className="flex items-center justify-center py-4">
              <span className="text-gray-400 text-sm italic">
                Filtered Results (Pagination Hidden)
              </span>
            </div>
          )
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
        <PrintProductTableModal
          data={Array.from(selectedProductsData.values())}
          setPrintModal={setPrintModal}
        />
      )}

      {/* --- 4. Modified: Date & Time Modal --- */}
      {showDateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/10 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-lg shadow-xl w-96 border border-gray-200">
            <h2 className="text-lg font-semibold mb-3">
              Select Date & Time Range
            </h2>

            <label className="text-sm text-gray-700 block mb-1">From:</label>
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                value={tempDateFrom}
                onChange={(e) => setTempDateFrom(e.target.value)}
              />
              <input
                type="time"
                className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                value={tempTimeFrom}
                onChange={(e) => setTempTimeFrom(e.target.value)}
              />
            </div>

            <label className="text-sm text-gray-700 block mb-1">To:</label>
            <div className="flex gap-2 mb-3">
              <input
                type="date"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                value={tempDateTo}
                onChange={(e) => setTempDateTo(e.target.value)}
              />
              <input
                type="time"
                className="w-32 px-2 py-1 text-sm border border-gray-300 rounded"
                value={tempTimeTo}
                onChange={(e) => setTempTimeTo(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-3 py-1 text-sm bg-gray-300 hover:bg-gray-400 rounded cursor-pointer"
                onClick={() => setShowDateModal(false)}
              >
                Cancel
              </button>

              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded cursor-pointer"
                onClick={() => {
                  setFilters({
                    ...filters,
                    dateFrom: tempDateFrom,
                    timeFrom: tempTimeFrom,
                    dateTo: tempDateTo,
                    timeTo: tempTimeTo,
                  });
                  setShowDateModal(false);
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default QRdownload;
