import React from "react";

const ExaminerPagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalRecords,
}) => {
  if (!totalPages || totalPages <= 0) {
    return null;
  }

  const handlePageChange = (page) => {
    if (page === currentPage) return;
    if (page < 1) return;
    if (totalPages && page > totalPages) return;
    onPageChange(page);
  };

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
      <div className="text-sm text-slate-600">
        Page <span className="font-semibold">{currentPage || 1}</span>
        {totalPages ? (
          <>
            {" "}
            / <span className="font-semibold">{totalPages}</span>
          </>
        ) : null}
        {typeof totalRecords === "number" && totalRecords > 0 && (
          <span className="ml-2">({totalRecords} records)</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPreviousPage || (currentPage || 1) === 1}
          className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
            hasPreviousPage && (currentPage || 1) > 1
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
          }`}
        >
          Prev
        </button>

        <span className="px-3 py-1 text-sm text-slate-600">
          {currentPage || 1}
        </span>

        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNextPage || (currentPage || 1) >= (totalPages || 1)}
          className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
            hasNextPage && (currentPage || 1) < (totalPages || 1)
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ExaminerPagination;
