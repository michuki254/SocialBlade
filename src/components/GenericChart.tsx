'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface GenericChartProps {
  data: ChartData<'bar' | 'doughnut' | 'line'>
  type: 'bar' | 'doughnut' | 'line'
  options?: ChartOptions<'bar' | 'doughnut' | 'line'>
}

export const GenericChart: React.FC<GenericChartProps> = ({ data, type, options }) => {
  const defaultBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Rubik',
            size: 12,
          },
          color: '#484848',
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#484848',
        titleFont: {
          family: 'Rubik',
          size: 14,
        },
        bodyFont: {
          family: 'Rubik',
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Rubik',
            size: 11,
          },
          color: '#767676',
        },
      },
      y: {
        grid: {
          color: '#E8E8E8',
        },
        ticks: {
          font: {
            family: 'Rubik',
            size: 11,
          },
          color: '#767676',
        },
      },
    },
  }

  const defaultDoughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: {
            family: 'Rubik',
            size: 12,
          },
          color: '#484848',
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: '#484848',
        titleFont: {
          family: 'Rubik',
          size: 14,
        },
        bodyFont: {
          family: 'Rubik',
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
  }

  const defaultLineOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'Rubik',
            size: 12,
          },
          color: '#484848',
        },
      },
      tooltip: {
        backgroundColor: '#484848',
        titleFont: {
          family: 'Rubik',
          size: 14,
        },
        bodyFont: {
          family: 'Rubik',
          size: 12,
        },
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Rubik',
            size: 11,
          },
          color: '#767676',
        },
      },
      y: {
        grid: {
          color: '#E8E8E8',
        },
        ticks: {
          font: {
            family: 'Rubik',
            size: 11,
          },
          color: '#767676',
        },
      },
    },
  }

  const chartOptions = options || (
    type === 'bar' ? defaultBarOptions :
    type === 'doughnut' ? defaultDoughnutOptions :
    defaultLineOptions
  )

  return (
    <div className="w-full h-[400px]">
      {type === 'bar' && <Bar data={data as ChartData<'bar'>} options={chartOptions as ChartOptions<'bar'>} />}
      {type === 'doughnut' && <Doughnut data={data as ChartData<'doughnut'>} options={chartOptions as ChartOptions<'doughnut'>} />}
      {type === 'line' && <Line data={data as ChartData<'line'>} options={chartOptions as ChartOptions<'line'>} />}
    </div>
  )
}
