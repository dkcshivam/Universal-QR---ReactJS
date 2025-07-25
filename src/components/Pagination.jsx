import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(start + itemsPerPage - 1, totalItems);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex justify-center items-center my-10 gap-2 flex-wrap">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-[15px] py-[10px] border-2 border-slate-200 bg-white rounded-lg cursor-pointer text-sm font-medium text-slate-500 transition-all duration-300 min-w-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-[15px] py-[10px] border-2 border-slate-200 rounded-lg cursor-pointer text-sm font-medium transition-all duration-300 min-w-[44px] flex items-center justify-center ${
              currentPage === page
                ? "bg-indigo-600 text-white border-indigo-600"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-[15px] py-[10px] border-2 border-slate-200 bg-white rounded-lg cursor-pointer text-sm font-medium text-slate-500 transition-all duration-300 min-w-[44px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:text-slate-400"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="text-slate-500 text-sm mx-4">
        {start}–{end} of {totalItems}
      </div>
    </div>
  );
};

export default Pagination;
