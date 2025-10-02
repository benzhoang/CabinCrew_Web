import { useEffect, useRef } from 'react'

const CabinCrewDashboardPage = () => {
  const pieRef = useRef(null)
  const barRef = useRef(null)
  const pieChartRef = useRef(null)
  const barChartRef = useRef(null)

  useEffect(() => {
    let isCancelled = false

    const setupCharts = async () => {
      try {
        const ChartAuto = await import('chart.js/auto')
        const Chart = ChartAuto.default

        if (isCancelled) return

        if (pieRef.current) {
          pieChartRef.current = new Chart(pieRef.current, {
        type: 'pie',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [
            {
              data: [35, 20, 25],
              backgroundColor: ['#22c55e', '#16a34a', '#86efac']
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.6,
          plugins: { legend: { position: 'bottom' } }
        }
        })
        }

        if (barRef.current) {
          barChartRef.current = new Chart(barRef.current, {
        type: 'bar',
        data: {
          labels: ['0', '1', '2', '3', '4'],
          datasets: [
            {
              label: 'Q',
              data: [100, 70, 50, 40, 90],
              backgroundColor: '#9333ea'
            },
            {
              label: 'I',
              data: [70, 50, 40, 30, 80],
              backgroundColor: '#f43f5e'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          aspectRatio: 1.6,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { beginAtZero: true } }
        }
        })
        }
      } catch (err) {
        console.error('Failed to load charts:', err)
      }
    }

    setupCharts()

    return () => {
      isCancelled = true
      if (pieChartRef.current) pieChartRef.current.destroy()
      if (barChartRef.current) barChartRef.current.destroy()
    }
  }, [])

  const handleExportToExcel = () => {
    // Logic export to excel sẽ được implement sau
    console.log('Export to Excel clicked')
  }

  return (
    <div className="w-full h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-sm text-gray-600">Total user <span className="text-gray-400">/month</span></div>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-semibold">10</div>
            <div className="text-gray-500 text-sm">user</div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-sm text-gray-600">Total question <span className="text-gray-400">/month</span></div>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-semibold">5</div>
            <div className="text-gray-500 text-sm">question</div>
          </div>
        </div>
        <div className="bg-gray-100 rounded-xl p-4">
          <div className="text-sm text-gray-600">Total interview <span className="text-gray-400">/month</span></div>
          <div className="mt-3 flex items-end justify-between">
            <div className="text-3xl font-semibold">10</div>
            <div className="text-gray-500 text-sm">interview</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-5">
          <div className="font-semibold mb-3">Report</div>
          <div className="w-full flex justify-center">
            <canvas ref={pieRef} className="w-full"></canvas>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5">
          <div className="font-semibold mb-3">Statistic</div>
          <canvas ref={barRef} className="w-full"></canvas>
        </div>
      </div>

      {/* Export Button below charts */}
      <div className="ml-10 pb-10">
        <button
          onClick={handleExportToExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export to Excel
        </button>
      </div>
    </div>
  )
}

export default CabinCrewDashboardPage