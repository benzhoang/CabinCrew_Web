import { useParams, useNavigate } from 'react-router-dom'

const CandidateDetailPage = () => {
  const { id, candidateId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="w-full h-full">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-semibold text-gray-900">Chi tiết ứng viên</div>
            <div className="text-sm text-gray-600">Chiến dịch #{id} • Ứng viên #{candidateId}</div>
          </div>
          <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50" onClick={() => navigate(-1)}>Quay lại</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="font-medium text-gray-900 mb-2">Hồ sơ</div>
            <div className="text-sm text-gray-700 space-y-1">
              <div>Họ tên: Trần Bảo Vy</div>
              <div>Email: vy@example.com</div>
              <div>Số điện thoại: 0901 234 567</div>
            </div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="font-medium text-gray-900 mb-2">Đánh giá</div>
            <div className="text-sm text-gray-700">Chưa có đánh giá.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateDetailPage