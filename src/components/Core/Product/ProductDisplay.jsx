import { useState } from "react";
import { FaMapMarkerAlt } from "react-icons/fa";
import Pagination from "../../Pagination";
import { demoProducts } from "../../../utils/data";
import { useNavigate } from "react-router-dom";


const ProductGrid = () => {
  const nagicate=useNavigate()
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = demoProducts.slice(indexOfFirstItem, indexOfLastItem);
  return (
    <div className="p-3 min-h-screen">
    
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {currentProducts.map((product, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow border border-gray-200 p-[10px] sm:p-[20px] flex flex-col justify-between hover:border-indigo-400"
          >
            <div className="w-full h-[220px] rounded-none mb-[15px] overflow-hidden relative cursor-pointer" onClick={()=>nagicate(`/product-detail/${product?.name}`)}>
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
        ))}
      </div>
      <Pagination
        totalItems={demoProducts.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductGrid;
