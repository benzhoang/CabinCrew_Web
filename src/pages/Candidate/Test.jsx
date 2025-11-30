import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { t, onLangChange } from '../../i18n';
import { getMyTests } from '../../service/api';

const Test = () => {
    const navigate = useNavigate();
    const [exams, setExams] = useState([]); // Danh sách đề thi từ API
    const [expandedExamId, setExpandedExamId] = useState(null); // ID của đề thi đang mở dropdown
    const [passwords, setPasswords] = useState({}); // Lưu mật khẩu cho từng đề thi
    const [isLoading, setIsLoading] = useState({}); // Loading state cho từng đề thi
    const [isLoadingExams, setIsLoadingExams] = useState(true); // Loading state khi fetch danh sách đề thi
    const [langVersion, setLangVersion] = useState(0); // Force re-render when language changes
    const [filterType, setFilterType] = useState('all'); // Filter: 'all', 'Listening', 'Speaking'

    // re-render on language change
    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1));
        return () => off();
    }, []);

    // Fetch danh sách đề thi từ API
    useEffect(() => {
        const fetchMyTests = async () => {
            setIsLoadingExams(true);
            try {
                const result = await getMyTests();
                console.log('=== getMyTests result ===', result);

                // Xử lý cả trường hợp success: false nhưng vẫn có data
                const hasData = result.data && (
                    (result.data.tests && Array.isArray(result.data.tests) && result.data.tests.length > 0) ||
                    (Array.isArray(result.data) && result.data.length > 0)
                );

                if (result.success || hasData) {
                    // Kiểm tra cấu trúc response - có thể tests nằm trong result.data.tests hoặc result.data
                    let testsArray = [];

                    if (result.data) {
                        // Nếu result.data là array trực tiếp
                        if (Array.isArray(result.data)) {
                            testsArray = result.data;
                        }
                        // Nếu result.data có property tests
                        else if (result.data.tests && Array.isArray(result.data.tests)) {
                            testsArray = result.data.tests;
                        }
                        // Nếu result.data có property data (nested)
                        else if (result.data.data && Array.isArray(result.data.data)) {
                            testsArray = result.data.data;
                        }
                    }

                    console.log('testsArray:', testsArray);
                    console.log('testsArray length:', testsArray.length);

                    if (testsArray.length === 0) {
                        console.log('Không có đề thi nào');
                        setExams([]);
                        return;
                    }

                    // Map dữ liệu từ API response sang format hiện tại
                    const mappedExams = testsArray.map((test) => {
                        // Map testType từ API sang format hiện tại
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
                            totalQuestions: 0, // API không trả về, có thể cần gọi API khác
                            description: `Đề thi ${examType} - Round ${test.roundId || ''}`,
                            type: examType,
                            maxScore: test.maxScore || 0,
                            roundId: test.roundId,
                            roundType: test.roundType,
                            roundStartDate: test.roundStartDate,
                            roundEndDate: test.roundEndDate,
                            hasCompleted: test.hasCompleted || false
                        };
                    });

                    // Sắp xếp theo roundStartDate
                    mappedExams.sort((a, b) => {
                        const dateA = new Date(a.roundStartDate || 0);
                        const dateB = new Date(b.roundStartDate || 0);
                        return dateA - dateB;
                    });

                    console.log('mappedExams:', mappedExams);
                    setExams(mappedExams);
                } else {
                    // Chỉ hiển thị error nếu thực sự không có data
                    console.error('API Error:', result.error);
                    console.error('Full Result:', result);

                    // Kiểm tra lại xem có data trong rawResponse không
                    if (result.rawResponse && result.rawResponse.data) {
                        const rawData = result.rawResponse.data;
                        if (rawData.tests && Array.isArray(rawData.tests) && rawData.tests.length > 0) {
                            // Vẫn có data trong rawResponse, xử lý lại
                            console.log('Found data in rawResponse, processing...');
                            const testsArray = rawData.tests;

                            const mappedExams = testsArray.map((test) => {
                                let examType = 'Listening';
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
                                    totalQuestions: 0,
                                    description: `Đề thi ${examType} - Round ${test.roundId || ''}`,
                                    type: examType,
                                    maxScore: test.maxScore || 0,
                                    roundId: test.roundId,
                                    roundType: test.roundType,
                                    roundStartDate: test.roundStartDate,
                                    roundEndDate: test.roundEndDate,
                                    hasCompleted: test.hasCompleted || false
                                };
                            });

                            mappedExams.sort((a, b) => {
                                const dateA = new Date(a.roundStartDate || 0);
                                const dateB = new Date(b.roundStartDate || 0);
                                return dateA - dateB;
                            });

                            setExams(mappedExams);
                            return;
                        }
                    }

                    // Nếu không có data, hiển thị error
                    if (result.error && !hasData) {
                        toast.error(result.error || 'Không thể tải danh sách đề thi');
                    }
                    setExams([]);
                }
            } catch (error) {
                console.error('Error fetching tests:', error);
                console.error('Error details:', error.response || error);
                toast.error('Đã xảy ra lỗi khi tải danh sách đề thi');
                setExams([]);
            } finally {
                setIsLoadingExams(false);
            }
        };

        fetchMyTests();
    }, []);

    const handlePasswordChange = (examId, value) => {
        setPasswords({
            ...passwords,
            [examId]: value
        });
    };

    const toggleDropdown = (examId) => {
        const selectedExam = exams.find(exam => exam.id === examId);
        // Không cho mở dropdown nếu đã hoàn thành
        if (selectedExam?.hasCompleted) {
            return;
        }

        if (expandedExamId === examId) {
            setExpandedExamId(null);
        } else {
            setExpandedExamId(examId);
            // Reset password khi mở dropdown mới
            if (!passwords[examId]) {
                setPasswords({ ...passwords, [examId]: '' });
            }
        }
    };

    const handleSubmit = async (examId) => {
        const password = passwords[examId] || '';

        // Validate password
        if (!password.trim()) {
            toast.error(t('exam_password_required') || 'Vui lòng nhập mã đề thi');
            return;
        }

        setIsLoading({ ...isLoading, [examId]: true });

        // TODO: Replace with actual API call to validate exam password/joinCode
        // For now, validate against joinCode from API
        const selectedExam = exams.find(exam => exam.id === examId);

        if (!selectedExam) {
            toast.error('Không tìm thấy đề thi');
            setIsLoading({ ...isLoading, [examId]: false });
            return;
        }

        // Validate password against joinCode
        if (password.trim() !== selectedExam.code) {
            toast.error(t('exam_password_incorrect') || 'Mã đề thi không đúng');
            setIsLoading({ ...isLoading, [examId]: false });
            return;
        }

        // Simulate API call delay
        setTimeout(() => {
            toast.success(t('exam_login_success') || 'Đăng nhập thành công. Chuyển đến trang làm bài...');
            setIsLoading({ ...isLoading, [examId]: false });

            // Navigate to exam page với thông tin exam
            setTimeout(() => {
                // Lưu examCode vào localStorage để có thể lấy lại nếu state bị mất
                if (selectedExam.code) {
                    localStorage.setItem(`examCode_${selectedExam.id}`, selectedExam.code);
                }

                navigate(`/exam/${selectedExam.id}`, {
                    state: {
                        examType: selectedExam.type || 'Listening',
                        examId: selectedExam.id,
                        examName: selectedExam.name,
                        examCode: selectedExam.code,
                        duration: selectedExam.duration,
                        totalQuestions: selectedExam.totalQuestions,
                        roundId: selectedExam.roundId,
                        roundType: selectedExam.roundType,
                        maxScore: selectedExam.maxScore
                    }
                });
            }, 1500);
        }, 1000);
    };

    // Filter exams based on selected type
    const filteredExams = filterType === 'all'
        ? exams
        : exams.filter(exam => exam.type === filterType);

    if (isLoadingExams) {
        return (
            <div className="min-h-screen bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto"></div>
                        <p className="mt-4 text-gray-600">{t('loading') || 'Đang tải danh sách đề thi...'}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-blue-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">{t('exam_list_title') || 'Danh sách đề thi'}</h2>
                    <p className="mt-2 text-sm text-gray-600">{t('exam_list_subtitle') || 'Chọn đề thi và nhập mật khẩu để bắt đầu làm bài'}</p>
                </div>

                {/* Filter Buttons */}
                <div className="mb-6 flex flex-wrap justify-center gap-3">
                    <button
                        onClick={() => setFilterType('all')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filterType === 'all'
                            ? 'bg-blue-800 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {t('all_exams') || 'Tất cả'}
                    </button>
                    <button
                        onClick={() => setFilterType('Listening')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filterType === 'Listening'
                            ? 'bg-blue-800 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {t('listening') || 'Listening'}
                    </button>
                    <button
                        onClick={() => setFilterType('Speaking')}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${filterType === 'Speaking'
                            ? 'bg-blue-800 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                    >
                        {t('speaking') || 'Speaking'}
                    </button>
                </div>

                {/* Thông báo chuẩn bị tai nghe */}
                <div className="mb-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-amber-600 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-amber-800 mb-1">{t('prepare_headphones') || 'Vui lòng chuẩn bị tai nghe'}</h3>
                            <p className="text-xs text-amber-700">{t('headphones_note') || 'Để có trải nghiệm tốt nhất trong bài thi nghe, vui lòng chuẩn bị tai nghe (headphones) và kiểm tra âm thanh trước khi bắt đầu làm bài.'}</p>
                        </div>
                    </div>
                </div>

                {/* Exam List */}
                <div className="space-y-4">
                    {filteredExams.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                            <p className="text-gray-600">{t('no_exams_found') || 'Không tìm thấy đề thi nào'}</p>
                        </div>
                    ) : (
                        filteredExams.map((exam) => (
                            <div
                                key={exam.id}
                                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-xl"
                            >
                                {/* Exam Info */}
                                <div className="p-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-800">{exam.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${exam.type === 'Listening'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-purple-100 text-purple-800'
                                                    }`}>
                                                    {exam.type}
                                                </span>
                                                {exam.hasCompleted && (
                                                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                                        {t('completed') || 'Đã hoàn thành'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">{exam.description}</p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                {/* <div>
                                                    <span className="text-gray-500">{t('exam_code') || 'Mã đề:'}</span>
                                                    <span className="ml-2 font-semibold text-gray-800">{exam.code}</span>
                                                </div> */}
                                                <div>
                                                    <span className="text-gray-500">{t('exam_duration') || 'Thời gian:'}</span>
                                                    <span className="ml-2 font-semibold text-gray-800">{exam.duration} {t('minutes') || 'phút'}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">{t('max_score') || 'Điểm tối đa:'}</span>
                                                    <span className="ml-2 font-semibold text-gray-800">{exam.maxScore}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => toggleDropdown(exam.id)}
                                            disabled={exam.hasCompleted}
                                            className={`ml-4 px-6 py-3 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 font-medium whitespace-nowrap ${exam.hasCompleted
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-800 to-indigo-800 hover:from-blue-900 hover:to-indigo-900'
                                                }`}
                                        >
                                            {exam.hasCompleted
                                                ? (t('completed') || 'Đã hoàn thành')
                                                : expandedExamId === exam.id
                                                    ? (t('close') || 'Đóng')
                                                    : (t('enter_exam') || 'Vào làm bài')
                                            }
                                        </button>
                                    </div>
                                </div>

                                {/* Password Dropdown - Chỉ hiển thị khi chưa hoàn thành */}
                                {expandedExamId === exam.id && !exam.hasCompleted && (
                                    <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                        {/* Cảnh báo chuẩn bị tai nghe */}
                                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                            <div className="flex items-start">
                                                <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                                <p className="text-xs text-blue-800 font-medium">
                                                    {t('prepare_and_plug_headphones') || 'Hãy chuẩn bị tai nghe và cắm tai nghe khi làm bài'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-end gap-4">
                                            <div className="flex-1">
                                                <label htmlFor={`password-${exam.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                                                    {t('exam_password_label') || 'Mã đề thi'}
                                                </label>
                                                <input
                                                    id={`password-${exam.id}`}
                                                    type="text"
                                                    value={passwords[exam.id] || ''}
                                                    onChange={(e) => handlePasswordChange(exam.id, e.target.value)}
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSubmit(exam.id);
                                                        }
                                                    }}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-sm bg-white text-gray-900 placeholder-gray-500"
                                                    placeholder={t('exam_password_placeholder') || 'Nhập mã đề thi'}
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                onClick={() => handleSubmit(exam.id)}
                                                disabled={isLoading[exam.id]}
                                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium whitespace-nowrap"
                                            >
                                                {isLoading[exam.id] ? (
                                                    <div className="flex items-center">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                        {t('loading') || 'Đang xử lý...'}
                                                    </div>
                                                ) : (
                                                    t('confirm') || 'Xác nhận'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Test;