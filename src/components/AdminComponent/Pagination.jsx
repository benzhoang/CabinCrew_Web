const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const getPageNumbers = () => {
    const pages = [];

    // Case 1: Page 1 - Show 1, 2, 3, 4, ..., last
    if (currentPage === 1) {
      for (let i = 1; i <= 4 && i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Case 2: Pages 2-3 - Show 1, 2, 3, 4 (always 4 pages from start)
    if (currentPage >= 2 && currentPage <= 3) {
      for (let i = 1; i <= 4 && i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Case 3: Near the end (2 pages from last) - Show 1, ..., last-3, last-2, last-1, last
    if (currentPage >= totalPages - 2) {
      const start = Math.max(1, totalPages - 3);
      for (let i = start; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Case 4: Middle pages (page 4 onwards, but not near end) - Show current-1, current, current+1
    pages.push(currentPage - 1);
    pages.push(currentPage);
    pages.push(currentPage + 1);

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const isNearEnd = currentPage >= totalPages - 2 && currentPage > 1;
  const showLeftArrow = currentPage > 1;
  const showRightArrow = currentPage < totalPages;
  const showFirstPage = currentPage >= 4 && !isNearEnd;
  const showRightEllipsis = currentPage < totalPages - 2 && currentPage > 1;
  const showLeftEllipsisForEarlyPages =
    currentPage >= 2 && currentPage <= 3 && totalPages > 4;

  return (
    <nav className="py-10">
      <ul className="flex items-center justify-center space-x-1">
        {showLeftArrow && (
          <li>
            <button
              className="px-3 py-3 text-sm text-blue-600 transition-colors duration-200 bg-transparent border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              &lsaquo;
            </button>
          </li>
        )}

        {showFirstPage && (
          <>
            <li>
              <button
                className="px-3 py-3 text-sm text-blue-600 transition-colors duration-200 bg-transparent border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600"
                onClick={() => handlePageChange(1)}
              >
                1
              </button>
            </li>
            <li>
              <span className="px-3 py-3 text-sm text-gray-500">...</span>
            </li>
          </>
        )}

        {currentPage === 1 && (
          <>
            {pageNumbers.map((page) => (
              <li key={page}>
                <button
                  className={`px-3 py-3 text-sm border rounded transition-colors duration-200 ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-gray-600"
                      : "text-blue-600 bg-transparent border-gray-300 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  onClick={() => handlePageChange(page)}
                  disabled={page === currentPage}
                >
                  {page}
                </button>
              </li>
            ))}
            {totalPages > 4 && (
              <>
                <li>
                  <span className="px-3 py-3 text-sm text-blue-500">...</span>
                </li>
                <li>
                  <button
                    className="px-3 py-3 text-sm text-blue-600 transition-colors duration-200 bg-transparent border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}
          </>
        )}

        {currentPage >= 2 && currentPage <= 3 && (
          <>
            {pageNumbers.map((page) => (
              <li key={page}>
                <button
                  className={`px-3 py-3 text-sm border rounded transition-colors duration-200 ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-gray-600"
                      : "text-blue-600 bg-transparent border-gray-300 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  onClick={() => handlePageChange(page)}
                  disabled={page === currentPage}
                >
                  {page}
                </button>
              </li>
            ))}
            {showLeftEllipsisForEarlyPages && (
              <>
                <li>
                  <span className="px-3 py-3 text-sm text-blue-500">...</span>
                </li>
                <li>
                  <button
                    className="px-3 py-3 text-sm text-blue-600 transition-colors duration-200 bg-transparent border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}
          </>
        )}

        {currentPage >= 4 && !isNearEnd && (
          <>
            {pageNumbers.map((page) => (
              <li key={page}>
                <button
                  className={`px-3 py-3 text-sm border rounded transition-colors duration-200 ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-gray-600"
                      : "text-blue-600 bg-transparent border-gray-300 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  onClick={() => handlePageChange(page)}
                  disabled={page === currentPage}
                >
                  {page}
                </button>
              </li>
            ))}
            {showRightEllipsis && (
              <>
                <li>
                  <span className="px-3 py-3 text-sm text-blue-500">...</span>
                </li>
                <li>
                  <button
                    className="px-3 py-3 text-sm text-blue-600 transition-colors duration-200 bg-transparent border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600"
                    onClick={() => handlePageChange(totalPages)}
                  >
                    {totalPages}
                  </button>
                </li>
              </>
            )}
          </>
        )}

        {isNearEnd && (
          <>
            {totalPages > 4 && (
              <>
                <li>
                  <button
                    className="px-3 py-3 text-sm text-blue-600 transition-colors duration-200 bg-transparent border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600"
                    onClick={() => handlePageChange(1)}
                  >
                    1
                  </button>
                </li>
                <li>
                  <span className="px-3 py-3 text-sm text-blue-500">...</span>
                </li>
              </>
            )}
            {pageNumbers.map((page) => (
              <li key={page}>
                <button
                  className={`px-3 py-3 text-sm border rounded transition-colors duration-200 ${
                    page === currentPage
                      ? "bg-blue-600 text-white border-gray-600"
                      : "text-blue-600 bg-transparent border-gray-300 hover:bg-gray-100 hover:text-blue-600"
                  }`}
                  onClick={() => handlePageChange(page)}
                  disabled={page === currentPage}
                >
                  {page}
                </button>
              </li>
            ))}
          </>
        )}

        {showRightArrow && (
          <li>
            <button
              className="px-3 py-3 text-sm text-blue-600 transition-colors duration-200 bg-transparent border border-gray-300 rounded hover:bg-gray-100 hover:text-blue-600"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              &rsaquo;
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

export default Pagination;
