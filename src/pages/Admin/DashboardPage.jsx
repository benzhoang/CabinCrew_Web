import { useEffect, useRef, useState } from 'react'
import { getApplicationsByCampaignType, getApplicationsByMonth, getCampaignsByAirlinePartner, getCampaignsByMonth, getTestsByTestType, getUserHistoryByMonth } from '../../service/api'

const DashboardPage = () => {
    // Refs for pie charts
    const airlineChartRef = useRef(null)
    const campaignTypeChartRef = useRef(null)
    const testTypeChartRef = useRef(null)

    // Refs for bar charts
    const campaignsMonthChartRef = useRef(null)
    const applicationsMonthChartRef = useRef(null)
    const userHistoryChartRef = useRef(null)

    // Chart instances - using refs to avoid closure issues
    const airlineChartInstance = useRef(null)
    const campaignTypeChartInstance = useRef(null)
    const testTypeChartInstance = useRef(null)
    const campaignsMonthChartInstance = useRef(null)
    const applicationsMonthChartInstance = useRef(null)
    const userHistoryChartInstance = useRef(null)
    const ChartInstanceRef = useRef(null)

    // Year states
    const [campaignsYear, setCampaignsYear] = useState(2025)
    const [applicationsYear, setApplicationsYear] = useState(2025)
    const [userHistoryYear, setUserHistoryYear] = useState(2025)

    // Color palettes
    const colors = {
        pie1: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
        pie2: ['#8b5cf6', '#ec4899'],
        pie3: ['#06b6d4', '#f97316', '#84cc16'],
        bar: '#667eea',
        pass: '#10b981',
        failed: '#ef4444'
    }

    // API data state
    const [airlineData, setAirlineData] = useState([])
    const [campaignTypeData, setCampaignTypeData] = useState([])
    const [testTypeData, setTestTypeData] = useState([])
    const [campaignsByMonthData, setCampaignsByMonthData] = useState([])
    const [applicationsByMonthData, setApplicationsByMonthData] = useState([])
    const [userHistoryByMonthData, setUserHistoryByMonthData] = useState([])

    // Dummy data (kept for other charts and as fallback)
    const dummyData = {
    }

    const updateCampaignsByMonth = async (ChartParam, yearParam) => {
        let ChartInstance = ChartParam || ChartInstanceRef.current
        if (!ChartInstance && campaignsMonthChartRef.current) {
            const ChartAuto = await import('chart.js/auto')
            ChartInstance = ChartAuto.default
            ChartInstanceRef.current = ChartInstance
        }

        // Destroy existing chart
        if (campaignsMonthChartInstance.current) {
            campaignsMonthChartInstance.current.destroy()
            campaignsMonthChartInstance.current = null
        }

        if (campaignsMonthChartRef.current && ChartInstance) {
            const year = yearParam ?? campaignsYear
            const apiData = await getCampaignsByMonth(year)
            setCampaignsByMonthData(apiData)

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            const chart = new ChartInstance(campaignsMonthChartRef.current, {
                type: 'bar',
                data: {
                    labels: apiData.map(item => monthNames[item.month - 1] || `M${item.month}`),
                    datasets: [{
                        label: 'Campaigns',
                        data: apiData.map(item => item.count),
                        backgroundColor: colors.bar,
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 5
                            }
                        }
                    }
                }
            })
            campaignsMonthChartInstance.current = chart
        }
    }

    const updateApplicationsByMonth = async (ChartParam, yearParam) => {
        let ChartInstance = ChartParam || ChartInstanceRef.current
        if (!ChartInstance && applicationsMonthChartRef.current) {
            const ChartAuto = await import('chart.js/auto')
            ChartInstance = ChartAuto.default
            ChartInstanceRef.current = ChartInstance
        }

        // Destroy existing chart
        if (applicationsMonthChartInstance.current) {
            applicationsMonthChartInstance.current.destroy()
            applicationsMonthChartInstance.current = null
        }

        if (applicationsMonthChartRef.current && ChartInstance) {
            const year = yearParam ?? applicationsYear
            const apiData = await getApplicationsByMonth(year)
            setApplicationsByMonthData(apiData)

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            const chart = new ChartInstance(applicationsMonthChartRef.current, {
                type: 'bar',
                data: {
                    labels: apiData.map(item => monthNames[item.month - 1] || `M${item.month}`),
                    datasets: [{
                        label: 'Applications',
                        data: apiData.map(item => item.count),
                        backgroundColor: colors.bar,
                        borderRadius: 5
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 5
                            }
                        }
                    }
                }
            })
            applicationsMonthChartInstance.current = chart
        }
    }

    const updateUserHistoryByMonth = async (ChartParam, yearParam) => {
        let ChartInstance = ChartParam || ChartInstanceRef.current
        if (!ChartInstance && userHistoryChartRef.current) {
            const ChartAuto = await import('chart.js/auto')
            ChartInstance = ChartAuto.default
            ChartInstanceRef.current = ChartInstance
        }

        // Destroy existing chart
        if (userHistoryChartInstance.current) {
            userHistoryChartInstance.current.destroy()
            userHistoryChartInstance.current = null
        }

        if (userHistoryChartRef.current && ChartInstance) {
            const year = yearParam ?? userHistoryYear
            const apiData = await getUserHistoryByMonth(year)
            setUserHistoryByMonthData(apiData)

            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

            const chart = new ChartInstance(userHistoryChartRef.current, {
                type: 'bar',
                data: {
                    labels: apiData.map(item => monthNames[item.month - 1] || `M${item.month}`),
                    datasets: [
                        {
                            label: 'Pass',
                            data: apiData.map(item => item.passCount),
                            backgroundColor: colors.pass,
                            borderRadius: 5
                        },
                        {
                            label: 'Failed',
                            data: apiData.map(item => item.failedCount),
                            backgroundColor: colors.failed,
                            borderRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top'
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 2
                            }
                        }
                    }
                }
            })
            userHistoryChartInstance.current = chart
        }
    }

    useEffect(() => {
        let isCancelled = false

        const setupCharts = async () => {
            try {
                const ChartAuto = await import('chart.js/auto')
                const ChartInstance = ChartAuto.default
                ChartInstanceRef.current = ChartInstance

                if (isCancelled) return

                // Create pie charts
                const airlineApiData = await getCampaignsByAirlinePartner()
                if (isCancelled) return
                const airlineDataset = airlineApiData.length ? airlineApiData : airlineData
                setAirlineData(airlineDataset)

                const campaignTypeApiData = await getApplicationsByCampaignType()
                if (isCancelled) return
                const campaignTypeDataset = campaignTypeApiData.length ? campaignTypeApiData : []
                setCampaignTypeData(campaignTypeDataset)

                const testTypeApiData = await getTestsByTestType()
                if (isCancelled) return
                const testTypeDataset = testTypeApiData.length ? testTypeApiData : []
                setTestTypeData(testTypeDataset)

                if (airlineChartRef.current) {
                    const chart = new ChartInstance(airlineChartRef.current, {
                        type: 'pie',
                        data: {
                            labels: airlineDataset.map(item => item.type),
                            datasets: [{
                                data: airlineDataset.map(item => item.count),
                                backgroundColor: colors.pie1,
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 15,
                                        font: { size: 12 }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.label || ''
                                            const value = context.parsed || 0
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                            const percentage = total ? ((value / total) * 100).toFixed(1) : 0
                                            return `${label}: ${value} (${percentage}%)`
                                        }
                                    }
                                }
                            }
                        }
                    })
                    airlineChartInstance.current = chart
                }

                if (campaignTypeChartRef.current) {
                    const chart = new ChartInstance(campaignTypeChartRef.current, {
                        type: 'pie',
                        data: {
                            labels: campaignTypeDataset.map(item => item.type),
                            datasets: [{
                                data: campaignTypeDataset.map(item => item.count),
                                backgroundColor: colors.pie2,
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 15,
                                        font: { size: 12 }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.label || ''
                                            const value = context.parsed || 0
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                            const percentage = total ? ((value / total) * 100).toFixed(1) : 0
                                            return `${label}: ${value} (${percentage}%)`
                                        }
                                    }
                                }
                            }
                        }
                    })
                    campaignTypeChartInstance.current = chart
                }

                if (testTypeChartRef.current) {
                    const chart = new ChartInstance(testTypeChartRef.current, {
                        type: 'pie',
                        data: {
                            labels: testTypeDataset.map(item => item.type),
                            datasets: [{
                                data: testTypeDataset.map(item => item.count),
                                backgroundColor: colors.pie3,
                                borderWidth: 2,
                                borderColor: '#fff'
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                    labels: {
                                        padding: 15,
                                        font: { size: 12 }
                                    }
                                },
                                tooltip: {
                                    callbacks: {
                                        label: function (context) {
                                            const label = context.label || ''
                                            const value = context.parsed || 0
                                            const total = context.dataset.data.reduce((a, b) => a + b, 0)
                                            const percentage = ((value / total) * 100).toFixed(1)
                                            return `${label}: ${value} (${percentage}%)`
                                        }
                                    }
                                }
                            }
                        }
                    })
                    testTypeChartInstance.current = chart
                }

                // Create bar charts
                updateCampaignsByMonth(ChartInstance, campaignsYear)
                updateApplicationsByMonth(ChartInstance, applicationsYear)
                updateUserHistoryByMonth(ChartInstance, userHistoryYear)
            } catch (err) {
                console.error('Failed to load charts:', err)
            }
        }

        setupCharts()

        return () => {
            isCancelled = true
            if (airlineChartInstance.current) airlineChartInstance.current.destroy()
            if (campaignTypeChartInstance.current) campaignTypeChartInstance.current.destroy()
            if (testTypeChartInstance.current) testTypeChartInstance.current.destroy()
            if (campaignsMonthChartInstance.current) campaignsMonthChartInstance.current.destroy()
            if (applicationsMonthChartInstance.current) applicationsMonthChartInstance.current.destroy()
            if (userHistoryChartInstance.current) userHistoryChartInstance.current.destroy()
        }
    }, [])

    const handleCampaignsYearUpdate = async (yearParam) => {
        if (!ChartInstanceRef.current) {
            const ChartAuto = await import('chart.js/auto')
            ChartInstanceRef.current = ChartAuto.default
        }
        await updateCampaignsByMonth(ChartInstanceRef.current, yearParam ?? campaignsYear)
    }

    const handleApplicationsYearUpdate = async (yearParam) => {
        if (!ChartInstanceRef.current) {
            const ChartAuto = await import('chart.js/auto')
            ChartInstanceRef.current = ChartAuto.default
        }
        await updateApplicationsByMonth(ChartInstanceRef.current, yearParam ?? applicationsYear)
    }

    const handleUserHistoryYearUpdate = async (yearParam) => {
        if (!ChartInstanceRef.current) {
            const ChartAuto = await import('chart.js/auto')
            ChartInstanceRef.current = ChartAuto.default
        }
        await updateUserHistoryByMonth(ChartInstanceRef.current, yearParam ?? userHistoryYear)
    }

    return (
        <div className="w-full h-full p-5">
            {/* Row 1: Pie Charts */}
            <div className="flex flex-wrap gap-5 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-md flex-1 min-w-[300px]">
                    <h2 className="text-gray-800 text-xl font-semibold mb-5">Campaigns by Airline Partner</h2>
                    <div className="w-full flex justify-center">
                        <canvas ref={airlineChartRef} className="max-h-[300px]"></canvas>
                    </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md flex-1 min-w-[300px]">
                    <h2 className="text-gray-800 text-xl font-semibold mb-5">Applications by Campaign Type</h2>
                    <div className="w-full flex justify-center">
                        <canvas ref={campaignTypeChartRef} className="max-h-[300px]"></canvas>
                    </div>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md flex-1 min-w-[300px]">
                    <h2 className="text-gray-800 text-xl font-semibold mb-5">Tests by Test Type</h2>
                    <div className="w-full flex justify-center">
                        <canvas ref={testTypeChartRef} className="max-h-[300px]"></canvas>
                    </div>
                </div>
            </div>

            {/* Row 2: Bar Charts with Year Filter */}
            <div className="flex flex-wrap gap-5 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-md flex-1 min-w-[400px]">
                    <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                        <h2 className="text-gray-800 text-xl font-semibold">Campaigns by Month</h2>
                        <div className="flex items-center gap-3">
                            <label htmlFor="campaignsYear" className="font-semibold text-gray-600">Year:</label>
                            <input
                                type="number"
                                id="campaignsYear"
                                value={campaignsYear}
                                onChange={(e) => {
                                    const newYear = parseInt(e.target.value)
                                    setCampaignsYear(newYear)
                                    handleCampaignsYearUpdate(newYear)
                                }}
                                min="2020"
                                max="2030"
                                className="px-3 py-2 border-2 border-gray-300 rounded-md text-sm w-20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                    <canvas ref={campaignsMonthChartRef} className="max-h-[300px]"></canvas>
                </div>
                <div className="bg-white rounded-lg p-6 shadow-md flex-1 min-w-[400px]">
                    <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                        <h2 className="text-gray-800 text-xl font-semibold">Applications by Month</h2>
                        <div className="flex items-center gap-3">
                            <label htmlFor="applicationsYear" className="font-semibold text-gray-600">Year:</label>
                            <input
                                type="number"
                                id="applicationsYear"
                                value={applicationsYear}
                                onChange={(e) => {
                                    const newYear = parseInt(e.target.value)
                                    setApplicationsYear(newYear)
                                    handleApplicationsYearUpdate(newYear)
                                }}
                                min="2020"
                                max="2030"
                                className="px-3 py-2 border-2 border-gray-300 rounded-md text-sm w-20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                    <canvas ref={applicationsMonthChartRef} className="max-h-[300px]"></canvas>
                </div>
            </div>

            {/* Row 3: Grouped Bar Chart */}
            <div className="flex flex-wrap gap-5 mb-8">
                <div className="bg-white rounded-lg p-6 shadow-md flex-1 w-full">
                    <div className="flex justify-between items-center mb-5 flex-wrap gap-3">
                        <h2 className="text-gray-800 text-xl font-semibold">User History by Month (Pass/Failed)</h2>
                        <div className="flex items-center gap-3">
                            <label htmlFor="userHistoryYear" className="font-semibold text-gray-600">Year:</label>
                            <input
                                type="number"
                                id="userHistoryYear"
                                value={userHistoryYear}
                                onChange={(e) => {
                                    const newYear = parseInt(e.target.value)
                                    setUserHistoryYear(newYear)
                                    handleUserHistoryYearUpdate(newYear)
                                }}
                                min="2020"
                                max="2030"
                                className="px-3 py-2 border-2 border-gray-300 rounded-md text-sm w-20 focus:outline-none focus:border-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                    <canvas ref={userHistoryChartRef} className="max-h-[300px]"></canvas>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage