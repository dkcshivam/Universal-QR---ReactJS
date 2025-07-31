import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, index, activeTab }) => {
  const navigate = useNavigate();
  return ( 
    <div
      key={index}
      className="bg-white rounded-none shadow border border-gray-200 p-3 sm:p-5 flex flex-col justify-between hover:border-blue-500"
    >
      <div
        className="w-full h-[220px] rounded-none mb-[15px] overflow-hidden relative cursor-pointer"
        onClick={() => navigate(`/product-detail/${product?.code}`)}
      >
        {
          product?.cover_image ? (
            <img
              src={product.cover_image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="bg-blue-300 text-white text-[15px] font-semibold px-4 py-2 rounded-full shadow">
                No cover image uploaded 
              </span>
            </span>
          )
        }
      </div>

      <h3 className="text-[16px] font-bold text-[#333] mb-[3px] leading-[1.3]">
        {product?.name}
      </h3>
      <div className="mb-[3px]">
        <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1" >
          Code: {product?.code || "N/A"}
        </span>
      </div>
      <div className="flex justify-between items-center gap-[10px] mt-2">
        <div className="flex items-center gap-[5px] text-[14px] text-[#666]">
          <FaMapMarkerAlt className="text-blue-600" />
          {product?.location ? product.location : "N/A"}
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="bg-[#6b7280] text-white text-[11px] font-medium px-[8px] py-[4px] rounded-[8px] uppercase tracking-[0.5px] whitespace-nowrap">
            {product?.belongs_to_department ? product.belongs_to_department : "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
