const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  maxPageNumbersToShow,
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
    const half = Math.floor(maxPageNumbersToShow / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, currentPage + half);

    if (start === 1) {
      end = Math.min(totalPages, maxPageNumbersToShow);
    }
    if (end === totalPages) {
      start = Math.max(1, totalPages - maxPageNumbersToShow + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <nav className="py-10">
      <ul className="flex justify-center items-center space-x-1">
        <li>
          <button 
            className={`px-3 py-3 text-sm border border-gray-300 rounded transition-colors duration-200 ${
              currentPage === 1 
                ? 'text-white bg-gray-500 cursor-not-allowed opacity-50' 
                : 'text-blue-600 bg-transparent hover:bg-gray-100 hover:text-blue-600'
            }`}
            onClick={() => handlePageChange(1)} 
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
        </li>
        <li>
          <button 
            className={`px-3 py-3 text-sm border border-gray-300 rounded transition-colors duration-200 ${
              currentPage === 1 
                ? 'text-white bg-gray-500 cursor-not-allowed opacity-50' 
                : 'text-blue-600 bg-transparent hover:bg-gray-100 hover:text-blue-600'
            }`}
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            &lsaquo;
          </button>
        </li>

        {currentPage >= 4 && (
          <>
            <li>
              <button 
                className="px-3 py-3 text-sm border border-gray-300 rounded text-blue-600 bg-transparent hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
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

        {getPageNumbers().map((page) => (
          <li key={page}>
            <button
              className={`px-3 py-3 text-sm border rounded transition-colors duration-200 ${
                page === currentPage
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'text-blue-600 bg-transparent border-gray-300 hover:bg-gray-100 hover:text-blue-600'
              }`}
              onClick={() => handlePageChange(page)}
              disabled={page === currentPage}
            >
              {page}
            </button>
          </li>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            <li>
              <span className="px-3 py-3 text-sm text-gray-500">...</span>
            </li>
            <li>
              <button 
                className="px-3 py-3 text-sm border border-gray-300 rounded text-blue-600 bg-transparent hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200"
                onClick={() => handlePageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        <li>
          <button 
            className={`px-3 py-3 text-sm border border-gray-300 rounded transition-colors duration-200 ${
              currentPage === totalPages 
                ? 'text-white bg-gray-500 cursor-not-allowed opacity-50' 
                : 'text-blue-600 bg-transparent hover:bg-gray-100 hover:text-blue-600'
            }`}
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage === totalPages}
          >
            &rsaquo;
          </button>
        </li>
        <li>
          <button 
            className={`px-3 py-3 text-sm border border-gray-300 rounded transition-colors duration-200 ${
              currentPage === totalPages 
                ? 'text-white bg-gray-500 cursor-not-allowed opacity-50' 
                : 'text-blue-600 bg-transparent hover:bg-gray-100 hover:text-blue-600'
            }`}
            onClick={() => handlePageChange(totalPages)} 
            disabled={currentPage === totalPages}
          >
            &raquo;
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;