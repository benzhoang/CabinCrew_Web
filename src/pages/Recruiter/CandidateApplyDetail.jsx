import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { t, onLangChange } from "../../i18n";
import { toast } from "react-toastify";
import { getApplicationById, screeningApprove } from "../../service/api";
import { formatDateFromAPI } from "../../config/formatDate";

const normalizeGender = (value) => {
  if (value === null || value === undefined) return "";
  const genderStr = String(value).toLowerCase();
  if (["male", "m", "1"].includes(genderStr)) return "male";
  if (["female", "f", "0", "2"].includes(genderStr)) return "female";
  return genderStr;
};

const formatMeasurement = (value, unit) => {
  if (value === null || value === undefined || value === "") return "";
  return `${value}${unit}`;
};

const getDocumentDisplayName = (document) => {
  if (!document) return "";
  if (typeof document === "string") return document;
  return (
    document.name ||
    document.title ||
    document.documentName ||
    document.url?.split("/").pop() ||
    "Document"
  );
};

const getDocumentUrl = (document) => {
  if (!document) return "";
  // Nếu document là string, xử lý các trường hợp URL tuyệt đối (Cloudinary, S3, v.v.)
  if (typeof document === "string") {
    const trimmed = document.trim();
    // Nếu đã là full URL (http/https) thì trả về nguyên vẹn
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // Nếu là path tuyệt đối trên backend thì dùng luôn
    if (trimmed.startsWith("/")) {
      return trimmed;
    }
    // Còn lại thì coi như file nội bộ trong hệ thống
    return `/documents/${trimmed}`;
  }
  // Nếu là object thì ưu tiên field url/documentURL
  return document.url || document.documentURL || "";
};

const mapDocumentsFromApi = (documents = []) => {
  if (!Array.isArray(documents)) return {};
  const mapped = {};

  documents.forEach((doc) => {
    if (!doc) return;
    const normalizedType = (doc.type || "").toLowerCase();
    const normalizedName = (
      doc.name ||
      doc.title ||
      doc.documentName ||
      doc.documentURL?.split("/").pop() ||
      "Document"
    ).trim();
    const fileInfo = {
      name: normalizedName,
      url: doc.documentURL || doc.url || "",
      type: normalizedType,
      uploadDate: doc.uploadDate || doc.createdDate,
    };

    if (
      normalizedType.includes("application") ||
      normalizedType.includes("form")
    ) {
      mapped.applicationForm = fileInfo;
    } else if (
      normalizedType.includes("profile") ||
      normalizedType.includes("photo")
    ) {
      mapped.profilePhoto = fileInfo;
    } else if (
      normalizedType.includes("education") ||
      normalizedType.includes("degree") ||
      normalizedType.includes("diploma")
    ) {
      mapped.educationDegree = fileInfo;
    } else if (
      normalizedType.includes("english") ||
      normalizedType.includes("certificate") ||
      normalizedType.includes("toeic")
    ) {
      mapped.englishCertificate = fileInfo;
    } else if (
      normalizedType.includes("passport") ||
      normalizedType.includes("id") ||
      normalizedType.includes("identification") ||
      normalizedType.includes("card")
    ) {
      const hasBackSideIndicator =
        normalizedType.includes("back") ||
        normalizedName.toLowerCase().includes("back");
      mapped[hasBackSideIndicator ? "idCardBack" : "idCard"] = fileInfo;
    } else {
      const fallbackKey = doc.documentId
        ? `document_${doc.documentId}`
        : `document_${Object.keys(mapped).length + 1}`;
      mapped[fallbackKey] = fileInfo;
    }
  });

  return mapped;
};

