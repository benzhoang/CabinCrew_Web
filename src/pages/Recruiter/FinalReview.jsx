import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { exportFinalReviewExcel } from "./Export & Import/exportFinalReview";
import ImportHauKiemModal from "./Export & Import/ImportHauKiemModal";
import {
  getCampaignRoundById,
  getRoundParticipants,
  exportRoundUsers,
} from "../../service/api";
import { toast } from "react-toastify";
import { formatDateFromAPI } from "../../config/formatDate";

const FinalReview = () => {
  const { campaignRoundId } = useParams();
  const [candidates, setCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingRoundInfo, setLoadingRoundInfo] = useState(false);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 5,
    totalPages: 0,
    totalRecords: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [finalRoundId, setFinalRoundId] = useState(null);
  const [campaignId, setCampaignId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const batchData = location.state?.batch;
  const resolvedCampaignRoundId = useMemo(
    () => campaignRoundId || batchData?.campaignRoundId || batchData?.id,
    [campaignRoundId, batchData]
  );

  // Khởi tạo campaignId từ location.state ngay khi component mount
  useEffect(() => {
    const initialCampaignId =
      location.state?.campaignId || batchData?.campaignId;
    if (initialCampaignId) {
      setCampaignId(initialCampaignId);
    }
  }, [location.state, batchData]);

  useEffect(() => {
    if (!resolvedCampaignRoundId) {
      setFinalRoundId(null);
      setFetchError(
        "Cannot find recruitment batch information to determine Final round."
      );
      return;
    }

    const fetchRoundInfo = async () => {
      setLoadingRoundInfo(true);
      setFetchError(null);
      try {
        const result = await getCampaignRoundById(resolvedCampaignRoundId);
        if (result.success && result.data) {
          const roundData = result.data;
          const roundsList = Array.isArray(roundData.rounds)
            ? roundData.rounds
            : [];

          // Lưu campaignId từ nhiều nguồn
          const fetchedCampaignId =
            location.state?.campaignId ||
            roundData.campaignId ||
            batchData?.campaignId ||
            null;
          if (fetchedCampaignId) {
            setCampaignId(fetchedCampaignId);
          }

          // Tìm round có roundName là 'Final'
          let finalRound =
            roundsList.find(
              (round) => round.roundName?.toLowerCase() === "final"
            ) || null;

          // Fallback: nếu bản thân round hiện tại là Final
          if (!finalRound && roundData.roundName?.toLowerCase() === "final") {
            finalRound = {
              roundId:
                roundData.roundId ||
                roundData.campaignRoundId ||
                resolvedCampaignRoundId,
              roundName: roundData.roundName,
            };
          }

          if (finalRound?.roundId) {
            setFinalRoundId(finalRound.roundId);
          } else {
            setFinalRoundId(null);
            setFetchError(
              "Could not find a Final round in this recruitment batch."
            );
          }
        } else {
          setFinalRoundId(null);
          setFetchError(
            result.error || "Unable to load recruitment batch information."
          );
        }
      } catch (error) {
        setFinalRoundId(null);
        setFetchError(
          error.message || "Unable to load recruitment batch information."
        );
      } finally {
        setLoadingRoundInfo(false);
      }
    };

    fetchRoundInfo();
  }, [resolvedCampaignRoundId]);

  useEffect(() => {
    if (!finalRoundId) {
      setCandidates([]);
      setPagination({
        currentPage: 1,
        pageSize: 5,
        totalPages: 0,
        totalRecords: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      return;
    }

    const fetchParticipants = async (page = 1) => {
      setLoadingCandidates(true);
      setFetchError(null);
      try {
        // Chuẩn bị params cho API call
        const apiParams = {
          roundName: "Final",
          page: page,
          pageSize: pagination.pageSize,
        };

        // Thêm status filter nếu không phải "all"
        if (statusFilter !== "all") {
          apiParams.status = parseInt(statusFilter, 10);
        }

        const result = await getRoundParticipants(finalRoundId, apiParams);
        if (result.success && Array.isArray(result.data)) {
          const mappedCandidates = result.data.map((participant) => ({
            id: participant.userId || participant.activityId,
            activityId: participant.activityId || 0,
            userId: participant.userId || 0,
            name: participant.fullName || "",
            email: participant.email || "",
            phone: participant.phoneNumber || "",
            photo: participant.imgURL || "",
            status: participant.status?.toLowerCase() || "pending",
            roundId: participant.roundId || finalRoundId,
            roundName: participant.roundName || "Final",
            appliedDate:
              participant.appliedDate || new Date().toISOString().split("T")[0],
            education: participant.education || "",
            experience: participant.experience || "",
            batchName: batchData?.name || participant.roundName || "Final",
            campaignId: batchData?.campaignId || participant.campaignId || 0,
            raw: participant,
          }));
          setCandidates(mappedCandidates);

          // Cập nhật pagination info từ API response
          if (result.pagination) {
            setPagination((prev) => ({
              ...result.pagination,
              pageSize: result.pagination.pageSize || prev.pageSize,
            }));
          } else {
            // Fallback khi API không trả về pagination
            setPagination((prev) => ({
              ...prev,
              currentPage: page,
              totalPages: 0,
              totalRecords: mappedCandidates.length,
              hasNextPage: false,
              hasPreviousPage: page > 1,
            }));
          }
        } else {
          setCandidates([]);
          setPagination({
            currentPage: 1,
            pageSize: 5,
            totalPages: 0,
            totalRecords: 0,
            hasNextPage: false,
            hasPreviousPage: false,
          });
          setFetchError(result.error || "Unable to load candidate list.");
        }
      } catch (error) {
        setCandidates([]);
        setPagination({
          currentPage: 1,
          pageSize: 5,
          totalPages: 0,
          totalRecords: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        });
        setFetchError(error.message || "Unable to load candidate list.");
      } finally {
        setLoadingCandidates(false);
      }
    };

    // Reset về trang 1 khi filter thay đổi
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    fetchParticipants(1);
  }, [finalRoundId, batchData, statusFilter]);

  // Filter candidates
  const filteredCandidates = useMemo(() => {
    // Bắt đầu từ toàn bộ danh sách, không auto lọc chỉ approved/rejected
    let filtered = [...candidates];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (candidate) =>
          candidate.name.toLowerCase().includes(q) ||
          candidate.email.toLowerCase().includes(q) ||
          candidate.phone.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((candidate) => {
        const candidateStatus = String(candidate.status || "").toLowerCase();
        // Map status values: 1 = ongoing, 2 = passed, 3 = failed
        const statusMap = {
          "1": ["1", "ongoing", "pending"],
          "2": ["2", "passed", "approved"],
          "3": ["3", "failed", "rejected"],
        };
        const statusValues = statusMap[statusFilter] || [];
        return statusValues.some(
          (val) => candidateStatus === val.toLowerCase()
        );
      });
    }

    return filtered;
  }, [candidates, searchTerm, statusFilter]);

  const getStatusBadge = (status) => {
    const normalized = status ? String(status).toLowerCase() : "";
    const statusConfig = {
      passed: { color: "bg-green-100 text-green-800", text: "Passed" },
      failed: { color: "bg-red-100 text-red-800", text: "Failed" },
      ongoing: { color: "bg-yellow-100 text-yellow-800", text: "Ongoing" },
    };
    const config = statusConfig[normalized] || statusConfig.ongoing;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const [showImport, setShowImport] = useState(false);

  const handleExport = async () => {
    if (!finalRoundId) {
      toast.error("Round ID not found to export.");
      return;
    }

    try {
      const result = await exportRoundUsers(finalRoundId);
      if (!result?.success) {
        toast.error(result?.error || "Export users failed.");
      }
    } catch (error) {
      console.error("Error calling API export-users:", error);
      toast.error("An error occurred while exporting users.");
    }
  };

  const handleImport = () => {
    setShowImport(true);
  };

  const handleBack = () => {
    // Get campaignId from state or location.state
    const effectiveCampaignId =
      campaignId || location.state?.campaignId || batchData?.campaignId;
    if (effectiveCampaignId) {
      navigate(`/recruiter/campaigns/${effectiveCampaignId}`, {
        state: batchData,
      });
    } else if (batchData) {
      navigate(`/recruiter/campaigns`, { state: batchData });
    } else {
      navigate("/recruiter/campaigns");
    }
  };

  // Helper function to get formatted date
  const getFormattedDate = (dateValue, fallbackValue) => {
    if (dateValue) {
      return formatDateFromAPI(dateValue);
    }
    if (fallbackValue) {
      return formatDateFromAPI(fallbackValue);
    }
    return "—";
  };

  const handlePageChange = async (page) => {
    // Kiểm tra page hợp lệ
    if (page === pagination.currentPage) return;
    if (pagination.totalPages && page > pagination.totalPages) return;
    if (page > pagination.currentPage && !pagination.hasNextPage) return;
    if (page < pagination.currentPage && !pagination.hasPreviousPage) return;
    if (page < 1) return;

    if (!finalRoundId) return;

    setLoadingCandidates(true);
    setFetchError(null);
    try {
      // Chuẩn bị params cho API call
      const apiParams = {
        roundName: "Final",
        page: page,
        pageSize: pagination.pageSize,
      };

      // Thêm status filter nếu không phải "all"
      if (statusFilter !== "all") {
        apiParams.status = parseInt(statusFilter, 10);
      }

      const result = await getRoundParticipants(finalRoundId, apiParams);
      if (result.success && Array.isArray(result.data)) {
        const mappedCandidates = result.data.map((participant) => ({
          id: participant.userId || participant.activityId,
          activityId: participant.activityId || 0,
          userId: participant.userId || 0,
          name: participant.fullName || "",
          email: participant.email || "",
          phone: participant.phoneNumber || "",
          photo: participant.imgURL || "",
          status: participant.status?.toLowerCase() || "pending",
          roundId: participant.roundId || finalRoundId,
          roundName: participant.roundName || "Final",
          appliedDate:
            participant.appliedDate || new Date().toISOString().split("T")[0],
          education: participant.education || "",
          experience: participant.experience || "",
          batchName: batchData?.name || participant.roundName || "Final",
          campaignId: batchData?.campaignId || participant.campaignId || 0,
          raw: participant,
        }));
        setCandidates(mappedCandidates);

        // Cập nhật pagination info từ API response
        if (result.pagination) {
          setPagination((prev) => ({
            ...result.pagination,
            pageSize: result.pagination.pageSize || prev.pageSize,
          }));
        } else {
          // Fallback khi API không trả về pagination
          setPagination((prev) => ({
            ...prev,
            currentPage: page,
            totalPages: 0,
            totalRecords: mappedCandidates.length,
            hasNextPage: false,
            hasPreviousPage: page > 1,
          }));
        }
      } else {
        setFetchError(result.error || "Unable to load candidate list.");
      }
    } catch (error) {
      setFetchError(error.message || "Unable to load candidate list.");
    } finally {
      setLoadingCandidates(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="text-white bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="px-6 py-6 mx-auto max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 transition-colors rounded-lg hover:bg-white/10"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-extrabold md:text-3xl">
                  Final Review
                </h1>
                <p className="mt-1 text-sm text-white/90">
                  List of candidates with final results
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Batch Info */}
        {batchData && (
          <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              Batch information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <span className="text-sm text-slate-600">Batch name:</span>
                <p className="font-medium text-slate-800">{batchData.name}</p>
              </div>
              <div>
                <span className="text-sm text-slate-600">Start Date:</span>
                <p className="font-medium text-slate-800">
                  {getFormattedDate(
                    batchData.startDate,
                    batchData.time?.split(" - ")[0]
                  )}
                </p>
              </div>
              <div>
                <span className="text-sm text-slate-600">End Date:</span>
                <p className="font-medium text-slate-800">
                  {getFormattedDate(
                    batchData.endDate,
                    batchData.time?.split(" - ")[1]
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="p-6 mb-6 bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-600">
                Filter by status:
              </label>
              <select
                className="px-3 py-2 text-sm border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="1">Ongoing</option>
                <option value="2">Passed</option>
                <option value="3">Failed</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  className="w-full py-2 pr-3 text-sm border rounded-md border-slate-300 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg
                  className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 mt-4 border-t border-slate-200">
            <button
              onClick={handleImport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Import
            </button>
            <button
              onClick={handleExport}
              disabled={!finalRoundId}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
              Export
            </button>
            <a
              href="https://iigvietnam.com/thong-bao-ve-dich-vu-hau-kiem-toeic/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
            >
              Template
            </a>
          </div>
        </div>

        {/* Candidates List */}
        <div className="overflow-hidden bg-white border shadow-sm rounded-xl border-slate-200">
          {fetchError && (
            <div className="px-6 py-3 text-sm text-red-700 border-b border-red-100 bg-red-50">
              {fetchError}
            </div>
          )}
          <div className="p-6 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800">
              Candidate list ({filteredCandidates.length})
            </h3>
          </div>

          {loadingCandidates ? (
            <div className="py-12 text-center">
              <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-600">
                Loading candidate list...
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                        Photo 4x6
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                        User
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredCandidates.map((candidate) => (
                      <tr key={candidate.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-16 h-20 overflow-hidden rounded-md bg-slate-100">
                            <img
                              src={
                                candidate.photo ||
                                "https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo"
                              }
                              alt={`Ảnh ${candidate.name}`}
                              className="object-cover w-full h-full"
                              onError={(e) => {
                                e.target.src =
                                  "https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo";
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {candidate.name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-slate-900">
                            {candidate.email || "—"}
                          </div>
                          <div className="text-sm text-slate-500">
                            {candidate.phone || "—"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(candidate.status)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                          <button
                            className="px-3 py-1 text-blue-600 transition-colors rounded hover:text-blue-900 hover:bg-blue-50"
                            onClick={() =>
                              navigate(
                                `/final-review/candidate/${candidate.activityId}`,
                                {
                                  state: { candidate, batchData },
                                }
                              )
                            }
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredCandidates.length === 0 && (
                <div className="p-12 text-center">
                  <p className="text-slate-500">
                    No candidates have final results yet
                  </p>
                </div>
              )}

              {/* Pagination */}
              {!loadingCandidates && filteredCandidates.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Page <span className="font-semibold">{pagination.currentPage}</span>
                    {pagination.totalPages ? (
                      <>
                        {" "}
                        / <span className="font-semibold">{pagination.totalPages}</span>
                      </>
                    ) : null}
                    {typeof pagination.totalRecords === "number" && (
                      <span className="ml-2">({pagination.totalRecords} records)</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPreviousPage}
                      className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasPreviousPage
                        ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        }`}
                    >
                      Previous
                    </button>

                    <span className="text-sm text-slate-600">
                      {pagination.currentPage}
                    </span>

                    <button
                      type="button"
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasNextPage
                        ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                        : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"
                        }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ImportHauKiemModal
        open={showImport}
        onClose={() => setShowImport(false)}
        roundId={finalRoundId}
        campaignRoundId={resolvedCampaignRoundId}
        campaignId={campaignId}
        batchData={batchData}
      />
    </div>
  );
};

export default FinalReview;
