import React, { useState, useRef, useEffect } from 'react';
import { t } from '../../../i18n';

/**
 * AudioPlayer Component
 * Quản lý việc phát audio cho các câu hỏi
 * Khi click phát, sẽ phát tất cả câu hỏi liên tiếp: Question 1 -> nội dung -> Question 2 -> nội dung...
 */
const AudioPlayer = ({ questionId, audioText, allQuestions = [], maxPlays = 3, onPlayCountChange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const utteranceRef = useRef(null);
    const isPlayingRef = useRef(false);
    const allQuestionsRef = useRef(null);

    // Hàm phát audio với Promise
    const playAudioPromise = (text) => {
        return new Promise((resolve) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 1;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            window.speechSynthesis.speak(utterance);
        });
    };

    // Hàm delay
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Hàm phát tất cả các câu hỏi liên tiếp
    const playAllQuestions = async () => {
        const questions = allQuestionsRef.current || allQuestions;
        if (!questions || questions.length === 0) return;

        setIsPlaying(true);
        isPlayingRef.current = true;

        // Dừng tất cả audio đang phát
        window.speechSynthesis.cancel();

        // Đợi một chút để đảm bảo cancel hoàn tất
        await delay(100);

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const questionNumber = i + 1;

            // Phát "Question X"
            await playAudioPromise(`Question ${questionNumber}`);

            // Ngắt một lúc ngắn (1.5 giây)
            await delay(1500);

            // Phát nội dung câu hỏi
            await playAudioPromise(question.audioText || question.question);

            // Ngắt một lúc ngắn trước câu tiếp theo (2 giây)
            if (i < questions.length - 1) {
                await delay(2000);
            }
        }

        setIsPlaying(false);
        isPlayingRef.current = false;
    };

    // Hàm dừng audio
    const stopAudio = () => {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
        setIsPlaying(false);
        isPlayingRef.current = false;
    };

    // Lưu allQuestions vào ref để tránh re-render
    useEffect(() => {
        allQuestionsRef.current = allQuestions;
    }, [allQuestions]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            stopAudio();
        };
    }, []);

    // Khi questionId thay đổi, reset state hiển thị
    useEffect(() => {
        setIsPlaying(false);
        isPlayingRef.current = false;
    }, [questionId]);

    // Xử lý play/pause - phát tất cả câu hỏi liên tiếp
    const handlePlayPause = () => {
        if (isPlayingRef.current) {
            stopAudio();
        } else {
            // Kiểm tra số lần phát
            if (playCount >= maxPlays) {
                return; // Đã hết số lần phát
            }

            // Tăng số lần phát
            const newPlayCount = playCount + 1;
            setPlayCount(newPlayCount);

            // Gọi callback để cập nhật playCount ở component cha
            if (onPlayCountChange) {
                onPlayCountChange(questionId, newPlayCount);
            }

            // Phát tất cả câu hỏi liên tiếp
            playAllQuestions();
        }
    };

    const canPlay = playCount < maxPlays;
    const playsRemaining = maxPlays - playCount;

    return (
        <div className="mb-8">
            {canPlay ? (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-center mb-4">
                        <button
                            onClick={handlePlayPause}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2"
                        >
                            {isPlaying ? (
                                <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {t('pause') || 'Tạm dừng'}
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    {t('play') || 'Phát'}
                                </>
                            )}
                        </button>
                    </div>
                    <div className="text-sm text-gray-600 text-center">
                        <p className="mb-1">{t('listening_instruction') || 'Nghe audio và chọn đáp án đúng'}</p>
                        <p className="text-amber-600 font-medium">
                            {t('plays_remaining') || 'Còn lại'} {playsRemaining} {t('times') || 'lần'}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="p-6 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm text-red-700 font-medium">
                            {t('audio_limit_reached') || 'Bạn đã sử dụng hết 3 lần phát audio cho câu hỏi này'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AudioPlayer;