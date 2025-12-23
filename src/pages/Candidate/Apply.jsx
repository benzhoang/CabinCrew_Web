import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getCampaignById, getOngoingCampaign, getRequirementItems, getRoundTypes } from '../../service/api'
import Navbar from '../../components/Navbar'
import Footer from '../Candidate/Footer'
import { formatDate } from '../../config/formatDate'
import { toast } from 'react-toastify'

// Helper function to render HTML content safely
const renderHTML = (htmlString) => {
    if (!htmlString) return null
    // Check if the string contains HTML tags
    if (htmlString.includes('<ul>') || htmlString.includes('<li>') || htmlString.includes('<p>') || htmlString.includes('<br>')) {
        return <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    }
    // If no HTML tags, render as plain text with line breaks
    return <div className="whitespace-pre-line">{htmlString}</div>
}

const getPositionBadgeClass = (position) => {
    if (!position) return "bg-gray-100 text-gray-700 border-gray-200";

    const positionLower = position.toLowerCase().trim();

    if (positionLower.includes("purser")) {
        return "bg-orange-100 text-orange-700 border-orange-200";
    }
    if (positionLower.includes("cabin crew") || positionLower.includes("cabincrew")) {
        return "bg-teal-100 text-teal-700 border-teal-200";
    }
    if (positionLower.includes("flight attendant") || positionLower.includes("flightattendant")) {
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
    if (positionLower.includes("pilot") || positionLower.includes("captain")) {
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
};

const getTypeBadgeClass = (campaignType) => {
    if (!campaignType) return "bg-gray-100 text-gray-700 border-gray-200";

    const typeStr = String(campaignType).trim().toLowerCase();

    if (typeStr === 'promotion' || typeStr === '2') {
        return "bg-purple-100 text-purple-700 border-purple-200";
    }
    if (typeStr === 'recruitment' || typeStr === '1') {
        return "bg-blue-100 text-blue-700 border-blue-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
};

const getAirlineBadgeClass = (airline) => {
    if (!airline) return "bg-gray-100 text-gray-700 border-gray-200";

    const airlineLower = airline.toLowerCase().trim();

    if (airlineLower.includes("vietjet")) {
        return "bg-red-100 text-red-700 border-red-200";
    }
    if (airlineLower.includes("vietnam airlines")) {
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    if (airlineLower.includes("bamboo")) {
        return "bg-cyan-100 text-cyan-700 border-cyan-200";
    }
    if (
        airlineLower.includes("sun phuquoc") ||
        airlineLower.includes("sunphuquoc")
    ) {
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
};

const getTypeDisplayName = (campaignType) => {
    if (!campaignType) return '—';

    const typeStr = String(campaignType).trim().toLowerCase();

    if (typeStr === 'promotion' || typeStr === '2') {
        return 'Promotion';
    }
    if (typeStr === 'recruitment' || typeStr === '1') {
        return 'Recruitment';
    }

    return campaignType;
};

const Apply = () => {
    const navigate = useNavigate()
    const { id } = useParams() // Lấy campaign ID từ URL
    const { state } = useLocation()
    const [campaign, setCampaign] = useState(null)
    const [isLoading, setIsLoading] = useState(!!id)
    const [error, setError] = useState(null)
    const [ongoingCampaign, setOngoingCampaign] = useState(null)
    const [appliedRoundIds, setAppliedRoundIds] = useState(new Set()) // Lưu các roundId đã có applicationId
    const [requirementItems, setRequirementItems] = useState([])
    const [isLoadingRequirements, setIsLoadingRequirements] = useState(false)
    const [roundTypes, setRoundTypes] = useState([])
    const [isLoadingRoundTypes, setIsLoadingRoundTypes] = useState(false)

    useEffect(() => {
        // Nếu có ID trong URL, luôn gọi API để lấy dữ liệu mới nhất (bao gồm rounds)
        if (id) {
            fetchCampaignDetail()
        }
        // Gọi API để kiểm tra ongoing campaign của user
        fetchOngoingCampaign()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    // Fetch requirement items based on campaignType
    useEffect(() => {
        const fetchRequirementItems = async () => {
            if (!campaign?.campaignType) return

            // Map campaignType string to number: "Recruitment" = 1, "Promotion" = 2
            const campaignTypeStr = String(campaign.campaignType).trim()
            let requirementId = null

            if (campaignTypeStr.toLowerCase() === 'recruitment') {
                requirementId = 1
            } else if (campaignTypeStr.toLowerCase() === 'promotion') {
                requirementId = 2
            } else {
                // Try to parse as number for backward compatibility
                const parsed = Number(campaignTypeStr)
                if (parsed === 1 || parsed === 2) {
                    requirementId = parsed
                } else {
                    return // Invalid campaignType
                }
            }

            setIsLoadingRequirements(true)
            try {
                const response = await getRequirementItems(requirementId)
                console.log('Requirement Items Response:', response)
                console.log('Campaign Type:', campaignTypeStr, 'Requirement ID:', requirementId)

                if (response.success && response.data) {
                    // Handle different response structures
                    // API có thể trả về: { code: 0, data: {...} } với data.requirementItems hoặc array trực tiếp
                    let items = []

                    // Case 1: response.data là array
                    if (Array.isArray(response.data)) {
                        // Check if it's array of items or array of objects with requirementItems
                        if (response.data.length > 0) {
                            // Check first element to determine structure
                            const firstItem = response.data[0]
                            if (firstItem.requirementItems && Array.isArray(firstItem.requirementItems)) {
                                // It's array of objects like [{ requirementId, requirementItems }]
                                // Collect all requirementItems from all objects in array
                                items = response.data.flatMap(item =>
                                    Array.isArray(item.requirementItems) ? item.requirementItems : []
                                )
                            } else if (firstItem.requirementItemId || firstItem.title) {
                                // It's array of requirement items directly
                                items = response.data
                            }
                        }
                    }
                    // Case 2: response.data là object có requirementItems
                    else if (
                        response.data.requirementItems &&
                        Array.isArray(response.data.requirementItems)
                    ) {
                        items = response.data.requirementItems
                    }
                    // Case 3: response.data.data có requirementItems (nested structure)
                    else if (
                        response.data.data &&
                        response.data.data.requirementItems &&
                        Array.isArray(response.data.data.requirementItems)
                    ) {
                        items = response.data.data.requirementItems
                    }
                    // Case 4: response.data.data là array
                    else if (response.data.data && Array.isArray(response.data.data)) {
                        items = response.data.data
                    }

                    console.log('Extracted Requirement Items:', items)
                    console.log('Items count:', items.length)
                    setRequirementItems(items || [])
                } else {
                    console.log('No requirement items found or API failed:', response)
                    setRequirementItems([])
                }
            } catch (error) {
                console.error('Error fetching requirement items:', error)
                setRequirementItems([])
            } finally {
                setIsLoadingRequirements(false)
            }
        }

        fetchRequirementItems()
    }, [campaign?.campaignType])

    // Fetch round types based on campaignType
    useEffect(() => {
        const fetchRoundTypes = async () => {
            if (!campaign?.campaignType) return

            // Map campaignType string to number: "Recruitment" = 1, "Promotion" = 2
            const campaignTypeStr = String(campaign.campaignType).trim()
            let type = null

            if (campaignTypeStr.toLowerCase() === 'recruitment') {
                type = 1
            } else if (campaignTypeStr.toLowerCase() === 'promotion') {
                type = 2
            } else {
                // Try to parse as number for backward compatibility
                const parsed = Number(campaignTypeStr)
                if (parsed === 1 || parsed === 2) {
                    type = parsed
                } else {
                    return // Invalid campaignType
                }
            }

            setIsLoadingRoundTypes(true)
            try {
                const response = await getRoundTypes(type)
                console.log('Round Types Response:', response)

                if (response.success && response.data) {
                    // Handle different response structures
                    // API có thể trả về: { code: 0, data: [...] } hoặc array trực tiếp
                    let types = []

                    if (Array.isArray(response.data)) {
                        types = response.data
                    } else if (response.data.data && Array.isArray(response.data.data)) {
                        types = response.data.data
                    }

                    console.log('Extracted Round Types:', types)
                    setRoundTypes(types)
                } else {
                    console.log('No round types found or API failed:', response)
                    setRoundTypes([])
                }
            } catch (error) {
                console.error('Error fetching round types:', error)
                setRoundTypes([])
            } finally {
                setIsLoadingRoundTypes(false)
            }
        }

        fetchRoundTypes()
    }, [campaign?.campaignType])

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
                            method: round.method || 'Direct',
                            status: mapRoundStatus(round.status),
                            owner: round.owner || '',
                            description: round.description || '',
                            slots: round.targetQuantity || round.slots || 0,
                            targetQuantity: round.targetQuantity || 0,
                            applied: round.actualQuantiy !== undefined ? round.actualQuantiy : (round.applied || 0), // Lưu ý: API có typo actualQuantiy
                            actualQuantiy: round.actualQuantiy || 0,
                            startDate: round.startDate || '',
                            endDate: round.endDate || '',
                            hasApplied: round.hasApplied || false // Thêm trường hasApplied từ API
                        }
                    }) : [],
                    // Giữ lại các trường khác từ API để đảm bảo không mất dữ liệu
                    ...apiData
                }
                console.log('Mapped Campaign:', mappedCampaign) // Debug log
                setCampaign(mappedCampaign)
            } else {
                setError(response.error || 'Unable to load campaign information')
            }
        } catch (err) {
            console.error('Error fetching campaign:', err) // Debug log
            setError(err.message || 'An error occurred while loading campaign information')
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
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-4 text-sm text-gray-600">Loading campaign information...</p>
                    </div>
                ) : error ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <p className="text-red-600 mb-4">{error}</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Back</button>
                    </div>
                ) : !campaign ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
                        <p className="text-gray-600 mb-4">Campaign information not found.</p>
                        <button onClick={() => navigate(-1)} className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium">Back</button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-md text-slate-700">Back</button>
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
                                    {isCampaignActive(campaign) ? 'Ongoing' : 'Ended'}
                                </span>
                            </div>
                            <div className="p-6">
                                {/* Overview grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                    <Info label="Position" value={campaign.position || '—'} badgeClass={getPositionBadgeClass(campaign.position)} />
                                    <Info label="Type" value={getTypeDisplayName(campaign.campaignType)} badgeClass={getTypeBadgeClass(campaign.campaignType)} />
                                    <Info label="Airline" value={campaign.airline || '—'} badgeClass={getAirlineBadgeClass(campaign.airline)} />
                                    <Info label="Start date" value={campaign.startDate ? formatDate(campaign.startDate) : '—'} />
                                    <Info label="End date" value={campaign.endDate ? formatDate(campaign.endDate) : '—'} />
                                    <Info label="Target quantity" value={`${campaign.targetHires ?? '—'}`} />
                                </div>

                                {/* Job Requirements */}
                                {requirementItems.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="text-lg font-semibold text-slate-800 mb-4">📝 Requirements</h3>
                                        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
                                            <ul className="space-y-2">
                                                {requirementItems.map((item) => (
                                                    <li key={item.requirementItemId} className="flex items-start">
                                                        <span className="mr-2 text-blue-600">•</span>
                                                        <span className="text-sm text-slate-700">
                                                            <span className="font-medium">{item.title}</span>
                                                            {item.description && (
                                                                <span className="text-slate-600">
                                                                    {' : '}
                                                                    {item.description}
                                                                </span>
                                                            )}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {/* Recruitment/Promotion Process - Dynamic from API (getRoundTypes) */}
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-4">
                                        🔄{' '}
                                        {(() => {
                                            const campaignTypeStr = String(campaign.campaignType || '')
                                                .trim()
                                                .toLowerCase()
                                            if (campaignTypeStr === 'recruitment') {
                                                return 'Recruitment'
                                            } else if (campaignTypeStr === 'promotion') {
                                                return 'Promotion'
                                            } else {
                                                // Try to parse as number for backward compatibility
                                                const parsed = Number(campaign.campaignType)
                                                if (parsed === 1) return 'Recruitment'
                                                if (parsed === 2) return 'Promotion'
                                                return ''
                                            }
                                        })()}{' '}
                                        process
                                    </h3>
                                    <div className="bg-purple-50 border border-purple-300 rounded-lg p-4">
                                        {roundTypes.length > 0 ? (
                                            <div className="space-y-3">
                                                {roundTypes.map((roundType, index) => (
                                                    <div
                                                        key={roundType.roundTypeId}
                                                        className="flex items-center p-3 transition-shadow bg-white border rounded-lg shadow-sm border-slate-200 hover:shadow-md"
                                                    >
                                                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-3 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-medium text-slate-800">
                                                                {roundType.roundTypeName}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-500">
                                                Loading Process...
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Batches (recruitment rounds) */}
                                <div className="mt-6">
                                    <div className="text-sm text-slate-600 mb-2">Recruitment rounds schedule</div>
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
                                                            {b.status === 'completed' ? 'Completed' :
                                                                b.status === 'ongoing' ? 'Ongoing' :
                                                                    'Upcoming'}
                                                        </span>
                                                    </div>
                                                    <div className="p-4 space-y-4">
                                                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs">
                                                            <InfoMini label="Start Date" value={b.startDate ? formatDate(b.startDate) : '—'} />
                                                            <InfoMini label="End Date" value={b.endDate ? formatDate(b.endDate) : '—'} />
                                                            {b.slots && <InfoMini label="Recruitment quota" value={`${b.slots} candidates`} />}
                                                            {b.applied !== undefined && <InfoMini label="Applied" value={`${b.applied} candidates`} />}
                                                            {b.description && (
                                                                <>
                                                                    <InfoMini label="Description" value={b.description} />
                                                                    <div></div>
                                                                </>
                                                            )}
                                                        </div>
                                                        {/* {b.slots && b.applied !== undefined && (
                                                            <div className="text-xs">
                                                                <div className="text-slate-500 mb-1">Application progress</div>
                                                                <div className="bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                        style={{ width: `${Math.min((b.applied / b.slots) * 100, 100)}%` }}
                                                                    ></div>
                                                                </div>
                                                                <div className="text-slate-600 mt-1">{b.applied}/{b.slots} ({Math.round((b.applied / b.slots) * 100)}%)</div>
                                                            </div>
                                                        )} */}
                                                    </div>
                                                    <div className="px-4 pb-4 pt-0 flex items-center justify-end">
                                                        {b.status === 'ongoing' && (
                                                            <button
                                                                onClick={() => {
                                                                    // Kiểm tra đăng nhập trước khi cho ứng tuyển
                                                                    const user = localStorage.getItem('user')

                                                                    if (!user) {
                                                                        toast.warning('Please log in before applying.')
                                                                        navigate('/login')
                                                                        return
                                                                    }

                                                                    navigate(`/application-form/${b.campaignRoundId}`, {
                                                                        state: { campaign: campaign, batch: b }
                                                                    })
                                                                }}
                                                                disabled={b.hasApplied === true}
                                                                className={`px-5 py-2.5 rounded-md text-white text-sm font-semibold ${b.hasApplied === true
                                                                    ? 'bg-gray-400 cursor-not-allowed opacity-60'
                                                                    : 'bg-green-600 hover:bg-green-700'
                                                                    }`}
                                                            >
                                                                {b.hasApplied === true ? 'Already applied' : 'Apply now'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
                                            <p className="text-slate-500 text-sm">No recruitment rounds scheduled</p>
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

const Info = ({ label, value, badgeClass }) => {
    // Nếu có badgeClass, hiển thị dạng badge có màu
    if (badgeClass && value !== '—') {
        return (
            <div>
                <div className="text-sm text-slate-600 mb-1">{label}:</div>
                <span className={`inline-flex items-center rounded-full border text-xs font-medium px-2.5 py-1 ${badgeClass}`}>
                    {value}
                </span>
            </div>
        )
    }
    // Nếu không có badgeClass, hiển thị text thường
    return (
        <div>
            <div className="text-sm text-slate-600">{label}</div>
            <div className="font-medium text-slate-800">{value}</div>
        </div>
    )
}

const InfoMini = ({ label, value }) => (
    <div>
        <div className="text-slate-500">{label}</div>
        <div className="text-slate-800 font-medium">{value}</div>
    </div>
)

export default Apply