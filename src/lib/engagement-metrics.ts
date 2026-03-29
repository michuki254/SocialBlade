import type { FormattedVideoData } from '@/types/youtube'

/**
 * Calculate engagement rate as percentage
 * Formula: (likes + comments) / views * 100
 */
export function calculateEngagementRate(video: FormattedVideoData): number {
  if (video.views === 0) return 0
  const engagement = (video.likes + video.comments) / video.views * 100
  return parseFloat(engagement.toFixed(2))
}

/**
 * Calculate like rate as percentage
 * Formula: likes / views * 100
 */
export function calculateLikeRate(video: FormattedVideoData): number {
  if (video.views === 0) return 0
  const likeRate = (video.likes / video.views) * 100
  return parseFloat(likeRate.toFixed(2))
}

/**
 * Calculate comment rate as percentage
 * Formula: comments / views * 100
 */
export function calculateCommentRate(video: FormattedVideoData): number {
  if (video.views === 0) return 0
  const commentRate = (video.comments / video.views) * 100
  return parseFloat(commentRate.toFixed(2))
}

/**
 * Calculate average views per day since publish
 */
export function calculateViewVelocity(video: FormattedVideoData): number {
  const publishDate = new Date(video.publishedAt)
  const now = new Date()
  const daysSincePublish = Math.max(1, Math.floor((now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24)))
  const viewsPerDay = video.views / daysSincePublish
  return Math.floor(viewsPerDay)
}

/**
 * Calculate likes-to-comments ratio
 */
export function calculateLikesToCommentsRatio(video: FormattedVideoData): number {
  if (video.comments === 0) return 0
  const ratio = video.likes / video.comments
  return parseFloat(ratio.toFixed(2))
}

/**
 * Get engagement quality score (0-100)
 * Higher score = better engagement
 */
export function calculateEngagementScore(video: FormattedVideoData): number {
  const engagementRate = calculateEngagementRate(video)
  const likeRate = calculateLikeRate(video)
  const commentRate = calculateCommentRate(video)

  // Weighted score (engagement rate is most important)
  const score = (engagementRate * 0.6) + (likeRate * 0.25) + (commentRate * 0.15)

  // Cap at 100
  return Math.min(100, parseFloat(score.toFixed(2)))
}

/**
 * Determine engagement level based on engagement rate
 */
export function getEngagementLevel(engagementRate: number): {
  level: 'Excellent' | 'Good' | 'Average' | 'Below Average' | 'Poor'
  color: string
  description: string
} {
  if (engagementRate >= 8) {
    return {
      level: 'Excellent',
      color: '#00A699', // babu
      description: 'Outstanding engagement! Your audience is highly active.'
    }
  } else if (engagementRate >= 5) {
    return {
      level: 'Good',
      color: '#4CAF50',
      description: 'Strong engagement. Your content resonates well with viewers.'
    }
  } else if (engagementRate >= 3) {
    return {
      level: 'Average',
      color: '#FFC107',
      description: 'Moderate engagement. Room for improvement.'
    }
  } else if (engagementRate >= 1) {
    return {
      level: 'Below Average',
      color: '#FC642D', // arches
      description: 'Low engagement. Consider improving content or audience targeting.'
    }
  } else {
    return {
      level: 'Poor',
      color: '#FF5A5F', // rausch
      description: 'Very low engagement. Action needed to improve audience interaction.'
    }
  }
}

/**
 * Compare multiple videos and find best performer by metric
 */
export function findBestPerformer(
  videos: FormattedVideoData[],
  metric: 'views' | 'likes' | 'comments' | 'engagement'
): FormattedVideoData | null {
  if (videos.length === 0) return null

  return videos.reduce((best, current) => {
    let currentValue: number
    let bestValue: number

    switch (metric) {
      case 'views':
        currentValue = current.views
        bestValue = best.views
        break
      case 'likes':
        currentValue = current.likes
        bestValue = best.likes
        break
      case 'comments':
        currentValue = current.comments
        bestValue = best.comments
        break
      case 'engagement':
        currentValue = calculateEngagementRate(current)
        bestValue = calculateEngagementRate(best)
        break
      default:
        return best
    }

    return currentValue > bestValue ? current : best
  })
}

/**
 * Calculate average metrics across multiple videos
 */
export function calculateAverageMetrics(videos: FormattedVideoData[]) {
  if (videos.length === 0) {
    return {
      avgViews: 0,
      avgLikes: 0,
      avgComments: 0,
      avgEngagementRate: 0,
      avgLikeRate: 0,
      avgCommentRate: 0,
    }
  }

  const totals = videos.reduce(
    (acc, video) => ({
      views: acc.views + video.views,
      likes: acc.likes + video.likes,
      comments: acc.comments + video.comments,
      engagementRate: acc.engagementRate + calculateEngagementRate(video),
      likeRate: acc.likeRate + calculateLikeRate(video),
      commentRate: acc.commentRate + calculateCommentRate(video),
    }),
    { views: 0, likes: 0, comments: 0, engagementRate: 0, likeRate: 0, commentRate: 0 }
  )

  return {
    avgViews: Math.floor(totals.views / videos.length),
    avgLikes: Math.floor(totals.likes / videos.length),
    avgComments: Math.floor(totals.comments / videos.length),
    avgEngagementRate: parseFloat((totals.engagementRate / videos.length).toFixed(2)),
    avgLikeRate: parseFloat((totals.likeRate / videos.length).toFixed(2)),
    avgCommentRate: parseFloat((totals.commentRate / videos.length).toFixed(2)),
  }
}
