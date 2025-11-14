import React, { useState, useRef, useEffect } from 'react';
import { t } from '../../../i18n';
import SubmitWarningModal from './SubmitWarningModal';

/**
 * AudioRecorder Component
 * Component quản lý việc ghi âm, phát lại, xuất và xóa recording
 */
const AudioRecorder = ({ questionId, existingRecording, onRecordingComplete, onDelete, onSubmit }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recording, setRecording] = useState(existingRecording || null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [recordingCount, setRecordingCount] = useState(0); // Đếm số lần ghi âm
    const [showWarningModal, setShowWarningModal] = useState(false); // Hiển thị pop-up warning
    const MAX_RECORDINGS = 3; // Số lần ghi âm tối đa

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordingTimerRef = useRef(null);
    const audioPlayerRef = useRef(null);
    const recordingTimeRef = useRef(0);

    // Cập nhật recording khi existingRecording thay đổi
    useEffect(() => {
        setRecording(existingRecording || null);
        // Reset trạng thái nộp khi recording thay đổi
        if (!existingRecording) {
            setIsSubmitted(false);
            setRecordingCount(0);
        }
    }, [existingRecording]);

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current);
            }
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current = null;
            }
        };
    }, []);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Bắt đầu ghi âm
    const startRecording = async () => {
        // Kiểm tra số lần ghi âm đã đạt tối đa
        if (recordingCount >= MAX_RECORDINGS) {
            alert(t('max_recordings_reached') || `Bạn đã ghi âm tối đa ${MAX_RECORDINGS} lần. Vui lòng nộp file ghi âm hiện tại.`);
            return;
        }

        // Xóa recording cũ nếu đang ghi lại (nhưng không gọi onDelete vì đây là ghi lại, không phải xóa)
        if (recording) {
            setRecording(null);
            setRecordingTime(0);
            recordingTimeRef.current = 0;
            setIsSubmitted(false); // Reset trạng thái nộp khi ghi lại
            // Dừng audio player nếu đang phát
            if (audioPlayerRef.current) {
                audioPlayerRef.current.pause();
                audioPlayerRef.current = null;
            }
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus'
            });

            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
                // Sử dụng ref để đảm bảo lấy được giá trị thời gian chính xác
                const finalDuration = recordingTimeRef.current;
                const newRecording = {
                    blob: audioBlob,
                    duration: finalDuration,
                    timestamp: Date.now()
                };

                setRecording(newRecording);
                // Tăng số lần ghi âm
                setRecordingCount(prev => prev + 1);

                // Gọi callback để thông báo cho component cha
                if (onRecordingComplete) {
                    onRecordingComplete(questionId, newRecording);
                }

                // Dừng tất cả tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimeRef.current = 0;

            // Bắt đầu đếm thời gian ghi âm
            recordingTimerRef.current = setInterval(() => {
                recordingTimeRef.current = recordingTimeRef.current + 1;
                setRecordingTime(recordingTimeRef.current);
            }, 1000);

        } catch (error) {
            console.error('Lỗi khi bắt đầu ghi âm:', error);
            alert(t('recording_error') || 'Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.');
        }
    };

    // Dừng ghi âm
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

    // Xóa recording
    const deleteRecording = () => {
        setRecording(null);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        setIsSubmitted(false);

        // Dừng audio player nếu đang phát
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
            audioPlayerRef.current = null;
        }

        // Gọi callback để thông báo cho component cha
        if (onDelete) {
            onDelete(questionId);
        }
    };

    // Phát lại recording
    const playRecording = () => {
        if (!recording) return;

        // Dừng audio cũ nếu đang phát
        if (audioPlayerRef.current) {
            audioPlayerRef.current.pause();
        }

        const audio = new Audio(URL.createObjectURL(recording.blob));
        audioPlayerRef.current = audio;

        audio.onended = () => {
            audioPlayerRef.current = null;
        };

        audio.onerror = (error) => {
            console.error('Lỗi khi phát audio:', error);
            audioPlayerRef.current = null;
        };

        audio.play().catch(error => {
            console.error('Lỗi khi bắt đầu phát audio:', error);
            audioPlayerRef.current = null;
        });
    };

    // Hiển thị pop-up warning khi nhấn nộp
    const handleSubmitClick = () => {
        if (!recording) {
            alert(t('no_recording') || 'Không có bản ghi âm để nộp');
            return;
        }

        if (isSubmitted) {
            alert(t('recording_already_submitted') || 'Bản ghi âm đã được nộp');
            return;
        }

        // Hiển thị pop-up warning
        setShowWarningModal(true);
    };

    // Xác nhận nộp file ghi âm (sau khi người dùng xác nhận trong pop-up)
    const confirmSubmitRecording = () => {
        // Gọi callback để thông báo cho component cha
        if (onSubmit) {
            onSubmit(questionId, recording);
        }

        setIsSubmitted(true);
        setShowWarningModal(false);
        alert(t('submit_recording') || `Đã nộp file ghi âm cho câu hỏi ${questionId}`);
    };

    // Export recording thành file MP3 (cần thư viện lamejs)
    const exportToMP3 = async (questionId) => {
        if (!recording) {
            alert(t('no_recording') || 'Không có bản ghi âm để xuất');
            return;
        }

        try {
            // Chuyển đổi WebM sang MP3 sử dụng lamejs
            // Lưu ý: Cần cài đặt lamejs: npm install lamejs
            const { default: lamejs } = await import('lamejs');

            // Đọc audio blob thành ArrayBuffer
            const arrayBuffer = await recording.blob.arrayBuffer();
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

            // Chuyển đổi sang MP3
            const mp3encoder = new lamejs.Mp3Encoder(1, audioBuffer.sampleRate, 128);
            const samples = audioBuffer.getChannelData(0);
            const sampleBlockSize = 1152;
            const mp3Data = [];

            for (let i = 0; i < samples.length; i += sampleBlockSize) {
                const sampleChunk = samples.subarray(i, i + sampleBlockSize);
                const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
                if (mp3buf.length > 0) {
                    mp3Data.push(mp3buf);
                }
            }

            const mp3buf = mp3encoder.flush();
            if (mp3buf.length > 0) {
                mp3Data.push(mp3buf);
            }

            // Tạo Blob từ MP3 data
            const mp3Blob = new Blob(mp3Data, { type: 'audio/mp3' });

            // Tạo URL và download
            const url = URL.createObjectURL(mp3Blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `speaking_question_${questionId}_${Date.now()}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            alert(t('export_success') || 'Xuất file MP3 thành công!');
        } catch (error) {
            console.error('Lỗi khi xuất MP3:', error);
            // Fallback: xuất file WebM nếu không thể chuyển đổi sang MP3
            exportRecording(questionId);
            alert(t('export_webm_fallback') || 'Đã xuất file WebM (không thể chuyển đổi sang MP3)');
        }
    };

    return (
        <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-col items-center gap-4">
                {/* Trạng thái chưa ghi âm */}
                {!isRecording && !recording && (
                    <div className="flex flex-col items-center gap-3">
                        <button
                            onClick={startRecording}
                            disabled={recordingCount >= MAX_RECORDINGS}
                            className={`px-8 py-4 rounded-lg focus:outline-none focus:ring-2 flex items-center gap-3 font-semibold ${recordingCount >= MAX_RECORDINGS
                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                                }`}
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            {t('start_recording') || 'Bắt đầu ghi âm'}
                        </button>
                        {recordingCount > 0 && (
                            <p className="text-sm text-gray-600">
                                {t('recording_attempts') || `Đã ghi âm: ${recordingCount}/${MAX_RECORDINGS} lần`}
                            </p>
                        )}
                    </div>
                )}

                {/* Trạng thái đang ghi âm */}
                {isRecording && (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-600 rounded-full animate-pulse"></div>
                                <span className="text-lg font-semibold text-red-600">
                                    {t('recording') || 'Đang ghi âm'}... {formatTime(recordingTime)}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={stopRecording}
                            className="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center gap-3 font-semibold"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {t('stop_recording') || 'Dừng ghi âm'}
                        </button>
                    </>
                )}

                {/* Trạng thái đã ghi âm */}
                {recording && !isRecording && (
                    <div className="w-full space-y-4">
                        <div className="flex items-center justify-center gap-2 text-green-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">
                                {t('recording_completed') || 'Đã ghi âm'} ({formatTime(recording.duration)})
                            </span>
                        </div>
                        <div className="text-center text-sm text-gray-600">
                            {t('recording_attempts_info') || `Đã ghi âm: ${recordingCount}/${MAX_RECORDINGS} lần`}
                            {recordingCount < MAX_RECORDINGS && !isSubmitted && (
                                <span className="ml-2 text-blue-600">
                                    ({MAX_RECORDINGS - recordingCount} {t('attempts_remaining') || 'lần còn lại'})
                                </span>
                            )}
                        </div>
                        {isSubmitted ? (
                            <div className="flex items-center justify-center gap-2 text-purple-600">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">
                                    {t('recording_submitted') || 'Đã nộp file ghi âm'}
                                </span>
                            </div>
                        ) : (
                            <div className="flex gap-3 justify-center flex-wrap">
                                <button
                                    onClick={playRecording}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                    {t('play_recording') || 'Phát lại'}
                                </button>
                                {recordingCount < MAX_RECORDINGS && (
                                    <button
                                        onClick={startRecording}
                                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                        </svg>
                                        {t('record_again') || 'Ghi âm lại'}
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmitClick}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    {t('submit_recording') || 'Nộp file ghi âm'}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {/* Pop-up warning khi nộp file */}
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