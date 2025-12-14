import React, { useCallback, useEffect, useState } from "react";
import { getTestsForRounds, updateRoundTestId } from "../../service/api2";
import { toast } from "react-toastify";

const transformTestData = (item) => ({
  id: item.testId || item.id,
  name: item.testName || item.name || "Unnamed test",
  totalQuestions: item.numberOfQuestions || item.totalQuestions || 0,
  status: item.status || "active",
  testType: item.testType || "Practical",
});

const StatusBadge = ({ status }) => {
  const map = {
    active: {
      text: "Active",
      cls: "bg-green-100 text-green-700 border-green-200",
    },
    draft: {
      text: "Draft",
      cls: "bg-amber-100 text-amber-700 border-amber-200",
    },
    archived: {
      text: "Archived",
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
  roundId,
  onRefresh,
}) => {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingTestId, setUpdatingTestId] = useState(null);
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
        const message = response.error || "Unable to fetch test list";
        setError(message);
        toast.error(message);
      }
    } catch (err) {
      setTests([]);
      const message = err.message || "Unable to fetch test list";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [testType]);

  useEffect(() => {
    if (isOpen && testType) {
      fetchTests();
    } else if (isOpen && !testType) {
      setTests([]);
      const message = "Please select a round to view the test list";
      setError(message);
      toast.error(message);
    }
  }, [isOpen, testType, fetchTests]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Select Test</h2>
            <p className="mt-1 text-sm text-white/90">
              List of active tests for the round
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto max-h-[70vh] space-y-4">
          {isLoading && (
            <div className="py-10 text-sm text-center text-slate-500">
              Loading test list...
            </div>
          )}

          {!isLoading && error && (
            <div className="px-4 py-3 text-sm text-red-600 border border-red-200 rounded-xl bg-red-50">
              {error}
            </div>
          )}

          {!isLoading && !error && tests.length === 0 && (
            <div className="py-10 text-sm text-center text-slate-500">
              No matching tests found.
            </div>
          )}

          {!isLoading &&
            !error &&
            tests.map((test) => (
              <div
                key={test.id}
                className={`rounded-2xl border px-5 py-4 transition duration-200 ${selectedTestId === test.id
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
                      onClick={async () => {
                        if (!roundId) {
                          const message = "Round ID not found";
                          setError(message);
                          toast.error(message);
                          return;
                        }
                        setIsUpdating(true);
                        setUpdatingTestId(test.id);
                        setError(null);
                        try {
                          const result = await updateRoundTestId(
                            roundId,
                            test.id
                          );
                          console.log("Result: ", result);
                          if (result.success) {
                            toast.success(
                              "Successfully updated test for the round"
                            );
                            onSelectTest?.(test);
                            onClose?.();
                            // Refresh lại filter thay vì reload trang
                            if (onRefresh) {
                              onRefresh();
                            }
                          } else {
                            const message =
                              result.error ||
                              "Unable to update test for round";
                            setError(message);
                            toast.error(message);
                          }
                        } catch (err) {
                          const message =
                            err.message ||
                            "Unable to update test for round";
                          setError(message);
                          toast.error(message);
                        } finally {
                          setIsUpdating(false);
                          setUpdatingTestId(null);
                        }
                      }}
                      disabled={isUpdating && updatingTestId === test.id}
                      className="px-4 py-2 text-sm font-medium text-white transition bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpdating && updatingTestId === test.id
                        ? "Updating..."
                        : "Select this test"}
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 mt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-slate-500">Number of questions</p>
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
