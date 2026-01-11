import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getInterviewCriterias,
  getInterviewResultDetail,
} from "../../../../service/api";

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getPassLabel = (flag) => {
  if (flag === true) return "Passed";
  if (flag === false) return "Failed";
  return "—";
};

const ExaminerRecruitmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [criteriaMap, setCriteriaMap] = useState({});
  const [criteriaGroups, setCriteriaGroups] = useState([]);

  const fetchResult = useCallback(async () => {
    if (!id) {
      setError("ID not found for result detail lookup.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await getInterviewResultDetail(id);

      if (response.success) {
        setResult(response.data);
        setError(null);
      } else {
        setError(response.error || "Unable to load interview result detail.");
        setResult(null);
      }
    } catch (err) {
      console.error("Load interview result detail error:", err);
      setError("An error occurred while loading data.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchCriterias = useCallback(async () => {
    try {
      const response = await getInterviewCriterias();
      if (response.success) {
        const dataArray = Array.isArray(response.data) ? response.data : [];
        setCriteriaGroups(dataArray);
        const map = {};

        dataArray.forEach((group) => {
          const items = Array.isArray(group?.items) ? group.items : [];
          items.forEach((item) => {
            const key = item?.interviewCriteriaItemId;
            if (key !== undefined && key !== null) {
              map[String(key)] = {
                label: item?.criteria || item?.title || "—",
                description: item?.description || "",
              };
            }
          });
        });

        setCriteriaMap(map);
      } else {
        console.warn("Load interview criterias failed:", response.error);
      }
    } catch (err) {
      console.error("Load interview criterias error:", err);
    }
  }, []);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  useEffect(() => {
    fetchCriterias();
  }, [fetchCriterias]);

  const summaryItems = useMemo(() => {
    const resultBadgeClass =
      result?.isPassed === true
        ? "bg-green-100 text-green-800"
        : result?.isPassed === false
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";

    const benchmarkValue = result?.benchmark !== null && result?.benchmark !== undefined
      ? `${result.benchmark}`
      : "—";

    return [
      { label: "Candidate", value: result?.candidate || "—" },
      { label: "Examiner", value: result?.examiner || "—" },
      { label: "Round", value: result?.roundName || "—" },
      { label: "Benchmark", value: benchmarkValue },
      {
        label: "Evaluation date",
        value: formatDateTime(result?.evaluatedDate),
      },
      {
        label: "Total score",
        value:
          result?.finalScore !== undefined && result?.finalScore !== null
            ? result.finalScore
            : "—",
      },
      {
        label: "Result",
        value: getPassLabel(result?.isPassed),
        valueClass: resultBadgeClass,
        isBadge: true,
      },
      {
        label: "Comments",
        value: result?.comment || "—",
        fullWidth: true,
        isComment: true,
      },
    ];
  }, [result]);

  const interviewResults = useMemo(() => {
    return Array.isArray(result?.interviewResults)
      ? result.interviewResults
      : [];
  }, [result]);

  const interviewResultMap = useMemo(() => {
    const map = {};
    interviewResults.forEach((item) => {
      const key = item?.interviewCriteriaItemId ?? item?.criteria;
      if (key !== undefined && key !== null) {
        map[String(key)] = item;
      }
    });
    return map;
  }, [interviewResults]);

  const knownCriteriaKeys = useMemo(() => {
    const keys = new Set();
    criteriaGroups.forEach((group) => {
      const items = Array.isArray(group?.items) ? group.items : [];
      items.forEach((item) => {
        const key = item?.interviewCriteriaItemId ?? item?.criteria;
        if (key !== undefined && key !== null) {
          keys.add(String(key));
        }
      });
    });
    return keys;
  }, [criteriaGroups]);

  const unmatchedResults = useMemo(() => {
    return interviewResults.filter((item) => {
      const key = item?.interviewCriteriaItemId ?? item?.criteria;
      if (key === undefined || key === null) return true;
      return !knownCriteriaKeys.has(String(key));
    });
  }, [interviewResults, knownCriteriaKeys]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            Candidate Result Detail
          </h1>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm font-medium"
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {loading && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading result details...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-10">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
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
              <p className="mt-3 text-base font-semibold text-gray-900">
                {error}
              </p>
              <button
                type="button"
                onClick={fetchResult}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          )}

          {!loading && !error && result && (
            <div className="space-y-8">
              <section>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {summaryItems.map((item) => (
                    <div
                      key={item.label}
                      className={`bg-gray-50 rounded-lg p-4 ${
                        item.fullWidth ? "sm:col-span-2" : ""
                      }`}
                    >
                      <dt className="text-sm text-gray-500">{item.label}</dt>
                      <dd
                        className={`text-base font-semibold mt-1 ${
                          item.isBadge
                            ? "inline-block"
                            : item.isComment
                            ? "text-gray-600 font-normal whitespace-pre-wrap"
                            : "text-gray-900"
                        }`}
                      >
                        {item.isBadge ? (
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                              item.valueClass || "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item.value || "—"}
                          </span>
                        ) : (
                          <span className={item.valueClass || ""}>
                            {item.value || "—"}
                          </span>
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {result?.comment && (
                <section>
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-1">
                      General comments
                    </h3>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                      {result.comment}
                    </p>
                  </div>
                </section>
              )}

              {criteriaGroups.length > 0 && (
                <section>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Evaluation criteria details
                  </h2>
                  <div className="space-y-6">
                    {criteriaGroups.map((group, groupIndex) => {
                      const items = Array.isArray(group?.items)
                        ? group.items
                        : [];
                      return (
                        <div
                          key={`${group?.title || "group"}-${groupIndex}`}
                          className="overflow-hidden border border-gray-200 rounded-lg"
                        >
                          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {group?.title || `Group ${groupIndex + 1}`}
                            </h3>
                            {group?.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {group.description}
                              </p>
                            )}
                          </div>
                          <table className="min-w-full divide-y divide-gray-200 table-fixed">
                            <colgroup>
                              <col className="w-1/3" />
                              <col className="w-24" />
                              <col className="w-1/3" />
                            </colgroup>
                            <thead className="bg-gray-50">
                              <tr>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                  Criteria
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                  Score
                                </th>
                                <th
                                  scope="col"
                                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                                >
                                  Comment
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {items.length > 0 ? (
                                items.map((criterion, itemIndex) => {
                                  const key =
                                    criterion?.interviewCriteriaItemId ??
                                    criterion?.criteria ??
                                    `${groupIndex}-${itemIndex}`;
                                  const resultItem =
                                    interviewResultMap[String(key)] || {};
                                  const mapInfo =
                                    criteriaMap[
                                      String(criterion?.interviewCriteriaItemId)
                                    ] || {};
                                  return (
                                    <tr key={`${key}-${itemIndex}`}>
                                      <td className="px-4 py-3 text-sm">
                                        <div className="font-semibold text-gray-900">
                                          {mapInfo.label ||
                                            criterion?.criteria ||
                                            "—"}
                                        </div>
                                        {(criterion?.description ||
                                          mapInfo.description) && (
                                          <p className="text-xs text-gray-500 mt-1">
                                            {criterion?.description ||
                                              mapInfo.description}
                                          </p>
                                        )}
                                      </td>
                                      <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                                        {resultItem.score !== undefined &&
                                        resultItem.score !== null
                                          ? resultItem.score
                                          : "—"}
                                      </td>
                                      <td className="px-4 py-3 text-sm text-gray-600">
                                        {resultItem.comment || "—"}
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td
                                    colSpan="3"
                                    className="px-4 py-4 text-center text-sm text-gray-500"
                                  >
                                    No criteria in this group.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {criteriaGroups.length === 0 && interviewResults.length > 0 && (
                <section>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <colgroup>
                        <col className="w-1/2" />
                        <col className="w-24" />
                        <col className="w-1/2" />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Criteria
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Comment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {interviewResults.map((item, index) => (
                          <tr key={item.interviewCriteriaItemId || index}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {criteriaMap[
                                String(item?.interviewCriteriaItemId)
                              ]?.label ??
                                item?.criteria ??
                                item?.interviewCriteriaItemId ??
                                "—"}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                              {item.score !== undefined && item.score !== null
                                ? item.score
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.comment || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {unmatchedResults.length > 0 && criteriaGroups.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    Other criteria
                  </h3>
                  <div className="overflow-hidden border border-gray-200 rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 table-fixed">
                      <colgroup>
                        <col className="w-1/2" />
                        <col className="w-24" />
                        <col className="w-1/2" />
                      </colgroup>
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Criteria
                          </th>
                          <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Comment
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {unmatchedResults.map((item, index) => (
                          <tr key={`unmatched-${index}`}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {item?.criteria ||
                                item?.interviewCriteriaItemId ||
                                "—"}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-center">
                              {item.score !== undefined && item.score !== null
                                ? item.score
                                : "—"}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {item.comment || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {criteriaGroups.length === 0 && interviewResults.length === 0 && (
                <section>
                  <div className="text-center py-8">
                    <svg
                      className="mx-auto h-10 w-10 text-gray-400"
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
                      No evaluation criteria details available
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminerRecruitmentDetailPage;
