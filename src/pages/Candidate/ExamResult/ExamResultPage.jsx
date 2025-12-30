import React from 'react';
import { useLocation } from 'react-router-dom';
import ListeningExamResult from './ListeningExamResult';
import SpeakingExamResult from './SpeakingExamResult';

const ExamResultPage = () => {
    const location = useLocation();
    const { examType } = location.state || {};

    // Route đến component phù hợp dựa trên examType
    if (examType === 'English Speaking') {
        return <SpeakingExamResult />;
    }

    // Mặc định là Listening exam
    return <ListeningExamResult />;
};

export default ExamResultPage;