import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

const ProductCard = ({ product, index }) => {
  return (
    <div
      key={index}
      className="bg-white rounded-lg shadow border border-gray-200 p-3 sm:p-5 flex flex-col justify-between hover:border-indigo-400"
    >
      <div className="w-full h-[220px] rounded-none mb-[15px] overflow-hidden relative">
        <img
          src={product.coverImage}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>

      <h3 className="text-[16px] font-bold text-[#333] mb-[15px] leading-[1.3]">
        {product.name}
      </h3>
      <div className="flex justify-between items-center gap-[10px] mt-2">
        <div className="flex items-center gap-[5px] text-[14px] text-[#666]">
          <FaMapMarkerAlt className="text-blue-600" />
          {product.location}
        </div>

        <div className="flex flex-wrap gap-1">
          <span className="bg-[#6b7280] text-white text-[11px] font-medium px-[8px] py-[4px] rounded-[8px] uppercase tracking-[0.5px] whitespace-nowrap">
            {product.department}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
