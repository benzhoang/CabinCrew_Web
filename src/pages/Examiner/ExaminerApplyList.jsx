import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onLangChange } from "../../i18n";
import { FiPlus } from "react-icons/fi";

// Mock data for applicants (tuyển dụng + thăng bậc)
const mockApplicants = [
  {
    id: 1,
    name: "Nguyễn Thị Lan",
    email: "lan.nguyen@email.com",
    phone: "0901234567",
    position: "Flight Attendant",
    appliedDate: "2024-10-15",
    status: "pending",
    score: null,
    experience: "2 năm",
    education: "Đại học Ngoại thương",
    languages: ["Tiếng Việt", "Tiếng Anh"],
    batchName: "Đợt 1",
    campaignId: 1,
    photo:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=200&fit=crop&crop=face",
    round: "screening",
    applicationType: "recruitment",
  },
  {
    id: 2,
    name: "Trần Văn Minh",
    email: "minh.tran@email.com",
    phone: "0912345678",
    position: "Flight Attendant",
    appliedDate: "2024-10-16",
    status: "approved",
    score: 85,
    experience: "3 năm",
    education: "Đại học Bách khoa",
    languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Nhật"],
    batchName: "Đợt 1",
    campaignId: 1,
    photo:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=200&fit=crop&crop=face",
    round: "final",
    applicationType: "recruitment",
  },
  {
    id: 3,
    name: "Lê Thị Hương",
    email: "huong.le@email.com",
    phone: "0923456789",
    position: "Flight Attendant",
    appliedDate: "2024-10-17",
    status: "rejected",
    score: 65,
    experience: "1 năm",
    education: "Cao đẳng Du lịch",
    languages: ["Tiếng Việt", "Tiếng Anh"],
    batchName: "Đợt 1",
    campaignId: 1,
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=200&fit=crop&crop=face",
    round: "test",
    applicationType: "recruitment",
  },
  {
    id: 4,
    name: "Phạm Văn Đức",
    email: "duc.pham@email.com",
    phone: "0934567890",
    position: "Flight Attendant",
    appliedDate: "2024-10-18",
    status: "pending",
    score: null,
    experience: "4 năm",
    education: "Đại học Kinh tế",
    languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Hàn"],
    batchName: "Đợt 1",
    campaignId: 1,
    round: "grooming",
    applicationType: "recruitment",
  },
  {
    id: 5,
    name: "Võ Thị Mai",
    email: "mai.vo@email.com",
    phone: "0945678901",
    position: "Flight Attendant",
    appliedDate: "2024-10-19",
    status: "pending",
    score: 78,
    experience: "2 năm",
    education: "Đại học Sư phạm",
    languages: ["Tiếng Việt", "Tiếng Anh"],
    batchName: "Đợt 1",
    campaignId: 1,
    round: "interview",
    applicationType: "recruitment",
  },
  {
    id: 101,
    name: "Bùi Thị Ánh",
    email: "anh.bui@vietjetair.com",
    phone: "0978123123",
    position: "Senior Cabin Crew",
    appliedDate: "2024-10-12",
    status: "interview",
    score: 92,
    experience: "5 năm",
    education: "Đại học Giao thông Vận tải",
    languages: ["Tiếng Việt", "Tiếng Anh"],
    batchName: "Đợt 1",
    campaignId: 1,
    round: "interview",
    applicationType: "promotion",
    currentPosition: "Cabin Crew",
    targetPosition: "Senior Cabin Crew",
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=200&fit=crop&crop=face",
  },
  {
    id: 102,
    name: "Đỗ Minh Quân",
    email: "quan.do@vietjetair.com",
    phone: "0987123456",
    position: "Cabin Supervisor",
    appliedDate: "2024-10-10",
    status: "approved",
    score: 88,
    experience: "7 năm",
    education: "Đại học Kinh tế Quốc dân",
    languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Pháp"],
    batchName: "Đợt 1",
    campaignId: 1,
    round: "final",
    applicationType: "promotion",
    currentPosition: "Senior Cabin Crew",
    targetPosition: "Cabin Supervisor",
    photo:
      "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=150&h=200&fit=crop&crop=face",
  },
  {
    id: 103,
    name: "Trịnh Ngọc Hà",
    email: "ha.trinh@vietjetair.com",
    phone: "0905566778",
    position: "Cabin Crew Trainer",
    appliedDate: "2024-10-18",
    status: "pending",
    score: 80,
    experience: "6 năm",
    education: "Đại học Sư phạm",
    languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Hàn"],
    batchName: "Đợt 1",
    campaignId: 1,
    round: "grooming",
    applicationType: "promotion",
    currentPosition: "Senior Cabin Crew",
    targetPosition: "Cabin Crew Trainer",
    photo:
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=200&fit=crop&crop=face",
  },
];