const buildCandidateProfile = (apiData, fallback = {}) => {
  const fallbackData = fallback || {};

  if (!apiData) {
    return fallbackData ? { ...fallbackData } : null;
  }

  const documentsFromApi = mapDocumentsFromApi(apiData.documents);
  const mergedDocuments = {
    ...(fallbackData.documents || {}),
    ...documentsFromApi,
  };

  return {
    id: apiData.applicationId ?? fallbackData.id,
    activityId: apiData.activityId ?? fallbackData.activityId,
    email: apiData.email ?? fallbackData.email ?? "",
    fullName: apiData.fullName ?? fallbackData.fullName ?? "",
    nationality: apiData.nationality ?? fallbackData.nationality ?? "other",
    dateOfBirth: apiData.dateOfBirth ?? fallbackData.dateOfBirth ?? "",
    gender: normalizeGender(apiData.gender) || fallbackData.gender || "",
    mobileNumber: apiData.phoneNumber ?? fallbackData.mobileNumber ?? "",
    workingExperience:
      apiData.experience ?? fallbackData.workingExperience ?? "",
    height: apiData.height ?? fallbackData.height ?? "",
    weight: apiData.weight ?? fallbackData.weight ?? "",
    bmi: apiData.bmi ?? fallbackData.bmi ?? "",
    englishCertificate:
      apiData.englishDegreeNumber ?? fallbackData.englishCertificate ?? "",
    certificateExpireDate:
      apiData.endDate ?? fallbackData.certificateExpireDate ?? "",
    basePreference: apiData.basePreference ?? fallbackData.basePreference ?? "",
    termsAccepted: apiData.termsAccepted ?? fallbackData.termsAccepted ?? "",
    status: apiData.status?.toLowerCase() ?? fallbackData.status ?? "pending",
    appliedDate: apiData.submissionDate ?? fallbackData.appliedDate ?? "",
    currentRound:
      apiData.currentRound ?? fallbackData.currentRound ?? "screening",
    listeningScore:
      apiData.listeningScore ?? fallbackData.listeningScore ?? null,
    readingScore: apiData.readingScore ?? fallbackData.readingScore ?? null,
    totalScore: apiData.totalScore ?? fallbackData.totalScore ?? null,
    englishTestDate:
      apiData.englishTestDate ?? fallbackData.englishTestDate ?? "",
    citizenId: apiData.citizenId ?? fallbackData.citizenId ?? "",
    documents: mergedDocuments,
  };
};

const DOCUMENT_SECTIONS = [
  { key: "applicationForm", label: "VJC-PD-FRM-12 Form Job Application" },
  { key: "profilePhoto", label: "Profile Photo 4x6cm" },
  { key: "educationDegree", label: "Education Degree" },
  { key: "englishCertificate", label: "English Certificate" },
  {
    key: "idCard",
    label: "ID Card / Passport",
    getValue: (docs) => docs.idCard || docs.idCardBack,
  },
];

// Timeline constants & helpers (reused from RecruitmentStages but simplified: no action buttons)
const LINE_START_PERCENT = 5;
const LINE_END_PERCENT = 95;
const AXIS_SEGMENTS = 4;
const TIMELINE_HEIGHT = 240;
const BASELINE_Y = 110;
const BRANCH_OFFSET = 70;

const stageAxisPositionMap = {
  screening: 0,
  appearance: 1,
  "english-listening": 2,
  "english-speaking": 2,
  interview: 3,
  final: 4,
};

const defaultStageTemplates = [
  {
    id: "screening",
    name: "Screening",
    nameEn: "Screening",
  },
  {
    id: "appearance",
    name: "Appearance",
    nameEn: "Appearance",
  },
  {
    id: "english-listening",
    name: "English Listening Test",
    nameEn: "English Listening Test",
  },
  {
    id: "english-speaking",
    name: "English Speaking Test",
    nameEn: "English Speaking Test",
  },
  {
    id: "interview",
    name: "Interview",
    nameEn: "Interview",
  },
  {
    id: "final",
    name: "Final",
    nameEn: "Final",
  },
];

const normalizeText = (text) => (text || "").toLowerCase().trim();

const normalizeStageId = (stageValue) => {
  const text = normalizeText(stageValue);
  if (!text) return null;

  if (text.includes("screening")) return "screening";
  // Map Flight Hour Confirmation vào cùng vị trí với English Listening Test trên timeline
  if (text.includes("flight") || text.includes("hour"))
    return "english-listening";
  if (text.includes("appearance") || text.includes("grooming"))
    return "appearance";
  if (text.includes("listening")) return "english-listening";
  // Practical Test được gắn với English Speaking Test
  if (text.includes("speaking") || text.includes("practical"))
    return "english-speaking";
  if (text.includes("interview")) return "interview";
  if (text.includes("final")) return "final";

  return null;
};

