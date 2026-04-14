import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, index, activeTab }) => {
  const navigate = useNavigate();
  return (
    <div
      key={index}
      className="bg-white rounded-none shadow border border-gray-200 p-2 flex flex-col justify-between hover:border-blue-500"
    >
      <div
        className="w-full rounded-none overflow-hidden relative cursor-pointer"
        onClick={() => navigate(`/product-detail/${product?.code}`)}
      >
        <h3 className="text-[16px] font-bold text-[#333] mb-[3px] leading-[1.3]">
          {product?.name}
        </h3>

        <div className="flex justify-between">
          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1">
            Code: {product?.code || "N/A"}
          </span>

          <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1">
            Images: {product?.image_count}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
