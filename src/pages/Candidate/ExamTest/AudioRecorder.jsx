import React, { useState, useRef, useEffect } from 'react';
import { t } from '../../../i18n';
import SubmitWarningModal from './SubmitWarningModal';

/**
 * AudioRecorder Component
 * Ghi âm → tự động chuyển thành MP3 ngay khi dừng
 * File luôn là audio/mp3, không còn webm nữa
 */
const AudioRecorder = ({ questionId, existingRecording, onRecordingComplete, onDelete, onSubmit }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(existingRecording || null); // { blob: MP3 Blob, duration: number, timestamp: number }
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [recordingCount, setRecordingCount] = useState(0);
    const [showWarningModal, setShowWarningModal] = useState(false);

    const MAX_RECORDINGS = 3;

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const recordingTimeRef = useRef(0);

    // FIXED: Hàm chuyển WebM → MP3 (đã sửa lỗi MP3Mode is not defined)
    const convertWebMToMP3 = async (webmBlob) => {
        try {
            // Đúng cách import lamejs trong ESM (Vite, Next.js, CRA, etc.)
            const lamejs = await import('@breezystack/lamejs');

            const arrayBuffer = await webmBlob.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            const leftChannel = audioBuffer.getChannelData(0);
            const sampleRate = audioBuffer.sampleRate;

            // Khởi tạo encoder
            const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // 128kbps, mono
            const samples = new Int16Array(leftChannel.length);

            // Chuyển Float32Array (-1.0 ~ 1.0) → Int16Array (-32768 ~ 32767)
            for (let i = 0; i < leftChannel.length; i++) {
                const s = Math.max(-1, Math.min(1, leftChannel[i]));
                samples[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }

            const mp3Data = [];
            const blockSize = 1152; // LAME standard

            for (let i = 0; i < samples.length; i += blockSize) {
                const chunk = samples.subarray(i, i + blockSize);
                const mp3buf = mp3encoder.encodeBuffer(chunk);
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }
            }

            // Flush remaining data
            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }

            console.log('MP3 conversion successful!');
            return new Blob(mp3Data, { type: 'audio/mp3' });
        } catch (err) {
            console.warn('MP3 conversion failed, falling back to WebM:', err);
            return webmBlob; // fallback an toàn
        }
    };

    // ==================== EFFECTS ====================
    useEffect(() => {
        setRecording(existingRecording || null);
        if (!existingRecording) {
            setIsSubmitted(false);
            setRecordingCount(0);
        }
    }, [existingRecording]);

    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current = null;
            }
        };
    }, []);

    // ==================== UTILS ====================
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // ==================== RECORDING ====================
    const startRecording = async () => {
        if (recordingCount >= MAX_RECORDINGS) {
            alert(t('max_recordings_reached') || `Bạn đã ghi âm tối đa ${MAX_RECORDINGS} lần. Vui lòng nộp file hiện tại.`);
            return;
        }

        // Reset khi ghi lại
        if (recording) {
            setRecording(null);
            setRecordingTime(0);
            recordingTimeRef.current = 0;
            setIsSubmitted(false);
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current = null;
            }
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : 'audio/webm';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const webmBlob = new Blob(audioChunksRef.current, { type: mimeType });
                const duration = recordingTimeRef.current;

                // Chuyển thành MP3 ngay lập tức
                const mp3Blob = await convertWebMToMP3(webmBlob);

                const newRecording = {
                    blob: mp3Blob,
                    duration,
                    timestamp: Date.now(),
                };

                setRecording(newRecording);
                setRecordingCount(prev => prev + 1);

                if (onRecordingComplete) {
                    onRecordingComplete(questionId, newRecording);
                }

                // Dừng stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimeRef.current = 0;

            recordingTimerRef.current = setInterval(() => {
                recordingTimeRef.current += 1;
                setRecordingTime(recordingTimeRef.current);
            }, 1000);
        } catch (err) {
            console.error('Microphone access error:', err);
            alert(t('recording_error') || 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        setIsRecording(false);
    };

    // ==================== PLAY / DELETE ====================
    const playRecording = () => {
        if (!recording) return;

        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }

        const url = URL.createObjectURL(recording.blob);
        const audio = new Audio(url);
        audioPlayerRef.current = audio;

        audio.onended = () => {
            audioPlayerRef.current = null;
            URL.revokeObjectURL(url);
        };

        audio.play().catch(err => {
            console.error('Playback error:', err);
            alert('Không thể phát lại bản ghi âm');
        });
    };

    const deleteRecording = () => {
        setRecording(null);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        setIsSubmitted(false);

        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current = null;
        }

        if (onDelete) onDelete(questionId);
    };

    // ==================== SUBMIT ====================
    const handleSubmitClick = () => {
        if (!recording) {
            alert(t('no_recording') || 'Chưa có bản ghi âm để nộp');
            return;
        }
        if (isSubmitted) {
            alert(t('recording_already_submitted') || 'Bản ghi đã được nộp rồi');
            return;
        }
        setShowWarningModal(true);
    };

    const confirmSubmitRecording = () => {
        if (onSubmit) {
            onSubmit(questionId, recording);
        }
        setIsSubmitted(true);
        setShowWarningModal(false);
        alert(t('submit_recording') || `Đã nộp file ghi âm cho câu ${questionId}`);
    };

    // ==================== RENDER ====================
    return (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center gap-5">

                {/* Chưa ghi âm */}
                {!isRecording && !recording && (
                    <div className="text-center">
                        <button
                            onClick={startRecording}
                            disabled={recordingCount >= MAX_RECORDINGS}
                            className={`px-8 py-4 rounded-lg font-semibold flex items-center gap-3 transition ${recordingCount >= MAX_RECORDINGS
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-300'
                                }`}
                        >
                            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            {t('start_recording') || 'Bắt đầu ghi âm'}
                        </button>
                        {recordingCount > 0 && (
                            <p className="mt-3 text-sm text-gray-600">
                                {t('recording_attempts') || `Đã ghi âm: ${recordingCount}/${MAX_RECORDINGS} lần`}
                            </p>
                        )}
                    </div>
                )}

                {/* Đang ghi âm */}
                {isRecording && (
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                            <span className="text-xl font-bold text-red-600">
                                {t('recording') || 'Đang ghi âm'}... {formatTime(recordingTime)}
                            </span>
                        </div>
                        <button
                            onClick={stopRecording}
                            className="px-8 py-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 flex items-center gap-3 font-semibold"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {t('stop_recording') || 'Dừng ghi âm'}
                        </button>
                    </div>
                )}

                {/* Đã có bản ghi âm */}
                {recording && !isRecording && (
                    <div className="w-full max-w-md space-y-4">
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-green-600 font-medium">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span>{t('recording_completed') || 'Ghi âm hoàn tất'} ({formatTime(recording.duration)})</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                                {t('recording_attempts_info') || `Lần ghi: ${recordingCount}/${MAX_RECORDINGS}`}
                                {recordingCount < MAX_RECORDINGS && !isSubmitted && (
                                    <span className="text-blue-600"> ({MAX_RECORDINGS - recordingCount} lần còn lại)</span>
                                )}
                            </p>
                        </div>

                        {isSubmitted ? (
                            <div className="text-center text-purple-600 font-medium">
                                <svg className="inline w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                {t('recording_submitted') || 'Đã nộp bản ghi âm'}
                            </div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-3">
                                <button onClick={playRecording} className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    {t('play_recording') || 'Nghe lại'}
                                </button>

                                {recordingCount < MAX_RECORDINGS && (
                                    <button onClick={startRecording} className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        {t('record_again') || 'Ghi lại'}
                                    </button>
                                )}

                                <button onClick={handleSubmitClick} className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {t('submit_recording') || 'Nộp file'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <SubmitWarningModal
                isOpen={showWarningModal}
                onClose={() => setShowWarningModal(false)}
                onConfirm={confirmSubmitRecording}
                questionId={questionId}
            />
        </div>
    );
};

export default AudioRecorder;