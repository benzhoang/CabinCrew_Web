import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { t, onLangChange } from '../../i18n';
import { getMyTests } from '../../service/api';

const ScoreReport = () => {
    const navigate = useNavigate();
    const [tests, setTests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [langTick, setLangTick] = useState(0);
    const [filterType, setFilterType] = useState('all'); // 'all', 'Listening', 'Speaking'

    // Tự động re-render khi đổi ngôn ngữ
    useEffect(() => {
        const off = onLangChange(() => setLangTick((v) => v + 1));
        return () => off();
    }, []);

    // Fetch danh sách đề thi từ API
    useEffect(() => {
        const fetchTests = async () => {
            setLoading(true);
            setError(null);
            try {
                const result = await getMyTests();
                console.log('=== getMyTests result ===', result);

                // Nếu chưa đăng nhập (401) thì hiển thị thông báo thân thiện
                if (result?.status === 401) {
                    setError('Please log in to view your exam scores.');
                    setTests([]);
                    return;
                }

                // Xử lý cả trường hợp success: false nhưng vẫn có data
                const hasData = result.data && (
                    (result.data.tests && Array.isArray(result.data.tests) && result.data.tests.length > 0) ||
                    (Array.isArray(result.data) && result.data.length > 0)
                );

                if (result.success || hasData) {
                    // Kiểm tra cấu trúc response
                    let testsArray = [];

                    if (result.data) {
                        if (Array.isArray(result.data)) {
                            testsArray = result.data;
                        } else if (result.data.tests && Array.isArray(result.data.tests)) {
                            testsArray = result.data.tests;
                        } else if (result.data.data && Array.isArray(result.data.data)) {
                            testsArray = result.data.data;
                        }
                    }

                    if (testsArray.length === 0) {
                        setTests([]);
                        return;
                    }

                    // Map dữ liệu từ API response
                    const mappedTests = testsArray.map((test) => {
                        let examType = 'Listening'; // default
                        if (test.testType === 'EnglishListening') {
                            examType = 'Listening';
                        } else if (test.testType === 'EnglishSpeaking') {
                            examType = 'Speaking';
                        } else if (test.testType === 'Practical') {
                            examType = 'Practical';
                        }

                        return {
                            id: test.testId,
                            name: test.testName || 'Đề thi',
                            code: test.joinCode || '',
                            duration: test.durationInMinutes || 0,
                            type: examType,
                            maxScore: test.maxScore || 0,
                            roundId: test.roundId,
                            roundType: test.roundType,
                            roundStartDate: test.roundStartDate,
                            roundEndDate: test.roundEndDate,
                            hasCompleted: test.hasCompleted || false,
                            score: test.score || null,
                            totalQuestions: test.totalQuestions || 0
                        };
                    });

                    // Lọc chỉ lấy các bài thi đã hoàn thành (hasCompleted === true)
                    const completedTests = mappedTests.filter(test => test.hasCompleted === true);

                    // Sắp xếp theo roundStartDate (mới nhất trước)
                    completedTests.sort((a, b) => {
                        const dateA = new Date(a.roundStartDate || 0);
                        const dateB = new Date(b.roundStartDate || 0);
                        return dateB - dateA;
                    });

                    setTests(completedTests);
                } else {
                    setError(result.error || 'Không thể tải danh sách đề thi');
                    setTests([]);
                }
            } catch (err) {
                // Nếu lỗi 401 ở mức axios (phòng trường hợp api.js đổi logic sau này)
                const status = err?.response?.status;
                if (status === 401) {
                    setError('Please log in to view your exam scores.');
                } else {
                    setError(err.message || 'Không thể tải danh sách đề thi');
                }
                setTests([]);
            } finally {
                setLoading(false);
            }
        };

        fetchTests();
    }, []);

    const handleViewDetail = (test) => {
        // Điều hướng đến trang kết quả chi tiết
        navigate(`/exam-report/${test.id}`, {
            state: {
                examType: test.type,
                examId: test.id,
                examName: test.name,
                examCode: test.code,
                duration: test.duration,
                totalQuestions: test.totalQuestions,
                roundId: test.roundId,
                roundType: test.roundType,
                maxScore: test.maxScore,
                score: test.score
            }
        });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Listening':
                return 'bg-blue-100 text-blue-800';
            case 'Speaking':
                return 'bg-green-100 text-green-800';
            case 'Practical':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Listening':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                );
            case 'Speaking':
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                );
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    // Filter tests based on selected type
    const filteredTests = filterType === 'all'
        ? tests
        : tests.filter(test => test.type === filterType);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">{t('loading') || 'Đang tải danh sách đề thi...'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('score_report') || 'Báo cáo điểm số'}
                    </h1>
                    <p className="text-gray-600">
                        {t('score_report_subtitle') || 'Xem lại kết quả các đề thi đã làm'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                        {error}
                    </div>
                )}

                {/* Filter Buttons */}
                <div className="mb-6 flex flex-wrap gap-3">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filterType === 'all'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {t('all') || 'Tất cả'}
                    </button>
                    <button
                        onClick={() => setFilterType('Listening')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filterType === 'Listening'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {t('listening') || 'Nghe'}
                    </button>
                    <button
                        onClick={() => setFilterType('Speaking')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filterType === 'Speaking'
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {t('speaking') || 'Nói'}
                    </button>
                </div>

                {/* Tests List */}
                {filteredTests.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                            {t('no_tests') || 'Chưa có đề thi nào'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {t('no_tests_desc') || 'Bạn chưa có đề thi nào trong danh sách'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredTests.map((test) => (
                            <div
                                key={test.id}
                                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className={`p-2 rounded-lg ${getTypeColor(test.type)}`}>
                                                    {getTypeIcon(test.type)}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        {test.name}
                                                    </h3>
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(test.type)} mt-1`}>
                                                        {test.type === 'Listening' ? (t('listening') || 'Nghe') :
                                                            test.type === 'Speaking' ? (t('speaking') || 'Nói') :
                                                                test.type}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{t('duration') || 'Thời gian'}: {test.duration} {t('minutes') || 'phút'}</span>
                                                </div>
                                                {test.totalQuestions > 0 && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <span>{t('total_questions') || 'Tổng câu hỏi'}: {test.totalQuestions}</span>
                                                    </div>
                                                )}
                                                {test.score !== null && test.score !== undefined && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                                        </svg>
                                                        <span className="font-semibold text-gray-900">
                                                            {t('score') || 'Điểm'}: {test.score} / {test.maxScore}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {test.roundStartDate && (
                                                <div className="mt-3 text-sm text-gray-500">
                                                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {t('start_date') || 'Ngày bắt đầu'}: {formatDate(test.roundStartDate)}
                                                </div>
                                            )}
                                        </div>

                                        <div className="ml-4">
                                            <button
                                                onClick={() => handleViewDetail(test)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center gap-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                {t('view_detail') || 'Xem chi tiết'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ScoreReport;

