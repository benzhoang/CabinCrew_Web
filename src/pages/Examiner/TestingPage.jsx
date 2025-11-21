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
import EditTestModal from "../../components/ExaminerComponent/EditTestModal";
import { exportQuestionTemplate } from "./ExportQuestionTemplate";

// Transform data từ API sang format của component
const transformTestData = (item) => {
  const getStatusFromTestType = (testType) => {
    return "active";
  };

  return {
    id: item.testId || item.id,
    code: item.joinCode || `TEST-${item.testId || item.id}`,
    name: item.testName || item.name || "Đề thi chưa có tên",
    description: item.purpose || item.description || "Không có mô tả",
    duration: item.durationInMinutes || item.duration || 0,
    totalQuestions: 0,
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
      text: "Đang sử dụng",
    },
    draft: {
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
      text: "Bản nháp",
    },
    archived: {
      cls: "bg-slate-100 text-slate-700 border-slate-200",
      text: "Đã lưu trữ",
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
    "Cơ bản": "bg-blue-100 text-blue-700",
    "Trung cấp": "bg-indigo-100 text-indigo-700",
    "Nâng cao": "bg-purple-100 text-purple-700",
    "Chuyên ngành": "bg-orange-100 text-orange-700",
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

// Helper function để format date an toàn
const formatDate = (dateValue) => {
  if (!dateValue) return "Không có thông tin";

  try {
    // Nếu đã là format "dd/MM/yyyy" hoặc "dd/MM/yyyy HH:mm" thì dùng trực tiếp
    if (typeof dateValue === "string" && dateValue.includes("/")) {
      return dateValue.split(" ")[0]; // Lấy phần date nếu có cả time
    }

    // Parse date
    const date = new Date(dateValue);

    // Kiểm tra xem date có hợp lệ không
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }

    // Format thành "dd/MM/yyyy"
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch (err) {
    console.error("Error formatting date:", err);
    return "Ngày không hợp lệ";
  }
};

const TestingPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingTestId, setDeletingTestId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [codeVisibility, setCodeVisibility] = useState({}); // Tracks visibility for each test code
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
          setError(response.error || "Không thể lấy danh sách đề thi");
        }
      } catch (err) {
        setTests([]);
        setError(err.message || "Không thể lấy danh sách đề thi");
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [pagination.currentPage, pagination.pageSize]
  );

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const filteredTests = useMemo(() => {
    // Nếu có pagination từ server (totalPages > 1), chỉ filter trên trang hiện tại
    // Vì filter nên được thực hiện ở server-side
    if (pagination.totalPages > 1) {
      return tests.filter((test) => {
        const matchesSearch =
          test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          test.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
          statusFilter === "all" || test.status === statusFilter;
        const matchesLevel =
          levelFilter === "all" || test.level === levelFilter;
        return matchesSearch && matchesStatus && matchesLevel;
      });
    }
    // Nếu không có pagination, filter toàn bộ
    return tests.filter((test) => {
      const matchesSearch =
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || test.status === statusFilter;
      const matchesLevel = levelFilter === "all" || test.level === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [tests, searchTerm, statusFilter, levelFilter, pagination.totalPages]);

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
    // Đợi một chút để đảm bảo backend đã xử lý xong, sau đó reload danh sách đề thi
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fetchTests(pagination.currentPage, pagination.pageSize, false);
  };

  const handleSaveTest = async (formData, responseData) => {
    // Lưu selectedTest ID trước khi nó bị reset
    const testIdToUpdate = selectedTest?.id;

    // Cập nhật test trong state với dữ liệu mới từ response nếu có
    if (responseData && testIdToUpdate) {
      setTests((prevTests) =>
        prevTests.map((test) =>
          test.id === testIdToUpdate ? transformTestData(responseData) : test
        )
      );
    }
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) return;
    setDeletingTestId(testId);
    setError(null);
    try {
      const response = await deleteTest(testId);
      if (response.success) {
        // Loại bỏ test khỏi state ngay lập tức
        setTests((prev) => prev.filter((test) => test.id !== testId));
        // Tải lại danh sách để đồng bộ với server
        await fetchTests(pagination.currentPage, pagination.pageSize, true);
        alert(response.message || "Xóa đề thi thành công");
      } else {
        setError(response.error || "Không thể xóa đề thi");
        alert(response.error || "Không thể xóa đề thi");
        // Nếu xóa thất bại, tải lại danh sách để khôi phục trạng thái
        await fetchTests(pagination.currentPage, pagination.pageSize, true);
      }
    } catch (err) {
      setError(err.message || "Không thể xóa đề thi");
      alert(err.message || "Không thể xóa đề thi");
      // Tải lại danh sách nếu có lỗi để khôi phục trạng thái
      await fetchTests(pagination.currentPage, pagination.pageSize, true);
    } finally {
      setDeletingTestId(null);
    }
  };

  const handleViewTest = (testId) => {
    navigate(`/examiner/testing/${testId}`);
  };

  const handleCreateTest = () => {
    navigate("/examiner/testing/create");
  };

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
            Quản lý đề thi tiếng Anh
          </h2>
          <p className="text-slate-600">
            Danh sách các đề thi tiếng Anh đã tạo
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateTest}
            className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
          >
            <FiPlus className="w-5 h-5" />
            Tạo đề thi mới
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã đề thi..."
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang sử dụng</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-700">
              Mức độ
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tất cả</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Nâng cao">Nâng cao</option>
              <option value="Chuyên ngành">Chuyên ngành</option>
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
          <div className="p-12 text-center">
            <FiLoader className="w-16 h-16 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-lg font-medium text-slate-600">
              Đang tải danh sách đề thi...
            </p>
          </div>
        ) : filteredTests.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="mb-2 text-lg font-medium text-slate-600">
              {tests.length === 0
                ? "Chưa có đề thi nào"
                : "Không tìm thấy đề thi nào"}
            </p>
            <p className="text-sm text-slate-500">
              {tests.length === 0
                ? "Hãy tạo đề thi mới để bắt đầu"
                : "Thử thay đổi bộ lọc hoặc tạo đề thi mới"}
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
                        <span className="text-slate-500">Mã đề thi:</span>
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
                              codeVisibility[test.id] ? "Ẩn mã" : "Hiện mã"
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
                        <span className="text-slate-500">Thời gian:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.duration} phút
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Số câu hỏi:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.totalQuestions}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Điểm tối đa:</span>
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
                            File âm thanh:
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
                      Tạo: {formatDate(test.createdAt)}
                      {test.createdBy && (
                        <>
                          {" "}
                          bởi{" "}
                          <span className="font-medium">{test.createdBy}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleViewTest(test.id)}
                      className="p-2 text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Xem chi tiết"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditTest(test.id)}
                      className="p-2 text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50"
                      title="Chỉnh sửa"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      disabled={deletingTestId === test.id}
                      className="p-2 text-red-600 transition-colors rounded-lg hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Xóa"
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
            Hiển thị {(pagination.currentPage - 1) * pagination.pageSize + 1} -{" "}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalRecords
            )}{" "}
            / {pagination.totalRecords} đề thi
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
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === pagination.currentPage
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
              Hiển thị {filteredTests.length} / {pagination.totalRecords} đề thi
            </>
          ) : (
            <>Hiển thị {filteredTests.length} đề thi</>
          )}
        </div>
      )}

      <EditTestModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        testData={selectedTest}
        onSave={handleSaveTest}
      />
    </div>
  );
};

export default TestingPage;
