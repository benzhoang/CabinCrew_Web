import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import RequestInfo from "../../components/AirlinePartnerComponent/RequestInfo";

const AirlineRequestDetailPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation()
  const request = state?.request

  
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(request.title)

const handleEditTitle = () => {
  setIsEditingTitle(true)
}

const handleSaveTitle = () => {
  // TODO: Implement save logic
  console.log('Saving title:', title)
  setIsEditingTitle(false)
  alert('Đã cập nhật tiêu đề!')
}

const handleCancelEditTitle = () => {
  setTitle(request.title)
  setIsEditingTitle(false)
}

const handleTitleKeyPress = (e) => {
  if (e.key === 'Enter') {
      handleSaveTitle()
  } else if (e.key === 'Escape') {
      handleCancelEditTitle()
  }
}

  return (
    <div className="w-full h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          {isEditingTitle ? (
            <div className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleTitleKeyPress}
                className="text-2xl font-bold text-slate-800 mb-2 bg-transparent border-b-2 border-red-600 focus:outline-none focus:border-red-800"
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveTitle}
                  className="text-green-600 hover:text-green-800 p-1 hover:bg-green-50 rounded"
                  title="Lưu"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  onClick={handleCancelEditTitle}
                  className="text-red-600 hover:text-red-800 p-1 hover:bg-red-50 rounded"
                  title="Hủy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                {request.title}
                <button
                                onClick={handleEditTitle}
                                className="text-blue-600 hover:text-blue-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Chỉnh sửa tiêu đề"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
              </h1>
              <p className="text-slate-600 mt-1 text-sm">
                Mã yêu cầu: {request.code}
              </p>
            </div>
          )}
        </div>
        <button
          onClick={() => navigate("/airline-partner/requests")}
          className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700"
        >
          Quay lại
        </button>
      </div>

      <div className="space-y-5">
        <RequestInfo />
      </div>
    </div>
  );
};

export default AirlineRequestDetailPage;