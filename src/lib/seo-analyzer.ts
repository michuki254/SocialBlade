import type { FormattedVideoData } from '@/types/youtube'

/**
 * SEO scoring constants and thresholds
 */
export const SEO_CONSTANTS = {
  // Title
  TITLE_MIN_LENGTH: 40,
  TITLE_IDEAL_LENGTH: 60,
  TITLE_MAX_LENGTH: 100,

  // Description
  DESC_MIN_LENGTH: 150,
  DESC_IDEAL_LENGTH: 250,
  DESC_MAX_LENGTH: 5000,

  // Tags
  TAGS_MIN_COUNT: 5,
  TAGS_IDEAL_COUNT: 15,
  TAGS_MAX_COUNT: 30,

  // Duration (minutes)
  DURATION_MIN: 3,
  DURATION_IDEAL: 10,
}

/**
 * Calculate overall SEO score (0-100)
 */
export function calculateSEOScore(video: FormattedVideoData): {
  totalScore: number
  scores: {
    title: number
    description: number
    tags: number
    engagement: number
    metadata: number
  }
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  issues: string[]
  strengths: string[]
} {
  const titleScore = analyzeTitleSEO(video.title).score
  const descScore = analyzeDescriptionSEO(video.description).score
  const tagsScore = analyzeTagsSEO(video.tags || []).score
  const engagementScore = analyzeEngagementSEO(video).score
  const metadataScore = analyzeMetadataSEO(video).score

  const totalScore = Math.round(
    (titleScore * 0.25) +
    (descScore * 0.2) +
    (tagsScore * 0.2) +
    (engagementScore * 0.2) +
    (metadataScore * 0.15)
  )

  const issues: string[] = []
  const strengths: string[] = []

  // Collect issues and strengths
  if (titleScore < 60) issues.push('Title needs optimization')
  else if (titleScore >= 80) strengths.push('Well-optimized title')

  if (descScore < 60) issues.push('Description is too short or missing keywords')
  else if (descScore >= 80) strengths.push('Comprehensive description')

  if (tagsScore < 60) issues.push('Add more relevant tags')
  else if (tagsScore >= 80) strengths.push('Good tag coverage')

  if (engagementScore < 60) issues.push('Low engagement metrics')
  else if (engagementScore >= 80) strengths.push('Strong audience engagement')

  let grade: 'A' | 'B' | 'C' | 'D' | 'F'
  if (totalScore >= 90) grade = 'A'
  else if (totalScore >= 75) grade = 'B'
  else if (totalScore >= 60) grade = 'C'
  else if (totalScore >= 50) grade = 'D'
  else grade = 'F'

  return {
    totalScore,
    scores: {
      title: titleScore,
      description: descScore,
      tags: tagsScore,
      engagement: engagementScore,
      metadata: metadataScore,
    },
    grade,
    issues,
    strengths,
  }
}

/**
 * Analyze title SEO quality
 */
export function analyzeTitleSEO(title: string): {
  score: number
  length: number
  issues: string[]
  suggestions: string[]
} {
  const length = title.length
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 50 // Base score

  // Length scoring
  if (length < SEO_CONSTANTS.TITLE_MIN_LENGTH) {
    score -= 20
    issues.push(`Title too short (${length} chars)`)
    suggestions.push(`Expand to at least ${SEO_CONSTANTS.TITLE_MIN_LENGTH} characters`)
  } else if (length > SEO_CONSTANTS.TITLE_MAX_LENGTH) {
    score -= 15
    issues.push('Title too long, may be truncated')
    suggestions.push('Shorten to under 100 characters')
  } else if (length >= SEO_CONSTANTS.TITLE_MIN_LENGTH && length <= SEO_CONSTANTS.TITLE_IDEAL_LENGTH) {
    score += 30
  } else {
    score += 20
  }

  // Check for numbers (tend to perform well)
  if (/\d+/.test(title)) {
    score += 10
  } else {
    suggestions.push('Consider adding numbers (e.g., "5 Tips", "2024")')
  }

  // Check for power words
  const powerWords = ['best', 'ultimate', 'guide', 'how to', 'tutorial', 'review', 'tips', 'tricks']
  const hasPowerWord = powerWords.some(word => title.toLowerCase().includes(word))
  if (hasPowerWord) {
    score += 10
  } else {
    suggestions.push('Use engaging keywords like "Best", "Ultimate", "Guide"')
  }

  // Check for ALL CAPS (bad practice)
  if (title === title.toUpperCase() && title.length > 3) {
    score -= 15
    issues.push('Avoid ALL CAPS in title')
  }

  // Check for emojis (can improve CTR but use sparingly)
  const emojiCount = (title.match(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || []).length
  if (emojiCount > 2) {
    issues.push('Too many emojis')
    score -= 5
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    length,
    issues,
    suggestions,
  }
}

/**
 * Analyze description SEO quality
 */
export function analyzeDescriptionSEO(description: string): {
  score: number
  length: number
  issues: string[]
  suggestions: string[]
  hasLinks: boolean
  hasTimestamps: boolean
  hasHashtags: boolean
} {
  const length = description.length
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 50

  // Length scoring
  if (length < SEO_CONSTANTS.DESC_MIN_LENGTH) {
    score -= 30
    issues.push('Description too short')
    suggestions.push(`Write at least ${SEO_CONSTANTS.DESC_MIN_LENGTH} characters`)
  } else if (length >= SEO_CONSTANTS.DESC_IDEAL_LENGTH) {
    score += 30
  } else {
    score += 15
  }

  // Check for links
  const hasLinks = /https?:\/\//.test(description)
  if (hasLinks) {
    score += 10
  } else {
    suggestions.push('Add relevant links (social media, website, related videos)')
  }

  // Check for timestamps
  const hasTimestamps = /\d{1,2}:\d{2}/.test(description)
  if (hasTimestamps) {
    score += 10
  } else if (length > 300) {
    suggestions.push('Add timestamps for better user experience')
  }

  // Check for hashtags
  const hasHashtags = /#\w+/.test(description)
  const hashtagCount = (description.match(/#\w+/g) || []).length
  if (hasHashtags) {
    if (hashtagCount <= 15) {
      score += 5
    } else {
      issues.push('Too many hashtags (max 15)')
      score -= 5
    }
  }

  // Check for call-to-action
  const ctaKeywords = ['subscribe', 'like', 'comment', 'share', 'follow', 'click']
  const hasCTA = ctaKeywords.some(word => description.toLowerCase().includes(word))
  if (hasCTA) {
    score += 10
  } else {
    suggestions.push('Add a call-to-action (subscribe, like, comment)')
  }

  // First 150 characters are crucial (shown in search)
  if (length > 150 && description.substring(0, 150).trim().length < 100) {
    suggestions.push('Make the first 150 characters compelling (shown in search)')
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    length,
    issues,
    suggestions,
    hasLinks,
    hasTimestamps,
    hasHashtags,
  }
}

/**
 * Analyze tags SEO quality
 */
export function analyzeTagsSEO(tags: string[]): {
  score: number
  count: number
  issues: string[]
  suggestions: string[]
  avgLength: number
} {
  const count = tags.length
  const issues: string[] = []
  const suggestions: string[] = []
  let score = 50

  // Count scoring
  if (count < SEO_CONSTANTS.TAGS_MIN_COUNT) {
    score -= 30
    issues.push(`Too few tags (${count})`)
    suggestions.push(`Add at least ${SEO_CONSTANTS.TAGS_MIN_COUNT} relevant tags`)
  } else if (count > SEO_CONSTANTS.TAGS_MAX_COUNT) {
    score -= 15
    issues.push('Too many tags')
    suggestions.push('Focus on the most relevant tags only')
  } else if (count >= SEO_CONSTANTS.TAGS_IDEAL_COUNT) {
    score += 30
  } else {
    score += 15
  }

  if (count > 0) {
    // Average tag length
    const avgLength = tags.reduce((sum, tag) => sum + tag.length, 0) / count

    // Check for single-word vs multi-word tags
    const singleWordTags = tags.filter(tag => !tag.includes(' ')).length
    const multiWordTags = count - singleWordTags

    if (multiWordTags > 0) {
      score += 10
    } else {
      suggestions.push('Include some multi-word tags (long-tail keywords)')
    }

    // Check for very long tags
    const longTags = tags.filter(tag => tag.length > 30).length
    if (longTags > 3) {
      issues.push('Some tags are too long')
      score -= 5
    }

    // Check for duplicate tags
    const uniqueTags = new Set(tags.map(t => t.toLowerCase()))
    if (uniqueTags.size < count) {
      issues.push('Duplicate tags detected')
      score -= 10
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      count,
      issues,
      suggestions,
      avgLength: Math.round(avgLength),
    }
  }

  return {
    score: 0,
    count: 0,
    issues: ['No tags found'],
    suggestions: ['Add relevant tags to improve discoverability'],
    avgLength: 0,
  }
}

/**
 * Analyze engagement metrics for SEO impact
 */
export function analyzeEngagementSEO(video: FormattedVideoData): {
  score: number
  engagementRate: number
  issues: string[]
} {
  const engagementRate = video.views > 0
    ? ((video.likes + video.comments) / video.views) * 100
    : 0
  const issues: string[] = []
  let score = 0

  // Engagement rate scoring
  if (engagementRate >= 8) {
    score = 100
  } else if (engagementRate >= 5) {
    score = 80
  } else if (engagementRate >= 3) {
    score = 60
  } else if (engagementRate >= 1) {
    score = 40
    issues.push('Low engagement rate')
  } else {
    score = 20
    issues.push('Very low engagement rate')
  }

  return {
    score,
    engagementRate: parseFloat(engagementRate.toFixed(2)),
    issues,
  }
}

/**
 * Analyze metadata completeness
 */
export function analyzeMetadataSEO(video: FormattedVideoData): {
  score: number
  issues: string[]
  completeness: {
    hasTitle: boolean
    hasDescription: boolean
    hasTags: boolean
    hasThumbnail: boolean
    hasDuration: boolean
  }
} {
  const issues: string[] = []
  let score = 0

  const completeness = {
    hasTitle: !!video.title && video.title.length > 0,
    hasDescription: !!video.description && video.description.length > 0,
    hasTags: !!video.tags && video.tags.length > 0,
    hasThumbnail: !!video.thumbnail,
    hasDuration: !!video.duration,
  }

  // Each metadata field worth 20 points
  if (completeness.hasTitle) score += 20
  else issues.push('Missing title')

  if (completeness.hasDescription) score += 20
  else issues.push('Missing description')

  if (completeness.hasTags) score += 20
  else issues.push('Missing tags')

  if (completeness.hasThumbnail) score += 20
  else issues.push('Missing custom thumbnail')

  if (completeness.hasDuration) score += 20

  return {
    score,
    issues,
    completeness,
  }
}

/**
 * Extract keywords from text using frequency analysis
 */
export function extractKeywords(text: string, minLength: number = 3): {
  keyword: string
  frequency: number
}[] {
  // Remove common words
  const commonWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  ])

  // Extract words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= minLength && !commonWords.has(word))

  // Count frequency
  const frequency: Record<string, number> = {}
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1
  })

  // Convert to array and sort
  return Object.entries(frequency)
    .map(([keyword, freq]) => ({ keyword, frequency: freq }))
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 20) // Top 20 keywords
}

