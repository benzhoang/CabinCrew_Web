import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ListeningExam from './ListeningExam';
import SpeakingExam from './SpeakingExam';

const ExamPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Lấy thông tin exam từ location state
    const examType = location.state?.examType || 'Listening';
    const examInfo = location.state || {};

    // Nếu không có state, redirect về trang test
    useEffect(() => {
        if (!location.state) {
            navigate('/test');
        }
    }, [location.state, navigate]);

    if (!location.state) {
        return null;
    }

    // Render component phù hợp dựa trên exam type
    if (examType === 'Speaking') {
        return <SpeakingExam examInfo={examInfo} />;
    }

    // Mặc định là Listening
    return <ListeningExam examInfo={examInfo} />;
};

export default ExamPage;