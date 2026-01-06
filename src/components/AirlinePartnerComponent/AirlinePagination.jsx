import React from "react";

const AirlinePagination = ({ pagination, onPageChange }) => {
  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;
    onPageChange(page);
  };

  if (!pagination || pagination.totalRecords <= 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
      <div className="text-sm text-slate-600">
        Page{" "}
        <span className="font-semibold">{pagination.currentPage || 1}</span>
        {pagination.totalPages ? (
          <>
            {" "}
            / <span className="font-semibold">{pagination.totalPages}</span>
          </>
        ) : null}
        {typeof pagination.totalRecords === "number" &&
          pagination.totalRecords > 0 && (
            <span className="ml-2">({pagination.totalRecords} records)</span>
          )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={
            !pagination.hasPreviousPage || (pagination.currentPage || 1) === 1
          }
          className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
            pagination.hasPreviousPage && (pagination.currentPage || 1) > 1
              ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
          }`}
        >
          Prev
        </button>

        <span className="px-3 py-1 text-sm text-slate-600">
          {pagination.currentPage || 1}
        </span>

        <button
          type="button"
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={
            !pagination.hasNextPage ||
            (pagination.currentPage || 1) >= (pagination.totalPages || 1)
          }
          className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${
            pagination.hasNextPage &&
            (pagination.currentPage || 1) < (pagination.totalPages || 1)
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

export default AirlinePagination;
