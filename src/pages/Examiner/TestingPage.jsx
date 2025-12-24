import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiLoader,
  FiMusic,
  FiExternalLink,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
} from "react-icons/fi";
import { getTests, deleteTest } from "../../service/api";
import { getTestTypes } from "../../service/api2";
import EditTestModal from "../../components/ExaminerComponent/EditTestModal";
import { exportQuestionTemplate } from "./ExportQuestionTemplate";

// Transform data from API to component format
const transformTestData = (item) => {
  const getStatusFromTestType = (testType) => {
    return "active";
  };

  return {
    id: item.testId || item.id,
    code: item.joinCode || `TEST-${item.testId || item.id}`,
    name: item.testName || item.name || "Untitled test",
    description: item.purpose || item.description || "No description",
    duration: item.durationInMinutes || item.duration || 0,
    totalQuestions: item.totalQuestions || 0,
    createdAt: item.createdAt || new Date().toISOString(),
    status: getStatusFromTestType(item.testType),
    usageCount: 0,
    testType: item.testType,
    maxScore: item.maxScore,
    audioFileURL: item.audioFileURL,
  };
};

const StatusBadge = ({ status }) => {
  const map = {
    active: {
      cls: "bg-green-100 text-green-700 border-green-200",
      text: "Active",
    },
    draft: {
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
      text: "Draft",
    },
    archived: {
      cls: "bg-slate-100 text-slate-700 border-slate-200",
      text: "Archived",
    },
  };
  const cfg = map[status] || map.draft;
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}
    >
      {cfg.text}
    </span>
  );
};

const LevelBadge = ({ level }) => {
  const map = {
    Basic: "bg-blue-100 text-blue-700",
    Intermediate: "bg-indigo-100 text-indigo-700",
    Advanced: "bg-purple-100 text-purple-700",
    Specialized: "bg-orange-100 text-orange-700",
  };
  const cls = map[level] || "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {level}
    </span>
  );
};

const TestTypeBadge = ({ testType }) => {
  if (!testType) return null;
  const map = {
    listening: "bg-cyan-100 text-cyan-700",
    speaking: "bg-pink-100 text-pink-700",
    reading: "bg-emerald-100 text-emerald-700",
    writing: "bg-amber-100 text-amber-700",
  };
  const type = testType.toLowerCase();
  let cls = "bg-gray-100 text-gray-700";
  if (type.includes("listening") || type.includes("nghe"))
    cls = map["listening"];
  else if (type.includes("speaking") || type.includes("nói"))
    cls = map["speaking"];
  else if (type.includes("reading") || type.includes("đọc"))
    cls = map["reading"];
  else if (type.includes("writing") || type.includes("viết"))
    cls = map["writing"];
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {testType}
    </span>
  );
};

// Helper to safely format date
const formatDate = (dateValue) => {
  if (!dateValue) return "No data";
  try {
    // If already "dd/MM/yyyy" or "dd/MM/yyyy HH:mm" keep it
    if (typeof dateValue === "string" && dateValue.includes("/")) {
      return dateValue.split(" ")[0]; // take date part if time exists
    }
    // Parse date
    const date = new Date(dateValue);
    // Validate date
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    // Format "dd/MM/yyyy"
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Invalid date";
  }
};

const TestingPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("all");
  const [testTypes, setTestTypes] = useState([]);
  const [isLoadingTestTypes, setIsLoadingTestTypes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingTestId, setDeletingTestId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [codeVisibility, setCodeVisibility] = useState({}); // Tracks visibility for each test code
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Toggle visibility for a specific test code
  const toggleCodeVisibility = (testId) => {
    setCodeVisibility((prev) => ({
      ...prev,
      [testId]: !prev[testId],
    }));
  };

  const fetchTests = useCallback(
    async (page = null, pageSize = null, showLoading = true) => {
      const currentPage = page !== null ? page : pagination.currentPage;
      const currentPageSize =
        pageSize !== null ? pageSize : pagination.pageSize;
      if (showLoading) setIsLoading(true);
      setError(null);
      try {
        const response = await getTests(currentPage, currentPageSize);
        if (response.success) {
          let items = [];
          if (response.data?.items && Array.isArray(response.data.items)) {
            items = response.data.items;
            setPagination((prev) => ({
              currentPage: response.data.currentPage,
              pageSize: response.data.pageSize || prev.pageSize,
              totalRecords: response.data.totalRecords || 0,
              totalPages: response.data.totalPages || 0,
              hasNextPage: response.data.hasNextPage || false,
              hasPreviousPage: response.data.hasPreviousPage || false,
            }));
          } else if (Array.isArray(response.data)) {
            items = response.data;
          } else if (response.data && typeof response.data === "object") {
            items = response.data.items || [response.data];
          }
          const transformedTests = items.map(transformTestData);
          setTests(transformedTests);
        } else {
          setTests([]);
          setError(response.error || "Unable to fetch tests");
        }
      } catch (err) {
        setTests([]);
        setError(err.message || "Unable to fetch tests");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [pagination.currentPage, pagination.pageSize]
  );

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Fetch test types from API
  useEffect(() => {
    const fetchTestTypes = async () => {
      setIsLoadingTestTypes(true);
      try {
        const response = await getTestTypes();
        if (response.success && Array.isArray(response.data)) {
          const mapped = response.data
            .map((item) => {
              const id =
                item?.testTypeId ?? item?.id ?? item?.code ?? item?.value;
              const name =
                item?.testTypeName ??
                item?.name ??
                item?.typeName ??
                item?.label ??
                "";
              if (!id || !name) return null;
              return { id, name };
            })
            .filter(Boolean);
          setTestTypes(mapped);
        } else {
          setTestTypes([]);
        }
      } catch (err) {
        console.error("Error fetching test types:", err);
        setTestTypes([]);
      } finally {
        setIsLoadingTestTypes(false);
      }
    };
    fetchTestTypes();
  }, []);

  const filteredTests = useMemo(() => {
    const normalize = (val) =>
      (val || "").toString().trim().toLowerCase().replace(/\s+/g, "");

    const filterBy = (collection) =>
      collection.filter((test) => {
        const testName = normalize(test.name);
        const testCode = normalize(test.code);
        const testDesc = normalize(test.description);
        const term = normalize(searchTerm);
        const matchesSearch =
          testName.includes(term) ||
          testCode.includes(term) ||
          testDesc.includes(term);

        // Filter by test type - compare with testTypeName
        const matchesType =
          testTypeFilter === "all" ||
          (test.testType &&
            normalize(test.testType).includes(normalize(testTypeFilter)));

        return matchesSearch && matchesType;
      });

    // Filter ideally server-side; apply client-side when needed
    if (pagination.totalPages > 1) {
      return filterBy(tests);
    }
    return filterBy(tests);
  }, [tests, searchTerm, testTypeFilter, pagination.totalPages]);

  const handleEditTest = (testId) => {
    const test = tests.find((t) => t.id === testId);
    if (test) {
      setSelectedTest(test);
      setIsEditModalOpen(true);
    }
  };

  const handleCloseEditModal = async () => {
    setIsEditModalOpen(false);
    setSelectedTest(null);
    // Delay to ensure backend finishes, then reload list
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fetchTests(pagination.currentPage, pagination.pageSize, false);
  };

  const handleSaveTest = async (formData, responseData) => {
    // Save selectedTest ID before reset
    const testIdToUpdate = selectedTest?.id;
    // Update state with latest response data if available
    if (responseData && testIdToUpdate) {
      setTests((prevTests) =>
        prevTests.map((test) =>
          test.id === testIdToUpdate ? transformTestData(responseData) : test
        )
      );
    }
  };

  const handleDeleteTest = async (testId) => {
    setDeletingTestId(testId);
    setError(null);
    try {
      const response = await deleteTest(testId);
      if (response.success) {
        // Remove locally first
        setTests((prev) => prev.filter((test) => test.id !== testId));
        // Reload to sync with server
        await fetchTests(pagination.currentPage, pagination.pageSize, true);
        showToast(response.message || "Deleted test successfully", "success");
      } else {
        setError(response.error || "Unable to delete test");
        showToast(response.error || "Unable to delete test", "error");
        // Reload to restore state on failure
        await fetchTests(pagination.currentPage, pagination.pageSize, true);
      }
    } catch (err) {
      setError(err.message || "Unable to delete test");
      showToast(err.message || "Unable to delete test", "error");
      // Reload on error to restore state
      await fetchTests(pagination.currentPage, pagination.pageSize, true);
    } finally {
      setDeletingTestId(null);
      setConfirmDeleteId(null);
    }
  };

  const handleViewTest = (testId) => {
    navigate(`/examiner/testing/${testId}`);
  };

  const handleCreateTest = () => {
    navigate("/examiner/testing/create");
  };

  const openConfirmDelete = (testId) => {
    setConfirmDeleteId(testId);
  };

  const closeConfirmDelete = () => {
    setConfirmDeleteId(null);
  };

  const showToast = useCallback((message, type = "success") => {
    setToast({ visible: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTests(newPage, pagination.pageSize, true);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Show last page
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-800">
            Manage English Tests
          </h2>
          <p className="text-slate-600">List of available English tests</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateTest}
            className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
          >
            <FiPlus className="w-5 h-5" />
            Create new test
          </button>
          <button
            type="button"
            onClick={exportQuestionTemplate}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-700 border border-indigo-200 rounded-lg bg-indigo-50 hover:bg-indigo-100"
          >
            <FiFileText className="w-4 h-4 mr-2" />
            Export Template
          </button>
        </div>
      </div>

      <div className="p-4 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Search
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name"
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Test type
            </label>
            <select
              value={testTypeFilter}
              onChange={(e) => setTestTypeFilter(e.target.value)}
              disabled={isLoadingTestTypes}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="all">All</option>
              {testTypes.map((type) => (
                <option key={type.id} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-6 border border-red-200 bg-red-50 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="bg-white border shadow-sm rounded-xl border-slate-200">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-sm text-gray-600">Loading test list...</p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="mb-2 text-lg font-medium text-slate-600">
              {tests.length === 0
                ? "No tests available yet"
                : "No tests match your filters"}
            </p>
            <p className="text-sm text-slate-500">
              {tests.length === 0
                ? "Create a new test to get started"
                : "Try adjusting filters or create a new test"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="p-5 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {test.name}
                      </h3>
                      <StatusBadge status={test.status} />
                      <LevelBadge level={test.level} />
                      {test.testType && (
                        <TestTypeBadge testType={test.testType} />
                      )}
                    </div>
                    <p className="mb-3 text-sm text-slate-600">
                      {test.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div className="flex items-center">
                        <span className="text-slate-500">Test code:</span>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="font-medium text-slate-800">
                            {codeVisibility[test.id]
                              ? test.code
                              : "•".repeat(test.code.length)}
                          </span>
                          <button
                            onClick={() => toggleCodeVisibility(test.id)}
                            className="text-slate-500 hover:text-slate-700"
                            title={
                              codeVisibility[test.id]
                                ? "Hide code"
                                : "Show code"
                            }
                          >
                            {codeVisibility[test.id] ? (
                              <FiEyeOff className="w-4 h-4" />
                            ) : (
                              <FiEye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Duration:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.duration} minutes
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Questions:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.totalQuestions}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Max score:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.maxScore || 0}
                        </span>
                      </div>
                    </div>
                    {test.audioFileURL && (
                      <div className="mt-3">
                        <div className="flex items-center gap-2">
                          <FiMusic className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-500">
                            Audio file:
                          </span>
                          <a
                            href={test.audioFileURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                          >
                            <span className="max-w-xs truncate">
                              {test.audioFileURL}
                            </span>
                            <FiExternalLink className="flex-shrink-0 w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="mt-3 text-xs text-slate-500">
                      Created: {formatDate(test.createdAt)}
                      {test.createdBy && (
                        <>
                          {" "}
                          by{" "}
                          <span className="font-medium">{test.createdBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleViewTest(test.id)}
                      className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="View detail"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditTest(test.id)}
                      className="p-2 text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                      title="Edit"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => openConfirmDelete(test.id)}
                      disabled={deletingTestId === test.id}
                      className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      {deletingTestId === test.id ? (
                        <FiLoader className="w-5 h-5 animate-spin" />
                      ) : (
                        <FiTrash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 mt-6 sm:flex-row">
          <div className="text-sm text-slate-600">
            Showing {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalRecords
            )}{" "}
            / {pagination.totalRecords} tests
          </div>

          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              className="px-3 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              {getPageNumbers().map((page, index) => {
                if (page === "...") {
                  return (
                    <span
                      key={`ellipsis-${index}`}
                      className="px-2 text-slate-500"
                    >
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${page === pagination.currentPage
                      ? "bg-indigo-600 text-white"
                      : "text-slate-700 bg-white border border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="px-3 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {!isLoading && pagination.totalPages <= 1 && (
        <div className="mt-4 text-sm text-slate-600">
          {pagination.totalRecords > 0 ? (
            <>
              Showing {filteredTests.length} / {pagination.totalRecords} tests
            </>
          ) : (
            <>Showing {filteredTests.length} tests</>
          )}
        </div>
      )}

      <EditTestModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        testData={selectedTest}
        onSave={handleSaveTest}
      />

      {/* Confirm Delete Popup */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-white/40 backdrop-blur-[1px]"
            onClick={closeConfirmDelete}
          />
          <div className="relative z-10 w-full max-w-sm p-6 bg-white border rounded-xl shadow-xl border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Delete this test?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Are you sure you want to delete this test? This action cannot be
              undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={closeConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border rounded-lg border-slate-300 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTest(confirmDeleteId)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={!!deletingTestId}
              >
                {deletingTestId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.visible &&
        (() => {
          const toastType = (toast.type || "success").toString().toLowerCase();
          // Mặc định xanh, chỉ đỏ khi type là "error"
          const isSuccess = toastType !== "error";
          return (
            <div className="fixed right-4 top-4 z-50">
              <div
                className={`min-w-[260px] px-4 py-3 rounded-lg shadow-lg border text-sm font-medium ${isSuccess
                  ? "bg-green-50 text-red-800 border-red-200"
                  : "bg-red-50 text-green-700 border-green-200"
                  }`}
              >
                {toast.message}
              </div>
            </div>
          );
        })()}
    </div>
  );
};

export default TestingPage;