const isStageReached = (stage, index, currentStage) => {
  if (!stage || typeof index !== "number") return false;
  if (stage.completed) return true;
  return index + 1 <= currentStage;
};

const getProgressPercentage = (timeline) => {
  if (!timeline || !timeline.stages || AXIS_SEGMENTS === 0) return 0;

  const completedPositions = timeline.stages
    .filter((stage) => stage.completed)
    .map((stage) => stageAxisPositionMap[stage.templateId])
    .filter((pos) => typeof pos === "number");

  const completedMax =
    completedPositions.length > 0 ? Math.max(...completedPositions) : 0;

  let currentPosition = completedMax;
  if (
    timeline.currentStage > 0 &&
    timeline.currentStage <= timeline.stages.length
  ) {
    const currentStageData = timeline.stages[timeline.currentStage - 1];
    if (currentStageData) {
      const axisPos = stageAxisPositionMap[currentStageData.templateId];
      if (typeof axisPos === "number") {
        currentPosition = axisPos;
      }
    }
  }

  const furthest = Math.max(completedMax, currentPosition);
  return (furthest / AXIS_SEGMENTS) * 100;
};

const getAxisPercent = (templateId) => {
  const axisPos = stageAxisPositionMap[templateId];
  if (typeof axisPos !== "number") return LINE_START_PERCENT;
  return (
    LINE_START_PERCENT +
    (LINE_END_PERCENT - LINE_START_PERCENT) * (axisPos / AXIS_SEGMENTS)
  );
};

const getStagePositionStyle = (templateId) => {
  const verticalOffset =
    templateId === "english-listening"
      ? -BRANCH_OFFSET
      : templateId === "english-speaking"
        ? BRANCH_OFFSET
        : 0;

  return {
    left: `${getAxisPercent(templateId)}%`,
    top: `${BASELINE_Y + verticalOffset}px`,
    transform: "translate(-50%, -50%)",
  };
};

const isStageFailed = (stage, overallStatus) => {
  const statusText = normalizeText(stage?.status);
  if (
    ["failed", "fail", "rejected", "not passed", "did not pass"].some(
      (keyword) => statusText.includes(keyword)
    )
  ) {
    return true;
  }
  const appStatus = normalizeText(overallStatus);
  return (
    ["failed", "rejected"].some((keyword) => appStatus.includes(keyword)) &&
    stage.isCurrent
  );
};

const getStageColor = (stage, currentStage, stageIndex, overallStatus) => {
  if (isStageFailed(stage, overallStatus)) {
    return "bg-red-500 text-white";
  }
  if (stage.completed) {
    return "bg-green-500 text-white";
  }
  if (stageIndex + 1 === currentStage) {
    return "bg-yellow-500 text-white";
  }
  return "bg-gray-300 text-gray-600";
};

const getStageIcon = (stage, currentStage, stageIndex, overallStatus) => {
  if (isStageFailed(stage, overallStatus)) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.95a1 1 0 10-1.414-1.414L10 7.758 7.879 5.636a1 1 0 00-1.414 1.414L8.586 9l-2.121 2.121a1 1 0 101.414 1.414L10 10.414l2.121 2.121a1 1 0 001.414-1.414L11.414 9l2.122-2.121z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (stage.completed) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
  if (stageIndex + 1 === currentStage) {
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );
};

