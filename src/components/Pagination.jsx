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

  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      // Show all pages if 7 or less
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Logic for showing ellipsis with many pages
    const pages = new Set();
    pages.add(1); // Always show first page
    pages.add(totalPages); // Always show last page

    // Add pages around the current page
    for (let i = currentPage - 1; i <= currentPage + 1; i++) {
      if (i > 1 && i < totalPages) {
        pages.add(i);
      }
    }

    // Add ellipsis placeholders
    const result = [];
    let lastPage = 0;
    Array.from(pages)
      .sort((a, b) => a - b)
      .forEach((page) => {
        if (lastPage !== 0 && page - lastPage > 1) {
          result.push("...");
        }
        result.push(page);
        lastPage = page;
      });

    return result;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col items-center my-8 gap-4">
      {/* Page number buttons */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 border border-slate-200 bg-white rounded-md cursor-pointer text-sm font-medium text-slate-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          <ChevronLeft size={16} />
        </button>

        {pages.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-sm font-medium text-slate-500"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-4 py-2 border rounded-md cursor-pointer text-sm font-medium transition-colors min-w-[40px] flex items-center justify-center ${
                currentPage === page
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              {page}
            </button>
          )
        )}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 border border-slate-200 bg-white rounded-md cursor-pointer text-sm font-medium text-slate-500 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Item count text */}
      <div className="text-slate-500 text-sm">
        Showing {start}–{end} of {totalItems}
      </div>
    </div>
  );
};

export default Pagination;
