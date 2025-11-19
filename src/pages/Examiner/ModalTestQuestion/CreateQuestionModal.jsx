import React, { useEffect, useMemo, useState } from 'react';
import { FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

const TEST_TYPE_CONFIG = {
  '1': { label: 'EnglishListening', requiresOptions: true },
  EnglishListening: { label: 'EnglishListening', requiresOptions: true },
  '2': { label: 'EnglishSpeaking', requiresOptions: false },
  EnglishSpeaking: { label: 'EnglishSpeaking', requiresOptions: false },
  '3': { label: 'Practical', requiresOptions: true },
  Practical: { label: 'Practical', requiresOptions: true },
};

const MIN_OPTIONS = 4;
const MAX_OPTIONS = 6;

const CreateQuestionModal = ({ isOpen, onClose, testType }) => {
  const typeConfig = useMemo(() => {
    return TEST_TYPE_CONFIG[String(testType)] || { label: 'Question', requiresOptions: false };
  }, [testType]);

  const [questionContent, setQuestionContent] = useState('');
  const [score, setScore] = useState('');
  const [options, setOptions] = useState(Array(MIN_OPTIONS).fill(''));
  const [correctAnswer, setCorrectAnswer] = useState('');

  useEffect(() => {
    if (isOpen) {
      setQuestionContent('');
      setScore('');
      setOptions(Array(MIN_OPTIONS).fill(''));
      setCorrectAnswer('');
    }
  }, [isOpen, testType]);

  if (!isOpen) return null;

  const handleOptionChange = (index, value) => {
    setOptions((prev) => prev.map((opt, idx) => (idx === index ? value : opt)));
  };

  const handleAddOption = () => {
    if (options.length >= MAX_OPTIONS) return;
    setOptions((prev) => [...prev, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= MIN_OPTIONS) return;
    setOptions((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      questionContent,
      score: Number(score),
      type: typeConfig.label,
      options: typeConfig.requiresOptions ? options : undefined,
      correctAnswer: typeConfig.requiresOptions ? correctAnswer : undefined,
    };
    // TODO: integrate with create question API
    console.log('Create question payload', payload);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <p className="text-sm font-medium uppercase text-indigo-600">Tạo câu hỏi</p>
            <h2 className="text-lg font-semibold text-gray-900">Dạng {typeConfig.label}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Đóng"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5 max-h-[80vh] overflow-y-auto">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Nội dung câu hỏi</label>
              <textarea
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                rows={4}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Nhập nội dung câu hỏi..."
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Điểm</label>
              <input
                type="number"
                min={0}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Nhập số điểm"
              />
            </div>
          </div>

          {typeConfig.requiresOptions && (
            <div className="space-y-4 rounded-2xl bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Phương án trả lời</p>
                  <p className="text-xs text-gray-500">Nhập từ 4 đến 6 phương án</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddOption}
                  disabled={options.length >= MAX_OPTIONS}
                  className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors disabled:border-gray-200 disabled:text-gray-400"
                >
                  <FiPlus className="h-4 w-4" />
                  Thêm
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {options.map((opt, index) => (
                  <div key={`option-${index}`} className="flex gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      required
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={`Phương án ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      disabled={options.length <= MIN_OPTIONS}
                      className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
                      aria-label="Xoá phương án"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Câu trả lời chính xác</label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Nhập câu trả lời chính xác"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Lưu câu hỏi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionModal;

