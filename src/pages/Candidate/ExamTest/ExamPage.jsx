import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import ListeningExam from './ListeningExam';
import SpeakingExam from './SpeakingExam';

const ExamPage = () => {
    const location = useLocation();
    const { id: testIdFromUrl } = useParams(); // Lấy testId từ URL params

    // Lấy thông tin exam từ location state (nếu có)
    const examType = location.state?.examType || 'Listening';
    const examInfo = {
        ...location.state,
        // Đảm bảo examId được lấy từ URL params (ưu tiên)
        examId: testIdFromUrl || location.state?.examId,
    };

    // Nếu có testIdFromUrl, cho phép render (không cần state)
    // Nếu không có testIdFromUrl và không có state, vẫn render để component con xử lý
    // Component con (ListeningExam/SpeakingExam) sẽ tự xử lý việc redirect nếu thiếu thông tin

    // Render component phù hợp dựa trên exam type
    if (examType === 'Speaking') {
        return <SpeakingExam examInfo={examInfo} />;
    }

    // Mặc định là Listening
    return <ListeningExam examInfo={examInfo} />;
};

export default ExamPage;