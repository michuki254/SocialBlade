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
import type { FormattedVideoData } from '@/types/youtube'
import { calculateEngagementRate, calculateLikeRate, calculateCommentRate } from '@/lib/engagement-metrics'

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

interface EngagementChartProps {
  videos: FormattedVideoData[]
  type?: 'bar' | 'doughnut' | 'line'
}

export const EngagementChart: React.FC<EngagementChartProps> = ({ videos, type = 'bar' }) => {
  if (videos.length === 0) return null

  const video = videos[0] // For single video analysis

  // Engagement breakdown data (single video)
  const engagementData = {
    labels: ['Likes', 'Comments', 'Views'],
    datasets: [
      {
        label: 'Engagement Metrics',
        data: [video.likes, video.comments, video.views],
        backgroundColor: ['#FF5A5F', '#FC642D', '#00A699'],
        borderColor: ['#E54A4F', '#DC541D', '#008679'],
        borderWidth: 1,
      },
    ],
  }

  // Engagement rate comparison (multiple videos)
  const comparisonData = {
    labels: videos.map((v, i) => v.title.length > 20 ? `Video ${i + 1}` : v.title),
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: videos.map(v => calculateEngagementRate(v)),
        backgroundColor: '#FF5A5F',
        borderColor: '#E54A4F',
        borderWidth: 1,
      },
      {
        label: 'Like Rate (%)',
        data: videos.map(v => calculateLikeRate(v)),
        backgroundColor: '#00A699',
        borderColor: '#008679',
        borderWidth: 1,
      },
      {
        label: 'Comment Rate (%)',
        data: videos.map(v => calculateCommentRate(v)),
        backgroundColor: '#FC642D',
        borderColor: '#DC541D',
        borderWidth: 1,
      },
    ],
  }

  // Doughnut data for engagement distribution (single video)
  const doughnutData = {
    labels: ['Likes', 'Comments'],
    datasets: [
      {
        label: 'Engagement Distribution',
        data: [video.likes, video.comments],
        backgroundColor: ['#FF5A5F', '#FC642D'],
        borderColor: ['#FFFFFF', '#FFFFFF'],
        borderWidth: 2,
      },
    ],
  }

  const barOptions = {
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

  const doughnutOptions = {
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

  const lineOptions = {
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

  return (
    <div className="w-full h-[400px]">
      {type === 'bar' && videos.length > 1 && (
        <Bar data={comparisonData} options={barOptions} />
      )}
      {type === 'bar' && videos.length === 1 && (
        <Bar data={engagementData} options={barOptions} />
      )}
      {type === 'doughnut' && (
        <Doughnut data={doughnutData} options={doughnutOptions} />
      )}
      {type === 'line' && (
        <Line data={comparisonData} options={lineOptions} />
      )}
    </div>
  )
}
