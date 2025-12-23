import React, { useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ListeningExam from './ListeningExam';
import SpeakingExam from './SpeakingExam';

const ExamPage = () => {
    const location = useLocation();
    const { id: testIdFromUrl } = useParams(); // Lấy testId từ URL params

    // Lấy thông tin exam từ location state (nếu có)
    const examType = location.state?.examType || 'English Listening';
    const examInfo = {
        ...location.state,
        // Đảm bảo examId được lấy từ URL params (ưu tiên)
        examId: testIdFromUrl || location.state?.examId,
    };

    useEffect(() => {
        // Ngăn chặn context menu (right click)
        const preventContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Ngăn chặn các phím tắt
        const preventShortcuts = (e) => {
            // Ngăn Alt+Tab, Ctrl+W, Ctrl+T, Ctrl+N, Ctrl+Shift+N, Ctrl+R, F5
            if (
                (e.altKey && e.key === 'Tab') ||
                (e.ctrlKey && ['w', 't', 'n', 'r'].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') ||
                e.key === 'F5'
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Phát hiện khi rời khỏi tab/window
        const handleVisibilityChange = () => {
            if (document.hidden) {
                // Có thể thêm logic cảnh báo hoặc xử lý khi người dùng chuyển tab
                console.warn('User switched to another tab/window');
            }
        };

        // Phát hiện khi người dùng cố gắng rời khỏi trang
        const handleBeforeUnload = (e) => {
            e.preventDefault();
            e.returnValue = 'Bạn có chắc chắn muốn rời khỏi trang thi? Tiến trình làm bài của bạn có thể bị mất.';
            return e.returnValue;
        };

        // Thêm event listeners
        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventShortcuts);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('beforeunload', handleBeforeUnload);

        // Ngăn chặn copy/paste
        const preventCopyPaste = (e) => {
            if (e.ctrlKey && ['c', 'v', 'x', 'a'].includes(e.key.toLowerCase())) {
                e.preventDefault();
                return false;
            }
        };
        document.addEventListener('keydown', preventCopyPaste);

        // Cleanup khi component unmount
        return () => {
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventShortcuts);
            document.removeEventListener('keydown', preventCopyPaste);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // Nếu có testIdFromUrl, cho phép render (không cần state)
    // Nếu không có testIdFromUrl và không có state, vẫn render để component con xử lý
    // Component con (ListeningExam/SpeakingExam) sẽ tự xử lý việc redirect nếu thiếu thông tin

    // Render component phù hợp dựa trên exam type
    if (examType === 'English Speaking') {
        return (
            <div style={{ width: '100%', height: '100%' }}>
                <SpeakingExam examInfo={examInfo} />
            </div>
        );
    }

    // Mặc định là Listening
    return (
        <div style={{ width: '100%', height: '100%' }}>
            <ListeningExam examInfo={examInfo} />
        </div>
    );
};

export default ExamPage;