import React, { useEffect, useMemo, useState } from 'react';
import { FiX, FiPlus, FiTrash2, FiLoader } from 'react-icons/fi';
import { createBulkTestQuestions } from '../../../service/api';

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

const CreateQuestionModal = ({ isOpen, onClose, testType, testId, onSuccess }) => {
  const typeConfig = useMemo(() => {
    return TEST_TYPE_CONFIG[String(testType)] || { label: 'Question', requiresOptions: false };
  }, [testType]);

  const [numberOfQuestions, setNumberOfQuestions] = useState('');
  const [questions, setQuestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Determine question limits per test type
  // API supports up to 50 questions; keep same cap for all types
  const questionLimits = useMemo(() => {
    if (typeConfig.label === 'EnglishSpeaking') {
      return { min: 1, max: 50 }; // Up to 50 per API, recommend 1-10
    } else if (typeConfig.label === 'EnglishListening' || typeConfig.label === 'Practical') {
      return { min: 1, max: 50 }; // Up to 50 per API, recommend 15-25
    }
    return { min: 1, max: 50 };
  }, [typeConfig.label]);

  useEffect(() => {
    if (isOpen) {
      setNumberOfQuestions('');
      setQuestions([]);
      setErrorMessage('');
      setIsSubmitting(false);
    }
  }, [isOpen, testType]);

  if (!isOpen) return null;

  const handleInitializeQuestions = () => {
    const count = parseInt(numberOfQuestions, 10);
    if (count >= questionLimits.min && count <= questionLimits.max) {
      const newQuestions = Array.from({ length: count }, () => ({
        questionContent: '',
        score: '',
        options: Array(MIN_OPTIONS).fill(''),
        correctAnswer: '',
      }));
      setQuestions(newQuestions);
    }
  };

  const handleQuestionChange = (questionIndex, field, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === questionIndex ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === questionIndex) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleAddOption = (questionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === questionIndex && q.options.length < MAX_OPTIONS) {
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    );
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === questionIndex && q.options.length > MIN_OPTIONS) {
          return { ...q, options: q.options.filter((_, optIdx) => optIdx !== optionIndex) };
        }
        return q;
      })
    );
  };

  const validateQuestions = () => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];

      // Validate question content
      if (!q.questionContent || q.questionContent.trim() === '') {
        setErrorMessage(`Question ${i + 1}: Content is required.`);
        return false;
      }

      // Validate score (1-100)
      const score = Number(q.score);
      if (!q.score || isNaN(score) || score < 1 || score > 100) {
        setErrorMessage(`Question ${i + 1}: Score must be between 1 and 100.`);
        return false;
      }

      // Validate options for Listening/Practical
      if (typeConfig.requiresOptions) {
        // Check if options array exists and has valid length
        if (!q.options || !Array.isArray(q.options) || q.options.length < MIN_OPTIONS || q.options.length > MAX_OPTIONS) {
          setErrorMessage(`Question ${i + 1}: Must have ${MIN_OPTIONS}-${MAX_OPTIONS} options.`);
          return false;
        }

        // Check if all options have content
        const emptyOptions = q.options.filter(opt => !opt || opt.trim() === '');
        if (emptyOptions.length > 0) {
          setErrorMessage(`Question ${i + 1}: All options must have content.`);
          return false;
        }

        // Check if correctAnswer is set and matches one of the options
        if (!q.correctAnswer || q.correctAnswer.trim() === '') {
          setErrorMessage(`Question ${i + 1}: Please select the correct answer.`);
          return false;
        }

        // Check if correctAnswer matches one of the options
        const correctOptionIndex = q.options.findIndex(opt => opt.trim() === q.correctAnswer.trim());
        if (correctOptionIndex === -1) {
          setErrorMessage(`Question ${i + 1}: Correct answer must match an option.`);
          return false;
        }

        // Check option content length (max 500 characters)
        const longOptions = q.options.filter(opt => opt && opt.length > 500);
        if (longOptions.length > 0) {
          setErrorMessage(`Question ${i + 1}: Option content must be <= 500 characters.`);
          return false;
        }
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validate testId
    if (!testId) {
      setErrorMessage('Invalid Test ID. Please check again.');
      return;
    }

    // Validate questions
    if (questions.length === 0) {
      setErrorMessage('Please create at least one question.');
      return;
    }

    // Validate all questions
    if (!validateQuestions()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Transform questions to match API format
      const questionsPayload = questions.map((q, index) => {
        const questionPayload = {
          questionContent: q.questionContent.trim(),
          score: Number(q.score),
          orderNumber: index + 1, // orderNumber starts from 1
        };

        // Add options for Listening/Practical types
        if (typeConfig.requiresOptions) {
          // Find the index of the correct answer
          const correctOptionIndex = q.options.findIndex(opt => opt.trim() === q.correctAnswer.trim());

          // Transform options array to match API format
          questionPayload.options = q.options.map((opt, optIndex) => ({
            optionContent: opt.trim(),
            isCorrect: optIndex === correctOptionIndex,
          }));
        }

        return questionPayload;
      });

      const response = await createBulkTestQuestions(testId, questionsPayload);

      if (response.success) {
        // Success - close modal and refresh
        if (typeof onSuccess === 'function') {
          onSuccess();
        }
        if (typeof onClose === 'function') {
          onClose();
        }
      } else {
        // Error from API
        setErrorMessage(response.error || 'Unable to create questions. Please try again.');
      }
    } catch (error) {
      console.error('Error creating questions:', error);
      setErrorMessage('An error occurred while creating questions. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <p className="text-sm font-medium uppercase text-indigo-600">Create questions</p>
            <h2 className="text-lg font-semibold text-gray-900">Type {typeConfig.label}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5 max-h-[80vh] overflow-y-auto">
          {errorMessage && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-800">{errorMessage}</p>
            </div>
          )}
          {questions.length === 0 ? (
            <div className="space-y-4">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Number of questions
                  </label>
                  <input
                    type="number"
                    min={questionLimits.min}
                    max={questionLimits.max}
                    value={numberOfQuestions}
                    onChange={(e) => setNumberOfQuestions(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder={`Enter question count (${questionLimits.min}-${questionLimits.max})`}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleInitializeQuestions}
                  disabled={
                    !numberOfQuestions ||
                    parseInt(numberOfQuestions, 10) < questionLimits.min ||
                    parseInt(numberOfQuestions, 10) > questionLimits.max
                  }
                  className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Build form
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {typeConfig.label === 'EnglishSpeaking'
                  ? 'Enter number of questions (max 50, recommended 1-10) then click "Build form"'
                  : 'Enter number of questions (max 50, recommended 15-25) then click "Build form"'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question, questionIndex) => (
                <div key={`question-${questionIndex}`} className="space-y-4 rounded-xl border border-gray-200 p-5 bg-gray-50">
                  <div className="flex items-center justify-between border-b border-gray-300 pb-2">
                    <h3 className="text-base font-semibold text-gray-900">Question {questionIndex + 1}</h3>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setQuestions((prev) => prev.filter((_, idx) => idx !== questionIndex))}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
                      >
                        Delete question
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-gray-700">Question content</label>
                      <textarea
                        value={question.questionContent}
                        onChange={(e) => handleQuestionChange(questionIndex, 'questionContent', e.target.value)}
                        rows={4}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter question content..."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">Score (1-100)</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={question.score}
                        onChange={(e) => handleQuestionChange(questionIndex, 'score', e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Enter score (1-100)"
                      />
                    </div>
                  </div>

                  {typeConfig.requiresOptions && (
                    <div className="space-y-4 rounded-2xl bg-white p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">Answer options</p>
                          <p className="text-xs text-gray-500">Enter 4 to 6 options</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddOption(questionIndex)}
                          disabled={question.options.length >= MAX_OPTIONS}
                          className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-colors disabled:border-gray-200 disabled:text-gray-400"
                        >
                          <FiPlus className="h-4 w-4" />
                          Add
                        </button>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {question.options.map((opt, optIndex) => (
                          <div key={`option-${questionIndex}-${optIndex}`} className="flex gap-2">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => handleOptionChange(questionIndex, optIndex, e.target.value)}
                              required
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              placeholder={`Option ${optIndex + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(questionIndex, optIndex)}
                              disabled={question.options.length <= MIN_OPTIONS}
                              className="rounded-lg border border-gray-200 p-2 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
                              aria-label="Remove option"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">Correct answer</label>
                        <select
                          value={question.correctAnswer}
                          onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', e.target.value)}
                          required
                          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">Select the correct answer</option>
                          {question.options.map((opt, optIdx) => (
                            opt && opt.trim() !== '' && (
                              <option key={optIdx} value={opt.trim()}>
                                {opt.trim()}
                              </option>
                            )
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                          Choose one of the options above as the correct answer
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {questions.length > 0 && (
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => {
                  setQuestions([]);
                  setNumberOfQuestions('');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <FiLoader className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  `Save ${questions.length} questions`
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateQuestionModal;

