import { useState } from "react";
import Pagination from "../../Pagination";
import ProductCard from "./ProductCard";

const ProductGrid = ({ product }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = product?.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="sm:p-3 min-h-screen box-border">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-5">
        {currentProducts?.map((product, index) => (
          <ProductCard key={index} product={product} index={index} />
        ))}
      </div>
      <Pagination
        totalItems={product.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ProductGrid;
