import { FaTimes } from 'react-icons/fa';

const TestModal = ({ isOpen, onClose, candidate }) => {
  if (!isOpen) return null;

  // Sample test data - replace with actual data from props
  const testData = candidate?.test || {
    questions: [
      {
        id: 1,
        type: 'reading',
        question: 'Đọc đoạn văn sau và trả lời câu hỏi...',
        answer: 'Đáp án của ứng viên cho câu hỏi 1',
        score: 8,
        maxScore: 10
      },
      {
        id: 2,
        type: 'listening',
        question: 'Nghe đoạn hội thoại và chọn đáp án đúng...',
        answer: 'Đáp án của ứng viên cho câu hỏi 2',
        score: 9,
        maxScore: 10
      },
      {
        id: 3,
        type: 'speaking',
        question: 'Hãy giới thiệu về bản thân trong vòng 2 phút...',
        answer: 'Tôi tên là...',
        score: 7,
        maxScore: 10
      }
    ]
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Bài thi</h2>
            <p className="text-sm text-gray-500 mt-1">{candidate?.name || 'Nguyễn Thị Lan'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {testData.questions.map((q, index) => (
            <div key={q.id} className="bg-gray-50 rounded-lg p-5 space-y-3 border border-gray-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">Câu {index + 1}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      q.type === 'speaking' ? 'bg-blue-100 text-blue-700' :
                      q.type === 'listening' ? 'bg-green-100 text-green-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {q.type === 'speaking' ? 'Speaking' :
                       q.type === 'listening' ? 'Listening' : 'Reading'}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium mb-3">{q.question}</p>
                </div>
                <div className="ml-4 text-right">
                  <p className="text-sm text-gray-600">Điểm</p>
                  <p className="text-lg font-semibold text-indigo-600">
                    {q.score}/{q.maxScore}
                  </p>
                </div>
              </div>
              <div className="bg-white rounded p-3 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-1">Đáp án:</p>
                <p className="text-gray-900 text-sm">{q.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestModal;

