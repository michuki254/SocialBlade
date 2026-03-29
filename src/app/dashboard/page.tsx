'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Card } from '@/components'
import { GenericChart } from '@/components/GenericChart'
import { HeatMap } from '@/components/HeatMap'
import { Timeline } from '@/components/Timeline'
import { getChannelById, getChannelByUsername, getChannelVideos } from '@/services/youtube'
import { extractChannelId, formatNumber } from '@/lib/youtube-utils'
import { calculateTrendLine, generateForecast, calculateMovingAverage } from '@/lib/forecasting'
import { getTrackedChannels } from '@/lib/storage'
import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'
import Image from 'next/image'

type WidgetType = 'stats' | 'chart' | 'timeline' | 'heatmap' | 'forecast' | 'comparison'

interface Widget {
  id: string
  type: WidgetType
  title: string
  size: 'small' | 'medium' | 'large'
}

export default function DashboardPage() {
  const [channelInput, setChannelInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<FormattedChannelData | null>(null)
  const [videos, setVideos] = useState<FormattedVideoData[]>([])
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: '1', type: 'stats', title: 'Channel Overview', size: 'medium' },
    { id: '2', type: 'chart', title: 'Growth Trend', size: 'large' },
  ])
  const [trackedChannels, setTrackedChannels] = useState<ReturnType<typeof getTrackedChannels>>([])

  useEffect(() => {
    setTrackedChannels(getTrackedChannels())
  }, [])

  const handleLoadChannel = async () => {
    if (!channelInput.trim()) {
      setError('Please enter a channel URL, ID, or username')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let channel: FormattedChannelData | null = null
      const channelId = extractChannelId(channelInput)

      if (channelId) {
        if (channelId.startsWith('@')) {
          channel = await getChannelByUsername(channelId)
        } else {
          channel = await getChannelById(channelId)
        }
      } else {
        channel = await getChannelByUsername(channelInput)
      }

      if (!channel) {
        setError('Channel not found')
        return
      }

      setSelectedChannel(channel)

      // Fetch videos
      const channelVideos = await getChannelVideos(channel.id, 20)
      setVideos(channelVideos)

      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load channel')
    } finally {
      setLoading(false)
    }
  }

  const addWidget = (type: WidgetType) => {
    const newWidget: Widget = {
      id: Date.now().toString(),
      type,
      title: getWidgetTitle(type),
      size: type === 'stats' ? 'small' : type === 'heatmap' || type === 'timeline' ? 'large' : 'medium'
    }
    setWidgets([...widgets, newWidget])
  }

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id))
  }

  const getWidgetTitle = (type: WidgetType): string => {
    switch (type) {
      case 'stats': return 'Quick Stats'
      case 'chart': return 'Performance Chart'
      case 'timeline': return 'Event Timeline'
      case 'heatmap': return 'Activity Heat Map'
      case 'forecast': return 'Growth Forecast'
      case 'comparison': return 'Video Comparison'
      default: return 'Widget'
    }
  }

  const renderWidget = (widget: Widget) => {
    if (!selectedChannel) return null

    switch (widget.type) {
      case 'stats':
        return (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-background rounded-standard">
              <p className="text-caption text-foggy">Subscribers</p>
              <p className="text-headline-3 font-bold text-rausch">
                {formatNumber(selectedChannel.subscribers)}
              </p>
            </div>
            <div className="p-3 bg-background rounded-standard">
              <p className="text-caption text-foggy">Total Views</p>
              <p className="text-headline-3 font-bold text-babu">
                {formatNumber(selectedChannel.totalViews)}
              </p>
            </div>
            <div className="p-3 bg-background rounded-standard">
              <p className="text-caption text-foggy">Videos</p>
              <p className="text-headline-3 font-bold text-arches">
                {formatNumber(selectedChannel.videoCount)}
              </p>
            </div>
            <div className="p-3 bg-background rounded-standard">
              <p className="text-caption text-foggy">Avg Views/Video</p>
              <p className="text-headline-3 font-bold text-hof">
                {formatNumber(Math.floor(selectedChannel.totalViews / selectedChannel.videoCount))}
              </p>
            </div>
          </div>
        )

      case 'chart':
        if (videos.length === 0) return <p className="text-foggy text-small">No video data available</p>

        return (
          <GenericChart
            data={{
              labels: videos.slice(0, 10).reverse().map((v, i) => `Video ${i + 1}`),
              datasets: [{
                label: 'Views',
                data: videos.slice(0, 10).reverse().map(v => v.views),
                borderColor: '#FF5A5F',
                backgroundColor: 'rgba(255, 90, 95, 0.1)',
                fill: true,
              }]
            }}
            type="line"
          />
        )

      case 'forecast':
        if (videos.length < 5) return <p className="text-foggy text-small">Need more video data for forecasting</p>

        const forecastData = videos.slice(0, 10).reverse().map((v, i) => ({
          x: i,
          y: v.views
        }))

        const forecast = generateForecast(forecastData, 5)

        return (
          <div className="space-y-4">
            <GenericChart
              data={{
                labels: [
                  ...forecastData.map((_, i) => `Video ${i + 1}`),
                  ...forecast.predictions.map((_, i) => `+${i + 1}`)
                ],
                datasets: [
                  {
                    label: 'Actual Views',
                    data: forecastData.map(d => d.y),
                    borderColor: '#FF5A5F',
                    backgroundColor: 'rgba(255, 90, 95, 0.1)',
                  },
                  {
                    label: 'Predicted Views',
                    data: [
                      ...Array(forecastData.length - 1).fill(null),
                      forecastData[forecastData.length - 1].y,
                      ...forecast.predictions.map(p => p.y)
                    ],
                    borderColor: '#00A699',
                    backgroundColor: 'rgba(0, 166, 153, 0.1)',
                    borderDash: [5, 5],
                  }
                ]
              }}
              type="line"
            />
            <div className="flex items-center gap-2 text-small">
              <span className={`px-2 py-1 rounded text-caption font-semibold ${
                forecast.confidence === 'high' ? 'bg-babu/20 text-babu' :
                forecast.confidence === 'medium' ? 'bg-arches/20 text-arches' :
                'bg-foggy/20 text-foggy'
              }`}>
                {forecast.confidence.toUpperCase()} CONFIDENCE
              </span>
              <span className="text-foggy">
                R² = {forecast.trendLine.r2}
              </span>
            </div>
          </div>
        )

      case 'timeline':
        const timelineEvents = videos.slice(0, 5).map((video, index) => ({
          date: video.publishedAt,
          title: video.title.substring(0, 50) + (video.title.length > 50 ? '...' : ''),
          value: video.views,
          type: index === 0 ? 'milestone' as const : video.views > 100000 ? 'growth' as const : 'event' as const,
          description: `${formatNumber(video.likes)} likes • ${formatNumber(video.comments)} comments`
        }))

        return <Timeline events={timelineEvents} />

      case 'heatmap':
        // Generate sample heat map data (in real app, this would be actual analytics data)
        const heatmapData = []
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for (let day of days) {
          for (let hour = 0; hour < 24; hour++) {
            heatmapData.push({
              day,
              hour,
              value: Math.floor(Math.random() * 1000)
            })
          }
        }

        return <HeatMap data={heatmapData} />

      case 'comparison':
        if (videos.length < 2) return <p className="text-foggy text-small">Need at least 2 videos</p>

        return (
          <GenericChart
            data={{
              labels: videos.slice(0, 5).map(v => v.title.substring(0, 20) + '...'),
              datasets: [
                {
                  label: 'Views',
                  data: videos.slice(0, 5).map(v => v.views),
                  backgroundColor: '#FF5A5F',
                },
                {
                  label: 'Likes',
                  data: videos.slice(0, 5).map(v => v.likes),
                  backgroundColor: '#00A699',
                },
                {
                  label: 'Comments',
                  data: videos.slice(0, 5).map(v => v.comments),
                  backgroundColor: '#FC642D',
                }
              ]
            }}
            type="bar"
          />
        )

      default:
        return null
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoadChannel()
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Custom Dashboard
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Build your own analytics dashboard with interactive charts, forecasts, and visualizations.
          </p>

          {/* Channel Input */}
          <div className="max-w-3xl">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter channel URL, ID, or @username..."
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white"
                  disabled={loading}
                />
              </div>
              <Button onClick={handleLoadChannel} size="large" disabled={loading}>
                {loading ? 'Loading...' : 'Load Channel'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {selectedChannel ? (
            <div className="space-y-8">
              {/* Channel Header */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-hof/10">
                      {selectedChannel.thumbnail && (
                        <Image
                          src={selectedChannel.thumbnail}
                          alt={selectedChannel.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-bold text-headline-2 text-hof">
                        {selectedChannel.title}
                      </h2>
                      <p className="text-small text-foggy">
                        {formatNumber(selectedChannel.subscribers)} subscribers
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Widget Toolbar */}
              <Card>
                <div className="p-6">
                  <h3 className="font-semibold text-body text-hof mb-4">
                    Add Widgets
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => addWidget('stats')}
                      size="small"
                      suppressHydrationWarning
                    >
                      + Quick Stats
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => addWidget('chart')}
                      size="small"
                      suppressHydrationWarning
                    >
                      + Performance Chart
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => addWidget('forecast')}
                      size="small"
                      suppressHydrationWarning
                    >
                      + Growth Forecast
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => addWidget('timeline')}
                      size="small"
                      suppressHydrationWarning
                    >
                      + Event Timeline
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => addWidget('heatmap')}
                      size="small"
                      suppressHydrationWarning
                    >
                      + Activity Heat Map
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => addWidget('comparison')}
                      size="small"
                      suppressHydrationWarning
                    >
                      + Video Comparison
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Dashboard Widgets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {widgets.map(widget => (
                  <div
                    key={widget.id}
                    className={
                      widget.size === 'large' ? 'md:col-span-2 lg:col-span-3' :
                      widget.size === 'medium' ? 'md:col-span-1 lg:col-span-2' :
                      'md:col-span-1'
                    }
                  >
                    <Card>
                      <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-body text-hof">
                            {widget.title}
                          </h3>
                          <button
                            onClick={() => removeWidget(widget.id)}
                            className="text-foggy hover:text-rausch transition-colors"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                        {renderWidget(widget)}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-24 h-24 mx-auto text-foggy/30 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                />
              </svg>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                Build Your Dashboard
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Load a channel above to start building your custom analytics dashboard with interactive widgets.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
