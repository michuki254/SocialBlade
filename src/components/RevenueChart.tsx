'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface RevenueChartProps {
  data: {
    labels: string[]
    values: number[]
  }
  type?: 'line' | 'bar'
  title?: string
  color?: string
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  type = 'line',
  title,
  color = '#00A699'
}) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title || 'Revenue',
        data: data.values,
        backgroundColor: type === 'line' ? `${color}20` : color,
        borderColor: color,
        borderWidth: 2,
        fill: type === 'line',
        tension: 0.4,
        pointBackgroundColor: color,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
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
        callbacks: {
          label: function(context: any) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            if (context.parsed.y !== null) {
              label += '$' + context.parsed.y.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }
            return label
          }
        }
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
          callback: function(value: any) {
            return '$' + value.toLocaleString()
          }
        },
      },
    },
  }

  return (
    <div className="w-full h-[300px]">
      {type === 'line' ? (
        <Line data={chartData} options={options} />
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  )
}
