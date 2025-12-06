import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getInterviewResults } from "../../service/api";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPassLabel = (flag) => {
  if (flag === true) return "Đạt";
  if (flag === false) return "Rớt";
  return "—";
};

const getResultColorClass = (flag) => {
  if (flag === true) return "text-green-600 font-semibold";
  if (flag === false) return "text-red-600 font-semibold";
  return "text-gray-700";
};

const getStatusBadge = (flag) => {
  if (flag === true) {
    return "bg-green-100 text-green-800";
  }
  if (flag === false) {
    return "bg-red-100 text-red-700";
  }
  return "bg-gray-100 text-gray-700";
};

const CabinCrewInterviewResultPage = () => {
  const { activityId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);

  const fetchResults = useCallback(async () => {
    if (!activityId) {
      setError("Không tìm thấy mã hoạt động để tra cứu kết quả.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getInterviewResults(activityId);

      if (response.success) {
        // Đảm bảo data là một mảng
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setResults(dataArray);
        setError(null);
      } else {
        setError(
          response.error || "Không thể tải danh sách kết quả phỏng vấn."
        );
        setResults([]);
      }
    } catch (err) {
      console.error("Load interview results error:", err);
      setError("Đã xảy ra lỗi khi tải dữ liệu.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="min-h-screen py-6 bg-gray-50">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Kết quả phỏng vấn</h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            Quay lại
          </button>
        </div>

        <div className="p-4 bg-white rounded-lg shadow">
          {loading && (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-600">Đang tải...</p>
            </div>
          )}

          {!loading && error && (
            <div className="py-8 text-center">
              <svg
                className="w-10 h-10 mx-auto text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v4m0 4h.01M5.455 19h13.09c1.54 0 2.5-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.723 16c-.768 1.333.193 3 1.732 3z"
                />
              </svg>
              <p className="mt-2 text-sm font-semibold text-gray-900">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchResults}
                className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Thử lại
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {results.length === 0 ? (
                <div className="py-8 text-center">
                  <svg
                    className="w-10 h-10 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm font-medium text-gray-900">
                    Chưa có kết quả phỏng vấn
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Không tìm thấy kết quả phỏng vấn nào cho hoạt động này.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.map((result, index) => (
                    <div
                      key={result.evaluationId || index}
                      className="p-4 transition-shadow border border-gray-200 rounded-lg hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(
                              result?.isPassed
                            )}`}
                          >
                            {getPassLabel(result?.isPassed)}
                          </span>
                          {result?.roundName && (
                            <span className="text-xs text-gray-500">
                              Vòng: {result.roundName}
                            </span>
                          )}
                          {result?.finalScore !== undefined &&
                            result?.finalScore !== null && (
                              <span className="text-xs font-medium text-gray-700">
                                Điểm: {result.finalScore}
                              </span>
                            )}
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/detail-result/${result.evaluationId}`)
                          }
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          Xem chi tiết →
                        </button>
                      </div>

                      <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <div className="p-2 rounded bg-gray-50">
                          <dt className="text-xs text-gray-500">Mã đánh giá</dt>
                          <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                            {result?.evaluationId ?? "—"}
                          </dd>
                        </div>
                        <div className="p-2 rounded bg-gray-50">
                          <dt className="text-xs text-gray-500">Thí sinh</dt>
                          <dd className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                            {result?.candidate || "—"}
                          </dd>
                        </div>
                        <div className="p-2 rounded bg-gray-50">
                          <dt className="text-xs text-gray-500">Giám khảo</dt>
                          <dd className="text-sm font-semibold text-gray-900 mt-0.5 truncate">
                            {result?.examiner || "—"}
                          </dd>
                        </div>
                        <div className="p-2 rounded bg-gray-50">
                          <dt className="text-xs text-gray-500">
                            Ngày đánh giá
                          </dt>
                          <dd className="text-sm font-semibold text-gray-900 mt-0.5">
                            {formatDateTime(result?.evaluatedDate)}
                          </dd>
                        </div>
                      </dl>

                      {result?.comment && (
                        <div className="pt-3 mt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {result.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CabinCrewInterviewResultPage;
