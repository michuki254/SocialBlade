import type { FormattedVideoData, FormattedChannelData, FormattedCommentData } from '@/types/youtube'

/**
 * Calculate growth rate between two time periods
 */
export function calculateGrowthRate(current: number, previous: number): {
  rate: number
  trend: 'up' | 'down' | 'stable'
  percentage: number
} {
  if (previous === 0) {
    return {
      rate: current,
      trend: current > 0 ? 'up' : 'stable',
      percentage: current > 0 ? 100 : 0,
    }
  }

  const rate = current - previous
  const percentage = (rate / previous) * 100

  return {
    rate,
    trend: rate > 0 ? 'up' : rate < 0 ? 'down' : 'stable',
    percentage: parseFloat(percentage.toFixed(2)),
  }
}

/**
 * Analyze recent video performance (last 24 hours)
 */
export function analyzeRecentPerformance(videos: FormattedVideoData[]): {
  recentVideos: FormattedVideoData[]
  totalViews24h: number
  totalEngagement24h: number
  avgViewsPerVideo: number
  topPerformer: FormattedVideoData | null
} {
  // Filter videos published in last 24 hours
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

  const recentVideos = videos.filter(video => {
    const publishDate = new Date(video.publishedAt)
    return publishDate >= twentyFourHoursAgo
  })

  const totalViews24h = recentVideos.reduce((sum, v) => sum + v.views, 0)
  const totalEngagement24h = recentVideos.reduce((sum, v) => sum + v.likes + v.comments, 0)
  const avgViewsPerVideo = recentVideos.length > 0 ? Math.floor(totalViews24h / recentVideos.length) : 0

  const topPerformer = recentVideos.length > 0
    ? recentVideos.reduce((best, current) => current.views > best.views ? current : best)
    : null

  return {
    recentVideos,
    totalViews24h,
    totalEngagement24h,
    avgViewsPerVideo,
    topPerformer,
  }
}

/**
 * Calculate velocity (views per hour) for recent videos
 */
export function calculateViewVelocity(video: FormattedVideoData): {
  viewsPerHour: number
  hoursLive: number
  projectedViews24h: number
} {
  const publishDate = new Date(video.publishedAt)
  const now = new Date()
  const hoursLive = Math.max(1, (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60))

  const viewsPerHour = video.views / hoursLive
  const projectedViews24h = Math.floor(viewsPerHour * 24)

  return {
    viewsPerHour: parseFloat(viewsPerHour.toFixed(2)),
    hoursLive: parseFloat(hoursLive.toFixed(1)),
    projectedViews24h,
  }
}

/**
 * Group videos by time period for trending analysis
 */
export function groupVideosByTimePeriod(videos: FormattedVideoData[]): {
  last24h: FormattedVideoData[]
  last7d: FormattedVideoData[]
  last30d: FormattedVideoData[]
  older: FormattedVideoData[]
} {
  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const last24h: FormattedVideoData[] = []
  const last7d: FormattedVideoData[] = []
  const last30d: FormattedVideoData[] = []
  const older: FormattedVideoData[] = []

  videos.forEach(video => {
    const publishDate = new Date(video.publishedAt)

    if (publishDate >= twentyFourHoursAgo) {
      last24h.push(video)
    } else if (publishDate >= sevenDaysAgo) {
      last7d.push(video)
    } else if (publishDate >= thirtyDaysAgo) {
      last30d.push(video)
    } else {
      older.push(video)
    }
  })

  return { last24h, last7d, last30d, older }
}

/**
 * Detect trending patterns
 */
export function detectTrendingPatterns(videos: FormattedVideoData[]): {
  isTrending: boolean
  trendScore: number
  reason: string
  recommendations: string[]
} {
  if (videos.length === 0) {
    return {
      isTrending: false,
      trendScore: 0,
      reason: 'No recent videos to analyze',
      recommendations: [],
    }
  }

  const grouped = groupVideosByTimePeriod(videos)
  const recommendations: string[] = []

  // Calculate average performance for each period
  const avg24h = grouped.last24h.length > 0
    ? grouped.last24h.reduce((sum, v) => sum + v.views, 0) / grouped.last24h.length
    : 0

  const avg7d = grouped.last7d.length > 0
    ? grouped.last7d.reduce((sum, v) => sum + v.views, 0) / grouped.last7d.length
    : 0

  const avg30d = grouped.last30d.length > 0
    ? grouped.last30d.reduce((sum, v) => sum + v.views, 0) / grouped.last30d.length
    : 0

  // Trending if recent performance significantly exceeds historical average
  const baselineAvg = (avg7d + avg30d) / 2 || 1
  const trendMultiplier = avg24h / baselineAvg

  const isTrending = trendMultiplier >= 2 // 2x or more than baseline
  const trendScore = Math.min(100, trendMultiplier * 50)

  let reason = ''
  if (isTrending) {
    reason = `Recent videos are performing ${trendMultiplier.toFixed(1)}x better than baseline`
    recommendations.push('Content is trending - maintain upload momentum')
    recommendations.push('Engage with comments to boost visibility')
  } else if (trendMultiplier >= 1.5) {
    reason = 'Showing positive growth momentum'
    recommendations.push('Good performance - consider increasing upload frequency')
  } else if (trendMultiplier < 0.5) {
    reason = 'Recent performance below baseline'
    recommendations.push('Review recent content strategy')
    recommendations.push('Analyze what worked in past successful videos')
  } else {
    reason = 'Stable performance'
    recommendations.push('Maintain consistency in uploads')
  }

  // Upload frequency recommendations
  if (grouped.last7d.length === 0) {
    recommendations.push('No uploads in the past week - consider posting more regularly')
  } else if (grouped.last7d.length >= 7) {
    recommendations.push('High upload frequency - ensure quality remains consistent')
  }

  return {
    isTrending,
    trendScore: parseFloat(trendScore.toFixed(1)),
    reason,
    recommendations,
  }
}

