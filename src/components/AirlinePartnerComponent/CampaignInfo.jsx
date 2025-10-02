import { useNavigate } from 'react-router-dom'

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="text-sm font-semibold text-gray-900 mb-3">{title}</div>
    {children}
  </div>
)

const InfoRow = ({ label, value }) => (
  <div className="flex items-start gap-3">
    <div className="w-36 shrink-0 text-gray-500 text-sm">{label}</div>
    <div className="text-gray-900 text-sm">{value}</div>
  </div>
)

const CampaignInfo = ({ campaign }) => {
  const navigate = useNavigate()
  const data = campaign

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 gap-5">
        <Section title="Thông tin đề xuất">
          <div className="text-gray-900 font-medium">{data.proposer}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            <InfoRow label="Vị trí tuyển" value={data.role} />
            <InfoRow label="Phòng ban" value={data.department} />
            <InfoRow label="Đơn vị" value={data.unit} />
            <InfoRow label="Số lượng tuyển" value={data.quantity} />
            <InfoRow label="Ngày bắt đầu" value={data.startDate} />
            <InfoRow label="Ngày kết thúc" value={data.endDate} />
          </div>
          <div className="mt-4">
            <InfoRow label="Mô tả nhu cầu" value={data.description} />
          </div>
          <div className="mt-2">
            <InfoRow label="Yêu cầu" value={data.requirements} />
          </div>
        </Section>

        <Section title="Kế hoạch các đợt tuyển">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {data.rounds.map((r) => (
              <div key={r.id} className="rounded-xl border border-gray-200">
                <div className="px-5 py-3 flex items-center justify-between bg-gray-50 rounded-t-xl">
                  <div className="font-semibold text-gray-900">{r.name}</div>
                  <span className={(r.status === 'Sắp diễn ra' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-gray-100 text-gray-700 border-gray-200') + ' text-xs px-2 py-0.5 rounded-full border'}>{r.status}</span>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                    <div><span className="text-gray-500">Thời gian:</span> {r.time}</div>
                    <div><span className="text-gray-500">Địa điểm:</span> {r.location}</div>
                    <div><span className="text-gray-500">Hình thức:</span> {r.method}</div>
                    <div><span className="text-gray-500">Phụ trách:</span> {r.owner}</div>
                  </div>

                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-900 mb-2">Ứng viên</div>
                    <div className="overflow-hidden rounded-lg border border-gray-200">
                      <table className="min-w-full table-fixed">
                        <thead className="bg-gray-50 text-gray-600 text-sm">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold w-40">Họ tên</th>
                            <th className="px-4 py-2 text-left font-semibold w-56">Email</th>
                            <th className="px-4 py-2 text-left font-semibold w-40">Số điện thoại</th>
                            <th className="px-4 py-2 text-right font-semibold w-28">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {r.candidates.length === 0 && (
                            <tr>
                              <td className="px-4 py-3 text-sm text-gray-500" colSpan={4}>Chưa có ứng viên</td>
                            </tr>
                          )}
                          {r.candidates.map((c, idx) => (
                            <tr key={c.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                              <td className="px-4 py-3 text-sm text-gray-800 truncate">{c.name}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 truncate">{c.email}</td>
                              <td className="px-4 py-3 text-sm text-gray-700 truncate">{c.phone}</td>
                              <td className="px-4 py-2">
                                <div className="flex items-center justify-end">
                                  <button className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50" onClick={() => navigate(`/airline-partner/campaigns/${data.id}/candidates/${c.id}`)}>Xem</button>
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
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

export default CampaignInfo