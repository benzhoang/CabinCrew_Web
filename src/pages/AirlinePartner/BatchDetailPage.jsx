import React, { useState } from 'react';
import { FaCheck, FaEye, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const formatDate = (isoString) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  if (Number.isNaN(date.getTime())) return isoString
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

const RoundDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [selectedRound, setSelectedRound] = useState(1);

  // Sample data for available rounds
  const availableRounds = [
    { id: 1, name: "Vòng 1", startDate: "2024-10-01", endDate: "2024-10-15", location: "Hà Nội", quota: "7/10" },
    { id: 2, name: "Vòng 2", startDate: "2024-10-16", endDate: "2024-10-30", location: "TP.HCM", quota: "5/8" },
    { id: 3, name: "Vòng 3", startDate: "2024-11-01", endDate: "2024-11-15", location: "Đà Nẵng", quota: "3/6" }
  ];

  // Prefer round info passed via navigation state; fallback to local sample
  const stateRoundInfo = React.useMemo(() => {
    if (!state) return null;
    const passedRound = state.round || {};
    const passedCampaign = state.campaign || {};
    return {
      name: state.roundName || passedRound.name || passedCampaign.roundName,
      startDate: passedRound.startDate || passedCampaign.startDate,
      endDate: passedRound.endDate || passedCampaign.endDate,
      location: passedRound.location || passedCampaign.location,
      quota: passedRound.target || passedCampaign.target || passedCampaign.quota || passedCampaign.quantity,
    };
  }, [state]);

  // Round details used in the UI
  const roundInfo = stateRoundInfo || (availableRounds.find(round => round.id === selectedRound) || availableRounds[0]);

  // Sample data for candidates (memoized to avoid re-creation each render)
  const candidates = React.useMemo(() => [
    {
      id: 1,
      roundId: 1,
      name: "Nguyễn Thị Lan",
      university: "Đại học Ngoại thương",
      email: "lan.nguyen@email.com",
      phone: "0901234567",
      experience: "2 năm",
      languages: "Tiếng Việt, Tiếng Anh",
      applicationDate: "2024-10-15",
      status: "Chờ xử lý",
      score: "-",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 2,
      roundId: 1,
      name: "Trần Văn Minh",
      university: "Đại học Bách khoa",
      email: "minh.tran@email.com",
      phone: "0912345678",
      experience: "3 năm",
      languages: "Tiếng Việt, Tiếng Anh, Tiếng Nhật",
      applicationDate: "2024-10-16",
      status: "Đã duyệt",
      score: "-",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 3,
      roundId: 1,
      name: "Lê Thị Hương",
      university: "Cao đẳng Du lịch",
      email: "huong.le@email.com",
      phone: "0923456789",
      experience: "1 năm",
      languages: "Tiếng Việt, Tiếng Anh",
      applicationDate: "2024-10-17",
      status: "Từ chối",
      score: "-",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
      id: 4,
      roundId: 1,
      name: "Phạm Văn Đức",
      university: "Đại học Kinh tế",
      email: "duc.pham@email.com",
      phone: "0934567890",
      experience: "4 năm",
      languages: "Tiếng Việt, Tiếng Anh, Tiếng Hàn",
      applicationDate: "2024-10-18",
      status: "Chờ xử lý",
      score: "-",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
    }
  ], []);

  const filteredCandidates = React.useMemo(() => {
    return candidates.filter((c) => c.roundId === selectedRound)
  }, [candidates, selectedRound])

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
          <div className="flex items-center justify-between">
            <div>
            <h1 className="text-2xl md:text-3xl font-extrabold">Danh sách ứng viên - {roundInfo.name}</h1>
            <p className="text-white/90 mt-1 text-sm">Sàng lọc và đánh giá ứng viên cho vòng tuyển dụng</p>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
            >
              Quay lại
            </button>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Recruitment Batch Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Thông tin vòng tuyển
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div>
              <p className="text-gray-600 text-sm mb-1">Tên vòng:</p>
              <p className="font-bold text-gray-900">{roundInfo.name}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Thời gian bắt đầu:</p>
              <p className="font-bold text-gray-900">{formatDate(roundInfo.startDate)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Thời gian kết thúc:</p>
              <p className="font-bold text-gray-900">{formatDate(roundInfo.endDate)}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Địa điểm:</p>
              <p className="font-bold text-gray-900">{roundInfo.location}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm mb-1">Chỉ tiêu:</p>
              <p className="font-bold text-gray-900">{roundInfo.quota}</p>
            </div>
          </div>
        </div>

  

        {/* Candidate List Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Danh sách ứng viên ({filteredCandidates.length})
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 mr-2">Chọn vòng:</span>
              {availableRounds.map((round) => (
                <button
                  key={round.id}
                  onClick={() => setSelectedRound(round.id)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    selectedRound === round.id
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {round.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">HÌNH</th>
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
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-6 text-center text-gray-500">Chưa có ứng viên cho vòng này</td>
                  </tr>
                ) : (
                  filteredCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className='py-4 px-4'>
                    <img 
                          src={candidate.avatar} 
                          alt={candidate.name}
                          className="w-16 h-20 rounded-md object-cover border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name)}&background=random&color=fff&size=48`;
                          }}
                        />
                    </td>
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
                      <p className="text-sm text-gray-900">{formatDate(candidate.applicationDate)}</p>
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
                          className="p-2 rounded-md border border-gray-200  hover:bg-gray-100 text-yellow-300 hover:text-yellow-400"
                          onClick={() => navigate(`/airline-partner/campaigns/${id}/candidates/${candidate.id}`)}
                        >
                         <FaEye/>
                        </button>
                        <button className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 text-green-500 hover:text-green-600">
                          <FaCheck/>
                        </button>
                        <button className="p-2 rounded-md border border-gray-200 hover:bg-gray-100 text-red-500 hover:text-red-600">
                          <FaTrash/>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoundDetailPage;