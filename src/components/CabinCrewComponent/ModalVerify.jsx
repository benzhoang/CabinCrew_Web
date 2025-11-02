import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalVerify = ({ isOpen, onClose, exam, examId }) => {
    const navigate = useNavigate();
    const [examCode, setExamCode] = useState('PROM001');
    const [examOTP, setExamOTP] = useState('');
    const [showOTP, setShowOTP] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Handle confirm logic here
        console.log('Exam Code:', examCode);
        console.log('Exam OTP:', examOTP);
        console.log('Exam:', exam);
        console.log('Exam ID:', examId);
        setExamOTP('');
        // Close modal after confirmation
        onClose();
        // Navigate to test page with exam id
        if (examId) {
            navigate(`/cabin-crew/tests/${examId}`);
        }
    };

    const handleCancel = () => {
        setExamCode('PROM001');
        setExamOTP('');
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleCancel();
                }
            }}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Content */}
                <div className="p-6">
                    {/* Title */}
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Kiểm tra cá nhân</h2>

                    {/* Form Fields */}
                    <div className="space-y-4">
                        {/* Exam Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mã bài thi
                            </label>
                            <input
                                type="text"
                                value={examCode}
                                onChange={(e) => setExamCode(e.target.value)}
                                placeholder="Nhập 'Mã bài thi'"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                readOnly
                            />
                        </div>

                        {/* Exam OTP */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                OTP bài thi
                            </label>
                            <div className="relative">
                                <input
                                    type={showOTP ? 'text' : 'password'}
                                    value={examOTP}
                                    onChange={(e) => setExamOTP(e.target.value)}
                                    placeholder="Nhập 'OTP bài thi'"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowOTP(!showOTP)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                                >
                                    {showOTP ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29M3 3l13.42 13.42" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalVerify;