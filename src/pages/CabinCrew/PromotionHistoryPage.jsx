import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { FaCheck, FaClock, FaEllipsisH, FaTimes } from 'react-icons/fa';

const PromotionHistoryPage = () => {
    const navigate = useNavigate();

    // Tự động re-render khi đổi ngôn ngữ
    const [, setLangTick] = useState(0);
    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);

    // Mock data cho lịch sử tuyển dụng - bao gồm cả giai đoạn đã chấp thuận và không đạt yêu cầu
    const recruitmentHistory = [
        {
            id: 2,
            position: 'Ground Staff Intake',
            company: 'Bamboo Airways',
            appliedDate: '2023-12-20',
            status: 'rejected',
            statusText: 'Không đạt yêu cầu',
            statusTextEn: 'Not Qualified',
            location: 'Đà Nẵng',
            description: 'Tuyển dụng nhân viên mặt đất phụ trách làm thủ tục.',
            currentStage: 1, // Bị loại ở giai đoạn "Kiểm tra hồ sơ"
            stages: [
                { id: 1, name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: false, date: '2023-12-21' },
                { id: 2, name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: false, date: null },
                { id: 3, name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: false, date: null },
                { id: 4, name: 'Phỏng vấn', nameEn: 'Interview', completed: false, date: null },
                { id: 5, name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: false, date: null }
            ]
        },
        {
            id: 3,
            position: 'Pilot Cadet Program',
            company: 'VietJet Air',
            appliedDate: '2023-11-10',
            status: 'accepted',
            statusText: 'Đã được chấp nhận',
            statusTextEn: 'Accepted',
            location: 'TP.HCM',
            description: 'Chương trình học viên phi công đã kết thúc.',
            currentStage: 5, // Hoàn thành tất cả giai đoạn
            stages: [
                { id: 1, name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: true, date: '2023-11-12' },
                { id: 2, name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: true, date: '2023-11-15' },
                { id: 3, name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: true, date: '2023-11-18' },
                { id: 4, name: 'Phỏng vấn', nameEn: 'Interview', completed: true, date: '2023-11-22' },
                { id: 5, name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: true, date: '2023-11-25' }
            ]
        },
        {
            id: 4,
            position: 'Customer Service Expansion',
            company: 'Pacific Airlines',
            appliedDate: '2023-10-05',
            status: 'rejected',
            statusText: 'Không đạt yêu cầu',
            statusTextEn: 'Not Qualified',
            location: 'Hà Nội',
            description: 'Mở rộng đội ngũ chăm sóc khách hàng tại sân bay Nội Bài.',
            currentStage: 3, // Bị loại ở giai đoạn "Kiểm tra tiếng Anh"
            stages: [
                { id: 1, name: 'Kiểm tra hồ sơ', nameEn: 'Document Review', completed: true, date: '2023-10-07' },
                { id: 2, name: 'Kiểm tra ngoại hình', nameEn: 'Physical Check', completed: true, date: '2023-10-10' },
                { id: 3, name: 'Kiểm tra tiếng Anh', nameEn: 'English Test', completed: false, date: '2023-10-15' },
                { id: 4, name: 'Phỏng vấn', nameEn: 'Interview', completed: false, date: null },
                { id: 5, name: 'Kết quả cuối cùng', nameEn: 'Final Result', completed: false, date: null }
            ]
        }
    ];

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
    const getStageColor = (stage, currentStage, status) => {
        if (stage.completed) {
            return 'bg-green-500 text-white';
        }
        if (stage.id === currentStage) {
            return status === 'rejected' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white';
        }
        return 'bg-gray-300 text-gray-600';
    };

    // Hàm lấy icon cho giai đoạn
    const getStageIcon = (stage, currentStage, status) => {
        if (stage.completed) {
            return (
                <FaCheck/>
            );
        } else if (stage.id === currentStage) {
            if (status === 'rejected') {
                return (
                   <FaTimes/>
                );
            }
            return (
                <FaEllipsisH/>
            );
        } else {
            return (
               <FaClock/>
            );
        }
    };

    // Hàm xử lý khi nhấn nút "Xem chi tiết"
    const handleViewDetails = (application) => {
        // Tạo campaign object từ application data để truyền vào ApplicationForm
        const campaignData = {
            id: application.id,
            title: application.position,
            company: application.company,
            location: application.location,
            description: application.description,
            status: application.status,
            appliedDate: application.appliedDate
        };

        // Điều hướng đến ApplicationForm với state chứa campaign data
     
        navigate('/cabin-crew/application/detail', {
            state: {
                campaign: campaignData,
                isUpdate: true // Flag để biết đây là chế độ cập nhật
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('promotion_history')}
                    </h1>
                    <p className="text-gray-600">
                        {t('recruitment_history_subtitle')}
                    </p>
                </div>

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
                                <p className="text-sm font-medium text-gray-600">{t('accepted')}</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {recruitmentHistory.filter(item => item.status === 'accepted').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-2 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">{t('pending')}</p>
                                <p className="text-2xl font-semibold text-gray-900">
                                    {recruitmentHistory.filter(item => item.status === 'pending').length}
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
                                <p className="text-sm font-medium text-gray-600">Không đạt yêu cầu</p>
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
                    <div className="divide-y divide-gray-200">
                        {recruitmentHistory.map((application) => (
                            <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {application.position}
                                            </h3>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                                                {getStatusText(application)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{application.company}</p>
                                        <p className="text-sm text-gray-500 mb-3">{application.description}</p>
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
                                                {t('applied_on')}: {new Date(application.appliedDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex flex-col gap-2">
                                        <button
                                            onClick={() => handleViewDetails(application)}
                                            className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            {t('view_details')}
                                        </button>
                                        {application.status === 'accepted' && (
                                            <button className="px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                                                {t('accept_offer')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Hiển thị timeline cho các giai đoạn đã chấp thuận và không đạt yêu cầu */}
                                {(application.status === 'accepted' || application.status === 'rejected') && application.stages && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <h4 className="text-sm font-medium text-gray-900 mb-4">Tiến trình ứng tuyển</h4>

                                        {/* Progress Timeline */}
                                        <div className="relative">
                                            {/* Progress Line */}
                                            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-500"
                                                    style={{
                                                        width: `${(application.currentStage / application.stages.length) * 100}%`
                                                    }}
                                                ></div>
                                            </div>

                                            {/* Stages */}
                                            <div className="relative flex justify-between">
                                                {application.stages.map((stage) => (
                                                    <div key={stage.id} className="flex flex-col items-center">
                                                        {/* Stage Circle */}
                                                <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center ${getStageColor(stage, application.currentStage, application.status)}`}>
                                                    {getStageIcon(stage, application.currentStage, application.status)}
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
                                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                            <p className="text-sm text-blue-800">
                                                <strong>Trạng thái hiện tại:</strong> {
                                                    application.status === 'rejected'
                                                        ? `Không đạt ở ${getStageName(application.stages.find(stage => stage.id === application.currentStage))}`
                                                        : (
                                                            application.stages.find(stage => stage.id === application.currentStage)?.completed
                                                                ? `Hoàn thành ${getStageName(application.stages.find(stage => stage.id === application.currentStage))}`
                                                                : `Đang trong giai đoạn ${getStageName(application.stages.find(stage => stage.id === application.currentStage))}`
                                                        )
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Empty State (if no applications) */}
                {recruitmentHistory.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('no_applications')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('no_applications_desc')}</p>
                        <div className="mt-6">
                            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                {t('browse_jobs')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PromotionHistoryPage;
