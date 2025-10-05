import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BatchDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Sample data for batch information
  const batchInfo = {
    name: "Đợt 1",
    time: "01/10/2024 - 15/10/2024",
    location: "Hà Nội",
    quota: "7/10"
  };

  // Sample data for candidates
  const candidates = [
    {
      id: 1,
      name: "Nguyễn Thị Lan",
      university: "Đại học Ngoại thương",
      email: "lan.nguyen@email.com",
      phone: "0901234567",
      experience: "2 năm",
      languages: "Tiếng Việt, Tiếng Anh",
      applicationDate: "2024-10-15",
      status: "Chờ xử lý",
      score: "-"
    },
    {
      id: 2,
      name: "Trần Văn Minh",
      university: "Đại học Bách khoa",
      email: "minh.tran@email.com",
      phone: "0912345678",
      experience: "3 năm",
      languages: "Tiếng Việt, Tiếng Anh, Tiếng Nhật",
      applicationDate: "2024-10-16",
      status: "Đã duyệt",
      score: "85/100"
    },
    {
      id: 3,
      name: "Lê Thị Hương",
      university: "Cao đẳng Du lịch",
      email: "huong.le@email.com",
      phone: "0923456789",
      experience: "1 năm",
      languages: "Tiếng Việt, Tiếng Anh",
      applicationDate: "2024-10-17",
      status: "Từ chối",
      score: "65/100"
    },
    {
      id: 4,
      name: "Phạm Văn Đức",
      university: "Đại học Kinh tế",
      email: "duc.pham@email.com",
      phone: "0934567890",
      experience: "4 năm",
      languages: "Tiếng Việt, Tiếng Anh, Tiếng Hàn",
      applicationDate: "2024-10-18",
      status: "Chờ xử lý",
      score: "-"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Chờ xử lý":
        return "bg-yellow-100 text-yellow-800";
      case "Đã duyệt":
        return "bg-green-100 text-green-800";
      case "Từ chối":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <div className="max-w-7xl mx-auto px-6 py-8">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold">Danh sách ứng viên - {batchInfo.name}</h1>
                                <p className="text-white/90 mt-1 text-sm">Sàng lọc và đánh giá ứng viên cho đợt tuyển dụng</p>
                            </div>
                        </div>
                    </div>
                </div>


      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Recruitment Batch Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Thông tin đợt tuyển
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Tên đợt:</p>
              <p className="font-bold text-gray-900">{batchInfo.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Thời gian:</p>
              <p className="font-bold text-gray-900">{batchInfo.time}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Địa điểm:</p>
              <p className="font-bold text-gray-900">{batchInfo.location}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Chỉ tiêu:</p>
              <p className="font-bold text-gray-900">{batchInfo.quota}</p>
            </div>
          </div>
        </div>

        {/* Candidate List Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Danh sách ứng viên ({candidates.length})
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ỨNG VIÊN</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">LIÊN HỆ</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">KINH NGHIỆM</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">NGÀY ỨNG TUYỂN</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">TRẠNG THÁI</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">ĐIỂM</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-gray-900">{candidate.name}</p>
                        <p className="text-sm text-gray-600">{candidate.university}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{candidate.email}</p>
                        <p className="text-sm text-gray-600">{candidate.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{candidate.experience}</p>
                        <p className="text-sm text-gray-600">{candidate.languages}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{candidate.applicationDate}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-gray-900">{candidate.score}</p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex space-x-3">
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          onClick={() => navigate(`/airline-partner/campaigns/${id}/candidates/${candidate.id}`)}
                        >
                          Xem
                        </button>
                        <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                          Duyệt
                        </button>
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Từ chối
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchDetail;