import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getMyTasks } from '../../service/api'

const Tasks = () => {
    const [allTasks, setAllTasks] = useState([]) // Lưu tất cả tasks từ API
    const [filteredTasks, setFilteredTasks] = useState([]) // Tasks sau khi filter/sort
    const [displayedTasks, setDisplayedTasks] = useState([]) // Tasks hiển thị trên trang hiện tại (5 items)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [taskFilter, setTaskFilter] = useState('all')
    const [sortBy, setSortBy] = useState('assignedAt')
    const [selectedTask, setSelectedTask] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [langVersion, setLangVersion] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        pageSize: 5, // Mỗi trang 5 task
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

    const parseDateValue = (value) => {
        if (!value) return null

        const native = new Date(value)
        if (!Number.isNaN(native.getTime())) return native

        const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{1,2}))?/)
        if (match) {
            const [, day, month, year, hour = '0', minute = '0'] = match
            return new Date(
                Number(year),
                Number(month) - 1,
                Number(day),
                Number(hour),
                Number(minute)
            )
        }

        return null
    }

    const formatDateValue = (value) => {
        const date = parseDateValue(value)
        if (!date) return value || 'Unknown'
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDateOnly = (value) => {
        const date = parseDateValue(value)
        if (!date) return value || 'Unknown'
        return date.toLocaleDateString('vi-VN')
    }

    const mapStatusValue = (status) => {
        const normalized = (status || '').toString().trim().toLowerCase()
        const compact = normalized.replace(/[\s_-]+/g, '')

        if (['completed', 'done', 'finished'].includes(compact)) return 'completed'
        if (['inprogress', 'processing', 'ongoing'].includes(compact)) return 'inProgress'
        if (['cancelled', 'canceled', 'cancel', 'aborted'].includes(compact)) return 'cancelled'
        if (['assigned', 'pending', 'todo'].includes(compact)) return 'assigned'

        return 'assigned'
    }

    // Transform data từ API thành format dễ sử dụng
    const transformTasksData = (data) => {
        const allTasks = []

        // Duyệt qua từng campaign
        if (Array.isArray(data)) {
            data.forEach(campaign => {
                const campaignId = campaign.campaignId || campaign.id
                const campaignName = campaign.campaignName || campaign.name || 'Chiến dịch chưa có tên'
                const description = campaign.description || ''
                const startDate = campaign.startDate
                const endDate = campaign.endDate

                // Duyệt qua từng assignment trong campaign
                if (Array.isArray(campaign.assignments)) {
                    campaign.assignments.forEach(assignment => {
                        allTasks.push({
                            id: assignment.assignmentId || assignment.id,
                            campaignId: campaignId,
                            campaignName: campaignName,
                            description: description,
                            startDate: startDate,
                            endDate: endDate,
                            task: assignment.task || 'Unknown',
                            taskDescription: assignment.taskDescription || assignment.description || '',
                            status: mapStatusValue(assignment.status),
                            assignedAt: assignment.assignedAt,
                            assignedBy: assignment.assignedBy || 'N/A',
                            completedAt: assignment.completedAt,
                            notes: assignment.notes || ''
                        })
                    })
                }
            })
        }

        return allTasks
    }

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true)
            setError(null)
            try {
                // Lấy tất cả tasks từ API (không phân trang ở server)
                const response = await getMyTasks({})
                if (response.success && response.data) {
                    const transformedTasks = transformTasksData(response.data)
                    setAllTasks(transformedTasks)

                    // Tính toán phân trang dựa trên tổng số tasks
                    const pageSize = 5
                    const totalRecords = transformedTasks.length
                    const totalPages = Math.ceil(totalRecords / pageSize) || 1

                    setPagination(prev => ({
                        ...prev,
                        currentPage: 1,
                        pageSize: pageSize,
                        totalRecords: totalRecords,
                        totalPages: totalPages,
                        hasNextPage: totalPages > 1,
                        hasPreviousPage: false,
                    }))
                } else {
                    setAllTasks([])
                    setFilteredTasks([])
                    setDisplayedTasks([])
                    setError(response.error || 'Unable to fetch tasks')
                }
            } catch (err) {
                setAllTasks([])
                setFilteredTasks([])
                setDisplayedTasks([])
                setError(err.message || 'Unable to fetch tasks')
            } finally {
                setIsLoading(false)
            }
        }

        // Lần đầu load sẽ lấy tất cả tasks
        fetchTasks()
    }, [])

    const normalizeString = (value) => (value || '').toString().toLowerCase()

    // Filter và sort tasks
    useEffect(() => {
        let filtered = allTasks

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(task =>
                normalizeString(task.campaignName).includes(term) ||
                normalizeString(task.task).includes(term) ||
                normalizeString(task.taskDescription).includes(term)
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(task => task.status === statusFilter)
        }

        // Filter by task type
        if (taskFilter !== 'all') {
            filtered = filtered.filter(task => normalizeString(task.task) === normalizeString(taskFilter))
        }

        // Sort tasks
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'assignedAt':
                    return (parseDateValue(b.assignedAt) || 0) - (parseDateValue(a.assignedAt) || 0)
                case 'campaignName':
                    return normalizeString(a.campaignName).localeCompare(normalizeString(b.campaignName))
                case 'task':
                    return normalizeString(a.task).localeCompare(normalizeString(b.task))
                case 'status':
                    const statusOrder = { completed: 1, inProgress: 2, assigned: 3, cancelled: 4 }
                    return (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5)
                default:
                    return 0
            }
        })

        setFilteredTasks(sorted)

        // Cập nhật pagination dựa trên số lượng filtered tasks
        // Reset về trang 1 khi filter/search/sort thay đổi
        const pageSize = 5
        const totalRecords = sorted.length
        const totalPages = Math.ceil(totalRecords / pageSize) || 1

        setPagination(prev => ({
            ...prev,
            currentPage: 1, // Reset về trang 1 khi filter thay đổi
            totalRecords: totalRecords,
            totalPages: totalPages,
            hasNextPage: totalPages > 1,
            hasPreviousPage: false,
        }))
    }, [allTasks, searchTerm, statusFilter, taskFilter, sortBy])

    // Áp dụng client-side pagination trên filteredTasks
    useEffect(() => {
        const pageSize = pagination.pageSize || 5
        const currentPage = pagination.currentPage || 1
        const startIndex = (currentPage - 1) * pageSize
        const endIndex = startIndex + pageSize
        const paginatedTasks = filteredTasks.slice(startIndex, endIndex)
        setDisplayedTasks(paginatedTasks)
    }, [filteredTasks, pagination.currentPage, pagination.pageSize])

    const handleViewDetails = (task) => {
        setSelectedTask(task)
        setShowModal(true)
    }

    const handlePageChange = (page) => {
        if (page === pagination.currentPage) return
        if (page < 1) return
        if (pagination.totalPages && page > pagination.totalPages) return

        // Chỉ cập nhật trang hiện tại (client-side pagination)
        setPagination(prev => ({
            ...prev,
            currentPage: page,
            hasNextPage: page < prev.totalPages,
            hasPreviousPage: page > 1,
        }))
    }

    // Hàm tính toán các số trang cần hiển thị
    const getPageNumbers = () => {
        const currentPage = pagination.currentPage || 1
        const totalPages = pagination.totalPages || 1

        if (totalPages <= 0) {
            return []
        }

        const pageNumbers = []

        if (totalPages <= 7) {
            // Nếu tổng số trang <= 7, hiển thị tất cả
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i)
            }
        } else {
            // Nếu tổng số trang > 7, hiển thị thông minh
            if (currentPage <= 4) {
                // Gần đầu: 1, 2, 3, 4, 5, ..., totalPages
                for (let i = 1; i <= 5; i++) {
                    pageNumbers.push(i)
                }
                pageNumbers.push('...')
                pageNumbers.push(totalPages)
            } else if (currentPage >= totalPages - 3) {
                // Gần cuối: 1, ..., totalPages-4, totalPages-3, totalPages-2, totalPages-1, totalPages
                pageNumbers.push(1)
                pageNumbers.push('...')
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pageNumbers.push(i)
                }
            } else {
                // Ở giữa: 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
                pageNumbers.push(1)
                pageNumbers.push('...')
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pageNumbers.push(i)
                }
                pageNumbers.push('...')
                pageNumbers.push(totalPages)
            }
        }

        return pageNumbers
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            assigned: { color: 'bg-yellow-100 text-yellow-800', text: 'Assigned' },
            inProgress: { color: 'bg-blue-100 text-blue-800', text: 'In progress' },
            completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-700', text: 'Cancelled' }
        }
        const config = statusConfig[status] || statusConfig.assigned
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    // Lấy danh sách các task types duy nhất
    const getUniqueTaskTypes = () => {
        const taskTypes = new Set()
        allTasks.forEach(task => {
            if (task.task) {
                taskTypes.add(task.task)
            }
        })
        return Array.from(taskTypes).sort()
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Assigned Tasks</h2>
                        <p className="text-slate-600">List of tasks assigned to you</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Bar */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Search by campaign name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Task Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Task type</label>
                        <select
                            value={taskFilter}
                            onChange={(e) => setTaskFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All task types</option>
                            {getUniqueTaskTypes().map(taskType => (
                                <option key={taskType} value={taskType}>{taskType}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sort by</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="assignedAt">Assigned date (newest)</option>
                            <option value="campaignName">Campaign name</option>
                            <option value="task">Task type</option>
                            <option value="status">Status</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Task List ({filteredTasks.length})</h3>
                    </div>

                    {/* Status Filter Buttons */}
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
                            onClick={() => setStatusFilter('assigned')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'assigned'
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-yellow-50'
                                }`}
                        >
                            Assigned
                        </button>
                        <button
                            onClick={() => setStatusFilter('inProgress')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'inProgress'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                                }`}
                        >
                            In progress
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'completed'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50'
                                }`}
                        >
                            Completed
                        </button>
                        <button
                            onClick={() => setStatusFilter('cancelled')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'cancelled'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                                }`}
                        >
                            Cancelled
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-200">
                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-4 text-sm text-gray-600">
                                {t('loading_data') || 'Loading task list...'}
                            </p>
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="p-6 text-center text-red-500">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && displayedTasks.length === 0 && (
                        <div className="p-6 text-center text-slate-500">
                            No tasks assigned
                        </div>
                    )}

                    {displayedTasks.map((task) => (
                        <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{task.campaignName}</h4>
                                        {task.description && (
                                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Task:</span>
                                            <p className="font-medium text-slate-800">{task.task}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Status:</span>
                                            <div className="mt-1">{getStatusBadge(task.status)}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Assigned at:</span>
                                            <p className="font-medium text-slate-800">{formatDateValue(task.assignedAt)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                        {task.taskDescription && (
                                            <div>
                                                <span className="text-sm text-slate-600">Task description:</span>
                                                <p className="text-slate-800">{task.taskDescription}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-sm text-slate-600">Start date:</span>
                                            <p className="font-medium text-slate-800">{formatDateOnly(task.startDate)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">End date:</span>
                                            <p className="font-medium text-slate-800">{formatDateOnly(task.endDate)}</p>
                                        </div>
                                    </div>

                                    {task.completedAt && (
                                        <div className="mb-2">
                                            <span className="text-sm text-slate-600">Completed at:</span>
                                            <p className="font-medium text-green-600">{formatDateValue(task.completedAt)}</p>
                                        </div>
                                    )}

                                    {task.assignedBy && (
                                        <div className="mb-2">
                                            <span className="text-sm text-slate-600">Assigned by:</span>
                                            <p className="font-medium text-slate-800">{task.assignedBy}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    {(pagination.totalPages > 0 || pagination.totalPages === undefined) && getPageNumbers().length > 0 && (
                        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                            <div className="text-sm text-slate-600">
                                Page <span className="font-semibold">{pagination.currentPage || 1}</span>
                                {pagination.totalPages ? (
                                    <> / <span className="font-semibold">{pagination.totalPages}</span></>
                                ) : null}
                                {typeof pagination.totalRecords === 'number' && pagination.totalRecords > 0 && (
                                    <span className="ml-2">
                                        ({pagination.totalRecords} records)
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => handlePageChange((pagination.currentPage || 1) - 1)}
                                    disabled={!pagination.hasPreviousPage || (pagination.currentPage || 1) === 1}
                                    className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasPreviousPage && (pagination.currentPage || 1) > 1
                                        ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                        }`}
                                >
                                    Prev
                                </button>

                                {getPageNumbers().map((pageNum, index) => {
                                    if (pageNum === '...') {
                                        return (
                                            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">
                                                ...
                                            </span>
                                        )
                                    }

                                    const isActive = pageNum === (pagination.currentPage || 1)
                                    return (
                                        <button
                                            key={pageNum}
                                            type="button"
                                            onClick={() => handlePageChange(pageNum)}
                                            className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${isActive
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    )
                                })}

                                <button
                                    type="button"
                                    onClick={() => handlePageChange((pagination.currentPage || 1) + 1)}
                                    disabled={!pagination.hasNextPage || (pagination.currentPage || 1) >= (pagination.totalPages || 1)}
                                    className={`px-3 py-1 rounded-md border text-sm font-medium transition-colors ${pagination.hasNextPage && (pagination.currentPage || 1) < (pagination.totalPages || 1)
                                        ? 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showModal && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-slate-800">Task details</h3>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="text-slate-400 hover:text-slate-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedTask.campaignName}</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-slate-600">Task:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.task}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Status:</span>
                                        <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Assigned at:</span>
                                        <p className="font-medium text-slate-800">{formatDateValue(selectedTask.assignedAt)}</p>
                                    </div>
                                    {selectedTask.completedAt && (
                                        <div>
                                            <span className="text-sm text-slate-600">Completed at:</span>
                                            <p className="font-medium text-green-600">{formatDateValue(selectedTask.completedAt)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-sm text-slate-600">Assigned by:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.assignedBy}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Campaign ID:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.campaignId}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm text-slate-600">Campaign timeline:</span>
                                    <p className="font-medium text-slate-800">{formatDateOnly(selectedTask.startDate)} - {formatDateOnly(selectedTask.endDate)}</p>
                                </div>

                                {selectedTask.description && (
                                    <div>
                                        <span className="text-sm text-slate-600">Campaign description:</span>
                                        <p className="text-slate-800 mt-1">{selectedTask.description || 'No description'}</p>
                                    </div>
                                )}

                                {selectedTask.taskDescription && (
                                    <div>
                                        <span className="text-sm text-slate-600">Task description:</span>
                                        <p className="text-slate-800 mt-1">{selectedTask.taskDescription}</p>
                                    </div>
                                )}

                                {selectedTask.notes && (
                                    <div>
                                        <span className="text-sm text-slate-600">Notes:</span>
                                        <p className="text-slate-800 mt-1">{selectedTask.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tasks

