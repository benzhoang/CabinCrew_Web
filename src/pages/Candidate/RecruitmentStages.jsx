import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { getOngoingCampaign } from '../../service/api';

const RecruitmentStages = () => {
    const navigate = useNavigate();

    // Tự động re-render khi đổi ngôn ngữ
    const [langTick, setLangTick] = useState(0);
    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);

    // State để lưu dữ liệu từ API
    const [recruitmentStages, setRecruitmentStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Gọi API để lấy chiến dịch đang ứng tuyển
    useEffect(() => {
        const fetchOngoingCampaign = async () => {
            try {
                setLoading(true);
                const result = await getOngoingCampaign();

                if (result.success && result.data) {
                    // Map dữ liệu từ API vào format của component
                    const campaignData = result.data;

                    // Xác định currentStage dựa trên rounds
                    const rounds = campaignData.rounds || [];

                    // Map rounds thành stages với thông tin completed
                    const mappedStages = rounds.map((round, index) => {
                        const isCompleted = round.status === 'Completed' ||
                            round.status === 'Passed' ||
                            round.status === 'Finished';
                        return {
                            id: round.roundId || index + 1,
                            name: round.roundName || `Giai đoạn ${index + 1}`,
                            nameEn: round.roundName || `Stage ${index + 1}`,
                            completed: isCompleted,
                            date: null, // API không trả về date, có thể thêm sau nếu cần
                            status: round.status
                        };
                    });

                    // Tính currentStage: số rounds đã hoàn thành + 1 (hoặc rounds.length nếu tất cả đã hoàn thành)
                    const completedCount = mappedStages.filter(stage => stage.completed).length;
                    let currentStageIndex = completedCount + 1;

                    // Nếu tất cả rounds đã hoàn thành, currentStage là rounds.length
                    if (currentStageIndex > rounds.length) {
                        currentStageIndex = rounds.length;
                    }

                    // Đảm bảo currentStage ít nhất là 1
                    if (currentStageIndex < 1) {
                        currentStageIndex = 1;
                    }

                    // Map status từ roundStatus
                    let status = 'pending';
                    let statusText = 'Đang xem xét';
                    let statusTextEn = 'Under Review';

                    if (campaignData.roundStatus) {
                        const roundStatus = campaignData.roundStatus.toLowerCase();
                        if (roundStatus.includes('completed') || roundStatus.includes('passed') || roundStatus.includes('finished')) {
                            status = 'accepted';
                            statusText = 'Đã hoàn thành';
                            statusTextEn = 'Completed';
                        } else if (roundStatus.includes('rejected') || roundStatus.includes('failed')) {
                            status = 'rejected';
                            statusText = 'Đã từ chối';
                            statusTextEn = 'Rejected';
                        }
                    }

                    const mappedData = {
                        id: campaignData.campaignRoundId || 1,
                        position: campaignData.campaignName || 'Chiến dịch tuyển dụng',
                        company: campaignData.airlinePartner || 'Đối tác hàng không',
                        roundName: campaignData.roundName || '',
                        airlinePartner: campaignData.airlinePartner || '',
                        campaignName: campaignData.campaignName || '',
                        appliedDate: new Date().toISOString().split('T')[0], // Có thể cập nhật nếu API trả về
                        status: status,
                        statusText: statusText,
                        statusTextEn: statusTextEn,
                        location: '', // Có thể cập nhật nếu API trả về
                        description: campaignData.description || '',
                        currentStage: currentStageIndex || 1,
                        stages: mappedStages
                    };

                    setRecruitmentStages([mappedData]);
                    setError(null);
                } else {
                    setRecruitmentStages([]);
                    setError(result.error || 'Không có chiến dịch đang ứng tuyển');
                }
            } catch (err) {
                console.error('Error fetching ongoing campaign:', err);
                setError('Đã xảy ra lỗi khi tải dữ liệu');
                setRecruitmentStages([]);
            } finally {
                setLoading(false);
            }
        };

        fetchOngoingCampaign();
    }, [langTick]);

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

    const getStatusText = (item) => {
        const lang = localStorage.getItem('lang') || 'vi';
        return lang === 'vi' ? item.statusText : item.statusTextEn;
    };

    // Hàm lấy tên giai đoạn theo ngôn ngữ
    const getStageName = (stage) => {
        const lang = localStorage.getItem('lang') || 'vi';
        return lang === 'vi' ? stage.name : stage.nameEn;
    };

    // Hàm lấy màu sắc cho giai đoạn
    const getStageColor = (stage, currentStage, stageIndex) => {
        if (stage.completed) {
            return 'bg-green-500 text-white';
        } else if (stageIndex + 1 === currentStage) {
            return 'bg-yellow-500 text-white';
        } else {
            return 'bg-gray-300 text-gray-600';
        }
    };

    // Hàm lấy icon cho giai đoạn
    const getStageIcon = (stage, currentStage, stageIndex) => {
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Giai đoạn tuyển dụng
                    </h1>
                    <p className="text-gray-600">
                        Theo dõi tiến trình ứng tuyển của bạn qua các giai đoạn
                    </p>
                </div>

                {/* Recruitment Stages Section */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Tiến trình ứng tuyển</h2>
                        <p className="text-sm text-gray-600 mt-1">Theo dõi tiến trình ứng tuyển của bạn</p>
                    </div>
                    <div className="p-6">
                        {loading && (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <p className="mt-4 text-sm text-gray-600">Đang tải dữ liệu...</p>
                            </div>
                        )}
                        {error && !loading && (
                            <div className="text-center py-12">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Không có chiến dịch đang ứng tuyển</h3>
                                <p className="mt-1 text-sm text-gray-500">{error}</p>
                            </div>
                        )}
                        {!loading && !error && recruitmentStages.map((application) => (
                            <div key={`stages-${application.id}`} className="mb-8 last:mb-0">
                                <div className="mb-4">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {application.campaignName || application.position}
                                        </h3>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                            {getStatusText(application)}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
                                        {application.roundName && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                                <span className="font-medium">Đợt tuyển:</span>
                                                <span>{application.roundName}</span>
                                            </div>
                                        )}
                                        {application.airlinePartner && (
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                <span className="font-medium">Đối tác:</span>
                                                <span>{application.airlinePartner}</span>
                                            </div>
                                        )}
                                    </div>
                                    {application.description && (
                                        <p className="text-sm text-gray-500 mb-3">{application.description}</p>
                                    )}
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
                                            Ngày ứng tuyển: {new Date(application.appliedDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Timeline */}
                                <div className="relative">
                                    {/* Progress Line */}
                                    <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-500"
                                            style={{
                                                width: application.stages.length > 0
                                                    ? `${(application.stages.filter(s => s.completed).length / application.stages.length) * 100}%`
                                                    : '0%'
                                            }}
                                        ></div>
                                    </div>

                                    {/* Stages */}
                                    <div className="relative flex justify-between">
                                        {application.stages.map((stage, index) => (
                                            <div key={stage.id || index} className="flex flex-col items-center">
                                                {/* Stage Circle */}
                                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(stage, application.currentStage, index)}`}>
                                                    {getStageIcon(stage, application.currentStage, index)}
                                                </div>

                                                {/* Stage Info */}
                                                <div className="mt-3 text-center max-w-24">
                                                    <p className="text-xs font-medium text-gray-900">
                                                        {getStageName(stage)}
                                                    </p>
                                                    {stage.date && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(stage.date).toLocaleDateString()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Current Status */}
                                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Trạng thái hiện tại:</strong> {
                                                application.stages.length > 0 && application.currentStage > 0 && application.currentStage <= application.stages.length
                                                    ? (() => {
                                                        const currentStageData = application.stages[application.currentStage - 1];
                                                        if (currentStageData?.completed) {
                                                            return `Hoàn thành ${getStageName(currentStageData)}`;
                                                        } else {
                                                            return `Đang trong giai đoạn ${getStageName(currentStageData)}`;
                                                        }
                                                    })()
                                                    : 'Đang chờ xử lý'
                                            }
                                        </p>
                                        {/* Nút Kiểm tra tiếng Anh - chỉ hiển thị khi đang ở giai đoạn này và có stage tương ứng */}
                                        {application.currentStage > 0 && application.currentStage <= application.stages.length &&
                                            application.stages[application.currentStage - 1] &&
                                            !application.stages[application.currentStage - 1].completed &&
                                            (application.stages[application.currentStage - 1].name?.toLowerCase().includes('tiếng anh') ||
                                                application.stages[application.currentStage - 1].name?.toLowerCase().includes('english')) && (
                                                <button
                                                    onClick={() => navigate(`/test/${application.id}`)}
                                                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 whitespace-nowrap"
                                                >
                                                    {t('take_english_test') || 'Kiểm tra tiếng Anh'}
                                                </button>
                                            )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Empty State (if no applications) */}
                {!loading && !error && recruitmentStages.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có đơn ứng tuyển</h3>
                        <p className="mt-1 text-sm text-gray-500">Bạn chưa có đơn ứng tuyển nào để theo dõi tiến trình</p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                Tìm việc ngay
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RecruitmentStages;
