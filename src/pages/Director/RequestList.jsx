import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getCampaignRequests } from '../../service/api'

const RequestList = () => {
    const [campaigns, setCampaigns] = useState([])
    const [filteredCampaigns, setFilteredCampaigns] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [langVersion, setLangVersion] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5, // 5 requests per page
        totalRecords: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    })
    const navigate = useNavigate()

    useEffect(() => {
        const off = onLangChange(() => setLangVersion((v) => v + 1))
        return () => off()
    }, [])

    useEffect(() => {
        const fetchCampaigns = async (page = 1) => {
            setLoading(true)
            setError(null)
            try {
                const result = await getCampaignRequests(page, pagination.pageSize)
                if (result.success) {
                    // Normalize status from API
                    const normalizeStatus = (status) => {
                        if (!status) return 'pending_approval'

                        // If numeric
                        if (typeof status === 'number') {
                            if (status === 2) return 'approved'
                            if (status === 3) return 'rejected'
                            return 'pending_approval' // 1 or other values
                        }

                        // If string, lowercase then handle
                        const statusLower = String(status).toLowerCase().trim()

                        // Handle various formats
                        if (statusLower === 'approved' || statusLower === 'approve') return 'approved'
                        if (statusLower === 'rejected' || statusLower === 'reject') return 'rejected'
                        if (statusLower === 'pending' || statusLower === 'pending_approval' || statusLower === 'pending approval') return 'pending_approval'

                        // Default
                        return 'pending_approval'
                    }

                    // Map API response data to component format
                    const mappedCampaigns = (result.data || []).map(item => ({
                        id: item.requestId,
                        name: item.campaignName || 'N/A',
                        description: item.description || '',
                        targetQuantity: item.targetQuantity || 0,
                        requestType: item.requestType || '',
                        status: normalizeStatus(item.status), // Normalize status from API
                        rejectReason: item.rejectReason || '',
                        approvedAt: item.approvedAt || '',
                        rejectedAt: item.rejectedAt || '',
                        partnerName: item.partnerName || '',
                        directorName: item.directorName || '',
                        createdAt: item.createdAt || '',
                        // Map legacy fields for compatibility
                        position: item.requestType || '',
                        department: item.partnerName || '',
                    }))
                    setCampaigns(mappedCampaigns)

                    // Save pagination info from API if provided
                    if (result.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            ...result.pagination,
                            pageSize: pagination.pageSize || 5,
                        }))
                    } else {
                        // Fallback when API does not return pagination
                        setPagination(prev => ({
                            ...prev,
                            currentPage: page,
                            pageSize: pagination.pageSize || 5,
                            totalRecords: mappedCampaigns.length,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPreviousPage: false,
                        }))
                    }
                } else {
                    setError(result.error || 'Unable to load campaign list')
                    setCampaigns([])
                }
            } catch (err) {
                console.error('Error fetching campaigns:', err)
                setError('An error occurred while loading data: ' + (err.message || 'Unknown error'))
                setCampaigns([])
            } finally {
                setLoading(false)
            }
        }

        // First load will be page 1
        fetchCampaigns(1)
    }, [])

    useEffect(() => {
        let filtered = campaigns
        if (searchTerm) {
            filtered = filtered.filter(campaign =>
                (campaign.name && campaign.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.requestType && campaign.requestType.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.partnerName && campaign.partnerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.directorName && campaign.directorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (campaign.description && campaign.description.toLowerCase().includes(searchTerm.toLowerCase()))
            )
        }
        if (statusFilter !== 'all') {
            filtered = filtered.filter(campaign => campaign.status === statusFilter)
        }
        setFilteredCampaigns(filtered)
    }, [campaigns, searchTerm, statusFilter])

    const handleViewDetails = (campaign) => {
        navigate(`/director/requirements/${campaign.id}`, { state: { campaign } })
    }

    const handlePageChange = (page) => {
        if (page === pagination.currentPage) return
        if (page < 1) return
        if (pagination.totalPages && page > pagination.totalPages) return
        // Only allow switching when previous/next exists
        if (page > pagination.currentPage && !pagination.hasNextPage) return
        if (page < pagination.currentPage && !pagination.hasPreviousPage) return

        // Fetch new page
        const fetchNewPage = async () => {
            setLoading(true)
            setError(null)
            try {
                const result = await getCampaignRequests(page, pagination.pageSize)
                if (result.success) {
                    const mappedCampaigns = (result.data || []).map(item => ({
                        id: item.requestId,
                        name: item.campaignName || 'N/A',
                        description: item.description || '',
                        targetQuantity: item.targetQuantity || 0,
                        requestType: item.requestType || '',
                        status: normalizeStatus(item.status),
                        rejectReason: item.rejectReason || '',
                        approvedAt: item.approvedAt || '',
                        rejectedAt: item.rejectedAt || '',
                        partnerName: item.partnerName || '',
                        directorName: item.directorName || '',
                        createdAt: item.createdAt || '',
                        position: item.requestType || '',
                        department: item.partnerName || '',
                    }))
                    setCampaigns(mappedCampaigns)

                    if (result.pagination) {
                        setPagination(prev => ({
                            ...prev,
                            ...result.pagination,
                            pageSize: pagination.pageSize || 5,
                        }))
                    } else {
                        setPagination(prev => ({
                            ...prev,
                            currentPage: page,
                            pageSize: pagination.pageSize || 5,
                            totalRecords: mappedCampaigns.length,
                            totalPages: 1,
                            hasNextPage: false,
                            hasPreviousPage: false,
                        }))
                    }
                } else {
                    setError(result.error || 'Unable to load campaign list')
                    setCampaigns([])
                }
            } catch (err) {
                console.error('Error fetching campaigns:', err)
                setError('An error occurred while loading data: ' + (err.message || 'Unknown error'))
                setCampaigns([])
            } finally {
                setLoading(false)
            }
        }

        fetchNewPage()
    }

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            // TODO: Implement delete API call when available
            setCampaigns(campaigns.filter(campaign => campaign.id !== id))
        }
    }

    // Normalize status from API (number or string) to UI format
    const normalizeStatus = (status) => {
        if (!status) return 'pending_approval'

        // If numeric
        if (typeof status === 'number') {
            if (status === 2) return 'approved'
            if (status === 3) return 'rejected'
            return 'pending_approval' // 1 or other values
        }

        // If string, lowercase then handle
        const statusLower = String(status).toLowerCase().trim()

        // Handle various formats
        if (statusLower === 'approved' || statusLower === 'approve') return 'approved'
        if (statusLower === 'rejected' || statusLower === 'reject') return 'rejected'
        if (statusLower === 'pending' || statusLower === 'pending_approval' || statusLower === 'pending approval') return 'pending_approval'

        // Default
        return 'pending_approval'
    }

    const getStatusBadge = (status) => {
        const normalizedStatus = normalizeStatus(status)
        const statusConfig = {
            pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending approval' },
            rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
            approved: { color: 'bg-green-100 text-green-800', text: 'Approved' }
        }
        const config = statusConfig[normalizedStatus] || statusConfig.pending_approval
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <p className="text-slate-600">Loading data...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">Error: {error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Campaign Management</h2>
                        <p className="text-slate-600">Manage and monitor recruitment campaigns across the system</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Campaign List ({filteredCampaigns.length})</h3>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-64 px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'all'
                                ? 'bg-slate-600 text-white border-slate-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending_approval')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'pending_approval'
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-yellow-50'
                                }`}
                        >
                            Pending approval
                        </button>
                        <button
                            onClick={() => setStatusFilter('rejected')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'rejected'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                                }`}
                        >
                            Rejected
                        </button>
                        <button
                            onClick={() => setStatusFilter('approved')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'approved'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50'
                                }`}
                        >
                            Approved
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-200">
                    {filteredCampaigns.map((campaign) => (
                        <div key={campaign.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{campaign.name}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Request type:</span>
                                            <p className="font-medium text-slate-800">{campaign.requestType || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Target quantity:</span>
                                            <p className="font-medium text-slate-800">{campaign.targetQuantity || 0}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Status:</span>
                                            <div className="mt-1">{getStatusBadge(campaign.status)}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        {campaign.partnerName ? (
                                            <div>
                                                <span className="text-sm text-slate-600">Partner:</span>
                                                <p className="font-medium text-slate-800">{campaign.partnerName}</p>
                                            </div>
                                        ) : (
                                            <div></div>
                                        )}
                                        {campaign.directorName && (
                                            <div>
                                                <span className="text-sm text-slate-600">Director:</span>
                                                <p className="font-medium text-slate-800">{campaign.directorName}</p>
                                            </div>
                                        )}
                                    </div>
                                    {campaign.createdAt && (
                                        <div className="mb-2">
                                            <span className="text-sm text-slate-600">Created at:</span>
                                            <p className="font-medium text-slate-800">
                                                {new Date(campaign.createdAt).toLocaleDateString('en-US')}
                                            </p>
                                        </div>
                                    )}

                                    {campaign.description && (
                                        <p className="text-sm text-slate-600">{campaign.description}</p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleViewDetails(campaign)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        View details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredCampaigns.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-500">No campaigns found</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                    <div className="text-sm text-slate-600">
                        Page <span className="font-semibold">{pagination.currentPage}</span>
                        {pagination.totalPages ? (
                            <> / <span className="font-semibold">{pagination.totalPages}</span></>
                        ) : null}
                        {typeof pagination.totalRecords === 'number' && (
                            <span className="ml-2">
                                ({pagination.totalRecords} records)
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPreviousPage}
                            className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasPreviousPage
                                ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                }`}
                        >
                            Prev
                        </button>

                        <span className="text-sm text-slate-600">
                            {pagination.currentPage}
                        </span>

                        <button
                            type="button"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasNextPage
                                ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                }`}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RequestList