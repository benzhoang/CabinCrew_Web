import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaUser } from "react-icons/fa";
import { FaClipboardList, FaEye } from "react-icons/fa6";
import { toast } from "react-toastify";
import {
    getTestSessionById,
    getTestSessionAnswersWithCriteria,
    updateEnquiryRequestScore,
} from "../../../../service/api";

const AppealDetail = () => {
    const { testSessionId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const fallbackCandidate = location.state?.candidate || null;

    const [testSession, setTestSession] = useState(
        location.state?.testSession || null
    );
    const [loading, setLoading] = useState(!location.state?.testSession);
    const [error, setError] = useState(null);
    const [answers, setAnswers] = useState([]);
    const [answersLoading, setAnswersLoading] = useState(true);
    const [answersError, setAnswersError] = useState(null);
    const [newReason, setNewReason] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        if (!testSessionId) return;
        let isMounted = true;

        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getTestSessionById(testSessionId);
                if (!isMounted) return;

                if (result.success && result.data) {
                    setTestSession(result.data);
                } else {
                    setError(result.error || "Không thể tải thông tin bài làm.");
                    setTestSession(null);
                }
            } catch (err) {
                if (!isMounted) return;
                setError(err.message || "Không thể tải thông tin bài làm.");
                setTestSession(null);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchDetail();
        return () => {
            isMounted = false;
        };
    }, [testSessionId]);

    useEffect(() => {
        if (!testSessionId) return;
        let isMounted = true;

        const fetchAnswers = async () => {
            setAnswersLoading(true);
            setAnswersError(null);
            try {
                const result = await getTestSessionAnswersWithCriteria(testSessionId);
                if (!isMounted) return;
                if (result.success && Array.isArray(result.data)) {
                    setAnswers(result.data);
                } else {
                    setAnswers([]);
                    setAnswersError(result.error || "Không thể tải câu trả lời.");
                }
            } catch (err) {
                if (!isMounted) return;
                setAnswers([]);
                setAnswersError(err.message || "Không thể tải câu trả lời.");
            } finally {
                if (isMounted) {
                    setAnswersLoading(false);
                }
            }
        };

        fetchAnswers();
        return () => {
            isMounted = false;
        };
    }, [testSessionId]);

    const detail = useMemo(() => {
        return {
            candidateName:
                testSession?.userFullName || fallbackCandidate?.name || "—",
            candidateEmail:
                testSession?.userEmail || fallbackCandidate?.email || "—",
            candidatePhoto:
                testSession?.imgURL || fallbackCandidate?.photo || null,
            totalScore:
                testSession?.totalScore ??
                fallbackCandidate?.totalScore ??
                null,
            maxScore:
                testSession?.maxScore ?? fallbackCandidate?.maxScore ?? null,
            status:
                testSession?.status ??
                fallbackCandidate?.status ??
                null,
            testName: testSession?.testName || fallbackCandidate?.testName || "—",
            testType: testSession?.testType || fallbackCandidate?.testType || "—",
            startTime: testSession?.startTime || fallbackCandidate?.startTime || null,
            endTime: testSession?.endTime || fallbackCandidate?.endTime || null,
            createdAt: testSession?.createdAt || fallbackCandidate?.createdAt || null,
        };
    }, [testSession, fallbackCandidate]);

    const formatDateTime = (value) => {
        if (!value) return "—";
        try {
            return new Date(value).toLocaleString();
        } catch {
            return value;
        }
    };

    const isListeningTest = useMemo(() => {
        const t = detail.testType;
        if (t === 1 || t === "1") return true;
        if (typeof t === "string" && t.toLowerCase().includes("listening")) {
            return true;
        }
        return false;
    }, [detail.testType]);

    const isSpeakingTest = useMemo(() => {
        const t = detail.testType;
        if (t === 2 || t === "2") return true;
        if (typeof t === "string" && t.toLowerCase().includes("speaking")) {
            return true;
        }
        return false;
    }, [detail.testType]);

    const getStatusBadge = (status) => {
        if (status === null || status === undefined) {
            return (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                    Chưa xác định
                </span>
            );
        }
        if (status === true) {
            return (
                <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                    Đạt
                </span>
            );
        }
        return (
            <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                Phúc khảo
            </span>
        );
    };

    const handleCriteriaChange = (answerIndex, key, value) => {
        setAnswers((prev) => {
            const clone = [...prev];
            const answer = { ...(clone[answerIndex] || {}) };
            const currentScores = { ...(answer.criteriaScores || {}) };
            const numValue =
                value === "" || value === null ? "" : Number(value);
            currentScores[key] = Number.isNaN(numValue) ? "" : numValue;
            answer.criteriaScores = currentScores;
            clone[answerIndex] = answer;
            return clone;
        });
    };

    const handleScoreChange = (answerIndex, value) => {
        setAnswers((prev) => {
            const clone = [...prev];
            const answer = { ...(clone[answerIndex] || {}) };
            const numValue =
                value === "" || value === null ? "" : Number(value);
            answer.score = Number.isNaN(numValue) ? "" : numValue;
            clone[answerIndex] = answer;
            return clone;
        });
    };

    const handleListeningCorrectChange = (answerIndex, isCorrect) => {
        setAnswers((prev) => {
            const clone = [...prev];
            const answer = { ...(clone[answerIndex] || {}) };

            // Lấy maxScore của câu hỏi (ưu tiên theo câu hỏi, fallback sang maxScore của bài)
            const rawMax =
                answer?.question?.maxScore !== undefined
                    ? answer.question.maxScore
                    : detail.maxScore ?? 0;
            const maxScoreNum = Number(rawMax) || 0;

            // Cập nhật trạng thái đúng/sai
            answer.isCorrect = isCorrect;
            // Nếu chọn Đúng → điểm = maxScore, nếu Sai → 0
            answer.score = isCorrect ? maxScoreNum : 0;

            clone[answerIndex] = answer;
            return clone;
        });
    };

    const buildAnswerScoresPayload = () => {
        const payload = {};
        answers.forEach((answer, idx) => {
            const answerId = answer.answerId ?? answer.id ?? `answer_${idx}`;
            const criteriaScores = {};
            if (
                answer.criteriaScores &&
                typeof answer.criteriaScores === "object"
            ) {
                Object.entries(answer.criteriaScores).forEach(([key, value]) => {
                    const numValue =
                        value === "" || value === null ? 0 : Number(value);
                    criteriaScores[key] = Number.isNaN(numValue) ? 0 : numValue;
                });
            }
            payload[answerId] = {
                criteriaScores,
                isCorrect:
                    answer.isCorrect === undefined
                        ? null
                        : Boolean(answer.isCorrect),
            };
        });
        return payload;
    };

    const handleUpdateAppeal = async () => {
        if (!testSessionId || answers.length === 0) {
            toast.warn("Không có dữ liệu phúc khảo để cập nhật.");
            return;
        }

        setIsUpdating(true);
        try {
            const answerScores = buildAnswerScoresPayload();
            const result = await updateEnquiryRequestScore(
                testSessionId,
                answerScores,
                newReason
            );
            if (result.success) {
                toast.success(result.message || "Cập nhật phúc khảo thành công!");
            } else {
                toast.error(result.error || "Không thể cập nhật phúc khảo.");
            }
        } catch (error) {
            console.error("Update appeal error:", error);
            toast.error("Đã xảy ra lỗi khi cập nhật phúc khảo. Vui lòng thử lại.");
        } finally {
            setIsUpdating(false);
        }
    };

    const renderCriteriaInputs = (criteriaScores, answerIndex) => {
        if (
            !criteriaScores ||
            typeof criteriaScores !== "object" ||
            Object.keys(criteriaScores).length === 0
        ) {
            return (
                <p className="text-sm text-gray-500">Không có dữ liệu tiêu chí.</p>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(criteriaScores).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-500">
                            {key}
                        </label>
                        <input
                            type="number"
                            value={value ?? ""}
                            onChange={(e) =>
                                handleCriteriaChange(
                                    answerIndex,
                                    key,
                                    e.target.value
                                )
                            }
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none"
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full h-full p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between p-6 text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl">
                    <div>
                        <p className="text-sm text-white/80">Chi tiết yêu cầu phúc khảo</p>
                        <h1 className="mt-1 text-2xl font-extrabold md:text-3xl">
                            Phúc khảo bài thi #{testSessionId}
                        </h1>
                    </div>
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors bg-white/20 rounded-lg hover:bg-white/30"
                    >
                        <FaArrowLeft />
                        Quay lại
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-6 lg:grid-cols-3">
                <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 text-indigo-600 bg-indigo-50 rounded-full">
                            <FaUser className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Thông tin ứng viên
                            </h2>
                            <p className="text-sm text-gray-500">
                                Dữ liệu lấy từ bài làm gần nhất
                            </p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <p className="text-sm text-gray-500">Họ và tên</p>
                            <p className="mt-1 text-base font-semibold text-gray-900">
                                {detail.candidateName}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="mt-1 text-base font-semibold text-gray-900">
                                {detail.candidateEmail}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Điểm số</p>
                            <p className="mt-1 text-base font-semibold text-gray-900">
                                {detail.totalScore !== null && detail.maxScore !== null
                                    ? `${detail.totalScore}/${detail.maxScore}`
                                    : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Trạng thái</p>
                            <div className="mt-1">{getStatusBadge(detail.status)}</div>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 text-blue-600 bg-blue-50 rounded-full">
                            <FaClipboardList className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Thông tin bài thi
                            </h2>
                            <p className="text-sm text-gray-500">Chi tiết bài làm</p>
                        </div>
                    </div>
                    <div className="space-y-3 text-sm text-gray-700">
                        <div className="flex items-start justify-between">
                            <span className="text-gray-500">Tên bài thi:</span>
                            <span className="font-medium text-gray-900 text-right">
                                {detail.testName}
                            </span>
                        </div>
                        <div className="flex items-start justify-between">
                            <span className="text-gray-500">Loại bài thi:</span>
                            <span className="font-medium text-gray-900 text-right">
                                {detail.testType}
                            </span>
                        </div>
                        <div className="flex items-start justify-between">
                            <span className="text-gray-500">Thời gian bắt đầu:</span>
                            <span className="font-medium text-gray-900 text-right">
                                {formatDateTime(detail.startTime)}
                            </span>
                        </div>
                        <div className="flex items-start justify-between">
                            <span className="text-gray-500">Thời gian kết thúc:</span>
                            <span className="font-medium text-gray-900 text-right">
                                {formatDateTime(detail.endTime)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            Câu trả lời đã nộp
                        </h2>
                        <p className="text-sm text-gray-500">
                            Bao gồm điểm số và tiêu chí chấm
                        </p>
                    </div>
                </div>

                {answersLoading ? (
                    <div className="py-6 text-center text-gray-500">
                        Đang tải câu trả lời...
                    </div>
                ) : answersError ? (
                    <div className="py-6 text-center text-red-500">{answersError}</div>
                ) : answers.length === 0 ? (
                    <div className="py-6 text-center text-gray-500">
                        Không có dữ liệu câu trả lời.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {answers.map((answer, index) => (
                            <div
                                key={answer.answerId || index}
                                className="p-4 border border-gray-100 rounded-xl bg-gray-50"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <p className="text-xs text-gray-500">
                                            Câu hỏi #{answer.question?.orderNumber ?? index + 1}
                                        </p>
                                        <h3 className="text-base font-semibold text-gray-900">
                                            {answer.question?.questionContent || "—"}
                                        </h3>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500">Điểm</p>
                                        {isListeningTest ? (
                                            <div className="flex items-center justify-end gap-3 mt-1">
                                                <label className="flex items-center gap-1 text-xs text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name={`listening-correct-${index}`}
                                                        checked={answer.isCorrect === true}
                                                        onChange={() =>
                                                            handleListeningCorrectChange(
                                                                index,
                                                                true
                                                            )
                                                        }
                                                    />
                                                    Đúng
                                                </label>
                                                <label className="flex items-center gap-1 text-xs text-gray-700">
                                                    <input
                                                        type="radio"
                                                        name={`listening-correct-${index}`}
                                                        checked={answer.isCorrect === false}
                                                        onChange={() =>
                                                            handleListeningCorrectChange(
                                                                index,
                                                                false
                                                            )
                                                        }
                                                    />
                                                    Sai
                                                </label>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="mt-1 text-sm font-semibold text-gray-900">
                                                    {answer.score}
                                                </p>
                                                <p className="text-xs mt-1">
                                                    {answer.isCorrect ? (
                                                        <span className="text-green-600">Đúng</span>
                                                    ) : (
                                                        <span className="text-red-600">Sai</span>
                                                    )}
                                                </p>
                                            </>
                                        )}
                                        {!isListeningTest && (
                                            <></>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm text-gray-700">
                                    {answer.studentAnswer && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Câu trả lời (trắc nghiệm/viết)
                                            </p>
                                            <div className="px-3 py-2 mt-1 bg-white border border-gray-200 rounded-lg">
                                                {answer.studentAnswer}
                                            </div>
                                        </div>
                                    )}
                                    {answer.answerAudioFileURL && (
                                        <div>
                                            <p className="text-xs font-medium text-gray-500">
                                                Audio trả lời
                                            </p>
                                            <audio
                                                controls
                                                className="w-full mt-1"
                                                src={answer.answerAudioFileURL}
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 mb-2">
                                            Điểm theo tiêu chí
                                        </p>
                                        {renderCriteriaInputs(
                                            answer.criteriaScores,
                                            index
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                <div className="mt-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            Ghi chú phúc khảo (tuỳ chọn)
                        </label>
                        <textarea
                            rows={3}
                            value={newReason}
                            onChange={(e) => setNewReason(e.target.value)}
                            className="w-full mt-2 text-sm text-gray-900 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2"
                            placeholder="Nhập lý do/ghi chú muốn gửi cho ứng viên..."
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            className="px-6 py-2 text-sm font-semibold text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={handleUpdateAppeal}
                            disabled={isUpdating || answers.length === 0}
                        >
                            {isUpdating ? "Đang cập nhật..." : "Cập nhật phúc khảo"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppealDetail;