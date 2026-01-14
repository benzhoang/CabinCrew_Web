import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { getRecruitmentHistory } from '../../service/api';

const STATUS_LABELS = {
    accepted: {
        vi: 'Đã hoàn thành',
        en: 'Completed'
    },
    rejected: {
        vi: 'Không hoàn thành',
        en: 'Not Completed'
    },
    pending: {
        vi: 'Đang xử lý',
        en: 'Pending'
    }
};

const COMPLETED_STAGE_STATUSES = ['completed', 'passed', 'done', 'approved', 'success'];
const FAILED_STAGE_STATUSES = ['failed', 'rejected', 'cancelled', 'canceled', 'not completed', 'not_completed', 'notcompleted'];
const IN_PROGRESS_STAGE_STATUSES = ['in_progress', 'processing', 'pending', 'ongoing', 'current'];

const appearanceKeywords = ['appearance', 'appearence', 'ngoại hình'];
const interviewKeywords = ['interview', 'phỏng vấn'];
const screeningKeywords = ['screening', 'sang loc', 'sàng lọc'];
const defaultStageTemplates = [
    {
        id: 'screening',
        name: 'Sàng lọc hồ sơ',
        nameEn: 'Screening',
        aliases: ['screening', 'sang loc']
    },
    {
        id: 'appearance',
        name: 'Vòng ngoại hình',
        nameEn: 'Appearance',
        aliases: ['appearance', 'ngoai hinh', 'appearence']
    },
    {
        id: 'english-listening',
        name: 'Bài kiểm tra Nghe tiếng Anh',
        nameEn: 'English Listening Test',
        aliases: ['listening', 'english listening', 'listening test']
    },
    {
        id: 'english-speaking',
        name: 'Bài kiểm tra Nói tiếng Anh',
        nameEn: 'English Speaking Test',
        aliases: ['speaking', 'english speaking', 'speaking test']
    },
    {
        id: 'interview',
        name: 'Phỏng vấn',
        nameEn: 'Interview',
        aliases: ['interview', 'phong van']
    },
    {
        id: 'final',
        name: 'Vòng cuối',
        nameEn: 'Final',
        aliases: ['final', 'chung ket', 'final round']
    },
];

const LINE_START_PERCENT = 5;
const LINE_END_PERCENT = 95;
const AXIS_SEGMENTS = 4;
const TIMELINE_HEIGHT = 240;
const BASELINE_Y = 110;
const BRANCH_OFFSET = 70;

const stageAxisPositionMap = {
    'screening': 0,
    'appearance': 1,
    'english-listening': 2,
    'english-speaking': 2,
    'interview': 3,
    'final': 4
};

const normalizeText = (text) => (text || '').toLowerCase().trim();
const formatDateSafe = (value) => {
    if (!value) return '—';

    // Try native parsing first
    const native = new Date(value);
    if (!isNaN(native.getTime())) {
        return native.toLocaleDateString();
    }

    // Handle common dd/MM/yyyy (e.g. 16/12/2025)
    if (typeof value === 'string') {
        const parts = value.split(/[\/\-]/);
        if (parts.length === 3) {
            const [p1, p2, p3] = parts.map((p) => p.trim());
            // Detect dd/MM/yyyy by checking if first part seems day (>12)
            const dayFirst = Number(p1);
            const month = Number(p2);
            const year = Number(p3);
            if (!isNaN(dayFirst) && !isNaN(month) && !isNaN(year)) {
                const dt = new Date(year, month - 1, dayFirst);
                if (!isNaN(dt.getTime())) {
                    return dt.toLocaleDateString();
                }
            }
        }
    }

    // Fallback: show raw string
    return typeof value === 'string' ? value : '—';
};

const doesRoundMatchStage = (round, stageTemplate) => {
    if (!round) return false;
    const roundName = normalizeText(round.roundName || round.name);
    const stageNames = [stageTemplate.name, stageTemplate.nameEn, ...(stageTemplate.aliases || [])]
        .map(normalizeText);
    return stageNames.some((name) => name && roundName.includes(name));
};

const matchesStageKeywords = (stage, keywords) => {
    const name = (stage?.name || '').toLowerCase();
    const nameEn = (stage?.nameEn || '').toLowerCase();
    return keywords.some(keyword => name.includes(keyword) || nameEn.includes(keyword));
};

const isStageReached = (stage, index, currentStageIndex) => {
    if (!stage || typeof index !== 'number') return false;
    if (stage.completed) return true;
    return index <= currentStageIndex;
};

const normalizeStatusKey = (status) => {
    if (!status) return 'pending';
    const normalized = (status || '').toLowerCase().trim();

    // Kiểm tra các status thành công
    if (['passed', 'completed', 'accepted', 'success', 'approved'].includes(normalized)) {
        return 'accepted';
    }

    // Kiểm tra các status thất bại (bao gồm exact match và contains)
    if (FAILED_STAGE_STATUSES.some(failedStatus => normalized === failedStatus || normalized.includes(failedStatus))) {
        return 'rejected';
    }

    // Kiểm tra các biến thể của "not completed"
    if (normalized.includes('not') && (normalized.includes('complete') || normalized.includes('finish'))) {
        return 'rejected';
    }

    return 'pending';
};

const normalizeRounds = (rounds = []) => {
    // Map rounds vào các stage templates
    const mappedStages = defaultStageTemplates.map((template, index) => {
        const matchingRound = rounds.find((round) => doesRoundMatchStage(round, template));
        const roundStatus = normalizeText(matchingRound?.status);

        // Kiểm tra failed trước để tránh false positive (ví dụ: "not completed" không bị nhận nhầm là "completed")
        const isFailed = FAILED_STAGE_STATUSES.some((status) => roundStatus.includes(status)) ||
            (roundStatus.includes('not') && (roundStatus.includes('complete') || roundStatus.includes('finish')));
        const isCompleted = !isFailed && COMPLETED_STAGE_STATUSES.some((status) => roundStatus.includes(status));
        const isInProgress = !isFailed && !isCompleted && IN_PROGRESS_STAGE_STATUSES.some((status) => roundStatus.includes(status));

        return {
            activityId: matchingRound?.activityId || matchingRound?.roundId || '',
            id: matchingRound?.roundId || matchingRound?.activityId || `${template.id}-${index}`,
            templateId: template.id,
            name: matchingRound?.roundName || template.name,
            nameEn: matchingRound?.roundName || template.nameEn,
            completed: Boolean(matchingRound) && isCompleted,
            failed: Boolean(matchingRound) && isFailed,
            inProgress: Boolean(matchingRound) && isInProgress,
            date: matchingRound?.date || matchingRound?.completedAt || null,
            status: matchingRound?.status || 'Pending'
        };
    });

    return mappedStages;
};

const deriveCurrentStage = (stages) => {
    if (!stages.length) {
        return { currentStageId: null, currentStageIndex: 0 };
    }

    const failedIndex = stages.findIndex((stage) => stage.failed);
    if (failedIndex !== -1) {
        return {
            currentStageId: stages[failedIndex].id,
            currentStageIndex: failedIndex + 1
        };
    }

    const inProgressIndex = stages.findIndex((stage) => stage.inProgress);
    if (inProgressIndex !== -1) {
        return {
            currentStageId: stages[inProgressIndex].id,
            currentStageIndex: inProgressIndex + 1
        };
    }

    // Tính số stages đã hoàn thành
    const completedCount = stages.filter(stage => stage.completed).length;
    let currentStageIndex = completedCount + 1;

    // Nếu tất cả đã hoàn thành, currentStage là tổng số stage
    if (currentStageIndex > stages.length) {
        currentStageIndex = stages.length;
    }

    // Đảm bảo currentStage ít nhất là 1
    if (currentStageIndex < 1) {
        currentStageIndex = 1;
    }

    const currentStageData = stages[currentStageIndex - 1];
    return {
        currentStageId: currentStageData?.id || stages[0]?.id,
        currentStageIndex: currentStageIndex
    };
};

const normalizeHistoryData = (data = []) => {
    if (!Array.isArray(data)) {
        return [];
    }
    return data.map((item, index) => {
        const stages = normalizeRounds(item.rounds || []);
        const { currentStageId, currentStageIndex } = deriveCurrentStage(stages);
        const statusKey = normalizeStatusKey(item.roundStatus);
        const statusLabels = STATUS_LABELS[statusKey] || STATUS_LABELS.pending || { vi: 'Đang xử lý', en: 'Pending' };

        const participatedDate = item.participatedDate || item.participateDate || item.appliedDate || null;
        return {
            id: item.campaignRoundId ?? item.roundId ?? index + 1,
            position: item.campaignName || 'Chưa có tên chiến dịch',
            company: item.airlinePartner || 'N/A',
            roundName: item.roundName || item.round || '',
            airlinePartner: item.airlinePartner || 'N/A',
            campaignType: item.campaignType || '',
            appliedDate: participatedDate,
            status: statusKey,
            statusText: statusLabels?.vi || 'Đang xử lý',
            statusTextEn: statusLabels?.en || 'Pending',
            location: item.location || item.airlinePartner || 'N/A',
            description: item.description || '',
            salary: item.salary,
            stages,
            currentStage: currentStageId,
            currentStageIndex,
            rawStatus: item.roundStatus
        };
    });
};

// Lấy nhãn cho ô thống kê "Completed" dựa theo ngôn ngữ
const getAcceptedSummaryLabel = () => {
    const lang = localStorage.getItem('lang') || 'en';
    return lang === 'en' ? STATUS_LABELS.accepted.en : STATUS_LABELS.accepted.vi;
};

const RecruitmentHistory = () => {
    const navigate = useNavigate();

    // Tự động re-render khi đổi ngôn ngữ
    const [langTick, setLangTick] = useState(0);
    const [recruitmentHistory, setRecruitmentHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);

    useEffect(() => {
        let isMounted = true;

        const fetchHistory = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await getRecruitmentHistory();
                if (!isMounted) return;

                if (response.success) {
                    const data = Array.isArray(response.data) ? response.data : [];
                    setRecruitmentHistory(normalizeHistoryData(data));
                } else {
                    setError(response.error || t('recruitment_history_fetch_error'));
                    setRecruitmentHistory([]);
                }
            } catch (err) {
                if (!isMounted) return;
                setError(err.message || t('recruitment_history_fetch_error'));
                setRecruitmentHistory([]);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchHistory();

        return () => {
            isMounted = false;
        };
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'accepted':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (item) => item.statusTextEn || item.statusText || STATUS_LABELS.pending.en;

    // Hàm lấy màu cho Campaign type (giống PromotionHistoryPage.jsx)
    const getCampaignTypeColor = (campaignType) => {
        if (!campaignType) return 'bg-gray-100 text-gray-800 border-gray-300';

        const type = campaignType.toLowerCase();
        if (type.includes('promotion')) {
            return 'bg-purple-100 text-purple-800 border-purple-300';
        } else if (type.includes('recruitment')) {
            return 'bg-blue-100 text-blue-800 border-blue-300';
        }
        return 'bg-gray-100 text-gray-800 border-gray-300';
    };

    // Hàm lấy tên giai đoạn theo ngôn ngữ
    const getStageName = (stage) => {
        const lang = localStorage.getItem('lang') || 'vi';
        return lang === 'vi' ? stage.name : stage.nameEn;
    };

    const isStageFailed = (stage) => {
        return stage?.failed || false;
    };

    // Hàm lấy màu sắc cho giai đoạn
    const getStageColor = (stage, currentStage, stageIndex) => {
        if (isStageFailed(stage)) {
            return 'bg-red-500 text-white';
        }
        if (stage.completed) {
            return 'bg-green-500 text-white';
        }
        if (stageIndex + 1 === currentStage) {
            return 'bg-yellow-500 text-white';
        }
        return 'bg-gray-300 text-gray-600';
    };

    // Hàm lấy icon cho giai đoạn
    const getStageIcon = (stage, currentStage, stageIndex) => {
        if (isStageFailed(stage)) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.536-10.95a1 1 0 10-1.414-1.414L10 7.758 7.879 5.636a1 1 0 00-1.414 1.414L8.586 9l-2.121 2.121a1 1 0 101.414 1.414L10 10.414l2.121 2.121a1 1 0 001.414-1.414L11.414 9l2.122-2.121z" clipRule="evenodd" />
                </svg>
            );
        }
        if (stage.completed) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            );
        } else if (stageIndex + 1 === currentStage) {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    const getProgressPercentage = (application) => {
        if (AXIS_SEGMENTS === 0) return 0;

        const completedPositions = application.stages
            .filter(stage => stage.completed)
            .map(stage => stageAxisPositionMap[stage.templateId])
            .filter(pos => typeof pos === 'number');

        const completedMax = completedPositions.length > 0 ? Math.max(...completedPositions) : 0;

        let currentPosition = completedMax;
        if (application.currentStageIndex > 0 && application.currentStageIndex <= application.stages.length) {
            const currentStageData = application.stages[application.currentStageIndex - 1];
            if (currentStageData) {
                const axisPos = stageAxisPositionMap[currentStageData.templateId];
                if (typeof axisPos === 'number') {
                    currentPosition = axisPos;
                }
            }
        }

        const furthest = Math.max(completedMax, currentPosition);
        return (furthest / AXIS_SEGMENTS) * 100;
    };

    const getAxisPercent = (templateId) => {
        const axisPos = stageAxisPositionMap[templateId];
        if (typeof axisPos !== 'number') return LINE_START_PERCENT;
        return LINE_START_PERCENT + ((LINE_END_PERCENT - LINE_START_PERCENT) * (axisPos / AXIS_SEGMENTS));
    };

    const getStagePositionStyle = (templateId) => {
        // Xác định các stage chính cần nằm trên baseline
        const isMainStage = ['screening', 'appearance', 'interview', 'final'].includes(templateId);

        if (isMainStage) {
            // Các stage chính: đáy hình tròn chạm baseline
            // Đặt top = BASELINE_Y - 30px để đáy chạm baseline
            return {
                left: `${getAxisPercent(templateId)}%`,
                top: `${BASELINE_Y - 30}px`,
                transform: 'translateX(-50%)'
            };
        } else {
            // Các stage nhánh (english-listening, english-speaking): căn giữa với offset
            const verticalOffset = templateId === 'english-listening'
                ? -BRANCH_OFFSET
                : templateId === 'english-speaking'
                    ? BRANCH_OFFSET
                    : 0;
            return {
                left: `${getAxisPercent(templateId)}%`,
                top: `${BASELINE_Y + verticalOffset}px`,
                transform: 'translate(-50%, -50%)'
            };
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('recruitment_history')}
                    </h1>
                    <p className="text-gray-600">
                        {t('recruitment_history_subtitle')}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error || t('recruitment_history_fetch_error')}
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{t('total_applications')}</p>
                                <p className="text-2xl font-semibold text-gray-900">{recruitmentHistory.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{getAcceptedSummaryLabel()}</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {recruitmentHistory.filter(item => item.status === 'accepted').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-red-100 rounded-lg">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{t('recruitment_history_failed_summary')}</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {recruitmentHistory.filter(item => item.status === 'rejected').length}
                                </p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Applications List */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">{t('application_history')}</h2>
                    </div>
                    <div className="p-6">
                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-sm text-gray-600">{t('recruitment_history_loading')}</p>
                            </div>
                        )}
                        {!loading && recruitmentHistory.length === 0 && !error && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_applications')}</h3>
                                <p className="mt-1 text-sm text-gray-500">{t('no_applications_desc')}</p>
                            </div>
                        )}
                        {!loading && recruitmentHistory.length > 0 && (
                            <div className="divide-y divide-gray-200">
                                {recruitmentHistory.map((application) => {
                                    const appliedDateText = application.appliedDate
                                        ? formatDateSafe(application.appliedDate)
                                        : '—';
                                    const hasStages = Array.isArray(application.stages) && application.stages.length > 0;

                                    return (
                                        <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    {/* Campaign title + status */}
                                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-gray-900">
                                                            {application.position}
                                                        </h3>
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                            {getStatusText(application)}
                                                        </span>
                                                    </div>

                                                    {/* Round + Partner + Campaign type */}
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                                        {application.roundName && (
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                                </svg>
                                                                <span className="font-medium">{t('application_round') || 'Round'}:</span>
                                                                <span>{application.roundName}</span>
                                                            </div>
                                                        )}
                                                        {application.airlinePartner && (
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                                </svg>
                                                                <span className="font-medium">{t('partner_label') || 'Partner'}:</span>
                                                                <span>{application.airlinePartner}</span>
                                                            </div>
                                                        )}
                                                        {application.campaignType && (
                                                            <div className="flex items-center gap-2">
                                                                <svg
                                                                    className="w-4 h-4 text-gray-400"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                                                                    />
                                                                </svg>
                                                                <span className="font-medium">
                                                                    {t('campaign_type') || 'Campaign type'}:
                                                                </span>
                                                                <span
                                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCampaignTypeColor(
                                                                        application.campaignType
                                                                    )}`}
                                                                >
                                                                    {application.campaignType}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Optional description */}
                                                    {application.description && (
                                                        <p className="text-sm text-gray-500 mb-3">{application.description}</p>
                                                    )}

                                                    {/* Location + Applied on */}
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            {application.location}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            {t('applied_on')}: {appliedDateText}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Hiển thị timeline cho các giai đoạn */}
                                            {hasStages && (
                                                <div className="mt-6 pt-6 border-t border-gray-200">
                                                    <h4 className="text-sm font-medium text-gray-900 mb-4">{t('recruitment_history_timeline')}</h4>

                                                    {/* Progress Timeline */}
                                                    <div className="relative" style={{ height: `${TIMELINE_HEIGHT}px` }}>
                                                        {(() => {
                                                            const stageMap = {};
                                                            const stageIndexMap = {};
                                                            application.stages.forEach((stage, index) => {
                                                                if (stage.templateId) {
                                                                    stageMap[stage.templateId] = stage;
                                                                    stageIndexMap[stage.templateId] = index;
                                                                }
                                                            });

                                                            const timelineStageIds = ['screening', 'appearance', 'english-listening', 'english-speaking', 'interview', 'final'];
                                                            const renderStageInfo = (stage, stageIndex, stageReached, position) => (
                                                                <div className={`${position === 'top' ? 'mb-3' : 'mt-3'} w-28 text-center`}>
                                                                    <p className="text-xs font-medium text-gray-900">
                                                                        {getStageName(stage)}
                                                                    </p>
                                                                    {stage.date && (
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            {new Date(stage.date).toLocaleDateString()}
                                                                        </p>
                                                                    )}
                                                                    {stageReached && matchesStageKeywords(stage, screeningKeywords) && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => navigate(`/profile/${stage.activityId || stage.id || ''}`)}
                                                                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                                                        >
                                                                            {t('view_profile')}
                                                                        </button>
                                                                    )}
                                                                    {stageReached && matchesStageKeywords(stage, appearanceKeywords) && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => navigate(`/appearance-result/${stage.activityId || stage.id || ''}`)}
                                                                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                                                        >
                                                                            {t('view_result')}
                                                                        </button>
                                                                    )}
                                                                    {stageReached && matchesStageKeywords(stage, interviewKeywords) && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => navigate(`/interview-result/${stage.activityId || stage.id || ''}`)}
                                                                            className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                                                                        >
                                                                            {t('view_result')}
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            );

                                                            return (
                                                                <>
                                                                    {/* Horizontal progress line */}
                                                                    <div
                                                                        className="absolute bg-gray-200"
                                                                        style={{
                                                                            top: `${BASELINE_Y}px`,
                                                                            left: `${LINE_START_PERCENT}%`,
                                                                            width: `${LINE_END_PERCENT - LINE_START_PERCENT}%`,
                                                                            height: '2px'
                                                                        }}
                                                                    >
                                                                        <div
                                                                            className="h-full bg-blue-500 transition-all duration-500"
                                                                            style={{ width: `${getProgressPercentage(application)}%` }}
                                                                        ></div>
                                                                    </div>

                                                                    {/* Vertical branch */}
                                                                    <div
                                                                        className="absolute bg-gray-200"
                                                                        style={{
                                                                            left: `${getAxisPercent('english-listening')}%`,
                                                                            top: `${BASELINE_Y - BRANCH_OFFSET}px`,
                                                                            height: `${BRANCH_OFFSET * 2}px`,
                                                                            width: '2px',
                                                                            transform: 'translateX(-50%)'
                                                                        }}
                                                                    ></div>

                                                                    {/* Stage nodes */}
                                                                    {timelineStageIds.map((templateId) => {
                                                                        const stage = stageMap[templateId];
                                                                        if (!stage) return null;
                                                                        const stageIndex = stageIndexMap[templateId];
                                                                        const stageReached = isStageReached(stage, stageIndex, application.currentStageIndex);
                                                                        // Chỉ english-listening hiển thị info ở trên, các stage khác hiển thị ở dưới
                                                                        const infoPosition = templateId === 'english-listening' ? 'top' : 'bottom';

                                                                        // Đảm bảo các stage chính (screening, appearance, interview, final) nằm trên baseline
                                                                        const isMainStage = ['screening', 'appearance', 'interview', 'final'].includes(templateId);
                                                                        const positionStyle = getStagePositionStyle(templateId);

                                                                        return (
                                                                            <div
                                                                                key={templateId}
                                                                                className="absolute flex flex-col items-center"
                                                                                style={positionStyle}
                                                                            >
                                                                                {infoPosition === 'top' && renderStageInfo(stage, stageIndex, stageReached, 'top')}
                                                                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(stage, application.currentStageIndex, stageIndex ?? 0)}`}>
                                                                                    {getStageIcon(stage, application.currentStageIndex, stageIndex ?? 0)}
                                                                                </div>
                                                                                {infoPosition === 'bottom' && renderStageInfo(stage, stageIndex, stageReached, 'bottom')}
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentHistory;
