import React, { useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ListeningExam from './ListeningExam';
import SpeakingExam from './SpeakingExam';

const ExamPage = () => {
    const location = useLocation();
    const { id: testIdFromUrl } = useParams(); // Lấy testId từ URL params
    const containerRef = useRef(null);

    // Lấy thông tin exam từ location state (nếu có)
    const examType = location.state?.examType || 'Listening';
    const examInfo = {
        ...location.state,
        // Đảm bảo examId được lấy từ URL params (ưu tiên)
        examId: testIdFromUrl || location.state?.examId,
    };

    // Hàm để vào fullscreen
    const enterFullscreen = async () => {
        try {
            const element = containerRef.current || document.documentElement;

            if (element.requestFullscreen) {
                await element.requestFullscreen();
            } else if (element.webkitRequestFullscreen) {
                await element.webkitRequestFullscreen();
            } else if (element.mozRequestFullScreen) {
                await element.mozRequestFullScreen();
            } else if (element.msRequestFullscreen) {
                await element.msRequestFullscreen();
            }
        } catch (error) {
            console.error('Error entering fullscreen:', error);
        }
    };

    // Hàm kiểm tra fullscreen
    const isFullscreen = () => {
        return !!(
            document.fullscreenElement ||
            document.webkitFullscreenElement ||
            document.mozFullScreenElement ||
            document.msFullscreenElement
        );
    };

    useEffect(() => {
        // Tự động vào fullscreen khi component mount
        const timer = setTimeout(() => {
            enterFullscreen();
        }, 500); // Delay một chút để đảm bảo DOM đã render

        // Ngăn chặn context menu (right click)
        const preventContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // Ngăn chặn các phím tắt
        const preventShortcuts = (e) => {
            // Ngăn F11, Alt+Tab, Ctrl+W, Ctrl+T, Ctrl+N, Ctrl+Shift+N, Ctrl+R, F5
            if (
                e.key === 'F11' ||
                (e.altKey && e.key === 'Tab') ||
                (e.ctrlKey && ['w', 't', 'n', 'r'].includes(e.key.toLowerCase())) ||
                (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'n') ||
                e.key === 'F5'
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Phát hiện khi rời khỏi fullscreen và tự động quay lại
        const handleFullscreenChange = () => {
            if (!isFullscreen()) {
                // Tự động quay lại fullscreen sau 100ms
                setTimeout(() => {
                    enterFullscreen();
                }, 100);
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
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
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
            clearTimeout(timer);
            document.removeEventListener('contextmenu', preventContextMenu);
            document.removeEventListener('keydown', preventShortcuts);
            document.removeEventListener('keydown', preventCopyPaste);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // Thoát fullscreen khi component unmount (tùy chọn)
            if (isFullscreen()) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        };
    }, []);

    // Nếu có testIdFromUrl, cho phép render (không cần state)
    // Nếu không có testIdFromUrl và không có state, vẫn render để component con xử lý
    // Component con (ListeningExam/SpeakingExam) sẽ tự xử lý việc redirect nếu thiếu thông tin

    // Render component phù hợp dựa trên exam type
    if (examType === 'Speaking') {
        return (
            <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
                <SpeakingExam examInfo={examInfo} />
            </div>
        );
    }

    // Mặc định là Listening
    return (
        <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
            <ListeningExam examInfo={examInfo} />
        </div>
    );
};

export default ExamPage;