const ExaminerApplyList = () => {
  const [applicantSearchTerm, setApplicantSearchTerm] = useState("");
  const [, setLangVersion] = useState(0);
  const [roundFilter, setRoundFilter] = useState("all");
  const [applicationTypeFilter, setApplicationTypeFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const off = onLangChange(() => setLangVersion((v) => v + 1));
    return () => off();
  }, []);

  // Filter applicants for specific batch + Application type
  const filteredApplicants = useMemo(() => {
    let list = mockApplicants;

    if (applicationTypeFilter !== "all") {
      list = list.filter(
        (applicant) => applicant.applicationType === applicationTypeFilter
      );
    }

    if (roundFilter !== "all") {
      list = list.filter(
        (applicant) => (applicant.round || "screening") === roundFilter
      );
    }

    if (applicantSearchTerm) {
      const q = applicantSearchTerm.toLowerCase();
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.phone || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [applicantSearchTerm, roundFilter, applicationTypeFilter]);

  const getApplicantStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", text: "Chờ xử lý" },
      approved: { color: "bg-green-100 text-green-800", text: "Đã duyệt" },
      rejected: { color: "bg-red-100 text-red-800", text: "Từ chối" },
      interview: { color: "bg-blue-100 text-blue-800", text: "Phỏng vấn" },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getRoundBadge = (round) => {
    const roundConfig = {
      screening: {
        color: "bg-indigo-100 text-indigo-800",
        text: "Vòng sàng lọc",
      },
      grooming: {
        color: "bg-purple-100 text-purple-800",
        text: "Vòng grooming",
      },
      test: { color: "bg-amber-100 text-amber-800", text: "Vòng kiểm tra" },
      interview: { color: "bg-teal-100 text-teal-800", text: "Vòng phỏng vấn" },
      final: {
        color: "bg-slate-200 text-slate-800",
        text: "Kết quả cuối cùng",
      },
    };
    const config = roundConfig[round] || roundConfig.screening;
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getApplicationTypeBadge = (type) => {
    const map = {
      recruitment: {
        color: "bg-blue-100 text-blue-700",
        text: "Tuyển dụng",
      },
      promotion: {
        color: "bg-purple-100 text-purple-700",
        text: "Thăng bậc",
      },
    };

    const config = map[type] || map.recruitment;
    return (
      <span
        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const handleCreateTest = () => {
    // TODO: Navigate to create test page or open modal
    navigate("/examiner/testing/create");
  };

  const getEvaluationRoute = (applicant) =>
    applicant.applicationType === "promotion"
      ? `/examiner/cabin-crew/${applicant.id}`
      : `/examiner/candidate/${applicant.id}`;

  const handleNavigateToEvaluation = (applicant) => {
    const targetRoute = getEvaluationRoute(applicant);
    navigate(targetRoute, {
      state: {
        candidate: applicant,
      },
    });
  };

  const goBackToCampaigns = () => {
    navigate(-1);
  };

  // Render applicant list view
  return (
    <div className="">
      {/* Page hero */}
      <div className="text-white bg-gradient-to-r from-indigo-600 to-blue-600">
        <div className="px-6 py-8 mx-auto max-w-7xl">
          <div className="flex items-center gap-4">
            <button
              onClick={goBackToCampaigns}
              className="p-2 transition-colors rounded-lg hover:bg-white/10"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-extrabold md:text-3xl">
                Danh sách ứng viên
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Sàng lọc và đánh giá ứng viên tuyển dụng & thăng bậc
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 mx-auto max-w-7xl">
        {/* Applicants List */}
        <div className="bg-white border shadow-sm rounded-xl border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-semibold text-slate-800">
                Danh sách ứng viên ({filteredApplicants.length})
              </h3>
              <div className="flex flex-col w-full gap-3 md:flex-row md:w-auto md:items-center">
                {roundFilter === "test" && (
                  <button
                    onClick={handleCreateTest}
                    className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700"
                  >
                    <FiPlus className="w-5 h-5" />
                    Tạo đề thi mới
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Loại hồ sơ:</label>
                  <select
                    className="px-3 py-2 text-sm border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={applicationTypeFilter}
                    onChange={(e) => setApplicationTypeFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="recruitment">Tuyển dụng</option>
                    <option value="promotion">Thăng bậc</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600">Vòng:</label>
                  <select
                    className="px-3 py-2 text-sm border rounded-md border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={roundFilter}
                    onChange={(e) => setRoundFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="screening">Vòng sàng lọc</option>
                    <option value="grooming">Vòng grooming</option>
                    <option value="test">Vòng kiểm tra</option>
                    <option value="interview">Vòng phỏng vấn</option>
                    <option value="final">Kết quả cuối cùng</option>
                  </select>
                </div>
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder="Tìm theo tên, email, SĐT..."
                    className="w-full py-2 pr-3 text-sm border rounded-md border-slate-300 pl-9 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={applicantSearchTerm}
                    onChange={(e) => setApplicantSearchTerm(e.target.value)}
                  />
                  <svg
                    className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-4.35-4.35M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Ảnh 4x6
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Ứng viên
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Liên hệ
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Ngày ứng tuyển
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Vòng
                  </th>
                  <th className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-slate-500">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-16 h-20 overflow-hidden rounded-md bg-slate-100">
                        <img
                          src={
                            applicant.photo ||
                            "https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo"
                          }
                          alt={`Ảnh ${applicant.name}`}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/64x80/cccccc/666666?text=No+Photo";
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-900">
                          {applicant.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {applicant.education}
                        </div>
                        <div className="mt-1">
                          {getApplicationTypeBadge(applicant.applicationType)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">
                        {applicant.email}
                      </div>
                      <div className="text-sm text-slate-500">
                        {applicant.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-900">
                      {applicant.appliedDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getApplicantStatusBadge(applicant.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoundBadge(applicant.round || "screening")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-center whitespace-nowrap">
                      <button
                        className="p-1 text-blue-600 transition-colors rounded hover:text-blue-900 hover:bg-blue-50"
                        title="Xem chi tiết"
                        onClick={() => handleNavigateToEvaluation(applicant)}
                      >
                        <svg
                          className="w-4 h-4 mx-auto"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplicants.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-slate-500">Chưa có ứng viên nào cho đợt này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExaminerApplyList;
