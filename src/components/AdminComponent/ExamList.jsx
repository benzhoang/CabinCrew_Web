import { useMemo, useState, useEffect, useCallback } from "react";
import { FaEye, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { getTests } from "../../service/api2";
import Loading from "../Loading";
import Pagination from "./Pagination";
import { useNavigate } from "react-router-dom";

const TestTypeBadge = ({ testType }) => {
  const getTestTypeConfig = (type) => {
    const normalizedType = type?.toLowerCase() || "";

    if (normalizedType.includes("practical")) {
      return {
        className: "bg-gray-100 text-gray-700 border-gray-200",
        text: "Practical",
      };
    }
    if (
      normalizedType.includes("listening") ||
      normalizedType.includes("englishlistening")
    ) {
      return {
        className: "bg-cyan-100 text-cyan-700 border-cyan-200",
        text: "English Listening",
      };
    }
    if (
      normalizedType.includes("speaking") ||
      normalizedType.includes("englishspeaking")
    ) {
      return {
        className: "bg-pink-100 text-pink-700 border-pink-200",
        text: "English Speaking",
      };
    }
    // Default fallback
    return {
      className: "bg-gray-100 text-gray-600 border-gray-200",
      text: type || "Unknown",
    };
  };

  const config = getTestTypeConfig(testType);

  return (
    <span
      className={`${config.className} inline-block rounded-full border px-2 py-0.5 text-xs font-medium`}
    >
      {config.text}
    </span>
  );
};

const SortButton = ({ field, label, sortField, sortDirection, onSort }) => {
  const getIcon = () => {
    if (sortField !== field || !sortDirection)
      return <FaSort className="text-gray-400 ms-1" />;
    return sortDirection === "asc" ? (
      <FaSortUp className="text-blue-600 ms-1" />
    ) : (
      <FaSortDown className="text-blue-600 ms-1" />
    );
  };
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className="flex items-center hover:text-gray-900"
    >
      {label} {getIcon()}
    </button>
  );
};

const ExamList = ({ search = "", testTypeFilter = "all" }) => {
  const navigate = useNavigate();
  const [allTests, setAllTests] = useState([]); // Store all tests from server
  const [loading, setLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalItems: 0,
    totalPages: 0,
  });

  const fetchTests = useCallback(
    async (showLoading = false) => {
      try {
        // Chỉ hiển thị loading nếu là lần đầu hoặc được yêu cầu
        if (showLoading) {
          setLoading(true);
        }
        setError(null);

        // Fetch all data for client-side filtering and pagination
        // This ensures that when filters change, data from later pages will move up
        const params = {
          page: 1, // Always fetch from page 1 to get all data
          pageSize: 1000, // Fetch large page size to get all tests
          searchTerm: search || undefined,
        };

        const result = await getTests(1, 1000, params);

        if (result.success && result.data && Array.isArray(result.data)) {
          // Map API data to component structure
          const mappedTests = result.data.map((item) => ({
            id: item.testId || item.id || item.testID || item.Id,
            testName: item.testName || item.name || "Đề thi chưa có tên",
            totalQuestions: item.totalQuestions || 0,
            testType: item.testType || "Unknown",
          }));

          // Store all tests from server for client-side filtering and pagination
          setAllTests(mappedTests);
          setError(null);
        } else {
          setAllTests([]);
          setError(result.error || "Error when fetching test list");
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
        setAllTests([]);
        setError(error.message || "Error when fetching test list");
      } finally {
        if (showLoading) {
          setLoading(false);
          setIsInitialLoad(false);
        }
      }
    },
    [search]
  );

  // Initial load - chỉ chạy một lần khi component mount
  useEffect(() => {
    fetchTests(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch lại khi filter thay đổi (không hiển thị loading)
  useEffect(() => {
    if (!isInitialLoad) {
      // Reset to page 1 when filters change
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
      fetchTests(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testTypeFilter, search]);

  const handleSort = (field) => {
    if (sortField === field) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortField(null);
        setSortDirection(null);
      } else {
        setSortDirection("asc");
      }
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter tests by search and testType (client-side)
  const filteredTests = useMemo(() => {
    let filtered = allTests;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.testName?.toLowerCase().includes(searchLower) ||
          t.testType?.toLowerCase().includes(searchLower)
      );
    }

    // Apply testType filter
    if (testTypeFilter !== "all") {
      filtered = filtered.filter((t) => {
        const normalizedType = t.testType?.toLowerCase() || "";
        const filterLower = testTypeFilter.toLowerCase();

        // Match based on filter value
        if (filterLower === "englishlistening") {
          return (
            normalizedType.includes("listening") ||
            normalizedType.includes("englishlistening")
          );
        }
        if (filterLower === "englishspeaking") {
          return (
            normalizedType.includes("speaking") ||
            normalizedType.includes("englishspeaking")
          );
        }
        if (filterLower === "practical") {
          return normalizedType.includes("practical");
        }

        return normalizedType.includes(filterLower);
      });
    }

    return filtered;
  }, [allTests, search, testTypeFilter]);

  const sortedTests = useMemo(() => {
    if (!sortField || !sortDirection) return filteredTests;
    const copy = [...filteredTests];
    const getValue = (t) => {
      const v = t?.[sortField];
      if (v == null) return "";
      if (typeof v === "string") return v.toLowerCase();
      return v;
    };
    copy.sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return sortDirection === "asc" ? -1 : 1;
      if (va > vb) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return copy;
  }, [filteredTests, sortField, sortDirection]);

  // Calculate pagination based on filtered data
  const paginatedTests = useMemo(() => {
    const pageSize = pagination.pageSize;
    const startIndex = (pagination.currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return sortedTests.slice(startIndex, endIndex);
  }, [sortedTests, pagination.currentPage, pagination.pageSize]);

  // Update pagination when filtered data changes
  useEffect(() => {
    const totalItems = sortedTests.length;
    const totalPages = Math.ceil(totalItems / pagination.pageSize);

    setPagination((prev) => {
      const currentPage = Math.min(prev.currentPage, totalPages || 1);
      return {
        ...prev,
        totalItems: totalItems,
        totalPages: totalPages || 1,
        currentPage: currentPage || 1,
      };
    });
  }, [sortedTests.length, pagination.pageSize]);

  const handlePageChange = (page) => {
    if (page === pagination.currentPage) return;
    if (page < 1) return;
    if (pagination.totalPages && page > pagination.totalPages) return;

    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  if (loading && allTests.length === 0) {
    return (
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
        <div className="py-8 text-center text-gray-600">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <div className="mb-2 text-red-600">{error}</div>
        <button
          onClick={() => fetchTests(true)}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="mt-10 overflow-hidden bg-white border border-gray-200 rounded-xl">
        <table className="min-w-full border-collapse table-fixed">
          <thead>
            <tr className="text-sm text-left text-gray-600 bg-gray-50">
              <th className="w-16 px-5 py-3 font-semibold">No.</th>
              <th className="px-5 py-3 font-semibold w-52">
                <SortButton
                  field="testName"
                  label="Test Name"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-5 py-3 font-semibold w-28">
                <SortButton
                  field="totalQuestions"
                  label="Total Questions"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="px-5 py-3 font-semibold w-36">Test Type</th>
              <th className="w-24 px-5 py-3 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedTests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              paginatedTests.map((t, idx) => (
                <tr
                  key={t.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {(pagination.currentPage - 1) * pagination.pageSize +
                      idx +
                      1}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 truncate">
                    {t.testName}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    {t.totalQuestions}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-700">
                    <TestTypeBadge testType={t.testType} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/admin/tests/${t.id}`)}
                        aria-label="View detail"
                        className="p-2 text-blue-400 border border-gray-200 rounded-md hover:bg-gray-50 hover:text-blue-300"
                      >
                        <FaEye />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 0 && (
        <div className="pt-4">
          <Pagination
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.pageSize}
            currentPage={pagination.currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
};

export default ExamList;
