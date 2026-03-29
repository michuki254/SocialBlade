'use client'

import { useState, useEffect } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { Button, Input, Card, VideoCard } from '@/components'
import { getChannelById, getChannelByUsername, getChannelVideos, getVideoComments } from '@/services/youtube'
import { extractChannelId, formatNumber, getRelativeTime } from '@/lib/youtube-utils'
import {
  analyzeRecentPerformance,
  calculateViewVelocity,
  groupVideosByTimePeriod,
  detectTrendingPatterns,
  generateRealtimeSummary,
  getTimeSinceLastActivity,
} from '@/lib/realtime-analyzer'
import { detectSpike, detectTrend, compareToBaseline, generateAlerts } from '@/lib/spike-detector'
import type { FormattedChannelData, FormattedVideoData, FormattedCommentData } from '@/types/youtube'
import Image from 'next/image'

export default function RealtimeAnalyticsPage() {
  const { data: session } = useSession()
  const [channelInput, setChannelInput] = useState('')
  const [channel, setChannel] = useState<FormattedChannelData | null>(null)
  const [videos, setVideos] = useState<FormattedVideoData[]>([])
  const [comments, setComments] = useState<FormattedCommentData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [countdown, setCountdown] = useState(60)

  // Analytics API data (requires OAuth)
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [trafficSources, setTrafficSources] = useState<any>(null)
  const [geographyData, setGeographyData] = useState<any>(null)
  const [liveViewers, setLiveViewers] = useState<Record<string, number>>({})

  // Spike detection
  const [viewHistory, setViewHistory] = useState<Array<{ timestamp: Date; value: number }>>([])
  const [spikeDetection, setSpikeDetection] = useState<any>(null)
  const [alerts, setAlerts] = useState<any[]>([])

  const fetchChannelData = async (skipInput: boolean = false) => {
    if (!skipInput && !channelInput.trim()) {
      setError('Please enter a channel URL, ID, or username')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let channelData: FormattedChannelData | null = null

      if (!skipInput) {
        const channelId = extractChannelId(channelInput)

        if (channelId) {
          if (channelId.startsWith('@')) {
            channelData = await getChannelByUsername(channelId)
          } else {
            channelData = await getChannelById(channelId)
          }
        } else {
          channelData = await getChannelByUsername(channelInput)
        }

        if (!channelData) {
          setError('Channel not found')
          setLoading(false)
          return
        }

        setChannel(channelData)
      } else if (channel) {
        channelData = await getChannelById(channel.id)
        if (channelData) setChannel(channelData)
      }

      if (channelData) {
        // Fetch recent videos
        let channelVideos: FormattedVideoData[] = []

        // If authenticated, try to fetch user's own videos via Analytics API
        if (session?.accessToken) {
          try {
            const response = await fetch('/api/analytics/my-videos?maxResults=20')
            if (response.ok) {
              const myVideosData = await response.json()
              // Convert to FormattedVideoData format
              channelVideos = myVideosData.map((item: any) => ({
                id: item.id,
                title: item.snippet?.title || '',
                thumbnail: item.snippet?.thumbnails?.high?.url || '',
                publishedAt: item.snippet?.publishedAt || '',
                duration: item.contentDetails?.duration || '',
                views: parseInt(item.statistics?.viewCount || '0'),
                likes: parseInt(item.statistics?.likeCount || '0'),
                comments: parseInt(item.statistics?.commentCount || '0'),
                channelId: item.snippet?.channelId || '',
                channelTitle: item.snippet?.channelTitle || '',
              }))
            } else {
              channelVideos = await getChannelVideos(channelData.id, 20)
            }
          } catch (err) {
            console.log('Could not fetch own videos, using public API:', err)
            channelVideos = await getChannelVideos(channelData.id, 20)
          }
        } else {
          channelVideos = await getChannelVideos(channelData.id, 20)
        }

        setVideos(channelVideos)

        // Fetch comments from most recent video
        if (channelVideos.length > 0) {
          const latestComments = await getVideoComments(channelVideos[0].id, 50)
          setComments(latestComments)

          // Check for live concurrent viewers
          if (session?.accessToken) {
            try {
              const response = await fetch(`/api/analytics/live-viewers?videoId=${channelVideos[0].id}`)
              if (response.ok) {
                const liveData = await response.json()
                if (liveData && liveData.concurrentViewers > 0) {
                  setLiveViewers(prev => ({
                    ...prev,
                    [channelVideos[0].id]: liveData.concurrentViewers
                  }))
                }
              }
            } catch (err) {
              console.log('Not a live stream or error fetching live viewers')
            }
          }
        }

        // Fetch Analytics API data if authenticated
        if (session?.accessToken) {
          try {
            const [metricsRes, trafficRes, geoRes] = await Promise.all([
              fetch('/api/analytics/realtime').catch(() => null),
              fetch('/api/analytics/traffic').catch(() => null),
              fetch('/api/analytics/geography').catch(() => null),
            ])

            const metrics = metricsRes && metricsRes.ok ? await metricsRes.json() : null
            const traffic = trafficRes && trafficRes.ok ? await trafficRes.json() : null
            const geography = geoRes && geoRes.ok ? await geoRes.json() : null

            setAnalyticsData(metrics)
            setTrafficSources(traffic)
            setGeographyData(geography)
          } catch (err) {
            console.log('Analytics API not available or not authorized:', err)
          }
        }

        // Update view history for spike detection
        if (channelData) {
          setViewHistory(prev => {
            const newHistory = [
              ...prev,
              { timestamp: new Date(), value: channelData.totalViews }
            ]
            // Keep only last 50 data points
            return newHistory.slice(-50)
          })
        }

        setLastUpdate(new Date())
        setCountdown(60)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch channel data')
    } finally {
      setLoading(false)
    }
  }

  // Spike detection analysis
  useEffect(() => {
    if (viewHistory.length >= 5) {
      const spike = detectSpike(viewHistory)
      setSpikeDetection(spike)

      if (spike.isSpike) {
        const newAlerts = generateAlerts(spike)
        setAlerts(prevAlerts => {
          // Add new alerts and remove duplicates
          const combined = [...newAlerts, ...prevAlerts]
          return combined.slice(0, 5) // Keep only last 5 alerts
        })
      }
    }
  }, [viewHistory])

  const handleAnalyze = () => {
    fetchChannelData(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  // Auto-refresh functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (autoRefresh && channel) {
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            fetchChannelData(true)
            return 60
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh, channel])

  // Analytics
  const recentPerformance = videos.length > 0 ? analyzeRecentPerformance(videos) : null
  const grouped = videos.length > 0 ? groupVideosByTimePeriod(videos) : null
  const trending = videos.length > 0 ? detectTrendingPatterns(videos) : null
  const summary = channel && videos.length > 0 ? generateRealtimeSummary(channel, videos, comments) : null
  const lastActivity = videos.length > 0 ? getTimeSinceLastActivity(videos) : null
  const trendAnalysis = viewHistory.length >= 5 ? detectTrend(viewHistory) : null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-headline-1 font-bold">
              Real-Time Analytics
            </h1>
            <div className="flex items-center gap-4">
              {session ? (
                <div className="text-right">
                  <p className="text-small opacity-80">Signed in as</p>
                  <p className="text-small font-semibold">{session.user?.email}</p>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => signIn('google', { callbackUrl: '/realtime' })}
                  size="small"
                  suppressHydrationWarning
                >
                  Sign In for Advanced Analytics
                </Button>
              )}
              {lastUpdate && (
                <div className="text-right">
                  <p className="text-small opacity-80">Last updated</p>
                  <p className="text-body font-semibold">{getRelativeTime(lastUpdate.toISOString())}</p>
                </div>
              )}
            </div>
          </div>

          {session && (
            <div className="mb-4 p-3 bg-white/10 rounded-standard">
              <p className="text-small">
                ✓ Advanced Analytics Enabled: Real-time metrics, traffic sources, and geographic data available
              </p>
            </div>
          )}

          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Monitor channel activity, recent uploads, and trending performance in real-time.
          </p>

          {/* Search Input */}
          <div className="flex gap-4 max-w-3xl">
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
            <Button onClick={handleAnalyze} size="large" disabled={loading}>
              {loading ? 'Loading...' : 'Monitor Channel'}
            </Button>
          </div>

          {/* Auto-refresh Toggle */}
          {channel && (
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-standard font-medium transition-all ${
                  autoRefresh
                    ? 'bg-white text-rausch'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                suppressHydrationWarning
              >
                {autoRefresh ? '● Live' : 'Start Auto-Refresh'}
              </button>
              {autoRefresh && (
                <p className="text-white/80 text-small">
                  Next update in {countdown}s
                </p>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {channel && summary && (
            <div className="space-y-8">
              {/* Alerts */}
              {alerts.length > 0 && (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-standard border-l-4 ${
                        alert.level === 'success' ? 'bg-babu/10 border-babu' :
                        alert.level === 'warning' ? 'bg-arches/10 border-arches' :
                        alert.level === 'critical' ? 'bg-rausch/10 border-rausch' :
                        'bg-foggy/10 border-foggy'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-body text-hof mb-1">{alert.title}</h4>
                          <p className="text-small text-foggy mb-2">{alert.message}</p>
                          {alert.action && (
                            <p className="text-small font-medium text-hof">→ {alert.action}</p>
                          )}
                        </div>
                        <button
                          onClick={() => setAlerts(alerts.filter((_, i) => i !== index))}
                          className="text-foggy hover:text-hof transition-colors"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Spike Detection Card */}
              {spikeDetection && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Performance Analysis
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-small text-foggy mb-2">Status</p>
                        <p className={`text-body font-semibold ${
                          spikeDetection.spikeType === 'positive' ? 'text-babu' :
                          spikeDetection.spikeType === 'negative' ? 'text-rausch' :
                          'text-hof'
                        }`}>
                          {spikeDetection.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-small text-foggy mb-2">Change from Baseline</p>
                        <p className={`text-headline-3 font-bold ${
                          spikeDetection.percentageChange > 0 ? 'text-babu' : 'text-rausch'
                        }`}>
                          {spikeDetection.percentageChange > 0 ? '+' : ''}{spikeDetection.percentageChange}%
                        </p>
                      </div>
                    </div>
                    {spikeDetection.recommendation && (
                      <div className="mt-4 p-3 bg-background rounded-standard">
                        <p className="text-small text-hof">
                          <span className="font-semibold">Recommendation:</span> {spikeDetection.recommendation}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Channel Header with Live Status */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="relative w-20 h-20 rounded-full overflow-hidden bg-hof/10">
                      {channel.thumbnail && (
                        <Image
                          src={channel.thumbnail}
                          alt={channel.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-headline-2 font-bold text-hof mb-2">
                        {channel.title}
                      </h2>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-small font-medium ${
                          summary.status === 'highly-active' ? 'bg-babu/20 text-babu' :
                          summary.status === 'active' ? 'bg-arches/20 text-arches' :
                          summary.status === 'moderate' ? 'bg-foggy/20 text-foggy' :
                          'bg-hof/20 text-hof'
                        }`}>
                          <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                          {summary.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className="text-foggy text-small">
                          Activity Score: {summary.activityScore}/100
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Subscribers</p>
                      <p className="text-body font-bold text-hof">{formatNumber(channel.subscribers)}</p>
                    </div>
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Total Videos</p>
                      <p className="text-body font-bold text-hof">{formatNumber(channel.videoCount)}</p>
                    </div>
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Total Views</p>
                      <p className="text-body font-bold text-hof">{formatNumber(channel.totalViews)}</p>
                    </div>
                    <div className="p-3 bg-background rounded-standard">
                      <p className="text-caption text-foggy">Last Upload</p>
                      <p className="text-body font-bold text-hof">
                        {lastActivity ? getRelativeTime(lastActivity.lastUploadDate?.toISOString() || '') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Traffic Sources & Geography (OAuth Required) */}
              {session && (trafficSources || geographyData) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {trafficSources && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-headline-3 font-semibold text-hof mb-4">
                          Traffic Sources (48h)
                        </h3>
                        <div className="space-y-3">
                          {trafficSources.rows?.slice(0, 5).map((row: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-small text-hof">{row[0] || 'Unknown'}</span>
                              <span className="font-semibold text-small text-rausch">
                                {formatNumber(row[1])} views
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {geographyData && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-headline-3 font-semibold text-hof mb-4">
                          Top Countries (48h)
                        </h3>
                        <div className="space-y-3">
                          {geographyData.rows?.slice(0, 5).map((row: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-small text-hof">{row[0]}</span>
                              <span className="font-semibold text-small text-babu">
                                {formatNumber(row[1])} views
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Activity Summary */}
              <Card>
                <div className="p-6">
                  <h3 className="text-headline-3 font-semibold text-hof mb-4">
                    Activity Summary
                  </h3>
                  <p className="text-body text-foggy mb-4">{summary.summary}</p>
                  {summary.highlights.length > 0 && (
                    <div className="space-y-2">
                      {summary.highlights.map((highlight, i) => (
                        <div key={i} className="flex items-center gap-2 text-small text-hof">
                          <svg className="w-5 h-5 text-babu" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {highlight}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Trending Analysis */}
              {trending && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-headline-3 font-semibold text-hof">
                        Trending Status
                      </h3>
                      <div className={`px-4 py-2 rounded-standard font-semibold ${
                        trending.isTrending ? 'bg-babu/20 text-babu' : 'bg-foggy/20 text-foggy'
                      }`}>
                        {trending.isTrending ? '🔥 TRENDING' : 'Stable'}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-small mb-1">
                        <span className="text-foggy">Trend Score</span>
                        <span className="text-hof font-semibold">{trending.trendScore}/100</span>
                      </div>
                      <div className="w-full bg-hof/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${trending.isTrending ? 'bg-babu' : 'bg-foggy'}`}
                          style={{ width: `${trending.trendScore}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-body text-hof mb-4">{trending.reason}</p>

                    {trending.recommendations.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-semibold text-small text-hof">Recommendations:</p>
                        {trending.recommendations.map((rec, i) => (
                          <div key={i} className="flex items-start gap-2 text-small text-foggy">
                            <span className="text-babu">•</span>
                            {rec}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Time Period Performance */}
              {grouped && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Last 24 Hours</p>
                      <p className="text-headline-2 font-bold text-rausch mb-1">
                        {grouped.last24h.length}
                      </p>
                      <p className="text-caption text-foggy">videos uploaded</p>
                      {grouped.last24h.length > 0 && (
                        <p className="text-caption text-babu mt-2">
                          {formatNumber(grouped.last24h.reduce((sum, v) => sum + v.views, 0))} views
                        </p>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Last 7 Days</p>
                      <p className="text-headline-2 font-bold text-babu mb-1">
                        {grouped.last7d.length + grouped.last24h.length}
                      </p>
                      <p className="text-caption text-foggy">videos uploaded</p>
                      {(grouped.last7d.length + grouped.last24h.length) > 0 && (
                        <p className="text-caption text-babu mt-2">
                          {formatNumber([...grouped.last7d, ...grouped.last24h].reduce((sum, v) => sum + v.views, 0))} views
                        </p>
                      )}
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Last 30 Days</p>
                      <p className="text-headline-2 font-bold text-arches mb-1">
                        {grouped.last30d.length + grouped.last7d.length + grouped.last24h.length}
                      </p>
                      <p className="text-caption text-foggy">videos uploaded</p>
                      {(grouped.last30d.length + grouped.last7d.length + grouped.last24h.length) > 0 && (
                        <p className="text-caption text-babu mt-2">
                          {formatNumber([...grouped.last30d, ...grouped.last7d, ...grouped.last24h].reduce((sum, v) => sum + v.views, 0))} views
                        </p>
                      )}
                    </div>
                  </Card>
                </div>
              )}

              {/* Recent Uploads */}
              {recentPerformance && recentPerformance.recentVideos.length > 0 && (
                <div>
                  <h2 className="text-headline-2 font-semibold text-hof mb-6">
                    Recent Uploads (Last 24h)
                  </h2>
                  <div className="space-y-4">
                    {recentPerformance.recentVideos.map((video) => {
                      const velocity = calculateViewVelocity(video)
                      const isLive = liveViewers[video.id] > 0

                      return (
                        <Card key={video.id}>
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              <div className="relative aspect-video bg-hof/10 rounded-standard overflow-hidden">
                                {video.thumbnail && (
                                  <Image
                                    src={video.thumbnail}
                                    alt={video.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                  />
                                )}
                                {isLive && (
                                  <div className="absolute top-2 right-2 bg-rausch text-white px-2 py-1 rounded text-caption font-bold">
                                    LIVE
                                  </div>
                                )}
                              </div>

                              <div className="md:col-span-2">
                                <h3 className="font-semibold text-body text-hof mb-2 line-clamp-2">
                                  {video.title}
                                </h3>
                                <p className="text-small text-foggy mb-3">
                                  Published {getRelativeTime(video.publishedAt)} • {velocity.hoursLive} hours live
                                </p>

                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <p className="text-caption text-foggy">Views</p>
                                    <p className="font-semibold text-small text-rausch">
                                      {formatNumber(video.views)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-caption text-foggy">Likes</p>
                                    <p className="font-semibold text-small text-babu">
                                      {formatNumber(video.likes)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-caption text-foggy">Comments</p>
                                    <p className="font-semibold text-small text-arches">
                                      {formatNumber(video.comments)}
                                    </p>
                                  </div>
                                </div>

                                {isLive && (
                                  <div className="mt-3 p-2 bg-rausch/10 rounded-standard">
                                    <p className="text-small font-semibold text-rausch">
                                      👥 {formatNumber(liveViewers[video.id])} watching now
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-3">
                                <div className="p-3 bg-background rounded-standard">
                                  <p className="text-caption text-foggy">Views/Hour</p>
                                  <p className="text-body font-bold text-rausch">
                                    {formatNumber(velocity.viewsPerHour)}
                                  </p>
                                </div>
                                <div className="p-3 bg-background rounded-standard">
                                  <p className="text-caption text-foggy">24h Projection</p>
                                  <p className="text-body font-bold text-babu">
                                    {formatNumber(velocity.projectedViews24h)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Latest Comments */}
              {comments.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Latest Comments ({comments.length})
                    </h3>
                    <div className="space-y-4">
                      {comments.slice(0, 10).map((comment) => (
                        <div key={comment.id} className="p-4 bg-background rounded-standard">
                          <div className="flex items-start gap-3">
                            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-hof/10 flex-shrink-0">
                              {comment.authorImage && (
                                <Image
                                  src={comment.authorImage}
                                  alt={comment.author}
                                  fill
                                  className="object-cover"
                                  sizes="40px"
                                />
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-small text-hof">{comment.author}</p>
                                <p className="text-caption text-foggy">{getRelativeTime(comment.publishedAt)}</p>
                              </div>
                              <p className="text-small text-hof line-clamp-2">{comment.text}</p>
                              {comment.likes > 0 && (
                                <p className="text-caption text-foggy mt-1">{formatNumber(comment.likes)} likes</p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* All Recent Videos */}
              {videos.length > 0 && (
                <div>
                  <h2 className="text-headline-2 font-semibold text-hof mb-6">
                    Recent Videos ({videos.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!channel && !loading && (
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                Start Monitoring
              </h3>
              <p className="text-foggy max-w-md mx-auto mb-6">
                Enter a channel URL above to monitor real-time activity, recent uploads, and trending performance.
              </p>
              <div className="max-w-lg mx-auto bg-background-secondary p-6 rounded-medium">
                <h4 className="font-semibold text-hof mb-3">Features:</h4>
                <ul className="text-small text-foggy space-y-2 text-left">
                  <li>• Real-time channel activity monitoring</li>
                  <li>• Auto-refresh every 60 seconds</li>
                  <li>• Recent upload performance tracking</li>
                  <li>• Trending analysis and recommendations</li>
                  <li>• Spike detection with alerts</li>
                  <li>• Latest comments from recent videos</li>
                  {session && (
                    <>
                      <li className="text-babu font-semibold">• Traffic source analysis (OAuth)</li>
                      <li className="text-babu font-semibold">• Geographic performance data (OAuth)</li>
                      <li className="text-babu font-semibold">• Live concurrent viewers (OAuth)</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
