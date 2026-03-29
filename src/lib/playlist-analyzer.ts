import type { FormattedVideoData, FormattedPlaylistData } from '@/types/youtube'

/**
 * Analyze playlist performance metrics
 */
export function analyzePlaylistPerformance(videos: FormattedVideoData[]): {
  totalViews: number
  totalLikes: number
  totalComments: number
  avgViews: number
  avgEngagementRate: number
  bestPerformer: FormattedVideoData | null
  worstPerformer: FormattedVideoData | null
} {
  if (videos.length === 0) {
    return {
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0,
      avgViews: 0,
      avgEngagementRate: 0,
      bestPerformer: null,
      worstPerformer: null,
    }
  }

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0)
  const totalComments = videos.reduce((sum, v) => sum + v.comments, 0)

  const avgViews = Math.floor(totalViews / videos.length)

  const engagementRates = videos.map(v =>
    v.views > 0 ? ((v.likes + v.comments) / v.views) * 100 : 0
  )
  const avgEngagementRate = parseFloat(
    (engagementRates.reduce((sum, rate) => sum + rate, 0) / videos.length).toFixed(2)
  )

  const bestPerformer = videos.reduce((best, current) =>
    current.views > best.views ? current : best
  )

  const worstPerformer = videos.reduce((worst, current) =>
    current.views < worst.views ? current : worst
  )

  return {
    totalViews,
    totalLikes,
    totalComments,
    avgViews,
    avgEngagementRate,
    bestPerformer,
    worstPerformer,
  }
}

/**
 * Analyze video sequencing and drop-off
 */
export function analyzeVideoSequencing(videos: FormattedVideoData[]): {
  viewDropoff: number[]
  avgDropoffRate: number
  suggestedReordering: {
    position: number
    video: FormattedVideoData
    reason: string
  }[]
} {
  if (videos.length === 0) {
    return {
      viewDropoff: [],
      avgDropoffRate: 0,
      suggestedReordering: [],
    }
  }

  // Calculate view drop-off between consecutive videos
  const viewDropoff: number[] = []
  for (let i = 0; i < videos.length - 1; i++) {
    const currentViews = videos[i].views
    const nextViews = videos[i + 1].views
    const dropoff = currentViews > 0
      ? ((currentViews - nextViews) / currentViews) * 100
      : 0
    viewDropoff.push(parseFloat(dropoff.toFixed(2)))
  }

  const avgDropoffRate = viewDropoff.length > 0
    ? parseFloat((viewDropoff.reduce((sum, d) => sum + d, 0) / viewDropoff.length).toFixed(2))
    : 0

  // Suggest reordering based on performance
  const suggestedReordering: {
    position: number
    video: FormattedVideoData
    reason: string
  }[] = []

  // Find high-performing videos that are buried in the playlist
  videos.forEach((video, index) => {
    if (index > 2) { // Not in top 3
      const engagementRate = video.views > 0
        ? ((video.likes + video.comments) / video.views) * 100
        : 0

      // If this video has significantly higher performance than earlier videos
      const earlierVideosAvgViews = videos.slice(0, index).reduce((sum, v) => sum + v.views, 0) / index

      if (video.views > earlierVideosAvgViews * 1.5 || engagementRate > 8) {
        suggestedReordering.push({
          position: index,
          video,
          reason: video.views > earlierVideosAvgViews * 1.5
            ? 'High view count compared to earlier videos'
            : 'Exceptional engagement rate',
        })
      }
    }
  })

  return {
    viewDropoff,
    avgDropoffRate,
    suggestedReordering: suggestedReordering.slice(0, 5), // Top 5 suggestions
  }
}

/**
 * Calculate playlist engagement score (0-100)
 */
export function calculatePlaylistEngagementScore(
  playlist: FormattedPlaylistData,
  videos: FormattedVideoData[]
): {
  score: number
  factors: {
    name: string
    score: number
    weight: number
  }[]
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
} {
  if (videos.length === 0) {
    return {
      score: 0,
      factors: [],
      grade: 'F',
    }
  }

  const performance = analyzePlaylistPerformance(videos)

  // Factor 1: Average engagement rate (30%)
  const engagementFactor = Math.min(100, performance.avgEngagementRate * 10)

  // Factor 2: View consistency (20%) - lower drop-off is better
  const sequencing = analyzeVideoSequencing(videos)
  const consistencyFactor = Math.max(0, 100 - sequencing.avgDropoffRate)

  // Factor 3: Playlist size appropriateness (15%)
  const sizeFactor = playlist.itemCount >= 5 && playlist.itemCount <= 50 ? 100 :
                     playlist.itemCount < 5 ? 50 : 75

  // Factor 4: Video count vs listed count (10%) - completeness
  const completenessFactor = videos.length > 0
    ? (videos.length / playlist.itemCount) * 100
    : 0

  // Factor 5: Total engagement (25%) - overall performance
  const totalEngagement = performance.totalLikes + performance.totalComments
  const totalEngagementFactor = Math.min(100, (totalEngagement / (videos.length * 100)) * 100)

  const factors = [
    { name: 'Avg Engagement', score: parseFloat(engagementFactor.toFixed(1)), weight: 0.3 },
    { name: 'View Consistency', score: parseFloat(consistencyFactor.toFixed(1)), weight: 0.2 },
    { name: 'Playlist Size', score: parseFloat(sizeFactor.toFixed(1)), weight: 0.15 },
    { name: 'Completeness', score: parseFloat(completenessFactor.toFixed(1)), weight: 0.1 },
    { name: 'Total Engagement', score: parseFloat(totalEngagementFactor.toFixed(1)), weight: 0.25 },
  ]

  const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0)

  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (totalScore >= 90) grade = 'A'
  else if (totalScore >= 75) grade = 'B'
  else if (totalScore >= 60) grade = 'C'
  else if (totalScore >= 50) grade = 'D'
  else grade = 'F'

  return {
    score: parseFloat(totalScore.toFixed(1)),
    factors,
    grade,
  }
}

