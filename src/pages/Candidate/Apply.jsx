import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { FiLoader } from 'react-icons/fi'
import { getCampaignById, getOngoingCampaign } from '../../service/api'
import Navbar from '../../components/Navbar'
import Footer from '../Candidate/Footer'

const Apply = () => {
    const navigate = useNavigate()
    const { id } = useParams() // Lấy campaign ID từ URL
    const { state } = useLocation()
    const [campaign, setCampaign] = useState(null)
    const [isLoading, setIsLoading] = useState(!!id)
    const [error, setError] = useState(null)
    const [ongoingCampaign, setOngoingCampaign] = useState(null)
    const [appliedRoundIds, setAppliedRoundIds] = useState(new Set()) // Lưu các roundId đã có applicationId

    useEffect(() => {
        // Nếu có ID trong URL, luôn gọi API để lấy dữ liệu mới nhất (bao gồm rounds)
        if (id) {
            fetchCampaignDetail()
        }
        // Gọi API để kiểm tra ongoing campaign của user
        fetchOngoingCampaign()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    const fetchCampaignDetail = async () => {
        setIsLoading(true)
        setError(null)
        try {
            const response = await getCampaignById(id)
            console.log('API Response:', response) // Debug log

            if (response.success) {
                // Map dữ liệu từ API response sang format component đang dùng
                const apiData = response.data
                console.log('API Data:', apiData) // Debug log
                console.log('Rounds:', apiData.rounds) // Debug log

                const mappedCampaign = {
                    // Map các trường từ API theo đúng cấu trúc từ hình
                    id: apiData.campaignId || apiData.id || id,
                    campaignId: apiData.campaignId || apiData.id || id,
                    name: apiData.campaignName || apiData.name || '',
                    campaignName: apiData.campaignName || '',
                    description: apiData.description || '',
                    jobDescription: apiData.jobDescription || '',
                    jobRequirement: apiData.jobRequirement || '',
                    airline: apiData.partnerName || apiData.airline || '',
                    partnerName: apiData.partnerName || '',
                    location: apiData.location || '', // Có thể không có trong API
                    position: apiData.position || apiData.campaignType || '', // Có thể không có trong API
                    startDate: apiData.startDate || '',
                    endDate: apiData.endDate || '',
                    targetHires: apiData.targetQuantity || apiData.targetHires || 0,
                    targetQuantity: apiData.targetQuantity || 0,
                    status: mapStatus(apiData.status),
                    campaignType: apiData.campaignType || '',
                    // Map rounds thành batches - đảm bảo map đúng tất cả các trường từ API
                    batches: Array.isArray(apiData.rounds) ? apiData.rounds.map(round => {
                        console.log('Mapping round:', round) // Debug log
                        return {
                            campaignRoundId: round.campaignRoundId || round.id || '',
                            name: round.roundName || round.name || '',
                            roundName: round.roundName || round.name || '',
                            time: `${round.startDate || ''} - ${round.endDate || ''}`,
                            location: round.location || '',
                            method: round.method || 'Trực tiếp',
                            status: mapRoundStatus(round.status),
                            owner: round.owner || '',
                            description: round.description || '',
                            slots: round.targetQuantity || round.slots || 0,
                            targetQuantity: round.targetQuantity || 0,
                            applied: round.actualQuantiy !== undefined ? round.actualQuantiy : (round.applied || 0), // Lưu ý: API có typo actualQuantiy
                            actualQuantiy: round.actualQuantiy || 0,
                            startDate: round.startDate || '',
                            endDate: round.endDate || ''
                        }
                    }) : [],
                    // Giữ lại các trường khác từ API để đảm bảo không mất dữ liệu
                    ...apiData
                }
                console.log('Mapped Campaign:', mappedCampaign) // Debug log
                setCampaign(mappedCampaign)
            } else {
                setError(response.error || 'Không thể tải thông tin chiến dịch')
            }
        } catch (err) {
            console.error('Error fetching campaign:', err) // Debug log
            setError(err.message || 'Đã xảy ra lỗi khi tải thông tin chiến dịch')
        } finally {
            setIsLoading(false)
        }
    }

    // Map status từ API sang format component
    const mapStatus = (status) => {
        if (!status) return 'inactive'
        const statusLower = status.toLowerCase()
        if (statusLower === 'approved' || statusLower === 'active' || statusLower === 'ongoing') {
            return 'active'
        }
        if (statusLower === 'rejected' || statusLower === 'ended' || statusLower === 'completed') {
            return 'inactive'
        }
        return statusLower
    }

    // Map round status từ API
    const mapRoundStatus = (status) => {
        if (!status) return 'upcoming'
        const statusLower = status.toLowerCase()
        if (statusLower === 'ended' || statusLower === 'completed') {
            return 'completed'
        }
        if (statusLower === 'ongoing' || statusLower === 'active' || statusLower === 'inprogress') {
            return 'ongoing'
        }
        return 'upcoming'
    }

    // Hàm gọi API để lấy ongoing campaign của user
    const fetchOngoingCampaign = async () => {
        try {
            const response = await getOngoingCampaign()
            console.log('Ongoing Campaign Response:', response) // Debug log

            if (response.success && response.data) {
                const ongoingData = response.data
                setOngoingCampaign(ongoingData)

                // Lấy danh sách các roundId đã có applicationId
                const rounds = ongoingData.rounds || []
                const appliedIds = new Set()

                // Kiểm tra xem có rounds nào có applicationId không
                const hasApplication = rounds.some(round =>
                    round.applicationId && round.applicationId > 0
                )

                // Nếu có applicationId trong rounds, thêm campaignRoundId vào danh sách
                if (hasApplication && ongoingData.campaignRoundId) {
                    appliedIds.add(ongoingData.campaignRoundId)
                }

                // Thêm các roundId có applicationId
                rounds.forEach(round => {
                    if (round.applicationId && round.applicationId > 0) {
                        // Thêm roundId nếu có
                        if (round.roundId) {
                            appliedIds.add(round.roundId)
                        }
                        // Thêm campaignRoundId từ round nếu có
                        if (round.campaignRoundId) {
                            appliedIds.add(round.campaignRoundId)
                        }
                    }
                })

                console.log('Applied Round IDs:', Array.from(appliedIds)) // Debug log
                setAppliedRoundIds(appliedIds)
            } else {
                // Nếu không có ongoing campaign, reset state
                setOngoingCampaign(null)
                setAppliedRoundIds(new Set())
            }
        } catch (err) {
            console.error('Error fetching ongoing campaign:', err) // Debug log
            // Không set error để không ảnh hưởng đến UI chính
            setOngoingCampaign(null)
            setAppliedRoundIds(new Set())
        }
    }

    // Hàm kiểm tra xem batch có đã được ứng tuyển chưa
    const isBatchApplied = (batch) => {
        if (!batch || appliedRoundIds.size === 0) return false

        // Kiểm tra campaignRoundId của batch có trong danh sách đã ứng tuyển không
        if (batch.campaignRoundId && appliedRoundIds.has(batch.campaignRoundId)) {
            return true
        }

        return false
    }

    // Hàm kiểm tra xem campaign có đang diễn ra không
    const isCampaignActive = (campaign) => {
        if (!campaign) return false

        // Kiểm tra status trực tiếp
        const status = campaign.status?.toLowerCase()
        if (status === 'active' || status === 'ongoing' || status === 'approved') {
            return true
        }
        if (status === 'inactive' || status === 'ended' || status === 'completed' || status === 'rejected') {
            return false
        }

        // Kiểm tra xem có rounds đang diễn ra không
        if (Array.isArray(campaign.batches) && campaign.batches.length > 0) {
            const hasOngoingRound = campaign.batches.some(batch => {
                const batchStatus = batch.status?.toLowerCase()
                return batchStatus === 'ongoing' || batchStatus === 'active'
            })
            if (hasOngoingRound) {
                return true
            }
        }

        // Kiểm tra ngày tháng nếu có
        if (campaign.startDate && campaign.endDate) {
            const now = new Date()
            const startDate = new Date(campaign.startDate)
            const endDate = new Date(campaign.endDate)
            if (now >= startDate && now <= endDate) {
                return true
            }
        }

        return false
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <FiLoader className="w-6 h-6 animate-spin text-indigo-600" />
                            <p className="text-gray-600">Đang tải thông tin chiến dịch...</p>
                        </div>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Quay lại</button>
                    </div>
                ) : !campaign ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <p className="text-gray-600 mb-4">Không tìm thấy thông tin chiến dịch.</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Quay lại</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Quay lại</button>
                        </div>
                        {/* Header */}
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-200 flex items-start justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-800">{campaign.name}</h1>
                                    <p className="text-sm text-slate-600 mt-1">
                                        {campaign.airline || '—'}
                                        {campaign.location && ` • ${campaign.location}`}
                                    </p>
                                </div>
                                <span className={`inline-flex items-center rounded-full text-xs font-medium px-2 py-1 ${isCampaignActive(campaign) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                    {isCampaignActive(campaign) ? 'Đang diễn ra' : 'Đã kết thúc'}
                                </span>
                            </div>
                            <div className="p-6">
                                {/* Overview grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <Info label="Loại" value={campaign.position || '—'} />
                                    <Info label="Hãng hàng không" value={campaign.airline || '—'} />
                                    <Info label="Ngày bắt đầu" value={campaign.startDate || '—'} />
                                    <Info label="Ngày kết thúc" value={campaign.endDate || '—'} />
                                    <Info label="Chỉ tiêu" value={`${campaign.targetHires ?? '—'}`} />
                                </div>

                                {/* Job Description */}
                                {campaign.jobDescription && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Mô tả công việc / Job Description</h3>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="text-sm text-slate-700 whitespace-pre-line">
                                                {campaign.jobDescription}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Job Requirements */}
                                {campaign.jobRequirement && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4">📝 Yêu cầu công việc / Job Requirements</h3>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                            <div className="text-sm text-slate-700 whitespace-pre-line">
                                                {campaign.jobRequirement}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Recruitment Process */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">🔄 Quy trình tuyển dụng / Recruitment Process</h3>
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-slate-800">🇻🇳 Tiếng Việt:</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                                            <span className="text-slate-700">Kiểm tra hồ sơ: Ứng viên chuẩn bị CCCD để đối chiếu và lấy số báo danh</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                                            <span className="text-slate-700">Kiểm tra ngoại hình AI</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                                            <span className="text-slate-700">Cân đo chiều cao và BMI</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                                            <span className="text-slate-700">Thi Catwalk - Phỏng vấn AI</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                                            <span className="text-slate-700">Thi Tài năng (theo nhóm)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                                                            <span className="text-slate-700">Phỏng vấn Hội đồng</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <h4 className="font-medium text-slate-800">🇺🇸 English:</h4>
                                                    <div className="space-y-2 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                                            <span className="text-slate-700">Document Check: candidates bring the ID Card (Passport for expat) for verification and candidate's number</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                                            <span className="text-slate-700">AI Grooming Check</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                                            <span className="text-slate-700">Height and BMI Check</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                                            <span className="text-slate-700">Catwalk - AI Interview</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">5</span>
                                                            <span className="text-slate-700">Talent Show (in groups)</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">6</span>
                                                            <span className="text-slate-700">Panel Interview</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Batches (đợt tuyển) */}
                                <div className="mt-6">
                                    <div className="text-sm text-slate-600 mb-2">Kế hoạch các đợt tuyển</div>
                                    {Array.isArray(campaign.batches) && campaign.batches.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {campaign.batches.map((b) => (
                                                <div key={b.campaignRoundId || b.name} className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                                                    <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                                        <div className="text-sm font-semibold text-slate-800">{b.name}</div>
                                                        <span className={`text-xs px-2 py-1 rounded-full ${b.status === 'completed' ? 'bg-red-100 text-red-700' :
                                                            b.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                                                                'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {b.status === 'completed' ? 'Đã hoàn thành' :
                                                                b.status === 'ongoing' ? 'Đang diễn ra' :
                                                                    'Sắp diễn ra'}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                                            <InfoMini label="Thời gian" value={b.time || '—'} />
                                                            <InfoMini label="Hình thức" value={b.method || '—'} />
                                                            {b.owner && <InfoMini label="Phụ trách" value={b.owner} />}
                                                            {b.slots && <InfoMini label="Số lượng tuyển" value={`${b.slots} người`} />}
                                                            {b.applied !== undefined && <InfoMini label="Đã ứng tuyển" value={`${b.applied} người`} />}
                                                        </div>
                                                        {b.description && (
                                                            <div className="text-xs">
                                                                <div className="text-slate-500 mb-1">Mô tả</div>
                                                                <div className="text-slate-700 bg-slate-50 p-2 rounded border">{b.description}</div>
                                                            </div>
                                                        )}
                                                        {b.slots && b.applied !== undefined && (
                                                            <div className="text-xs">
                                                                <div className="text-slate-500 mb-1">Tiến độ ứng tuyển</div>
                                                                <div className="bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${Math.min((b.applied / b.slots) * 100, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-slate-600 mt-1">{b.applied}/{b.slots} ({Math.round((b.applied / b.slots) * 100)}%)</div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="px-4 pb-4 pt-0 flex items-center justify-end">
                                                        {b.status === 'ongoing' && (
                                                            <button
                                                                onClick={() => navigate(`/application-form/${b.campaignRoundId}`, { state: { campaign: campaign, batch: b } })}
                                                                disabled={isBatchApplied(b)}
                                                                className={`px-5 py-2.5 rounded-md text-white text-sm font-semibold ${isBatchApplied(b)
                                                                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                                                    : 'bg-green-600 hover:bg-green-700'
                                                                    }`}
                                                            >
                                                                {isBatchApplied(b) ? 'Đã ứng tuyển' : 'Ứng tuyển ngay'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                                            <p className="text-slate-500 text-sm">Chưa có đợt tuyển nào được lên kế hoạch</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

const Info = ({ label, value }) => (
    <div>
        <div className="text-sm text-slate-600">{label}</div>
        <div className="font-medium text-slate-800">{value}</div>
    </div>
)

const InfoMini = ({ label, value }) => (
    <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
    </div>
)

export default Apply