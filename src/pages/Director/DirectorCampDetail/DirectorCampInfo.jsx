import React, { useState, useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { getCampaignById } from '../../../service/api'
import DirectorBatchInfo from './DirectorBatchInfo'

const formatDate = (isoString) => {
    if (!isoString) return ''
    const date = new Date(isoString)
    if (Number.isNaN(date.getTime())) return isoString
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}

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

const DirectorCampInfo = ({ campaign, onCreateBatch }) => {
    const { id } = useParams()
    const { state } = useLocation()
    const [campaignData, setCampaignData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchCampaignData = async () => {
            // Ưu tiên sử dụng campaign từ props hoặc state
            if (campaign || state?.campaign) {
                const campaignFromProps = campaign || state?.campaign

                // Log campaign từ props/state
                console.log('DetailInfo - Campaign from props/state:', campaignFromProps)
                console.log('DetailInfo - Has rounds:', !!campaignFromProps?.rounds)

                // Đảm bảo rounds là array (nếu có) - tạo copy mới để tránh mutate
                let normalizedCampaign = campaignFromProps
                if (campaignFromProps && !Array.isArray(campaignFromProps.rounds) && campaignFromProps.rounds !== null && campaignFromProps.rounds !== undefined) {
                    console.warn('DetailInfo - Rounds from props/state is not an array, converting:', campaignFromProps.rounds)
                    normalizedCampaign = {
                        ...campaignFromProps,
                        rounds: [campaignFromProps.rounds]
                    }
                }

                setCampaignData(normalizedCampaign)

                // Nếu rounds đang trống, tiếp tục gọi API theo id để lấy rounds chuẩn theo Swagger
                const effectiveId = normalizedCampaign?.campaignId || normalizedCampaign?.id || id
                if (
                    effectiveId &&
                    (!Array.isArray(normalizedCampaign.rounds) || normalizedCampaign.rounds.length === 0)
                ) {
                    try {
                        console.log('DetailInfo - Rounds empty, fetching by id to hydrate:', effectiveId)
                        const result = await getCampaignById(effectiveId)
                        if (result.success) {
                            let apiData = result.data
                            // Đảm bảo rounds là array
                            if (apiData && !Array.isArray(apiData.rounds) && apiData.rounds) {
                                apiData = { ...apiData, rounds: [apiData.rounds] }
                            }
                            // Trộn dữ liệu: giữ thông tin hiện có, ưu tiên rounds từ API
                            const merged = {
                                ...normalizedCampaign,
                                ...apiData,
                                rounds: Array.isArray(apiData?.rounds) ? apiData.rounds : []
                            }
                            setCampaignData(merged)
                        }
                    } catch (err) {
                        console.warn('DetailInfo - Unable to hydrate rounds from API:', err)
                    } finally {
                        setLoading(false)
                    }
                } else {
                    setLoading(false)
                }
                return
            }

            // Nếu không có campaign từ props/state, fetch từ API bằng ID
            if (id) {
                try {
                    setLoading(true)
                    const result = await getCampaignById(id)
                    if (result.success) {
                        const apiData = result.data

                        // Log API response để debug
                        console.log('DetailInfo - API Response:', apiData)
                        console.log('DetailInfo - API Response has rounds:', !!apiData?.rounds)
                        if (apiData?.rounds) {
                            console.log('DetailInfo - API Rounds:', apiData.rounds)
                        }

                        // Đảm bảo rounds là array (nếu có) - tạo copy mới để tránh mutate
                        let normalizedApiData = apiData
                        if (apiData && !Array.isArray(apiData.rounds) && apiData.rounds !== null && apiData.rounds !== undefined) {
                            console.warn('DetailInfo - Rounds from API is not an array, converting:', apiData.rounds)
                            normalizedApiData = {
                                ...apiData,
                                rounds: [apiData.rounds]
                            }
                        }

                        setCampaignData(normalizedApiData)
                        setError(null)
                    } else {
                        setError(result.error || "Không thể tải thông tin chiến dịch")
                    }
                } catch (err) {
                    console.error('DetailInfo - Error fetching campaign:', err)
                    setError(err.message || "Đã xảy ra lỗi khi tải thông tin chiến dịch")
                } finally {
                    setLoading(false)
                }
            } else {
                setLoading(false)
                setError("Không tìm thấy ID chiến dịch")
            }
        }

        fetchCampaignData()
    }, [id, campaign, state?.campaign])

    // Debug: Log data để kiểm tra (chỉ log một lần khi data thay đổi)
    useEffect(() => {
        if (campaignData) {
            console.log('DetailInfo - Campaign Data:', campaignData)
            console.log('DetailInfo - All keys:', Object.keys(campaignData))
            console.log('DetailInfo - campaignType:', campaignData.campaignType)
            console.log('DetailInfo - targetQuantity:', campaignData.targetQuantity)

            // Log rounds data specifically
            if (campaignData.rounds) {
                console.log('DetailInfo - Rounds found:', campaignData.rounds)
                console.log('DetailInfo - Rounds type:', Array.isArray(campaignData.rounds) ? 'Array' : typeof campaignData.rounds)
                console.log('DetailInfo - Rounds length:', Array.isArray(campaignData.rounds) ? campaignData.rounds.length : 'N/A')
                if (Array.isArray(campaignData.rounds) && campaignData.rounds.length > 0) {
                    console.log('DetailInfo - First round structure:', campaignData.rounds[0])
                    console.log('DetailInfo - First round keys:', Object.keys(campaignData.rounds[0]))
                }
            } else {
                console.log('DetailInfo - No rounds found in campaign data')
            }

            console.log('DetailInfo - Full data structure:', JSON.stringify(campaignData, null, 2))
        }
    }, [campaignData])

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500">Đang tải thông tin chiến dịch...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        )
    }

    if (!campaignData) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-gray-500">Không có dữ liệu chiến dịch</div>
            </div>
        )
    }

    // Normalize và validate rounds data từ API
    const normalizeRoundsData = (campaign) => {
        if (!campaign) return campaign

        // Nếu đã có rounds và là array, giữ nguyên
        if (campaign.rounds && Array.isArray(campaign.rounds)) {
            // Validate và normalize từng round
            const normalizedRounds = campaign.rounds.map((round, index) => {
                return {
                    campaignRoundId: round.campaignRoundId || round.id || index + 1,
                    roundName: round.roundName || round.name || `Đợt ${index + 1}`,
                    description: round.description || '',
                    targetQuantity: round.targetQuantity || round.target || 0,
                    actualQuantity: round.actualQuantity || round.actualQuantiy || 0, // Handle typo in API
                    status: round.status || 'Draft',
                    startDate: round.startDate || '',
                    endDate: round.endDate || '',
                    location: round.location || '',
                    method: round.method || 'Trực tiếp',
                    owner: round.owner || '',
                    totalApplicants: round.totalApplicants || 0
                }
            })

            return {
                ...campaign,
                rounds: normalizedRounds
            }
        }

        // Nếu không có rounds, trả về campaign với rounds là empty array
        if (!campaign.rounds) {
            return {
                ...campaign,
                rounds: []
            }
        }

        return campaign
    }

    const data = normalizeRoundsData(campaignData)

    // Format date từ API (có thể là "11/12/2025 00:00" hoặc ISO string)
    const formatDateFromAPI = (dateString) => {
        if (!dateString) return ''
        // Nếu đã là format "dd/mm/yyyy HH:mm", chỉ lấy phần date
        if (dateString.includes('/')) {
            return dateString.split(' ')[0]
        }
        return formatDate(dateString)
    }

    // Format campaignType để hiển thị - kiểm tra nhiều field name
    const formatCampaignType = (type) => {
        if (!type) return ''
        const typeMap = {
            'Promotion': 'Thăng bậc',
            'Recruitment': 'Tuyển dụng',
            'Replacement': 'Thay thế'
        }
        return typeMap[type] || type
    }

    // Format targetQuantity để hiển thị - kiểm tra nhiều field name
    const formatTargetQuantity = (quantity) => {
        if (quantity === null || quantity === undefined || quantity === '') return ''
        const num = Number(quantity)
        if (isNaN(num)) return String(quantity)
        return num.toLocaleString('vi-VN') + ' người'
    }

    // Lấy campaignType từ nhiều field name có thể
    // Lưu ý: data từ props/state đã được transform (campaignType → position)
    //        data từ API có format gốc (campaignType)
    const getCampaignType = () => {
        if (!data) return ''

        // Kiểm tra tất cả các field name có thể (bao gồm cả format đã transform)
        const type = data.campaignType ||      // Format gốc từ API
            data.position ||          // Format đã transform từ Campaign.jsx
            data.campaign_type ||
            data.type ||
            data.campaignTypeName ||
            ''

        return type
    }

    // Lấy targetQuantity từ nhiều field name có thể
    // Lưu ý: data từ props/state đã được transform (targetQuantity → targetHires)
    //        data từ API có format gốc (targetQuantity)
    const getTargetQuantity = () => {
        if (!data) return ''

        // Kiểm tra tất cả các field name có thể (bao gồm cả format đã transform)
        const quantity = data.targetQuantity ||    // Format gốc từ API
            data.targetHires ||       // Format đã transform từ Campaign.jsx
            data.target_quantity ||
            data.quantity ||
            data.target ||
            data.targetQty ||
            ''

        return quantity
    }

    return (
        <div className="w-full h-full">
            <div className="grid grid-cols-1 gap-5">
                <Section title="Thông tin đề xuất">
                    <div className="space-y-4">
                        <div className="text-gray-900 font-medium">{data.campaignName || data.name || ""}</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <InfoRow label="Mô tả" value={data.description || ""} />
                            <InfoRow label="Loại chiến dịch" value={formatCampaignType(getCampaignType())} />
                            <InfoRow label="Trạng thái" value={data.status || ""} />
                            <InfoRow label="Số lượng tuyển" value={formatTargetQuantity(getTargetQuantity())} />
                            <InfoRow label="Ngày bắt đầu" value={formatDateFromAPI(data.startDate) || ""} />
                            <InfoRow label="Ngày kết thúc" value={formatDateFromAPI(data.endDate) || ""} />
                        </div>
                    </div>

                    {/* Job Description */}
                    {data.jobDescription && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">📋 Mô tả công việc / Job Description</h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="text-sm text-slate-700 whitespace-pre-line">
                                    {data.jobDescription}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Job Requirements */}
                    {data.jobRequirement && (
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-4">📝 Yêu cầu công việc / Job Requirements</h3>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="text-sm text-slate-700 whitespace-pre-line">
                                    {data.jobRequirement}
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Batch Management Section */}
                    <div className="mt-6">
                        {(() => {
                            // Log data being passed to DirectorBatchInfo
                            console.log('DetailInfo - Passing to DirectorBatchInfo:', {
                                campaignId: data.campaignId || data.id,
                                campaignName: data.campaignName || data.name,
                                hasRounds: !!data.rounds,
                                roundsCount: Array.isArray(data.rounds) ? data.rounds.length : 0,
                                rounds: data.rounds
                            })
                            return (
                                <DirectorBatchInfo
                                    campaign={data}
                                />
                            )
                        })()}
                    </div>
                </Section>

            </div>
        </div>
    )
}

export default DirectorCampInfo