/**
 * Analyze engagement velocity (rate of new likes/comments)
 */
export function analyzeEngagementVelocity(
  currentEngagement: number,
  previousEngagement: number,
  hoursElapsed: number
): {
  likesPerHour: number
  engagementRate: number
  momentum: 'accelerating' | 'steady' | 'slowing'
} {
  const engagementGrowth = currentEngagement - previousEngagement
  const likesPerHour = hoursElapsed > 0 ? engagementGrowth / hoursElapsed : 0

  // Mock previous rate for momentum calculation (in real app, would track historical data)
  const expectedRate = currentEngagement / Math.max(hoursElapsed, 1)
  const currentRate = likesPerHour

  let momentum: 'accelerating' | 'steady' | 'slowing'
  if (currentRate > expectedRate * 1.2) {
    momentum = 'accelerating'
  } else if (currentRate < expectedRate * 0.8) {
    momentum = 'slowing'
  } else {
    momentum = 'steady'
  }

  return {
    likesPerHour: parseFloat(likesPerHour.toFixed(2)),
    engagementRate: parseFloat(((currentEngagement / Math.max(currentEngagement, 1)) * 100).toFixed(2)),
    momentum,
  }
}

/**
 * Generate real-time performance summary
 */
export function generateRealtimeSummary(
  channel: FormattedChannelData,
  recentVideos: FormattedVideoData[],
  recentComments: FormattedCommentData[]
): {
  status: 'highly-active' | 'active' | 'moderate' | 'quiet'
  activityScore: number
  summary: string
  highlights: string[]
} {
  const recent24h = analyzeRecentPerformance(recentVideos)
  const trending = detectTrendingPatterns(recentVideos)

  // Calculate activity score
  let activityScore = 0

  // Recent uploads (0-30 points)
  activityScore += Math.min(30, recent24h.recentVideos.length * 10)

  // Recent engagement (0-30 points)
  const recentCommentsCount = recentComments.length
  activityScore += Math.min(30, recentCommentsCount / 2)

  // Trending performance (0-40 points)
  activityScore += (trending.trendScore / 100) * 40

  // Determine status
  let status: 'highly-active' | 'active' | 'moderate' | 'quiet'
  if (activityScore >= 75) status = 'highly-active'
  else if (activityScore >= 50) status = 'active'
  else if (activityScore >= 25) status = 'moderate'
  else status = 'quiet'

  // Generate summary
  let summary = ''
  const highlights: string[] = []

  if (status === 'highly-active') {
    summary = 'Channel is highly active with strong recent performance'
    highlights.push(`${recent24h.recentVideos.length} new video(s) in last 24h`)
    if (trending.isTrending) highlights.push('Content is currently trending')
  } else if (status === 'active') {
    summary = 'Channel showing good activity levels'
    if (recent24h.recentVideos.length > 0) highlights.push('Recent uploads performing well')
  } else if (status === 'moderate') {
    summary = 'Moderate channel activity'
    highlights.push('Consider increasing upload frequency')
  } else {
    summary = 'Low recent activity detected'
    highlights.push('No recent uploads in last 24 hours')
  }

  // Add engagement highlights
  if (recent24h.totalEngagement24h > 100) {
    highlights.push(`${recent24h.totalEngagement24h} total engagements in 24h`)
  }

  if (recentComments.length > 50) {
    highlights.push(`${recentComments.length} new comments`)
  }

  return {
    status,
    activityScore: parseFloat(activityScore.toFixed(1)),
    summary,
    highlights,
  }
}

/**
 * Calculate time since last activity
 */
export function getTimeSinceLastActivity(videos: FormattedVideoData[]): {
  lastUploadDate: Date | null
  hoursSinceUpload: number
  daysSinceUpload: number
  status: 'recent' | 'this-week' | 'this-month' | 'inactive'
} {
  if (videos.length === 0) {
    return {
      lastUploadDate: null,
      hoursSinceUpload: 0,
      daysSinceUpload: 0,
      status: 'inactive',
    }
  }

  const sortedVideos = [...videos].sort((a, b) =>
    new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  const lastUploadDate = new Date(sortedVideos[0].publishedAt)
  const now = new Date()
  const hoursSinceUpload = (now.getTime() - lastUploadDate.getTime()) / (1000 * 60 * 60)
  const daysSinceUpload = hoursSinceUpload / 24

  let status: 'recent' | 'this-week' | 'this-month' | 'inactive'
  if (hoursSinceUpload < 48) status = 'recent'
  else if (daysSinceUpload < 7) status = 'this-week'
  else if (daysSinceUpload < 30) status = 'this-month'
  else status = 'inactive'

  return {
    lastUploadDate,
    hoursSinceUpload: parseFloat(hoursSinceUpload.toFixed(1)),
    daysSinceUpload: parseFloat(daysSinceUpload.toFixed(1)),
    status,
  }
}
