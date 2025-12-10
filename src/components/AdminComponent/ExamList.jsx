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
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
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
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: page,
          pageSize: 5,
          searchTerm: search || undefined,
        };

        const result = await getTests(page, 5, params);

        if (result.success && result.data && Array.isArray(result.data)) {
          // Map API data to component structure
          const mappedTests = result.data.map((item) => ({
            id: item.testId || item.id || item.testID || item.Id,
            testName: item.testName || item.name || "Đề thi chưa có tên",
            totalQuestions: item.totalQuestions || 0,
            testType: item.testType || "Unknown",
          }));

          setTests(mappedTests);

          // Update pagination
          if (result.pagination) {
            setPagination({
              currentPage: result.pagination.currentPage || page,
              pageSize: result.pagination.pageSize || 5,
              totalItems: result.pagination.totalRecords || mappedTests.length,
              totalPages: result.pagination.totalPages || 1,
            });
          } else {
            setPagination({
              currentPage: page,
              pageSize: 5,
              totalItems: mappedTests.length,
              totalPages: Math.ceil(mappedTests.length / 5) || 1,
            });
          }
        } else {
          setTests([]);
          setError(result.error || "Error when fetching test list");
        }
      } catch (error) {
        console.error("Error fetching tests:", error);
        setTests([]);
        setError(error.message || "Error when fetching test list");
      } finally {
        setLoading(false);
      }
    },
    [search]
  );

  useEffect(() => {
    fetchTests(1);
  }, [fetchTests, testTypeFilter]);

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
    let filtered = tests;

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
  }, [tests, search, testTypeFilter]);

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

  const handlePageChange = (page) => {
    if (
      page > 0 &&
      page <= pagination.totalPages &&
      page !== pagination.currentPage
    ) {
      fetchTests(page);
    }
  };

  if (loading && tests.length === 0) {
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
          onClick={() => fetchTests(pagination.currentPage)}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-hidden bg-white border border-gray-200 rounded-xl">
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
              <th className="px-5 py-3 font-semibold w-36">
                <SortButton
                  field="testType"
                  label="Test Type"
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                />
              </th>
              <th className="w-24 px-5 py-3 font-semibold text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTests.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                  No data available
                </td>
              </tr>
            ) : (
              sortedTests.map((t, idx) => (
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
