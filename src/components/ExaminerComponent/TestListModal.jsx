import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getTests } from "../../service/api2";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa6";
import { formatDate } from "../../config/formatDate";

const transformTestData = (item) => ({
  id: item.testId || item.id,
  code: item.joinCode || `TEST-${item.testId || item.id}`,
  name: item.testName || item.name || "Đề thi chưa có tên",
  description: item.purpose || item.description || "Không có mô tả",
  duration: item.durationInMinutes || item.duration || 0,
  totalQuestions: item.totalQuestions || 0,
  createdAt: item.createdAt || new Date().toISOString(),
  status: item.status || "active",
  testType: item.testType || "Practical",
  maxScore: item.maxScore ?? 0,
});

const StatusBadge = ({ status }) => {
  const map = {
    active: {
      text: "Đang sử dụng",
      cls: "bg-green-100 text-green-700 border-green-200",
    },
    draft: {
      text: "Bản nháp",
      cls: "bg-amber-100 text-amber-700 border-amber-200",
    },
    archived: {
      text: "Đã lưu trữ",
      cls: "bg-slate-100 text-slate-600 border-slate-200",
    },
  };
  const cfg = map[status] || map.active;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${cfg.cls}`}
    >
      {cfg.text}
    </span>
  );
};

const TestTypeBadge = ({ testType }) => {
  if (!testType) return null;
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
      {testType}
    </span>
  );
};

const TestListModal = ({ isOpen, onClose, onSelectTest, selectedTestId }) => {
  const PAGE_SIZE = 5;
  const [tests, setTests] = useState([]);
  const [codeVisibility, setCodeVisibility] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: PAGE_SIZE,
    totalRecords: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const normalizeResponseItems = (data) => {
    if (!data) return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return data.items ? data.items : [];
  };

  const fetchTests = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getTests(page, PAGE_SIZE);
        if (response.success) {
          const rawTests = normalizeResponseItems(response.data);
          setTests(rawTests.map(transformTestData));

          const nextPageSize = response.data?.pageSize || PAGE_SIZE;
          const nextTotalRecords =
            response.data?.totalRecords ?? rawTests.length ?? 0;
          const derivedTotalPages = Math.max(
            response.data?.totalPages ||
              Math.ceil(nextTotalRecords / nextPageSize) ||
              1,
            1
          );

          setPagination(() => ({
            currentPage: response.data?.currentPage || page,
            pageSize: nextPageSize,
            totalRecords: nextTotalRecords,
            totalPages: derivedTotalPages,
            hasNextPage:
              response.data?.hasNextPage ??
              (response.data?.currentPage || page) < derivedTotalPages,
            hasPreviousPage:
              response.data?.hasPreviousPage ??
              (response.data?.currentPage || page) > 1,
          }));
        } else {
          setTests([]);
          setError(response.error || "Không thể lấy danh sách đề thi");
        }
      } catch (err) {
        setTests([]);
        setError(err.message || "Không thể lấy danh sách đề thi");
      } finally {
        setIsLoading(false);
      }
    },
    [PAGE_SIZE]
  );

  useEffect(() => {
    if (isOpen) {
      fetchTests(1);
    }
  }, [isOpen, fetchTests]);

  const totalItems = useMemo(
    () =>
      pagination.totalRecords > 0 ? pagination.totalRecords : tests.length,
    [pagination.totalRecords, tests.length]
  );
  const totalPages = useMemo(
    () =>
      pagination.totalPages > 0
        ? pagination.totalPages
        : Math.max(
            Math.ceil(totalItems / (pagination.pageSize || PAGE_SIZE)) || 1,
            1
          ),
    [pagination.totalPages, totalItems, pagination.pageSize]
  );

  const displayStart =
    (pagination.currentPage - 1) * (pagination.pageSize || PAGE_SIZE) + 1;
  const displayEnd = Math.min(
    pagination.currentPage * (pagination.pageSize || PAGE_SIZE),
    totalItems
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchTests(newPage);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i += 1) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    if (pagination.currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, pagination.currentPage - 1);
    const end = Math.min(totalPages - 1, pagination.currentPage + 1);

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (pagination.currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Chọn đề thi
            </h2>
            <p className="text-sm text-slate-500">
              Danh sách đề thi đang hoạt động cho vòng kiểm tra
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[70vh] space-y-4">
          {isLoading && (
            <div className="py-10 text-sm text-center text-slate-500">
              Đang tải danh sách đề thi...
            </div>
          )}

          {!isLoading && error && (
            <div className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
              {error}
            </div>
          )}

          {!isLoading && !error && tests.length === 0 && (
            <div className="py-10 text-sm text-center text-slate-500">
              Chưa có đề thi nào phù hợp.
            </div>
          )}

          {!isLoading &&
            !error &&
            tests.map((test) => (
              <div
                key={test.id}
                className={`rounded-2xl border px-5 py-4 transition duration-200 ${
                  selectedTestId === test.id
                    ? "border-indigo-400 bg-indigo-50/70"
                    : "border-slate-200 hover:border-indigo-200"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {test.name}
                      </h3>
                      <StatusBadge status={test.status} />
                      <TestTypeBadge testType={test.testType} />
                    </div>
                    <p className="mt-2 text-sm text-slate-600">
                      {test.description}
                    </p>
                  </div>
                  {onSelectTest && (
                    <button
                      onClick={() => onSelectTest(test)}
                      className="px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
                    >
                      Chọn đề này
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 mt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Mã đề thi</p>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold tracking-widest text-slate-900">
                        {codeVisibility[test.id]
                          ? test.code
                          : "•".repeat(Math.min(test.code.length, 8))}
                      </p>
                      <button
                        type="button"
                        className="transition text-slate-500 hover:text-slate-700"
                        onClick={() =>
                          setCodeVisibility((prev) => ({
                            ...prev,
                            [test.id]: !prev[test.id],
                          }))
                        }
                      >
                        {codeVisibility[test.id] ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-500">Thời gian</p>
                    <p className="font-semibold text-slate-900">
                      {test.duration} phút
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Số câu hỏi</p>
                    <p className="font-semibold text-slate-900">
                      {test.totalQuestions || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Điểm tối đa</p>
                    <p className="font-semibold text-slate-900">
                      {test.maxScore}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-xs text-slate-500">
                  Tạo ngày {formatDate(test.createdAt)}
                </div>
              </div>
            ))}
        </div>

        {!isLoading && tests.length > 0 && totalPages > 1 && (
          <div className="px-6 py-3 border-t border-slate-200">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <div className="text-sm text-slate-600">
                Hiển thị {displayStart}-{displayEnd} / {totalItems} đề thi
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPreviousPage}
                  className="px-3 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-2 text-slate-500"
                      >
                        ...
                      </span>
                    ) : (
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
                    )
                  )}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 text-sm font-medium transition-colors bg-white border rounded-lg text-slate-700 border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestListModal;
