import type { FormattedVideoData, FormattedChannelData } from '@/types/youtube'

/**
 * Revenue estimation constants (industry averages)
 * These are estimates and actual values vary significantly
 */
export const REVENUE_CONSTANTS = {
  // CPM (Cost Per Mille/Thousand impressions) ranges
  CPM_LOW: 0.25,      // Very low CPM (gaming, kids content)
  CPM_AVERAGE: 3.00,  // Average CPM across all content
  CPM_HIGH: 15.00,    // High CPM (finance, tech, business)

  // Typical ad view rate (percentage of views that see ads)
  AD_VIEW_RATE: 0.55, // 55% of views typically monetized

  // YouTube's revenue share
  CREATOR_SHARE: 0.55, // Creators get 55% of ad revenue
}

/**
 * Estimate CPM based on video category and engagement
 * Higher engagement typically means higher CPM
 */
export function estimateCPM(video: FormattedVideoData): number {
  const engagementRate = (video.likes + video.comments) / video.views * 100

  // Base CPM on engagement
  let baseCPM = REVENUE_CONSTANTS.CPM_AVERAGE

  // Adjust based on engagement quality
  if (engagementRate >= 8) {
    baseCPM = REVENUE_CONSTANTS.CPM_HIGH
  } else if (engagementRate >= 5) {
    baseCPM = REVENUE_CONSTANTS.CPM_AVERAGE * 1.5
  } else if (engagementRate < 2) {
    baseCPM = REVENUE_CONSTANTS.CPM_AVERAGE * 0.7
  }

  return parseFloat(baseCPM.toFixed(2))
}

/**
 * Estimate monetized views (views that actually show ads)
 */
export function estimateMonetizedViews(totalViews: number): number {
  return Math.floor(totalViews * REVENUE_CONSTANTS.AD_VIEW_RATE)
}

/**
 * Calculate estimated revenue for a video
 * Formula: (Monetized Views / 1000) * CPM * Creator Share
 */
export function estimateVideoRevenue(video: FormattedVideoData): {
  estimatedRevenueLow: number
  estimatedRevenueAverage: number
  estimatedRevenueHigh: number
  estimatedCPM: number
  monetizedViews: number
} {
  const monetizedViews = estimateMonetizedViews(video.views)
  const estimatedCPM = estimateCPM(video)

  const calculateRevenue = (cpm: number) => {
    return (monetizedViews / 1000) * cpm * REVENUE_CONSTANTS.CREATOR_SHARE
  }

  return {
    estimatedRevenueLow: parseFloat(calculateRevenue(REVENUE_CONSTANTS.CPM_LOW).toFixed(2)),
    estimatedRevenueAverage: parseFloat(calculateRevenue(estimatedCPM).toFixed(2)),
    estimatedRevenueHigh: parseFloat(calculateRevenue(REVENUE_CONSTANTS.CPM_HIGH).toFixed(2)),
    estimatedCPM,
    monetizedViews,
  }
}

/**
 * Calculate RPM (Revenue Per Mille/Thousand views)
 * This is what creators actually earn per 1000 views after YouTube's cut
 */
export function calculateRPM(cpm: number): number {
  return parseFloat((cpm * REVENUE_CONSTANTS.CREATOR_SHARE).toFixed(2))
}

/**
 * Estimate total channel revenue
 */
export function estimateChannelRevenue(
  channel: FormattedChannelData,
  averageCPM: number = REVENUE_CONSTANTS.CPM_AVERAGE
): {
  estimatedTotalRevenueLow: number
  estimatedTotalRevenueAverage: number
  estimatedTotalRevenueHigh: number
  estimatedMonthlyRevenue: number
} {
  const monetizedViews = estimateMonetizedViews(channel.totalViews)

  const calculateRevenue = (cpm: number) => {
    return (monetizedViews / 1000) * cpm * REVENUE_CONSTANTS.CREATOR_SHARE
  }

  // Estimate monthly revenue based on channel age
  const publishDate = new Date(channel.publishedAt)
  const now = new Date()
  const monthsActive = Math.max(1, Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))

  const averageRevenue = calculateRevenue(averageCPM)

  return {
    estimatedTotalRevenueLow: parseFloat(calculateRevenue(REVENUE_CONSTANTS.CPM_LOW).toFixed(2)),
    estimatedTotalRevenueAverage: parseFloat(averageRevenue.toFixed(2)),
    estimatedTotalRevenueHigh: parseFloat(calculateRevenue(REVENUE_CONSTANTS.CPM_HIGH).toFixed(2)),
    estimatedMonthlyRevenue: parseFloat((averageRevenue / monthsActive).toFixed(2)),
  }
}

/**
 * Check if channel is eligible for monetization
 * Requirements: 1000 subscribers + 4000 watch hours in past 12 months
 */
