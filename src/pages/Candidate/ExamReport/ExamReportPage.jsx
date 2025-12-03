import React from 'react';
import { useLocation } from 'react-router-dom';
import ListeningReport from "./ListeningReport";
import SpeakingReport from "./SpeakingReport";

const ExamReportPage = () => {
    const location = useLocation();
    const { examType } = location.state || {};

    // Route đến component phù hợp dựa trên examType
    if (examType === 'Speaking') {
        return <SpeakingReport />;
    }

    // Mặc định là Listening exam
    return <ListeningReport />;
};

export default ExamReportPage;