import React, { useState, useRef, useEffect } from 'react';
import { t } from '../../../i18n';

// Mock data - Listening test với câu hỏi tiếng Anh
export const mockQuestions = [
    {
        id: 1,
        question: 'What should you do when a passenger asks for assistance?',
        options: [
            'A. Ignore the request and continue with your duties',
            'B. Respond politely and provide the necessary help',
            'C. Ask another crew member to handle it',
            'D. Direct them to find the information themselves'
        ],
        correctAnswer: 'B'
    },
    {
        id: 2,
        question: 'How should you address passengers during the flight?',
        options: [
            'A. Use their first names only',
            'B. Use formal titles and be respectful',
            'C. Use casual language to be friendly',
            'D. Avoid speaking to passengers directly'
        ],
        correctAnswer: 'B'
    },
    {
        id: 3,
        question: 'What is the most important quality for a cabin crew member?',
        options: [
            'A. Physical appearance',
            'B. Excellent communication and customer service skills',
            'C. Ability to speak multiple languages',
            'D. Years of flying experience'
        ],
        correctAnswer: 'B'
    }
];

/**
 * AudioPlayer Component
 * Quản lý việc phát audio cho các câu hỏi
 * Phát file audio từ URL Cloudinary
 */
const AudioPlayer = ({ questionId, allQuestions = [], maxPlays = 3, onPlayCountChange, isPlaying: externalIsPlaying, onPlayingChange }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [playCount, setPlayCount] = useState(0);
    const audioRef = useRef(null);
    const isPlayingRef = useRef(false);
    const allQuestionsRef = useRef(null);

    // URL audio từ Cloudinary
    const audioUrl = "https://res.cloudinary.com/dxhaku7lp/raw/upload/v1762772878/audio-tests/audio-tests/01-01 - Học TA giao tiếp chỉ trong 30 ngày_20251110110757.mp3";

    // Sử dụng trạng thái từ component cha nếu có
    const playingState = externalIsPlaying !== undefined ? externalIsPlaying : isPlaying;
    const setPlayingState = onPlayingChange || setIsPlaying;

    // Hàm phát audio từ URL với Promise
    const playAudioFromUrl = (url) => {
        return new Promise((resolve, reject) => {
            // Tạo Audio object mới
            const audio = new Audio(url);
            audioRef.current = audio;

            audio.onended = () => {
                audioRef.current = null;
                resolve();
            };

            audio.onerror = (error) => {
                audioRef.current = null;
                console.error('Lỗi phát audio:', error);
                reject(error);
            };

            // Phát audio
            audio.play().catch((error) => {
                console.error('Lỗi khi bắt đầu phát audio:', error);
                audioRef.current = null;
                reject(error);
            });
        });
    };

    // Hàm phát audio
    const playAudio = async () => {
        if (!audioUrl) {
            console.error('Không có URL audio');
            return;
        }

        setPlayingState(true);
        isPlayingRef.current = true;

        try {
            // Phát file audio từ URL
            await playAudioFromUrl(audioUrl);
        } catch (error) {
            console.error('Lỗi khi phát audio:', error);
        } finally {
            setPlayingState(false);
            isPlayingRef.current = false;
        }
    };

    // Hàm dừng audio
    const stopAudio = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
            audioRef.current = null;
        }
        setPlayingState(false);
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

    // Khi questionId thay đổi, KHÔNG reset trạng thái nếu đang phát
    // Chỉ reset nếu không có trạng thái từ component cha
    useEffect(() => {
        // Nếu không có trạng thái từ component cha và không đang phát, reset
        if (externalIsPlaying === undefined && !isPlayingRef.current) {
            setPlayingState(false);
        }
    }, [questionId, externalIsPlaying]);

    // Xử lý play/pause - phát file audio
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

            // Phát file audio
            playAudio();
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
                            {playingState ? (
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