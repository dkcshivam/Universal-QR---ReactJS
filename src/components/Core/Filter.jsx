import React, { useState } from "react";
import { FiFilter, FiPlus, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const SearchFilter = ({ onSearch, onFilterChange, onAddProduct }) => {
  const [activeTab, setActiveTab] = useState("mine");
  const navigate=useNavigate();

  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onFilterChange(tab);
  };

  return (
    <div className="items-center justify-between w-full bg-white rounded-lg hidden sm:flex p-2 mb-4">
      {/* Left side - Mine/All tabs */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleTabChange("mine")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "mine"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Mine
        </button>
        <button
          onClick={() => handleTabChange("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All
        </button>
      </div>

      {/* Right side - Filter and Add New Product buttons */}
      <div className="flex items-center gap-3">
        {/* Filter Button */}
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
          <FiFilter className="w-4 h-4" />
          <span className="text-sm font-medium">Filter</span>
          <FiChevronDown className="w-4 h-4" />
        </button>

        {/* Add New Product Button */}
        <button
          onClick={() => navigate("/add-product")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Add New Product</span>
        </button>
         <button
          onClick={onAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span className="text-sm font-medium" onClick={()=>navigate("/upload-multiple-product")}>Add Multiple Product</span>
        </button>
           <button
          onClick={onAddProduct}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span className="text-sm font-medium cursor-pointer" onClick={()=>navigate("/download-qr")}>Download QR Code</span>
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;
