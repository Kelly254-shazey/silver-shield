import React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

const Pagination = ({ currentPage, totalPages, onPageChange, pageSize, onPageSizeChange }) => {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-8 border-t border-silver/30 mt-12">
      {/* Page Size Selector */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold text-text-500 uppercase tracking-widest">Show:</span>
        <div className="flex gap-1.5">
          {[10, 25, 50, 100].map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all ${
                pageSize === size ? "bg-primary-purple text-white" : "bg-white text-text-700 hover:bg-soft-lavender/20"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Pill Pagination */}
      <nav className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="p-2.5 rounded-full bg-white text-text-700 hover:bg-soft-lavender/20 disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-full text-[11px] font-black transition-all ${
                currentPage === p ? "bg-primary-purple text-white shadow-lg scale-110" : "bg-white text-text-700 hover:bg-soft-lavender/20"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="p-2.5 rounded-full bg-white text-text-700 hover:bg-soft-lavender/20 disabled:opacity-20 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;