/**
 * Analyze tag overlap with top performing videos
 */
export function analyzeTagOverlap(
  videoTags: string[],
  competitorTags: string[][]
): {
  uniqueTags: string[]
  commonTags: string[]
  missingTags: string[]
  overlapPercentage: number
} {
  const videoTagsSet = new Set(videoTags.map(t => t.toLowerCase()))

  // Flatten and count competitor tags
  const allCompetitorTags = competitorTags.flat()
  const tagFrequency: Record<string, number> = {}

  allCompetitorTags.forEach(tag => {
    const lowerTag = tag.toLowerCase()
    tagFrequency[lowerTag] = (tagFrequency[lowerTag] || 0) + 1
  })

  // Find common tags (appear in multiple competitor videos)
  const commonCompetitorTags = Object.entries(tagFrequency)
    .filter(([_, count]) => count >= 2)
    .map(([tag, _]) => tag)

  const commonTags = videoTags.filter(tag =>
    commonCompetitorTags.includes(tag.toLowerCase())
  )

  const missingTags = commonCompetitorTags.filter(tag =>
    !videoTagsSet.has(tag)
  )

  const uniqueTags = videoTags.filter(tag =>
    !commonCompetitorTags.includes(tag.toLowerCase())
  )

  const overlapPercentage = videoTags.length > 0
    ? (commonTags.length / videoTags.length) * 100
    : 0

  return {
    uniqueTags,
    commonTags,
    missingTags: missingTags.slice(0, 10), // Top 10 missing
    overlapPercentage: parseFloat(overlapPercentage.toFixed(2)),
  }
}

/**
 * Generate SEO optimization recommendations
 */
export function generateSEORecommendations(video: FormattedVideoData): string[] {
  const recommendations: string[] = []
  const seoScore = calculateSEOScore(video)

  // Add issue-based recommendations
  recommendations.push(...seoScore.issues)

  // Title recommendations
  const titleAnalysis = analyzeTitleSEO(video.title)
  recommendations.push(...titleAnalysis.suggestions)

  // Description recommendations
  const descAnalysis = analyzeDescriptionSEO(video.description)
  recommendations.push(...descAnalysis.suggestions)

  // Tags recommendations
  const tagsAnalysis = analyzeTagsSEO(video.tags || [])
  recommendations.push(...tagsAnalysis.suggestions)

  // Engagement recommendations
  if (seoScore.scores.engagement < 60) {
    recommendations.push('Improve engagement by asking questions and encouraging interaction')
    recommendations.push('Respond to comments to boost engagement signals')
  }

  return recommendations.slice(0, 10) // Top 10 recommendations
}
