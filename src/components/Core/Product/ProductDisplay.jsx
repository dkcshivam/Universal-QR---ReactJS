import { useState } from "react";
import Pagination from "../../Pagination";
import ProductCard from "./ProductCard";

const ProductGrid = ({ product, activeTab }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = product?.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="min-h-screen box-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {currentProducts?.map((product, index) => (
          <ProductCard key={index} product={product} index={index} activeTab={activeTab} />
        ))}
      </div>
      {currentProducts?.length > 0 ? (
        <Pagination
          totalItems={product.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      ) : (
        <div className="flex items-center justify-center py-4">
          <span className="text-gray-500">No products found.</span>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;


