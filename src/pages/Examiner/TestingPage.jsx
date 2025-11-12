import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiFileText } from "react-icons/fi";

// Mock data cho đề thi tiếng Anh
const mockEnglishTests = [
  {
    id: 1,
    code: "ENG-001",
    name: "Đề thi tiếng Anh cơ bản",
    description: "Đề thi đánh giá trình độ tiếng Anh cơ bản cho ứng viên",
    level: "Cơ bản",
    duration: 60, // phút
    totalQuestions: 15,
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
    status: "active",
    usageCount: 15,
  },
  {
    id: 2,
    code: "ENG-002",
    name: "Đề thi tiếng Anh nâng cao",
    description:
      "Đề thi đánh giá trình độ tiếng Anh nâng cao cho ứng viên có kinh nghiệm",
    level: "Nâng cao",
    duration: 90,
    totalQuestions: 10,
    createdAt: "2024-02-10",
    updatedAt: "2024-02-15",
    status: "active",
    usageCount: 8,
  },
  {
    id: 3,
    code: "ENG-003",
    name: "Đề thi TOEIC mẫu",
    description: "Đề thi mô phỏng format TOEIC chuẩn",
    level: "Trung cấp",
    duration: 120,
    totalQuestions: 20,
    createdAt: "2024-03-01",
    updatedAt: "2024-03-05",
    status: "active",
    usageCount: 25,
  },
  {
    id: 4,
    code: "ENG-004",
    name: "Đề thi giao tiếp hàng không",
    description:
      "Đề thi chuyên biệt về tiếng Anh giao tiếp trong ngành hàng không",
    level: "Chuyên ngành",
    duration: 75,
    totalQuestions: 15,
    createdAt: "2024-03-20",
    updatedAt: "2024-03-25",
    status: "draft",
    usageCount: 0,
  },
];

const StatusBadge = ({ status }) => {
  const map = {
    active: {
      cls: "bg-green-100 text-green-700 border-green-200",
      text: "Đang sử dụng",
    },
    draft: {
      cls: "bg-yellow-100 text-yellow-700 border-yellow-200",
      text: "Bản nháp",
    },
    archived: {
      cls: "bg-slate-100 text-slate-700 border-slate-200",
      text: "Đã lưu trữ",
    },
  };
  const cfg = map[status] || map.draft;
  return (
    <span
      className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}
    >
      {cfg.text}
    </span>
  );
};

const LevelBadge = ({ level }) => {
  const map = {
    "Cơ bản": "bg-blue-100 text-blue-700",
    "Trung cấp": "bg-indigo-100 text-indigo-700",
    "Nâng cao": "bg-purple-100 text-purple-700",
    "Chuyên ngành": "bg-orange-100 text-orange-700",
  };
  const cls = map[level] || "bg-slate-100 text-slate-700";
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {level}
    </span>
  );
};

const TestingPage = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState(mockEnglishTests);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const matchesSearch =
        test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || test.status === statusFilter;
      const matchesLevel = levelFilter === "all" || test.level === levelFilter;
      return matchesSearch && matchesStatus && matchesLevel;
    });
  }, [tests, searchTerm, statusFilter, levelFilter]);

  const handleCreateTest = () => {
    // TODO: Navigate to create test page or open modal
    navigate("/examiner/testing/create");
  };

  const handleEditTest = (testId) => {
    // TODO: Navigate to edit test page
    alert(`Chỉnh sửa đề thi ID: ${testId}`);
  };

  const handleDeleteTest = (testId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đề thi này?")) {
      setTests((prev) => prev.filter((test) => test.id !== testId));
    }
  };

  const handleViewTest = (testId) => {
    // TODO: Navigate to view test details
    alert(`Xem chi tiết đề thi ID: ${testId}`);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Quản lý đề thi tiếng Anh
          </h2>
          <p className="text-slate-600">
            Danh sách các đề thi tiếng Anh đã tạo
          </p>
        </div>
        <button
          onClick={handleCreateTest}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm font-medium transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Tạo đề thi mới
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, mã đề thi..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang sử dụng</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
          </div>

          {/* Level Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mức độ
            </label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Tất cả</option>
              <option value="Cơ bản">Cơ bản</option>
              <option value="Trung cấp">Trung cấp</option>
              <option value="Nâng cao">Nâng cao</option>
              <option value="Chuyên ngành">Chuyên ngành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        {filteredTests.length === 0 ? (
          <div className="p-12 text-center">
            <FiFileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg font-medium mb-2">
              Không tìm thấy đề thi nào
            </p>
            <p className="text-slate-500 text-sm">
              Thử thay đổi bộ lọc hoặc tạo đề thi mới
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTests.map((test) => (
              <div
                key={test.id}
                className="p-5 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {test.name}
                      </h3>
                      <StatusBadge status={test.status} />
                      <LevelBadge level={test.level} />
                    </div>
                    <p className="text-sm text-slate-600 mb-3">
                      {test.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500">Mã đề thi:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.code}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Thời gian:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.duration} phút
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Số câu hỏi:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.totalQuestions}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Đã sử dụng:</span>
                        <span className="ml-2 font-medium text-slate-800">
                          {test.usageCount} lần
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-slate-500">
                      Tạo:{" "}
                      {new Date(test.createdAt).toLocaleDateString("vi-VN")} |
                      Cập nhật:{" "}
                      {new Date(test.updatedAt).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleViewTest(test.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Xem chi tiết"
                    >
                      <FiEye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleEditTest(test.id)}
                      className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTest(test.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredTests.length > 0 && (
        <div className="mt-4 text-sm text-slate-600">
          Hiển thị {filteredTests.length} / {tests.length} đề thi
        </div>
      )}
    </div>
  );
};

export default TestingPage;
