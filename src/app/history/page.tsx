'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Card } from '@/components'
import { getChannelById, getChannelByUsername } from '@/services/youtube'
import { extractChannelId, formatNumber } from '@/lib/youtube-utils'
import {
  createChannelSnapshot,
  generateHistoricalComparison,
  calculateIndustryBenchmarks,
  compareToIndustryBenchmark,
} from '@/lib/historical-tracker'
import {
  saveChannelSnapshot,
  getTrackedChannels,
  getChannelSnapshotsById,
  getChannelSnapshots,
  deleteChannelSnapshots,
} from '@/lib/storage'
import {
  checkMilestones,
  checkPerformanceDrop,
  addAlert,
  getAlertConfig,
} from '@/lib/alerts'
import { useNotifications } from '@/components/NotificationCenter'
import { GenericChart } from '@/components/GenericChart'
import type { FormattedChannelData } from '@/types/youtube'
import Image from 'next/image'

export default function HistoryPage() {
  const [channelInput, setChannelInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trackedChannels, setTrackedChannels] = useState<ReturnType<typeof getTrackedChannels>>([])
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null)
  const [historicalData, setHistoricalData] = useState<ReturnType<typeof generateHistoricalComparison> | null>(null)
  const [benchmarks, setBenchmarks] = useState<ReturnType<typeof calculateIndustryBenchmarks> | null>(null)
  const [comparison, setComparison] = useState<ReturnType<typeof compareToIndustryBenchmark> | null>(null)
  const { showNotification, refreshNotifications } = useNotifications()

  useEffect(() => {
    loadTrackedChannels()
    calculateBenchmarks()
  }, [])

  const loadTrackedChannels = () => {
    const channels = getTrackedChannels()
    setTrackedChannels(channels)
  }

  const calculateBenchmarks = () => {
    const snapshots = getChannelSnapshots()
    const benchmarkData = calculateIndustryBenchmarks(snapshots)
    setBenchmarks(benchmarkData)
  }

  const handleTrackChannel = async () => {
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

      // Get previous snapshots
      const previousSnapshots = getChannelSnapshotsById(channel.id)
      const previousSnapshot = previousSnapshots.length > 0
        ? previousSnapshots[previousSnapshots.length - 1]
        : null

      // Create and save snapshot
      const snapshot = createChannelSnapshot(channel)
      saveChannelSnapshot(snapshot)

      // Check for alerts
      const config = getAlertConfig()

      if (previousSnapshot && config.milestoneAlerts) {
        // Check milestones
        const milestones = checkMilestones(channel, previousSnapshot.data as any, config)
        for (const milestone of milestones) {
          const alert = addAlert({
            type: 'milestone',
            severity: 'success',
            title: `Milestone Achieved: ${milestone.milestone.toLocaleString()} ${milestone.metric}!`,
            message: `${channel.title} just reached ${milestone.milestone.toLocaleString()} ${milestone.metric}!`,
            channelId: channel.id,
            channelName: channel.title,
            metric: milestone.metric,
            value: milestone.currentValue,
            previousValue: milestone.previousValue
          })
          showNotification(alert)
        }
      }

      if (previousSnapshot && config.performanceAlerts) {
        // Check performance drops
        const drop = checkPerformanceDrop(channel, previousSnapshot.data, config.performanceThreshold)
        if (drop) {
          const alert = addAlert({
            type: 'performance_drop',
            severity: drop.severity,
            title: `Performance Drop Alert: ${channel.title}`,
            message: `${drop.metric} dropped by ${drop.dropPercentage.toFixed(1)}% since last check`,
            channelId: channel.id,
            channelName: channel.title,
            metric: drop.metric,
            value: channel.subscribers,
            previousValue: previousSnapshot.data.subscribers
          })
          showNotification(alert)
        }
      }

      // Reload tracked channels and refresh notifications
      loadTrackedChannels()
      calculateBenchmarks()
      refreshNotifications()

      setChannelInput('')
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to track channel')
    } finally {
      setLoading(false)
    }
  }

  const handleViewHistory = async (channelId: string) => {
    setLoading(true)
    try {
      const snapshots = getChannelSnapshotsById(channelId)
      if (snapshots.length === 0) {
        setError('No historical data found for this channel')
        return
      }

      // Fetch current channel data
      const channel = await getChannelById(channelId)
      if (!channel) {
        setError('Could not fetch current channel data')
        return
      }

      const historical = generateHistoricalComparison(channel, snapshots)
      setHistoricalData(historical)
      setSelectedChannel(channelId)

      // Calculate comparison to benchmarks
      if (benchmarks) {
        const comp = compareToIndustryBenchmark(channel, benchmarks)
        setComparison(comp)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load historical data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChannel = (channelId: string) => {
    if (confirm('Are you sure you want to delete all snapshots for this channel?')) {
      deleteChannelSnapshots(channelId)
      loadTrackedChannels()
      calculateBenchmarks()
      if (selectedChannel === channelId) {
        setSelectedChannel(null)
        setHistoricalData(null)
        setComparison(null)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTrackChannel()
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Historical Tracking
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Track channel growth over time and compare performance against industry benchmarks.
          </p>

          {/* Add Channel */}
          <div className="max-w-3xl">
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Enter channel URL, ID, or @username to track..."
                  value={channelInput}
                  onChange={(e) => setChannelInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white"
                  disabled={loading}
                />
              </div>
              <Button onClick={handleTrackChannel} size="large" disabled={loading}>
                {loading ? 'Loading...' : 'Take Snapshot'}
              </Button>
            </div>
            <p className="mt-3 text-small opacity-80">
              Track channels to build historical data. Take snapshots over time to see growth trends.
            </p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tracked Channels Sidebar */}
            <div className="lg:col-span-1">
              <Card>
                <div className="p-6">
                  <h2 className="text-headline-3 font-semibold text-hof mb-4">
                    Tracked Channels ({trackedChannels.length})
                  </h2>

                  {trackedChannels.length === 0 ? (
                    <p className="text-foggy text-small">
                      No channels tracked yet. Add a channel above to start tracking historical data.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {trackedChannels.map((channel) => (
                        <div
                          key={channel.id}
                          className={`p-3 rounded-standard border-2 transition-all cursor-pointer ${
                            selectedChannel === channel.id
                              ? 'border-rausch bg-rausch/5'
                              : 'border-transparent bg-background hover:border-hof/20'
                          }`}
                          onClick={() => handleViewHistory(channel.id)}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-small text-hof line-clamp-1">
                              {channel.title}
                            </p>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteChannel(channel.id)
                              }}
                              className="text-foggy hover:text-rausch transition-colors"
                            >
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-caption text-foggy">
                            {channel.snapshotCount} snapshot{channel.snapshotCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Industry Benchmarks */}
              {benchmarks && (
                <Card className="mt-6">
                  <div className="p-6">
                    <h2 className="text-headline-3 font-semibold text-hof mb-4">
                      Industry Benchmarks
                    </h2>
                    <div className="space-y-3">
                      <div>
                        <p className="text-caption text-foggy">Avg Subscribers</p>
                        <p className="font-semibold text-body text-rausch">
                          {formatNumber(benchmarks.avgSubscribers)}
                        </p>
                      </div>
                      <div>
                        <p className="text-caption text-foggy">Avg Total Views</p>
                        <p className="font-semibold text-body text-babu">
                          {formatNumber(benchmarks.avgTotalViews)}
                        </p>
                      </div>
                      <div>
                        <p className="text-caption text-foggy">Avg Videos</p>
                        <p className="font-semibold text-body text-arches">
                          {formatNumber(benchmarks.avgVideoCount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-caption text-foggy">Median Subscribers</p>
                        <p className="font-semibold text-body text-hof">
                          {formatNumber(benchmarks.medianSubscribers)}
                        </p>
                      </div>
                      <div className="pt-3 border-t border-hof/10">
                        <p className="text-caption text-foggy mb-2">Channel Categories</p>
                        <div className="space-y-1 text-small">
                          <div className="flex justify-between">
                            <span className="text-foggy">Micro (&lt;10K)</span>
                            <span className="text-hof font-semibold">{benchmarks.categories.micro.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foggy">Small (10K-100K)</span>
                            <span className="text-hof font-semibold">{benchmarks.categories.small.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foggy">Medium (100K-1M)</span>
                            <span className="text-hof font-semibold">{benchmarks.categories.medium.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foggy">Large (1M-10M)</span>
                            <span className="text-hof font-semibold">{benchmarks.categories.large.count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foggy">Mega (10M+)</span>
                            <span className="text-hof font-semibold">{benchmarks.categories.mega.count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Historical Data Display */}
            <div className="lg:col-span-2">
              {historicalData && comparison ? (
                <div className="space-y-6">
                  {/* Channel Header */}
                  <Card>
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-hof/10">
                          {historicalData.channel.thumbnail && (
                            <Image
                              src={historicalData.channel.thumbnail}
                              alt={historicalData.channel.title}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h2 className="text-headline-2 font-bold text-hof mb-1">
                            {historicalData.channel.title}
                          </h2>
                          <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-caption font-semibold ${
                              comparison.category === 'mega' ? 'bg-rausch/20 text-rausch' :
                              comparison.category === 'large' ? 'bg-babu/20 text-babu' :
                              comparison.category === 'medium' ? 'bg-arches/20 text-arches' :
                              comparison.category === 'small' ? 'bg-foggy/20 text-foggy' :
                              'bg-hof/20 text-hof'
                            }`}>
                              {comparison.category.toUpperCase()} CHANNEL
                            </span>
                            <span className="text-small text-foggy">
                              {historicalData.snapshots.length} snapshots
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 bg-background rounded-standard">
                          <p className="text-caption text-foggy">Current Subscribers</p>
                          <p className="text-body font-bold text-rausch">
                            {formatNumber(historicalData.channel.subscribers)}
                          </p>
                        </div>
                        <div className="p-3 bg-background rounded-standard">
                          <p className="text-caption text-foggy">Total Views</p>
                          <p className="text-body font-bold text-babu">
                            {formatNumber(historicalData.channel.totalViews)}
                          </p>
                        </div>
                        <div className="p-3 bg-background rounded-standard">
                          <p className="text-caption text-foggy">Videos</p>
                          <p className="text-body font-bold text-arches">
                            {formatNumber(historicalData.channel.videoCount)}
                          </p>
                        </div>
                        <div className="p-3 bg-background rounded-standard">
                          <p className="text-caption text-foggy">Tracking Period</p>
                          <p className="text-body font-bold text-hof">
                            {historicalData.trends.period}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Growth Statistics */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-headline-3 font-semibold text-hof mb-4">
                        Growth Statistics
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-small text-foggy mb-2">Subscriber Growth</p>
                          <p className={`text-headline-2 font-bold mb-1 ${
                            historicalData.growth.subscribers.total >= 0 ? 'text-babu' : 'text-rausch'
                          }`}>
                            {historicalData.growth.subscribers.total >= 0 ? '+' : ''}
                            {formatNumber(historicalData.growth.subscribers.total)}
                          </p>
                          <p className="text-caption text-foggy">
                            {historicalData.growth.subscribers.percentage >= 0 ? '+' : ''}
                            {historicalData.growth.subscribers.percentage}% •
                            {historicalData.growth.subscribers.perDay >= 0 ? ' +' : ' '}
                            {formatNumber(historicalData.growth.subscribers.perDay)}/day
                          </p>
                        </div>

                        <div>
                          <p className="text-small text-foggy mb-2">View Growth</p>
                          <p className={`text-headline-2 font-bold mb-1 ${
                            historicalData.growth.views.total >= 0 ? 'text-babu' : 'text-rausch'
                          }`}>
                            {historicalData.growth.views.total >= 0 ? '+' : ''}
                            {formatNumber(historicalData.growth.views.total)}
                          </p>
                          <p className="text-caption text-foggy">
                            {historicalData.growth.views.percentage >= 0 ? '+' : ''}
                            {historicalData.growth.views.percentage}% •
                            {historicalData.growth.views.perDay >= 0 ? ' +' : ' '}
                            {formatNumber(historicalData.growth.views.perDay)}/day
                          </p>
                        </div>

                        <div>
                          <p className="text-small text-foggy mb-2">Video Growth</p>
                          <p className={`text-headline-2 font-bold mb-1 ${
                            historicalData.growth.videos.total >= 0 ? 'text-babu' : 'text-rausch'
                          }`}>
                            {historicalData.growth.videos.total >= 0 ? '+' : ''}
                            {historicalData.growth.videos.total}
                          </p>
                          <p className="text-caption text-foggy">
                            {historicalData.growth.videos.perDay >= 0 ? '+' : ''}
                            {historicalData.growth.videos.perDay}/day
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Historical Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <div className="p-6">
                        <h3 className="text-headline-3 font-semibold text-hof mb-4">
                          Subscriber Growth
                        </h3>
                        <GenericChart
                          data={{
                            labels: historicalData.trends.dates,
                            datasets: [{
                              label: 'Subscribers',
                              data: historicalData.trends.subscriberGrowth,
                              borderColor: '#FF5A5F',
                              backgroundColor: 'rgba(255, 90, 95, 0.1)',
                              fill: true,
                            }]
                          }}
                          type="line"
                        />
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6">
                        <h3 className="text-headline-3 font-semibold text-hof mb-4">
                          View Growth
                        </h3>
                        <GenericChart
                          data={{
                            labels: historicalData.trends.dates,
                            datasets: [{
                              label: 'Total Views',
                              data: historicalData.trends.viewGrowth,
                              borderColor: '#00A699',
                              backgroundColor: 'rgba(0, 166, 153, 0.1)',
                              fill: true,
                            }]
                          }}
                          type="line"
                        />
                      </div>
                    </Card>
                  </div>

                  {/* Benchmark Comparison */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-headline-3 font-semibold text-hof mb-4">
                        Industry Benchmark Comparison
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-4 bg-background rounded-standard">
                          <p className="text-caption text-foggy mb-1">Subscribers</p>
                          <p className={`font-bold text-body ${
                            comparison.performance.subscribers === 'above' ? 'text-babu' :
                            comparison.performance.subscribers === 'below' ? 'text-rausch' :
                            'text-hof'
                          }`}>
                            {comparison.performance.subscribers === 'above' ? '↑ Above Average' :
                             comparison.performance.subscribers === 'below' ? '↓ Below Average' :
                             '= Average'}
                          </p>
                        </div>

                        <div className="p-4 bg-background rounded-standard">
                          <p className="text-caption text-foggy mb-1">Total Views</p>
                          <p className={`font-bold text-body ${
                            comparison.performance.views === 'above' ? 'text-babu' :
                            comparison.performance.views === 'below' ? 'text-rausch' :
                            'text-hof'
                          }`}>
                            {comparison.performance.views === 'above' ? '↑ Above Average' :
                             comparison.performance.views === 'below' ? '↓ Below Average' :
                             '= Average'}
                          </p>
                        </div>

                        <div className="p-4 bg-background rounded-standard">
                          <p className="text-caption text-foggy mb-1">Avg Views/Video</p>
                          <p className={`font-bold text-body ${
                            comparison.performance.videosPerView === 'above' ? 'text-babu' :
                            comparison.performance.videosPerView === 'below' ? 'text-rausch' :
                            'text-hof'
                          }`}>
                            {comparison.performance.videosPerView === 'above' ? '↑ Above Average' :
                             comparison.performance.videosPerView === 'below' ? '↓ Below Average' :
                             '= Average'}
                          </p>
                        </div>
                      </div>

                      {comparison.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <p className="font-semibold text-small text-hof">Recommendations:</p>
                          {comparison.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start gap-2 text-small text-foggy">
                              <span className="text-rausch">•</span>
                              {rec}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <svg
                      className="w-24 h-24 mx-auto text-foggy/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-headline-3 font-semibold text-hof mb-2">
                    No Channel Selected
                  </h3>
                  <p className="text-foggy max-w-md mx-auto">
                    Select a tracked channel from the sidebar to view historical data and growth trends.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
