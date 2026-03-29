import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'

export interface HistoricalSnapshot {
  id: string
  timestamp: Date
  channelId: string
  channelTitle: string
  data: {
    subscribers: number
    totalViews: number
    videoCount: number
    avgViews: number
  }
}

export interface VideoSnapshot {
  id: string
  timestamp: Date
  videoId: string
  videoTitle: string
  data: {
    views: number
    likes: number
    comments: number
    engagementRate: number
  }
}

export interface HistoricalComparison {
  channel: FormattedChannelData
  snapshots: HistoricalSnapshot[]
  growth: {
    subscribers: {
      total: number
      percentage: number
      perDay: number
    }
    views: {
      total: number
      percentage: number
      perDay: number
    }
    videos: {
      total: number
      perDay: number
    }
  }
  trends: {
    period: string
    subscriberGrowth: number[]
    viewGrowth: number[]
    dates: string[]
  }
}

/**
 * Create a historical snapshot for a channel
 */
export function createChannelSnapshot(channel: FormattedChannelData): HistoricalSnapshot {
  return {
    id: `${channel.id}-${Date.now()}`,
    timestamp: new Date(),
    channelId: channel.id,
    channelTitle: channel.title,
    data: {
      subscribers: channel.subscribers,
      totalViews: channel.totalViews,
      videoCount: channel.videoCount,
      avgViews: Math.floor(channel.totalViews / channel.videoCount),
    },
  }
}

/**
 * Create a historical snapshot for a video
 */
export function createVideoSnapshot(video: FormattedVideoData): VideoSnapshot {
  const engagementRate = video.views > 0
    ? ((video.likes + video.comments) / video.views) * 100
    : 0

  return {
    id: `${video.id}-${Date.now()}`,
    timestamp: new Date(),
    videoId: video.id,
    videoTitle: video.title,
    data: {
      views: video.views,
      likes: video.likes,
      comments: video.comments,
      engagementRate: parseFloat(engagementRate.toFixed(2)),
    },
  }
}

/**
 * Calculate growth between two snapshots
 */
export function calculateGrowthBetweenSnapshots(
  older: HistoricalSnapshot,
  newer: HistoricalSnapshot
): {
  subscriberGrowth: number
  subscriberGrowthPercentage: number
  viewGrowth: number
  viewGrowthPercentage: number
  videoGrowth: number
  daysElapsed: number
} {
  const daysElapsed = Math.max(
    1,
    (new Date(newer.timestamp).getTime() - new Date(older.timestamp).getTime()) / (1000 * 60 * 60 * 24)
  )

  const subscriberGrowth = newer.data.subscribers - older.data.subscribers
  const subscriberGrowthPercentage = older.data.subscribers > 0
    ? (subscriberGrowth / older.data.subscribers) * 100
    : 0

  const viewGrowth = newer.data.totalViews - older.data.totalViews
  const viewGrowthPercentage = older.data.totalViews > 0
    ? (viewGrowth / older.data.totalViews) * 100
    : 0

  const videoGrowth = newer.data.videoCount - older.data.videoCount

  return {
    subscriberGrowth,
    subscriberGrowthPercentage: parseFloat(subscriberGrowthPercentage.toFixed(2)),
    viewGrowth,
    viewGrowthPercentage: parseFloat(viewGrowthPercentage.toFixed(2)),
    videoGrowth,
    daysElapsed: parseFloat(daysElapsed.toFixed(1)),
  }
}

/**
 * Generate historical comparison data
 */
