import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { onLangChange } from "../../i18n";
import { getApplicationById } from "../../service/api2";
import { toast } from "react-toastify";

const normalizeGender = (value) => {
  if (value === null || value === undefined) return "";
  const genderStr = String(value).toLowerCase();
  if (["male", "m", "1"].includes(genderStr)) return "male";
  if (["female", "f", "0", "2"].includes(genderStr)) return "female";
  return genderStr;
};

const getDocumentDisplayName = (document) => {
  if (!document) return "";
  if (typeof document === "string") return document;
  return (
    document.name ||
    document.title ||
    document.documentName ||
    document.documentURL?.split("/").pop() ||
    "Document"
  );
};

const getDocumentUrl = (document) => {
  if (!document) return "";
  if (typeof document === "string") return `/documents/${document}`;
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
    totalFlightHours:
      apiData.totalFlightHours ?? fallbackData.totalFlightHours ?? null,
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

const normalizeText = (text) => (text || "").toLowerCase().trim();

const normalizeStageId = (stageValue) => {
  const text = normalizeText(stageValue);
  if (!text) return null;

  if (text.includes("screening")) return "screening";
  // Map Flight Hour Confirmation vào cùng vị trí với English Listening Test
  if (text.includes("flight") || text.includes("hour")) return "flight-hours";
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

const getRoundText = (round) => {
  const roundMap = {
    screening: "Screening",
    grooming: "Appearance",
    test: "English Test",
    interview: "Interview",
    final: "Final Result",
    "flight-hours": "Flight Hours Confirmation",
    "english-listening": "English Listening Test",
    "english-speaking": "English Speaking Test",
  };
  return roundMap[round] || "Screening";
};

const AirlineCandidateDetailPage = () => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, setLangVersion] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: routeApplicationId } = useParams();
  const candidateFromState = location.state?.candidate || null;
  const batchData = location.state?.batchData || null;
  const viewingRound = location.state?.viewingRound || null;

  // Xác định stage ID từ viewingRound hoặc candidate.currentRound
  const derivedStageId =
    normalizeStageId(
      viewingRound?.stageId || viewingRound?.roundName || viewingRound?.roundId
    ) ||
    normalizeStageId(candidate?.currentRound) ||
    normalizeStageId(
      candidateFromState?.currentRound || candidateFromState?.roundName
    ) ||
    "screening";

  // Ưu tiên dùng tên vòng từ dữ liệu truyền vào (ví dụ: "Flight Hour Confirmation", "Practical Test")
  const currentStageName =
    viewingRound?.roundName ||
    viewingRound?.stageName ||
    viewingRound?.stageId?.toString().replace(/-/g, " ") ||
    getRoundText(derivedStageId) ||
    "Screening";

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
        candidateFromState?.id ||
        candidateFromState?.activityId;

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
        // Fetch application data
        const response = await getApplicationById(applicationId);
        if (!isMounted) return;

        if (response.success) {
          const candidateData = buildCandidateProfile(
            response.data,
            candidateFromState || {}
          );

          setCandidate(candidateData);
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
    if (batchData) {
      navigate(-1, { state: batchData });
    } else {
      navigate(-1);
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
    try {
      // Handle different date formats
      if (dateString.includes("/")) {
        return dateString; // Already formatted
      }
      return new Date(dateString).toLocaleDateString("en-US");
    } catch {
      return dateString;
    }
  };

  const getWorkingExperienceText = (experience) => {
    if (!experience) return "—";
    const experienceMap = {
      "no-experience": "No experience",
      "less-than-1-year": "Less than 1 year",
      "1-2-years": "1-2 years",
      "3-5-years": "3-5 years",
    };
    return experienceMap[experience] || experience || "—";
  };

  const handleViewDocument = (documentSource) => {
    const documentUrl = getDocumentUrl(documentSource);
    if (!documentUrl) {
      toast.error("Document URL not found.");
      return;
    }
    window.open(documentUrl, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-b-2 border-blue-600 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold text-slate-800">
            Candidate information not found
          </h2>
          {error && <p className="mb-4 text-red-600">{error}</p>}
          <button
            onClick={goBack}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
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
      <div className="bg-white border-b shadow-sm border-slate-200">
        <div className="px-6 py-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <button
              onClick={goBack}
              className="p-2 transition-colors rounded-lg hover:bg-gray-100"
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

      <div className="max-w-6xl px-4 py-8 mx-auto">
        {error && (
          <div className="px-4 py-3 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Column - CV and Documents */}
          <div className="space-y-6">
            {/* CV Section */}
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
                CANDIDATE PROFILE
              </h3>

              {/* Profile Photo */}
              <div className="mb-6 text-center">
                <div className="w-32 h-40 mx-auto mb-4 overflow-hidden border-2 rounded-lg shadow-sm bg-slate-100 border-slate-300">
                  <img
                    src={
                      getDocumentUrl(candidate?.documents?.profilePhoto) ||
                      "https://via.placeholder.com/128x160/cccccc/666666?text=4x6"
                    }
                    alt="4x6 Photo"
                    className="object-cover w-full h-full"
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
            <div className="p-6 bg-white border border-gray-200 rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-slate-800">
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
                      <label className="block mb-2 text-sm font-medium text-slate-700">
                        {section.label}
                      </label>
                      <div className="p-4 border rounded-lg border-slate-300 bg-slate-50">
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
                            <span className="font-medium text-green-600">
                              {getDocumentDisplayName(documentData)}
                            </span>
                            <button
                              onClick={() => handleViewDocument(documentData)}
                              className="flex items-center gap-1 text-sm text-blue-600 underline hover:text-blue-800"
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
          <div className="p-6 bg-white border border-gray-200 rounded-xl">
            <h2 className="mb-6 text-xl font-bold text-slate-800">
              Application Details
            </h2>

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="pb-2 mb-4 text-lg font-semibold border-b text-slate-800 border-slate-200">
                  Personal Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      1. Email:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {candidate.email || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      2. Full Name:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {candidate.fullName || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      3. Date of Birth:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {formatDate(candidate.dateOfBirth) || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      4. Gender:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {candidate.gender === "male"
                        ? "Male"
                        : candidate.gender === "female"
                        ? "Female"
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      5. Phone Number:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {candidate.mobileNumber || "—"}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      6. Working Experience:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {getWorkingExperienceText(candidate.workingExperience)}
                    </p>
                  </div>

                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      7. Height & Weight:
                    </label>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block mb-1 text-xs text-slate-600">
                          Height (cm)
                        </label>
                        <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                          {candidate.height || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-slate-600">
                          Weight (kg)
                        </label>
                        <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                          {candidate.weight || "—"}
                        </p>
                      </div>
                      <div>
                        <label className="block mb-1 text-xs text-slate-600">
                          BMI
                        </label>
                        <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                          {candidate.bmi || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* English Certificate */}
              <div>
                <h3 className="pb-2 mb-4 text-lg font-semibold border-b text-slate-800 border-slate-200">
                  English Certificate
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      Type:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {candidate.englishCertificate || "—"}
                    </p>
                    <div className="mt-3 space-y-2">
                      {candidate.readingScore !== null &&
                        candidate.readingScore !== undefined && (
                          <div>
                            <label className="block mb-1 text-xs text-slate-600">
                              Reading score:
                            </label>
                            <p className="p-2 text-sm rounded-md text-slate-800 bg-slate-50">
                              {candidate.readingScore}
                            </p>
                          </div>
                        )}
                      {candidate.englishTestDate && (
                        <div>
                          <label className="block mb-1 text-xs text-slate-600">
                            English test date:
                          </label>
                          <p className="p-2 text-sm rounded-md text-slate-800 bg-slate-50">
                            {formatDate(candidate.englishTestDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1 text-sm font-medium text-slate-700">
                      Total score:
                    </label>
                    <p className="p-3 rounded-md text-slate-800 bg-slate-50">
                      {candidate.totalScore !== null &&
                      candidate.totalScore !== undefined
                        ? candidate.totalScore
                        : "—"}
                    </p>
                    <div className="mt-3 space-y-2">
                      {candidate.listeningScore !== null &&
                        candidate.listeningScore !== undefined && (
                          <div>
                            <label className="block mb-1 text-xs text-slate-600">
                              Listening score:
                            </label>
                            <p className="p-2 text-sm rounded-md text-slate-800 bg-slate-50">
                              {candidate.listeningScore}
                            </p>
                          </div>
                        )}
                      <div>
                        <label className="block mb-1 text-xs text-slate-600">
                          Expiration date:
                        </label>
                        <p className="p-2 text-sm rounded-md text-slate-800 bg-slate-50">
                          {formatDate(candidate.certificateExpireDate) || "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirlineCandidateDetailPage;
