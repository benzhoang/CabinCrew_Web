import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiChevronDown, FiChevronRight, FiFileText } from 'react-icons/fi'

// Demo campaigns with tests (simplified fields for UI only)
const demoCampaigns = [
  {
    id: 1,
    name: 'Tuyển dụng Tiếp viên hàng không 2024',
    department: 'Cabin Crew',
    startDate: '2024-11-01',
    endDate: '2025-01-31',
    status: 'ongoing',
    tests: [
      { id: 11, code: 'CC-ENG-01', name: 'English Proficiency', complaints: 4, roundName: 'Đợt 1', location: 'TP.HCM', target: 10 },
      { id: 12, code: 'CC-SAF-02', name: 'Safety Procedures', complaints: 2, roundName: 'Đợt 2', location: 'Hà Nội', target: 12 },
      { id: 13, code: 'CC-CUS-03', name: 'Customer Service', complaints: 0, roundName: 'Đợt 3', location: 'Đà Nẵng', target: 8 }
    ]
  },
  {
    id: 2,
    name: 'Chiến dịch Pilot Training',
    department: 'Flight Operations',
    startDate: '2024-09-01',
    endDate: '2024-12-15',
    status: 'completed',
    tests: [
      { id: 21, code: 'PLT-TECH-01', name: 'Technical Knowledge', complaints: 1, roundName: 'Đợt 1', location: 'TP.HCM', target: 6 },
      { id: 22, code: 'PLT-SIM-02', name: 'Simulator Session', complaints: 3, roundName: 'Đợt 2', location: 'Hà Nội', target: 5 }
    ]
  },
  {
    id: 3,
    name: 'Ground Staff Campaign',
    department: 'Ground Operations',
    startDate: '2025-02-01',
    endDate: '2025-03-15',
    status: 'pending',
    tests: [
      { id: 31, code: 'GR-OPS-01', name: 'Operational Basics', complaints: 0, roundName: 'Đợt 1', location: 'TP.HCM', target: 15 }
    ]
  }
]

const StatusBadge = ({ status }) => {
  const map = useMemo(
    () => ({
      ongoing: { cls: 'bg-green-100 text-green-700 border-green-200', text: 'Đang diễn ra' },
      pending: { cls: 'bg-yellow-100 text-yellow-700 border-yellow-200', text: 'Sắp diễn ra' },
      completed: { cls: 'bg-blue-100 text-blue-700 border-blue-200', text: 'Đã hoàn thành' }
    }),
    []
  )
  const cfg = map[status] || map.ongoing
  return <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.cls}`}>{cfg.text}</span>
}

const ExamCampaignListPage = () => {
  const navigate = useNavigate()
  const [expandedId, setExpandedId] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return demoCampaigns
    return demoCampaigns.filter((c) => c.status === statusFilter)
  }, [statusFilter])

  const toggle = (id) => setExpandedId((cur) => (cur === id ? null : id))

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Chiến dịch</h2>
        <p className="text-slate-600">Danh sách chiến dịch - bấm để xem đề thi</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex gap-3 flex-wrap">
          <button
            onClick={() => setStatusFilter('ongoing')}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              statusFilter === 'ongoing' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50'
            }`}
          >
            Đang diễn ra
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              statusFilter === 'pending' ? 'bg-yellow-600 text-white border-yellow-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-yellow-50'
            }`}
          >
            Sắp diễn ra
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              statusFilter === 'completed' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
            }`}
          >
            Đã hoàn thành
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-1.5 text-sm font-medium border-2 rounded-md ${
              statusFilter === 'all' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            Tất cả
          </button>
        </div>

        <div className="divide-y divide-slate-200">
          {filtered.map((c) => (
            <div key={c.id} className="p-4">
              {/* Header row styled like Airline Partner card (no progress/description) */}
              <div className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 w-full">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-gray-900 truncate">{c.name}</h3>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-700">
                      <div>
                        <span className="text-gray-500">Phòng ban:</span> {c.department}
                      </div>
                      <div>
                        <span className="text-gray-500">Thời gian bắt đầu:</span> {c.startDate}
                      </div>
                      <div>
                        <span className="text-gray-500">Thời gian kết thúc:</span> {c.endDate}
                      </div>
                      <div>
                        <span className="text-gray-500">Trạng thái:</span> <StatusBadge status={c.status} />
                      </div>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <button
                      aria-label="Toggle tests"
                      onClick={() => toggle(c.id)}
                      className="p-2 rounded-lg text-blue-700 hover:bg-blue-100"
                    >
                      {expandedId === c.id ? <FiChevronDown className="w-5 h-5" /> : <FiChevronRight className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Tests list */}
              {expandedId === c.id && (
                <div className="mt-3 rounded-xl border border-slate-200">
                  {c.tests.map((t, idx) => (
                    <div key={t.id} className={`flex items-center justify-between px-4 py-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{t.code}</p>
                        <p className="text-sm text-slate-600 truncate">{t.name}</p>
                      </div>
                      <button
                        onClick={() =>
                          navigate(`/examiner/exam-campaigns/${expandedId}/scores`, {
                            state: {
                              examInfo: {
                                campaignId: c.id,
                                testId: t.id,
                                campaignName: c.name,
                                roundName: t.roundName,
                                startDate: c.startDate,
                                endDate: c.endDate,
                                location: t.location,
                                target: t.target,
                                testCode: t.code,
                                testName: t.name
                              }
                            }
                          })
                        }
                        className="relative inline-flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100"
                        aria-label="Xem chi tiết"
                      >
                        <span className="text-sm font-medium">Chi tiết</span>
                        {typeof t.complaints === 'number' && (
                          <span className="ml-1 inline-flex items-center justify-center w-6 h-6 text-xs font-semibold bg-red-600 text-white rounded-full">{t.complaints}</span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ExamCampaignListPage