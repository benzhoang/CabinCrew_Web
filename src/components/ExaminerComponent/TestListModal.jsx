import React, { useCallback, useEffect, useState } from "react";
import { getTestsForRounds } from "../../service/api2";

const transformTestData = (item) => ({
  id: item.testId || item.id,
  name: item.testName || item.name || "Đề thi chưa có tên",

  totalQuestions: item.numberOfQuestions || item.totalQuestions || 0,
  status: item.status || "active",
  testType: item.testType || "Practical",
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

const TestListModal = ({
  isOpen,
  onClose,
  onSelectTest,
  selectedTestId,
  testType,
}) => {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const normalizeResponseItems = (data) => {
    if (!data) return [];
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.data)) return data.data;
    return data.items ? data.items : [];
  };

  const fetchTests = useCallback(async () => {
    if (!testType) {
      setTests([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await getTestsForRounds({
        testType: testType,
      });

      if (response.success) {
        const rawTests = normalizeResponseItems(response.data);
        setTests(rawTests.map(transformTestData));
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
  }, [testType]);

  useEffect(() => {
    if (isOpen && testType) {
      fetchTests();
    } else if (isOpen && !testType) {
      setTests([]);
      setError("Vui lòng chọn vòng kiểm tra để xem danh sách đề thi");
    }
  }, [isOpen, testType, fetchTests]);

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
                    <p className="text-slate-500">Số câu hỏi</p>
                    <p className="font-semibold text-slate-900">
                      {test.totalQuestions || 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default TestListModal;
