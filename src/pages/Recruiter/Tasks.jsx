import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { t, onLangChange } from '../../i18n'
import { getMyTasks } from '../../service/api'

const Tasks = () => {
    const [tasks, setTasks] = useState([])
    const [filteredTasks, setFilteredTasks] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [sortBy, setSortBy] = useState('name')
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
        return date.toLocaleDateString('vi-VN')
    }

    const mapStatusValue = (status) => {
        const normalized = (status || '').toString().trim().toLowerCase()
        if (['ongoing', 'inprogress', 'in_progress', 'active', 'assigned'].includes(normalized)) return 'ongoing'
        if (['pending', 'draft', 'scheduled', 'waiting', 'reviewing'].includes(normalized)) return 'pending'
        if (['completed', 'done', 'finished', 'closed'].includes(normalized)) return 'completed'
        return 'ongoing'
    }

    const transformTaskData = (item) => {
        return {
            id: item.id ?? item.taskId ?? item.taskID ?? item.Id,
            title: item.title ?? item.taskTitle ?? item.name ?? 'Task chưa có tên',
            description: item.description ?? item.taskDescription ?? '',
            status: mapStatusValue(item.status),
            assignedDate: formatDateValue(item.assignedDate ?? item.createdDate),
            dueDate: formatDateValue(item.dueDate ?? item.deadline),
            rawAssignedDate: item.assignedDate ?? item.createdDate,
            rawDueDate: item.dueDate ?? item.deadline,
            campaignId: item.campaignId ?? item.campaignID,
            campaignName: item.campaignName ?? item.campaign?.name ?? 'Không xác định',
            taskType: item.taskType ?? item.type ?? 'Không xác định',
            priority: item.priority ?? 'normal',
            assigner: item.assigner ?? item.createdBy ?? 'Không xác định'
        }
    }

    useEffect(() => {
        const fetchTasks = async () => {
            setIsLoading(true)
            setError(null)
            try {
                const response = await getMyTasks()
                if (response.success && Array.isArray(response.data)) {
                    const normalizedTasks = response.data.map(transformTaskData)
                    setTasks(normalizedTasks)
                    setFilteredTasks(normalizedTasks)
                } else {
                    setTasks([])
                    setFilteredTasks([])
                    setError(response.error || 'Không thể lấy danh sách task')
                }
            } catch (err) {
                setTasks([])
                setFilteredTasks([])
                setError(err.message || 'Không thể lấy danh sách task')
            } finally {
                setIsLoading(false)
            }
        }

        fetchTasks()
    }, [])

    const normalizeString = (value) => (value || '').toString().toLowerCase()
    const normalizeStatus = (value) => normalizeString(value)

    useEffect(() => {
        let filtered = tasks

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            filtered = filtered.filter(task =>
                normalizeString(task.title).includes(term) ||
                normalizeString(task.description).includes(term) ||
                normalizeString(task.campaignName).includes(term) ||
                normalizeString(task.taskType).includes(term)
            )
        }

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(task => normalizeStatus(task.status) === statusFilter)
        }

        // Sort tasks
        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return normalizeString(a.title).localeCompare(normalizeString(b.title))
                case 'assignedDate':
                    return (parseDateValue(a.rawAssignedDate) || 0) - (parseDateValue(b.rawAssignedDate) || 0)
                case 'dueDate':
                    return (parseDateValue(a.rawDueDate) || 0) - (parseDateValue(b.rawDueDate) || 0)
                case 'status':
                    const statusOrder = { ongoing: 1, pending: 2, completed: 3 }
                    const statusA = statusOrder[normalizeStatus(a.status)] || 4
                    const statusB = statusOrder[normalizeStatus(b.status)] || 4
                    return statusA - statusB
                default:
                    return 0
            }
        })

        setFilteredTasks(sorted)
    }, [tasks, searchTerm, statusFilter, sortBy])

    const handleViewDetails = (task) => {
        setSelectedTask(task)
        setShowModal(true)
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            ongoing: { color: 'bg-green-100 text-green-800', text: 'Đang thực hiện' },
            completed: { color: 'bg-blue-100 text-blue-800', text: 'Đã hoàn thành' },
            pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Đang chờ' }
        }
        const config = statusConfig[normalizeStatus(status)] || statusConfig.ongoing
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            high: { color: 'bg-red-100 text-red-800', text: 'Cao' },
            medium: { color: 'bg-orange-100 text-orange-800', text: 'Trung bình' },
            normal: { color: 'bg-blue-100 text-blue-800', text: 'Bình thường' },
            low: { color: 'bg-gray-100 text-gray-800', text: 'Thấp' }
        }
        const config = priorityConfig[normalizeString(priority)] || priorityConfig.normal
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                {config.text}
            </span>
        )
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">Quản lý Task</h2>
                        <p className="text-slate-600">Danh sách các task được giao cho bạn</p>
                    </div>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Search Bar */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Tìm kiếm</label>
                        <input
                            type="text"
                            placeholder="Tìm theo tiêu đề, mô tả, chiến dịch..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Sort Filter */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Sắp xếp theo</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="name">Tên task</option>
                            <option value="assignedDate">Ngày giao</option>
                            <option value="dueDate">Hạn hoàn thành</option>
                            <option value="status">Trạng thái</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200">
                <div className="p-6 border-b border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-slate-800">Danh sách Task ({filteredTasks.length})</h3>
                    </div>

                    {/* Status Filter Buttons */}
                    <div className="flex gap-3 flex-wrap">
                        <button
                            onClick={() => setStatusFilter('ongoing')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'ongoing'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-green-50'
                                }`}
                        >
                            Đang thực hiện
                        </button>
                        <button
                            onClick={() => setStatusFilter('pending')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'pending'
                                ? 'bg-yellow-600 text-white border-yellow-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-yellow-50'
                                }`}
                        >
                            Đang chờ
                        </button>
                        <button
                            onClick={() => setStatusFilter('completed')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors border-2 ${statusFilter === 'completed'
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-slate-700 border-slate-300 hover:bg-blue-50'
                                }`}
                        >
                            Đã hoàn thành
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
                            Đang tải danh sách task...
                        </div>
                    )}

                    {!isLoading && error && (
                        <div className="p-6 text-center text-red-500">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && filteredTasks.map((task) => (
                        <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="mb-2">
                                        <h4 className="text-lg font-semibold text-slate-800">{task.title}</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Chiến dịch:</span>
                                            <p className="font-medium text-slate-800">{task.campaignName}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Loại task:</span>
                                            <p className="font-medium text-slate-800">{task.taskType}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Trạng thái:</span>
                                            <div className="mt-1">{getStatusBadge(task.status)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                                        <div>
                                            <span className="text-sm text-slate-600">Ngày giao:</span>
                                            <p className="font-medium text-slate-800">{task.assignedDate}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Hạn hoàn thành:</span>
                                            <p className="font-medium text-slate-800">{task.dueDate}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-600">Độ ưu tiên:</span>
                                            <div className="mt-1">{getPriorityBadge(task.priority)}</div>
                                        </div>
                                    </div>

                                    {task.description && (
                                        <p className="text-sm text-slate-600 mb-2">{task.description}</p>
                                    )}

                                    <div className="text-sm text-slate-500">
                                        <span>Người giao: </span>
                                        <span className="font-medium">{task.assigner}</span>
                                    </div>
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

                {!isLoading && !error && filteredTasks.length === 0 && (
                    <div className="p-12 text-center">
                        <p className="text-slate-500">Không tìm thấy task nào</p>
                    </div>
                )}
            </div>

            {/* Modal Chi tiết */}
            {showModal && selectedTask && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-semibold text-slate-800">Chi tiết Task</h3>
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
                                    <h4 className="text-lg font-semibold text-slate-800 mb-2">{selectedTask.title}</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-slate-600">Chiến dịch:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.campaignName}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Loại task:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.taskType}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Trạng thái:</span>
                                        <div className="mt-1">{getStatusBadge(selectedTask.status)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Độ ưu tiên:</span>
                                        <div className="mt-1">{getPriorityBadge(selectedTask.priority)}</div>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Ngày giao:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.assignedDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Hạn hoàn thành:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.dueDate}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-slate-600">Người giao:</span>
                                        <p className="font-medium text-slate-800">{selectedTask.assigner}</p>
                                    </div>
                                </div>

                                {selectedTask.description && (
                                    <div>
                                        <span className="text-sm text-slate-600">Mô tả:</span>
                                        <p className="text-slate-800 mt-1">{selectedTask.description}</p>
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