export function generateHistoricalComparison(
  channel: FormattedChannelData,
  snapshots: HistoricalSnapshot[]
): HistoricalComparison {
  // Sort snapshots by timestamp
  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  if (sortedSnapshots.length === 0) {
    return {
      channel,
      snapshots: [],
      growth: {
        subscribers: { total: 0, percentage: 0, perDay: 0 },
        views: { total: 0, percentage: 0, perDay: 0 },
        videos: { total: 0, perDay: 0 },
      },
      trends: {
        period: '0 days',
        subscriberGrowth: [],
        viewGrowth: [],
        dates: [],
      },
    }
  }

  const oldest = sortedSnapshots[0]
  const newest = sortedSnapshots[sortedSnapshots.length - 1]
  const growth = calculateGrowthBetweenSnapshots(oldest, newest)

  // Calculate per-day averages
  const subscriberPerDay = growth.daysElapsed > 0
    ? Math.floor(growth.subscriberGrowth / growth.daysElapsed)
    : 0
  const viewsPerDay = growth.daysElapsed > 0
    ? Math.floor(growth.viewGrowth / growth.daysElapsed)
    : 0
  const videosPerDay = growth.daysElapsed > 0
    ? parseFloat((growth.videoGrowth / growth.daysElapsed).toFixed(2))
    : 0

  // Generate trend data for charts
  const subscriberGrowth = sortedSnapshots.map(s => s.data.subscribers)
  const viewGrowth = sortedSnapshots.map(s => s.data.totalViews)
  const dates = sortedSnapshots.map(s =>
    new Date(s.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  )

  return {
    channel,
    snapshots: sortedSnapshots,
    growth: {
      subscribers: {
        total: growth.subscriberGrowth,
        percentage: growth.subscriberGrowthPercentage,
        perDay: subscriberPerDay,
      },
      views: {
        total: growth.viewGrowth,
        percentage: growth.viewGrowthPercentage,
        perDay: viewsPerDay,
      },
      videos: {
        total: growth.videoGrowth,
        perDay: videosPerDay,
      },
    },
    trends: {
      period: `${Math.floor(growth.daysElapsed)} days`,
      subscriberGrowth,
      viewGrowth,
      dates,
    },
  }
}

/**
 * Calculate industry benchmarks from multiple channels
 */
export function calculateIndustryBenchmarks(snapshots: HistoricalSnapshot[]): {
  avgSubscribers: number
  avgTotalViews: number
  avgVideoCount: number
  avgViewsPerVideo: number
  medianSubscribers: number
  topPerformerThreshold: number
  categories: {
    micro: { min: number; max: number; count: number }
    small: { min: number; max: number; count: number }
    medium: { min: number; max: number; count: number }
    large: { min: number; max: number; count: number }
    mega: { min: number; max: number; count: number }
  }
} {
  if (snapshots.length === 0) {
    return {
      avgSubscribers: 0,
      avgTotalViews: 0,
      avgVideoCount: 0,
      avgViewsPerVideo: 0,
      medianSubscribers: 0,
      topPerformerThreshold: 0,
      categories: {
        micro: { min: 0, max: 10000, count: 0 },
        small: { min: 10000, max: 100000, count: 0 },
        medium: { min: 100000, max: 1000000, count: 0 },
        large: { min: 1000000, max: 10000000, count: 0 },
        mega: { min: 10000000, max: Infinity, count: 0 },
      },
    }
  }

  // Get unique channels (latest snapshot per channel)
  const latestSnapshots = new Map<string, HistoricalSnapshot>()
  snapshots.forEach(snapshot => {
    const existing = latestSnapshots.get(snapshot.channelId)
    if (!existing || new Date(snapshot.timestamp) > new Date(existing.timestamp)) {
      latestSnapshots.set(snapshot.channelId, snapshot)
    }
  })

  const uniqueChannels = Array.from(latestSnapshots.values())

  // Calculate averages
  const avgSubscribers = Math.floor(
    uniqueChannels.reduce((sum, s) => sum + s.data.subscribers, 0) / uniqueChannels.length
  )
  const avgTotalViews = Math.floor(
    uniqueChannels.reduce((sum, s) => sum + s.data.totalViews, 0) / uniqueChannels.length
  )
  const avgVideoCount = Math.floor(
    uniqueChannels.reduce((sum, s) => sum + s.data.videoCount, 0) / uniqueChannels.length
  )
  const avgViewsPerVideo = Math.floor(
    uniqueChannels.reduce((sum, s) => sum + s.data.avgViews, 0) / uniqueChannels.length
  )

  // Calculate median subscribers
  const sortedSubscribers = uniqueChannels
    .map(s => s.data.subscribers)
    .sort((a, b) => a - b)
  const mid = Math.floor(sortedSubscribers.length / 2)
  const medianSubscribers = sortedSubscribers.length % 2 === 0
    ? Math.floor((sortedSubscribers[mid - 1] + sortedSubscribers[mid]) / 2)
    : sortedSubscribers[mid]

  // Top 10% threshold
  const top10Index = Math.floor(uniqueChannels.length * 0.9)
  const topPerformerThreshold = sortedSubscribers[top10Index] || 0

  // Categorize channels
  const categories = {
    micro: { min: 0, max: 10000, count: 0 },
    small: { min: 10000, max: 100000, count: 0 },
    medium: { min: 100000, max: 1000000, count: 0 },
    large: { min: 1000000, max: 10000000, count: 0 },
    mega: { min: 10000000, max: Infinity, count: 0 },
  }

  uniqueChannels.forEach(channel => {
    const subs = channel.data.subscribers
    if (subs < 10000) categories.micro.count++
    else if (subs < 100000) categories.small.count++
    else if (subs < 1000000) categories.medium.count++
    else if (subs < 10000000) categories.large.count++
    else categories.mega.count++
  })

  return {
    avgSubscribers,
    avgTotalViews,
    avgVideoCount,
    avgViewsPerVideo,
    medianSubscribers,
    topPerformerThreshold,
    categories,
  }
}

/**
 * Compare channel to industry benchmarks
 */
export function compareToIndustryBenchmark(
  channel: FormattedChannelData,
  benchmarks: ReturnType<typeof calculateIndustryBenchmarks>
): {
  category: 'micro' | 'small' | 'medium' | 'large' | 'mega'
  subscriberPercentile: number
  viewsPercentile: number
  performance: {
    subscribers: 'above' | 'at' | 'below'
    views: 'above' | 'at' | 'below'
    videosPerView: 'above' | 'at' | 'below'
  }
  recommendations: string[]
} {
  // Determine category
  let category: 'micro' | 'small' | 'medium' | 'large' | 'mega' = 'micro'
  if (channel.subscribers >= 10000000) category = 'mega'
  else if (channel.subscribers >= 1000000) category = 'large'
  else if (channel.subscribers >= 100000) category = 'medium'
  else if (channel.subscribers >= 10000) category = 'small'

  // Calculate percentiles (simplified)
  const subscriberPercentile = channel.subscribers > benchmarks.avgSubscribers ? 75 : 25
  const viewsPercentile = channel.totalViews > benchmarks.avgTotalViews ? 75 : 25

  // Compare performance
  const avgViewsPerVideo = Math.floor(channel.totalViews / channel.videoCount)
  const performance = {
    subscribers: channel.subscribers > benchmarks.avgSubscribers ? 'above' as const :
                  channel.subscribers === benchmarks.avgSubscribers ? 'at' as const : 'below' as const,
    views: channel.totalViews > benchmarks.avgTotalViews ? 'above' as const :
           channel.totalViews === benchmarks.avgTotalViews ? 'at' as const : 'below' as const,
    videosPerView: avgViewsPerVideo > benchmarks.avgViewsPerVideo ? 'above' as const :
                    avgViewsPerVideo === benchmarks.avgViewsPerVideo ? 'at' as const : 'below' as const,
  }

  // Generate recommendations
  const recommendations: string[] = []
  if (performance.subscribers === 'below') {
    recommendations.push('Focus on subscriber growth through consistent content and engagement')
  }
  if (performance.views === 'below') {
    recommendations.push('Improve video visibility through better SEO and promotion')
  }
  if (performance.videosPerView === 'below') {
    recommendations.push('Optimize video quality and audience retention to increase average views')
  }
  if (channel.subscribers >= benchmarks.topPerformerThreshold) {
    recommendations.push('Excellent performance! You are in the top 10% of channels')
  }

  return {
    category,
    subscriberPercentile,
    viewsPercentile,
    performance,
    recommendations,
  }
}