// Build timeline data với stage hiện tại linh hoạt theo vòng đang xem
const buildTimelineForCandidate = (candidate, forcedStageId) => {
  if (!candidate) return null;

  const fallbackStage = normalizeStageId(candidate.currentRound) || "screening";
  const currentStageId = forcedStageId || fallbackStage || "screening";
  const currentStageIndex = Math.max(
    defaultStageTemplates.findIndex((t) => t.id === currentStageId),
    0
  );
  const overallStatus = normalizeText(candidate.status || "pending");
  const isPassedFinal = [
    "passed",
    "accepted",
    "approved",
    "completed",
    "success",
  ].some((k) => overallStatus.includes(k));
  const isFailedFinal = ["failed", "rejected"].some((k) =>
    overallStatus.includes(k)
  );

  const stages = defaultStageTemplates.map((template, index) => {
    const isFinal = template.id === "final";
    const isCurrent = index === currentStageIndex;
    const completedBefore = index < currentStageIndex;

    let completed = completedBefore;
    let status = completed
      ? "Completed"
      : isCurrent
        ? "In Progress"
        : "Pending";

    return {
      templateId: template.id,
      name: template.name,
      nameEn: template.nameEn,
      completed: isFinal ? (isCurrent ? isPassedFinal : completed) : completed,
      isCurrent,
      status: isFinal
        ? isCurrent
          ? isFailedFinal
            ? "Failed"
            : isPassedFinal
              ? "Completed"
              : "In Progress"
          : status
        : status,
      date: null,
    };
  });

  return {
    stages,
    currentStage: currentStageIndex + 1,
  };
};