/**
 * Generate playlist optimization recommendations
 */
export function generatePlaylistRecommendations(
  playlist: FormattedPlaylistData,
  videos: FormattedVideoData[]
): string[] {
  const recommendations: string[] = []

  if (videos.length === 0) {
    return ['Unable to analyze: No videos found in playlist']
  }

  const performance = analyzePlaylistPerformance(videos)
  const sequencing = analyzeVideoSequencing(videos)
  const engagementScore = calculatePlaylistEngagementScore(playlist, videos)

  // Size recommendations
  if (playlist.itemCount < 5) {
    recommendations.push('Add more videos - playlists with 5+ videos perform better')
  } else if (playlist.itemCount > 50) {
    recommendations.push('Consider splitting into smaller, topic-focused playlists')
  }

  // Sequencing recommendations
  if (sequencing.avgDropoffRate > 50) {
    recommendations.push('High viewer drop-off detected - reorder videos to maintain interest')
  }

  if (sequencing.suggestedReordering.length > 0) {
    recommendations.push(`Move high-performing videos earlier in the playlist`)
  }

  // Engagement recommendations
  if (performance.avgEngagementRate < 3) {
    recommendations.push('Low overall engagement - review video quality and relevance to playlist theme')
  }

  // View distribution
  if (performance.bestPerformer && performance.worstPerformer) {
    const viewRatio = performance.bestPerformer.views / performance.worstPerformer.views
    if (viewRatio > 10) {
      recommendations.push('Large view disparity - ensure all videos are well-optimized and promoted')
    }
  }

  // Description optimization
  if (playlist.description.length < 100) {
    recommendations.push('Add a detailed playlist description with keywords for better discoverability')
  }

  // Update frequency
  const latestVideo = videos[0]
  const daysSinceUpdate = Math.floor((Date.now() - new Date(latestVideo?.publishedAt || 0).getTime()) / (1000 * 60 * 60 * 24))
  if (daysSinceUpdate > 90) {
    recommendations.push('Playlist appears inactive - add fresh content to maintain relevance')
  }

  // Performance-based
  if (engagementScore.score >= 80) {
    recommendations.push('Excellent playlist performance! Consider creating similar playlists')
  }

  return recommendations.length > 0
    ? recommendations
    : ['Playlist is performing well - keep up the good work!']
}

/**
 * Calculate playlist watch time estimate
 */
export function estimatePlaylistWatchTime(videos: FormattedVideoData[]): {
  totalMinutes: number
  totalHours: number
  avgVideoLength: string
  formattedTotal: string
} {
  if (videos.length === 0) {
    return {
      totalMinutes: 0,
      totalHours: 0,
      avgVideoLength: '0:00',
      formattedTotal: '0:00',
    }
  }

  // Convert duration strings to minutes
  const durations = videos.map(v => {
    const parts = (v.duration || '0:00').split(':')
    if (parts.length === 2) {
      // MM:SS
      return parseInt(parts[0]) + parseInt(parts[1]) / 60
    } else if (parts.length === 3) {
      // HH:MM:SS
      return parseInt(parts[0]) * 60 + parseInt(parts[1]) + parseInt(parts[2]) / 60
    }
    return 0
  })

  const totalMinutes = durations.reduce((sum, d) => sum + d, 0)
  const totalHours = totalMinutes / 60
  const avgMinutes = totalMinutes / videos.length

  // Format average video length
  const avgHours = Math.floor(avgMinutes / 60)
  const avgMins = Math.floor(avgMinutes % 60)
  const avgSecs = Math.floor((avgMinutes % 1) * 60)
  const avgVideoLength = avgHours > 0
    ? `${avgHours}:${avgMins.toString().padStart(2, '0')}:${avgSecs.toString().padStart(2, '0')}`
    : `${avgMins}:${avgSecs.toString().padStart(2, '0')}`

  // Format total time
  const hours = Math.floor(totalHours)
  const minutes = Math.floor(totalMinutes % 60)
  const formattedTotal = hours > 0
    ? `${hours}h ${minutes}m`
    : `${minutes}m`

  return {
    totalMinutes: parseFloat(totalMinutes.toFixed(1)),
    totalHours: parseFloat(totalHours.toFixed(2)),
    avgVideoLength,
    formattedTotal,
  }
}