export function checkMonetizationEligibility(channel: FormattedChannelData): {
  eligible: boolean
  subscribersRequired: number
  subscribersProgress: number
  meetsSubscriberRequirement: boolean
  estimatedWatchHoursNeeded: string
} {
  const MIN_SUBSCRIBERS = 1000
  const meetsSubscriberRequirement = channel.subscribers >= MIN_SUBSCRIBERS
  const subscribersProgress = Math.min(100, (channel.subscribers / MIN_SUBSCRIBERS) * 100)
  const subscribersRequired = Math.max(0, MIN_SUBSCRIBERS - channel.subscribers)

  // We can't calculate exact watch hours without Analytics API
  // But we can estimate based on average video duration and views
  // Assume average watch time is 50% of video duration
  const estimatedAvgDuration = 10 // minutes (rough estimate)
  const estimatedWatchMinutes = channel.totalViews * estimatedAvgDuration * 0.5
  const estimatedWatchHours = estimatedWatchMinutes / 60

  const watchHoursNeeded = Math.max(0, 4000 - estimatedWatchHours)

  return {
    eligible: meetsSubscriberRequirement, // Can't verify watch hours without API
    subscribersRequired,
    subscribersProgress: parseFloat(subscribersProgress.toFixed(2)),
    meetsSubscriberRequirement,
    estimatedWatchHoursNeeded: watchHoursNeeded > 0
      ? `~${Math.floor(watchHoursNeeded)} hours estimated`
      : 'Likely met (estimated)',
  }
}

/**
 * Calculate revenue forecast for next 30/60/90 days
 */
export function forecastRevenue(
  currentMonthlyRevenue: number,
  growthRate: number = 5 // percentage
): {
  next30Days: number
  next60Days: number
  next90Days: number
  yearly: number
} {
  const monthlyGrowthMultiplier = 1 + (growthRate / 100)

  const month1 = currentMonthlyRevenue * monthlyGrowthMultiplier
  const month2 = month1 * monthlyGrowthMultiplier
  const month3 = month2 * monthlyGrowthMultiplier

  return {
    next30Days: parseFloat(month1.toFixed(2)),
    next60Days: parseFloat((month1 + month2).toFixed(2)),
    next90Days: parseFloat((month1 + month2 + month3).toFixed(2)),
    yearly: parseFloat((currentMonthlyRevenue * 12 * Math.pow(monthlyGrowthMultiplier, 6)).toFixed(2)),
  }
}

/**
 * Get monetization health score (0-100)
 */
export function getMonetizationHealthScore(
  video: FormattedVideoData,
  channelSubscribers: number
): {
  score: number
  level: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  factors: {
    name: string
    score: number
    impact: 'positive' | 'negative' | 'neutral'
  }[]
} {
  const engagementRate = (video.likes + video.comments) / video.views * 100
  const likeRatio = video.likes / video.views * 100

  // Factor scores
  const factors = [
    {
      name: 'Engagement Rate',
      score: Math.min(100, engagementRate * 10),
      impact: engagementRate >= 5 ? 'positive' : engagementRate >= 3 ? 'neutral' : 'negative'
    },
    {
      name: 'Like Ratio',
      score: Math.min(100, likeRatio * 20),
      impact: likeRatio >= 4 ? 'positive' : likeRatio >= 2 ? 'neutral' : 'negative'
    },
    {
      name: 'View Count',
      score: Math.min(100, (video.views / 10000) * 100),
      impact: video.views >= 10000 ? 'positive' : video.views >= 1000 ? 'neutral' : 'negative'
    },
    {
      name: 'Channel Size',
      score: Math.min(100, (channelSubscribers / 10000) * 100),
      impact: channelSubscribers >= 10000 ? 'positive' : channelSubscribers >= 1000 ? 'neutral' : 'negative'
    },
  ] as const

  const totalScore = factors.reduce((sum, f) => sum + f.score, 0) / factors.length

  let level: 'Excellent' | 'Good' | 'Fair' | 'Poor'
  if (totalScore >= 75) level = 'Excellent'
  else if (totalScore >= 50) level = 'Good'
  else if (totalScore >= 25) level = 'Fair'
  else level = 'Poor'

  return {
    score: parseFloat(totalScore.toFixed(2)),
    level,
    factors: factors as any,
  }
}

/**
 * Get revenue optimization tips
 */
export function getRevenueOptimizationTips(
  video: FormattedVideoData,
  channelSubscribers: number
): string[] {
  const tips: string[] = []
  const engagementRate = (video.likes + video.comments) / video.views * 100
  const likeRatio = video.likes / video.views * 100

  // Engagement tips
  if (engagementRate < 3) {
    tips.push('Improve engagement by adding clear calls-to-action and encouraging comments')
  }

  // Content length tips
  if (video.duration && video.duration.includes(':') && !video.duration.includes(':', video.duration.indexOf(':') + 1)) {
    const minutes = parseInt(video.duration.split(':')[0])
    if (minutes < 8) {
      tips.push('Consider creating longer videos (8+ minutes) to enable mid-roll ads and increase revenue')
    }
  }

  // Like ratio tips
  if (likeRatio < 2) {
    tips.push('Encourage viewers to like your video - higher like ratios improve ad rates')
  }

  // Channel growth tips
  if (channelSubscribers < 1000) {
    tips.push('Focus on reaching 1,000 subscribers to qualify for YouTube Partner Program')
  } else if (channelSubscribers < 10000) {
    tips.push('Grow to 10,000+ subscribers to unlock better monetization opportunities')
  }

  // View count tips
  if (video.views < 1000) {
    tips.push('Improve SEO and thumbnails to increase views and revenue potential')
  }

  // Tag/description tips
  if (!video.tags || video.tags.length < 5) {
    tips.push('Add more relevant tags to improve discoverability and attract higher-value ads')
  }

  // High performers
  if (engagementRate >= 8 && video.views >= 10000) {
    tips.push('Excellent performance! Consider creating similar content to maximize revenue')
  }

  return tips.length > 0 ? tips : ['Keep creating quality content and engaging with your audience!']
}