const CandidateApplyDetail = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // 'approve' | 'reject' | null
  const [, setLangVersion] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeApplicationId } = useParams();
  const candidateFromState = location.state?.candidate || null;
  const viewingRound = location.state?.viewingRound || null;
  const batchData = location.state?.batchData || null;

  const derivedStageId =
    normalizeStageId(
      viewingRound?.stageId || viewingRound?.roundName || viewingRound?.roundId
    ) ||
    normalizeStageId(candidate?.currentRound) ||
    normalizeStageId(
      candidateFromState?.currentRound || candidateFromState?.roundName
    ) ||
    "screening";

  const applicationTimeline = buildTimelineForCandidate(
    candidate,
    derivedStageId
  );

  // Ưu tiên dùng tên vòng từ dữ liệu truyền vào (ví dụ: "Flight Hour Confirmation", "Practical Test")
  const currentStageName =
    viewingRound?.roundName ||
    viewingRound?.stageName ||
    viewingRound?.stageId?.toString().replace(/-/g, " ") ||
    defaultStageTemplates.find((stage) => stage.id === derivedStageId)?.name ||
    "Screening";

  const normalizedStatus = normalizeText(candidate?.status);
  const isOngoingStatus = [
    "pending",
    "ongoing",
    "in progress",
    "processing",
  ].some((s) => normalizedStatus.includes(s) || normalizedStatus === s);

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchCandidate = async () => {
      const applicationId =
        routeApplicationId ||
        candidateFromState?.applicationId ||
        candidateFromState?.id;

      if (!applicationId) {
        setError(
          "Application ID not found. Please go back to the list and try again."
        );
        if (candidateFromState) {
          setCandidate(candidateFromState);
        }
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getApplicationById(applicationId);
        if (!isMounted) return;

        if (response.success) {
          setCandidate((prev) =>
            buildCandidateProfile(
              response.data,
              candidateFromState || prev || {}
            )
          );
        } else {
          setError(response.error || "Unable to load application information.");
          setCandidate((prev) => prev || candidateFromState || null);
        }
      } catch (fetchError) {
        if (!isMounted) return;
        console.error("Error loading candidate information:", fetchError);
        setError("An error occurred while loading application information.");
        setCandidate((prev) => prev || candidateFromState || null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCandidate();

    return () => {
      isMounted = false;
    };
  }, [routeApplicationId, candidateFromState]);

  const goBack = () => {
    // Quay về danh sách ứng viên với thông tin batch
    // Lấy campaignRoundId từ nhiều nguồn có thể
    const campaignRoundId =
      batchData?.batch?.id ||
      batchData?.batch?.campaignRoundId ||
      batchData?.campaignRoundId ||
      location.state?.campaignRoundId ||
      candidate?.activityId; // fallback nếu không có trong batchData

    if (batchData && campaignRoundId) {
      navigate(`/recruiter/applications/${campaignRoundId}`, {
        state: batchData,
      });
    } else if (campaignRoundId) {
      navigate(`/recruiter/applications/${campaignRoundId}`);
    } else {
      // Fallback nếu không có campaignRoundId
      navigate(`/recruiter/applications/`);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Ongoing" },
      passed: { color: "bg-green-100 text-green-800", text: "Approved" },
      failed: { color: "bg-red-100 text-red-800", text: "Rejected" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const formatted = formatDateFromAPI(dateString);
    return formatted || "—";
  };

  const getWorkingExperienceText = (experience) => {
    const experienceMap = {
      "no-experience": "No experience",
      "less-than-1-year": "Less than 1 year",
      "1-2-years": "1-2 years",
      "3-5-years": "3-5 years",
    };
    return experienceMap[experience] || experience || "—";
  };

  const getBasePreferenceText = (preference) => {
    const preferenceMap = {
      flexible: "Flexible base",
      "cam-ranh": "Cam Ranh (CXR)",
      "da-nang": "Da Nang (DAD)",
    };
    return preferenceMap[preference] || preference || "—";
  };

  const getRoundText = (round) => {
    const roundMap = {
      screening: "Screening",
      grooming: "Appearance",
      test: "English Test",
      interview: "Interview",
      final: "Final Result",
    };
    return roundMap[round] || "Screening";
  };

  const rounds = [
    { key: "screening", label: "Kiểm tra hồ sơ" },
    { key: "grooming", label: "Kiểm tra ngoại hình" },
    { key: "test", label: "Kiểm tra tiếng Anh" },
    { key: "interview", label: "Phỏng vấn" },
    { key: "final", label: "Kết quả cuối cùng" },
  ];

  const getRoundIndex = (roundKey) =>
    rounds.findIndex((r) => r.key === roundKey);

  const handleViewDocument = (documentSource) => {
    const documentUrl = getDocumentUrl(documentSource);
    if (!documentUrl) {
      toast.error("Document URL not found.");
      return;
    }
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  const handleApprove = async () => {
    if (!candidate?.activityId) {
      toast.error("Activity ID not found. Please try again.");
      return;
    }

    setActionLoading(true);
    try {
      const result = await screeningApprove(candidate.activityId, 2); // 2 = Passed
      if (result.success) {
        toast.success("Application approved successfully!");
        // Cập nhật trạng thái candidate
        setCandidate((prev) => ({
          ...prev,
          status: "approved",
        }));
        // Có thể navigate về trang trước hoặc reload
        goBack();
      } else {
        toast.error(
          result.error || "Unable to approve application. Please try again."
        );
      }
    } catch (error) {
      console.error("Error approving application:", error);
      toast.error(
        "An error occurred while approving application. Please try again."
      );
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleReject = async () => {
    if (!candidate?.activityId) {
      toast.error("Activity ID not found. Please try again.");
      return;
    }

    setActionLoading(true);
    try {
      const result = await screeningApprove(candidate.activityId, 3); // 3 = Failed
      if (result.success) {
        toast.success("Application rejected successfully!");
        // Cập nhật trạng thái candidate
        setCandidate((prev) => ({
          ...prev,
          status: "rejected",
        }));
        // Có thể navigate về trang trước hoặc reload
        goBack();
      } else {
        toast.error(
          result.error || "Unable to reject application. Please try again."
        );
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      toast.error(
        "An error occurred while rejecting application. Please try again."
      );
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">
            Candidate information not found
          </h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <button
            onClick={goBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
              <h1 className="text-2xl font-bold text-slate-800">
                Candidate Profile - {currentStageName}
              </h1>
              <p className="text-slate-600">Detailed candidate information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - CV and Documents */}
          <div className="space-y-6">
            {/* CV Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                CANDIDATE PROFILE
              </h3>

              {/* Profile Photo */}
              <div className="text-center mb-6">
                <div className="w-32 h-40 mx-auto bg-slate-100 rounded-lg overflow-hidden mb-4 border-2 border-slate-300 shadow-sm">
                  <img
                    src={
                      getDocumentUrl(candidate?.documents?.profilePhoto) ||
                      "https://via.placeholder.com/128x160/cccccc/666666?text=4x6"
                    }
                    alt="4x6 Photo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/128x160/cccccc/666666?text=4x6";
                    }}
                  />
                </div>
                <p className="text-slate-600">Cabin Crew Candidate</p>
                <div className="mt-2">{getStatusBadge(candidate.status)}</div>
              </div>
            </div>

            {/* Uploaded Documents */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">
                UPLOADED DOCUMENTS
              </h3>

              <div className="space-y-4">
                {DOCUMENT_SECTIONS.map((section) => {
                  const docs = candidate?.documents || {};
                  const documentData = section.getValue
                    ? section.getValue(docs)
                    : docs[section.key];

                  return (
                    <div key={section.key}>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {section.label}
                      </label>
                      <div className="border border-slate-300 rounded-lg p-4 bg-slate-50">
                        {documentData ? (
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-6 h-6 text-green-600"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span className="text-green-600 font-medium">
                              {getDocumentDisplayName(documentData)}
                            </span>
                            <button
                              onClick={() => handleViewDocument(documentData)}
                              className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500">No file</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Application Form Details */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">
              Application Details
            </h2>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      1. Email:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {candidate.email || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      2. Full Name:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {candidate.fullName || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      3. Date of Birth:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {formatDate(candidate.dateOfBirth) || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      4. Gender:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {candidate.gender === "male"
                        ? "Male"
                        : candidate.gender === "female"
                          ? "Female"
                          : "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      5. Phone Number:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {candidate.mobileNumber || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      6. Working Experience:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {getWorkingExperienceText(candidate.workingExperience)}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      7. Height & Weight:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Height (cm)
                        </label>
                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                          {candidate.height || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Weight (kg)
                        </label>
                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                          {candidate.weight || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          BMI
                        </label>
                        <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                          {candidate.bmi || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* English Certificate */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  English Certificate
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {candidate.englishCertificate || "—"}
                    </p>
                    <div className="mt-3 space-y-2">
                      {candidate.readingScore !== null &&
                        candidate.readingScore !== undefined && (
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">
                              Reading score:
                            </label>
                            <p className="text-slate-800 bg-slate-50 p-2 rounded-md text-sm">
                              {candidate.readingScore}
                            </p>
                          </div>
                        )}
                      {candidate.englishTestDate && (
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">
                            English test date:
                          </label>
                          <p className="text-slate-800 bg-slate-50 p-2 rounded-md text-sm">
                            {formatDate(candidate.englishTestDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Total score:
                    </label>
                    <p className="text-slate-800 bg-slate-50 p-3 rounded-md">
                      {candidate.totalScore !== null &&
                        candidate.totalScore !== undefined
                        ? candidate.totalScore
                        : "—"}
                    </p>
                    <div className="mt-3 space-y-2">
                      {candidate.listeningScore !== null &&
                        candidate.listeningScore !== undefined && (
                          <div>
                            <label className="block text-xs text-slate-600 mb-1">
                              Listening score:
                            </label>
                            <p className="text-slate-800 bg-slate-50 p-2 rounded-md text-sm">
                              {candidate.listeningScore}
                            </p>
                          </div>
                        )}
                      <div>
                        <label className="block text-xs text-slate-600 mb-1">
                          Expiration date:
                        </label>
                        <p className="text-slate-800 bg-slate-50 p-2 rounded-md text-sm">
                          {formatDate(candidate.certificateExpireDate) || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Recruiter Actions */}
              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b border-slate-200 pb-2">
                  Application Review Actions
                </h3>
                {derivedStageId === "screening" && isOngoingStatus && (
                  <div className="flex flex-wrap gap-3">
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setConfirmAction("approve")}
                      disabled={actionLoading}
                    >
                      {actionLoading && confirmAction === "approve"
                        ? "Processing..."
                        : "Approve Application"}
                    </button>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => setConfirmAction("reject")}
                      disabled={actionLoading}
                    >
                      {actionLoading && confirmAction === "reject"
                        ? "Processing..."
                        : "Reject Application"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Confirm modal */}
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-[1px]">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 w-full max-w-md p-6">
              <h4 className="text-lg font-semibold text-slate-800 mb-2">
                {confirmAction === "approve"
                  ? "Approve application"
                  : "Reject application"}
              </h4>
              <p className="text-sm text-slate-600 mb-6">
                {confirmAction === "approve"
                  ? "Are you sure you want to approve this application?"
                  : "Are you sure you want to reject this application?"}
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm"
                  onClick={() => setConfirmAction(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm text-white font-medium ${confirmAction === "approve"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  onClick={
                    confirmAction === "approve" ? handleApprove : handleReject
                  }
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateApplyDetail;
