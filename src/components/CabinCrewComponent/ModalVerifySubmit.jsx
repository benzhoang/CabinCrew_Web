import { useNavigate } from 'react-router-dom';
import { t } from '../../i18n';

const ModalVerifySubmit = ({ isOpen, onClose, onSubmit, answers }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleConfirm = () => {
        // Handle submit logic
        if (onSubmit) {
            onSubmit();
        } else {
            console.log("Answers:", answers);
            navigate("/cabin-crew/tests");
        }
        onClose();
    };

    const handleClose = () => {
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    handleClose();
                }
            }}
        >
            <div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Content */}
                <div className="text-center">
                    {/* Message */}
                    <p className="text-lg text-gray-800 mb-6">
                        {t("submit_confirm") || "Bạn có chắc chắn muốn nộp bài?"}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                        >
                            {t("close") || "Đóng"}
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        >
                            {t("confirm") || "Xác nhận"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalVerifySubmit;