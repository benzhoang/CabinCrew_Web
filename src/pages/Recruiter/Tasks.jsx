import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getMyTasks } from '../../service/api'

const Tasks = () => {
    const [tasks, setTasks] = useState([])
    const [filteredTasks, setFilteredTasks] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [taskFilter, setTaskFilter] = useState('all')
    const [sortBy, setSortBy] = useState('assignedAt')
    const [selectedTask, setSelectedTask] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [langVersion, setLangVersion] = useState(0)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(null)
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
        if (!date) return value || 'Không xác định'
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
        if (!date) return value || 'Không xác định'
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
                            task: assignment.task || 'Không xác định',
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
                const response = await getMyTasks()
                if (response.success && response.data) {
                    const transformedTasks = transformTasksData(response.data)
                    setTasks(transformedTasks)
                    setFilteredTasks(transformedTasks)
                } else {
                    setTasks([])
                    setFilteredTasks([])
                    setError(response.error || 'Không thể lấy danh sách công việc')
                }
            } catch (err) {
                setTasks([])
                setFilteredTasks([])
                setError(err.message || 'Không thể lấy danh sách công việc')
            } finally {
                setIsLoading(false)
            }
        }

        fetchTasks()
    }, [])

    const normalizeString = (value) => (value || '').toString().toLowerCase()

    useEffect(() => {
        let filtered = tasks

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
    }, [tasks, searchTerm, statusFilter, taskFilter, sortBy])

    const handleViewDetails = (task) => {
        setSelectedTask(task)
        setShowModal(true)
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            assigned: { color: 'bg-yellow-100 text-yellow-800', text: 'Đã giao' },
            inProgress: { color: 'bg-blue-100 text-blue-800', text: 'Đang thực hiện' },
            completed: { color: 'bg-green-100 text-green-800', text: 'Đã hoàn thành' },
            cancelled: { color: 'bg-red-100 text-red-700', text: 'Đã hủy' }
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
        tasks.forEach(task => {
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
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Công Việc Được Giao</h2>
                        <p className="text-slate-600">Danh sách các công việc được giao cho bạn</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search Bar */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Tìm theo tên chiến dịch, công việc..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Task Type Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Loại công việc</label>
                        <select
                            value={taskFilter}
                            onChange={(e) => setTaskFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">Tất cả loại công việc</option>
                            {getUniqueTaskTypes().map(taskType => (
                                <option key={taskType} value={taskType}>{taskType}</option>
                            ))}
                        </select>
                    </div>

                    {/* Sort Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sắp xếp theo</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="assignedAt">Ngày giao (mới nhất)</option>
                            <option value="campaignName">Tên chiến dịch</option>
                            <option value="task">Loại công việc</option>
                            <option value="status">Trạng thái</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Danh sách Công Việc ({filteredTasks.length})</h3>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('assigned')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'assigned'
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-yellow-50'
                                }`}
                        >
                            Đã giao
                        </button>
                        <button
                            onClick={() => setStatusFilter('inProgress')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'inProgress'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                                }`}
                        >
                            Đang thực hiện
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'completed'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50'
                                }`}
                        >
                            Đã hoàn thành
                        </button>
                        <button
                            onClick={() => setStatusFilter('cancelled')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'cancelled'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50'
                                }`}
                        >
                            Đã hủy
                        </button>
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'all'
                                ? 'bg-slate-600 text-white border-slate-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                        >
                            Tất cả
                        </button>
                    </div>
                </div>

                <div className="divide-y divide-slate-200">
                    {isLoading && (
                        <div className="p-6 text-center text-slate-500">
                            Đang tải danh sách công việc...
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="p-6 text-center text-red-500">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && filteredTasks.length === 0 && (
                        <div className="p-6 text-center text-slate-500">
                            Không có công việc nào được giao
                        </div>
                    )}

                    {filteredTasks.map((task) => (
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
                                            <span className="text-sm text-slate-600">Công việc:</span>
                                            <p className="font-medium text-slate-800">{task.task}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Trạng thái:</span>
                                            <div className="mt-1">{getStatusBadge(task.status)}</div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Ngày giao:</span>
                                            <p className="font-medium text-slate-800">{formatDateValue(task.assignedAt)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                        {task.taskDescription && (
                                            <div>
                                                <span className="text-sm text-slate-600">Mô tả công việc:</span>
                                                <p className="text-slate-800">{task.taskDescription}</p>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-sm text-slate-600">Ngày bắt đầu:</span>
                                            <p className="font-medium text-slate-800">{formatDateOnly(task.startDate)}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Ngày kết thúc:</span>
                                            <p className="font-medium text-slate-800">{formatDateOnly(task.endDate)}</p>
                                        </div>
                                    </div>

                                    {task.completedAt && (
                                        <div className="mb-2">
                                            <span className="text-sm text-slate-600">Hoàn thành lúc:</span>
                                            <p className="font-medium text-green-600">{formatDateValue(task.completedAt)}</p>
                                        </div>
                                    )}

                                    {task.assignedBy && (
                                        <div className="mb-2">
                                            <span className="text-sm text-slate-600">Giao bởi:</span>
                                            <p className="font-medium text-slate-800">{task.assignedBy}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => handleViewDetails(task)}
                                        className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Xem chi tiết
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Chi tiết */}
            {showModal && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-slate-800">Chi tiết Công Việc</h3>
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
                                        <span className="text-sm text-slate-600">Công việc:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.task}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Trạng thái:</span>
                                        <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Ngày giao:</span>
                                        <p className="font-medium text-slate-800">{formatDateValue(selectedTask.assignedAt)}</p>
                                    </div>
                                    {selectedTask.completedAt && (
                                        <div>
                                            <span className="text-sm text-slate-600">Hoàn thành lúc:</span>
                                            <p className="font-medium text-green-600">{formatDateValue(selectedTask.completedAt)}</p>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-sm text-slate-600">Giao bởi:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.assignedBy}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Mã chiến dịch:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.campaignId}</p>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-sm text-slate-600">Thời gian chiến dịch:</span>
                                    <p className="font-medium text-slate-800">{formatDateOnly(selectedTask.startDate)} - {formatDateOnly(selectedTask.endDate)}</p>
                                </div>

                                {selectedTask.description && (
                                    <div>
                                        <span className="text-sm text-slate-600">Mô tả chiến dịch:</span>
                                        <p className="text-slate-800 mt-1">{selectedTask.description || 'Không có mô tả'}</p>
                                    </div>
                                )}

                                {selectedTask.taskDescription && (
                                    <div>
                                        <span className="text-sm text-slate-600">Mô tả công việc:</span>
                                        <p className="text-slate-800 mt-1">{selectedTask.taskDescription}</p>
                                    </div>
                                )}

                                {selectedTask.notes && (
                                    <div>
                                        <span className="text-sm text-slate-600">Ghi chú:</span>
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
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Tasks

