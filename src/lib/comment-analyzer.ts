import type { FormattedCommentData } from '@/types/youtube'

/**
 * Sentiment analysis result
 */
export type Sentiment = 'positive' | 'neutral' | 'negative'

export interface SentimentAnalysis {
  sentiment: Sentiment
  score: number // -1 to 1, negative to positive
  confidence: number // 0 to 1
}

/**
 * Simple keyword-based sentiment analyzer
 * Uses predefined word lists for positive and negative sentiment
 */
export function analyzeSentiment(text: string): SentimentAnalysis {
  const lowerText = text.toLowerCase()

  // Positive keywords
  const positiveWords = [
    'love', 'great', 'awesome', 'amazing', 'excellent', 'perfect', 'best', 'fantastic',
    'wonderful', 'good', 'nice', 'beautiful', 'brilliant', 'incredible', 'outstanding',
    'superb', 'terrific', 'thank', 'thanks', 'appreciate', 'helpful', 'enjoy', 'enjoyed',
    'inspiring', 'impressive', 'cool', 'fun', 'like', 'liked', 'loving'
  ]

  // Negative keywords
  const negativeWords = [
    'hate', 'bad', 'terrible', 'awful', 'horrible', 'worst', 'sucks', 'boring', 'stupid',
    'dumb', 'lame', 'trash', 'garbage', 'disappointing', 'disappointed', 'poor', 'useless',
    'waste', 'annoying', 'irritating', 'ugly', 'disgusting', 'dislike', 'disliked', 'hate'
  ]

  // Amplifiers
  const amplifiers = ['very', 'really', 'extremely', 'super', 'so', 'absolutely', 'totally']

  // Negation words
  const negations = ["not", "no", "never", "don't", "doesn't", "didn't", "won't", "can't", "isn't", "aren't"]

  const words = lowerText.split(/\s+/)
  let positiveScore = 0
  let negativeScore = 0
  let amplifierMultiplier = 1

  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, '') // Remove punctuation

    // Check for amplifiers
    if (amplifiers.includes(word)) {
      amplifierMultiplier = 1.5
      continue
    }

    // Check for negations (flip sentiment)
    const hasNegation = i > 0 && negations.includes(words[i - 1])

    if (positiveWords.includes(word)) {
      if (hasNegation) {
        negativeScore += amplifierMultiplier
      } else {
        positiveScore += amplifierMultiplier
      }
    } else if (negativeWords.includes(word)) {
      if (hasNegation) {
        positiveScore += amplifierMultiplier
      } else {
        negativeScore += amplifierMultiplier
      }
    }

    amplifierMultiplier = 1 // Reset
  }

  // Calculate score (-1 to 1)
  const totalScore = positiveScore + negativeScore
  const score = totalScore > 0
    ? (positiveScore - negativeScore) / totalScore
    : 0

  // Determine sentiment
  let sentiment: Sentiment
  if (score > 0.2) {
    sentiment = 'positive'
  } else if (score < -0.2) {
    sentiment = 'negative'
  } else {
    sentiment = 'neutral'
  }

  // Confidence based on total score
  const confidence = Math.min(1, totalScore / 5)

  return {
    sentiment,
    score: parseFloat(score.toFixed(2)),
    confidence: parseFloat(confidence.toFixed(2)),
  }
}

/**
 * Analyze sentiment for multiple comments
 */
export function analyzeCommentsSentiment(comments: FormattedCommentData[]): {
  overall: SentimentAnalysis
  distribution: {
    positive: number
    neutral: number
    negative: number
  }
  percentages: {
    positive: number
    neutral: number
    negative: number
  }
} {
  if (comments.length === 0) {
    return {
      overall: { sentiment: 'neutral', score: 0, confidence: 0 },
      distribution: { positive: 0, neutral: 0, negative: 0 },
      percentages: { positive: 0, neutral: 0, negative: 0 },
    }
  }

  const sentiments = comments.map(comment => analyzeSentiment(comment.text))

  const distribution = {
    positive: sentiments.filter(s => s.sentiment === 'positive').length,
    neutral: sentiments.filter(s => s.sentiment === 'neutral').length,
    negative: sentiments.filter(s => s.sentiment === 'negative').length,
  }

  const percentages = {
    positive: (distribution.positive / comments.length) * 100,
    neutral: (distribution.neutral / comments.length) * 100,
    negative: (distribution.negative / comments.length) * 100,
  }

  // Calculate overall score
  const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length

  return {
    overall: {
      sentiment: avgScore > 0.2 ? 'positive' : avgScore < -0.2 ? 'negative' : 'neutral',
      score: parseFloat(avgScore.toFixed(2)),
      confidence: parseFloat((sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length).toFixed(2)),
    },
    distribution,
    percentages: {
      positive: parseFloat(percentages.positive.toFixed(1)),
      neutral: parseFloat(percentages.neutral.toFixed(1)),
      negative: parseFloat(percentages.negative.toFixed(1)),
    },
  }
}

/**
 * Extract word frequency from comments (for word cloud)
 */
export function extractCommentKeywords(comments: FormattedCommentData[], minLength: number = 4): {
  word: string
  count: number
  sentiment: number
}[] {
  // Common stop words to exclude
  const stopWords = new Set([
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
    'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
    'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
    'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'into', 'year', 'your', 'some', 'could', 'them', 'see', 'other', 'than', 'then',
    'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after',
    'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new',
  ])

  const wordStats: Record<string, { count: number; totalSentiment: number }> = {}

  comments.forEach(comment => {
    const sentiment = analyzeSentiment(comment.text)
    const words = comment.text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= minLength && !stopWords.has(word))

    words.forEach(word => {
      if (!wordStats[word]) {
        wordStats[word] = { count: 0, totalSentiment: 0 }
      }
      wordStats[word].count++
      wordStats[word].totalSentiment += sentiment.score
    })
  })

  return Object.entries(wordStats)
    .map(([word, stats]) => ({
      word,
      count: stats.count,
      sentiment: parseFloat((stats.totalSentiment / stats.count).toFixed(2)),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 50) // Top 50 keywords
}

/**
 * Find top commenters
 */
export function getTopCommenters(comments: FormattedCommentData[]): {
  author: string
  commentCount: number
  totalLikes: number
  avgLikes: number
}[] {
  const authorStats: Record<string, { count: number; likes: number }> = {}

  comments.forEach(comment => {
    if (!authorStats[comment.author]) {
      authorStats[comment.author] = { count: 0, likes: 0 }
    }
    authorStats[comment.author].count++
    authorStats[comment.author].likes += comment.likes
  })

  return Object.entries(authorStats)
    .map(([author, stats]) => ({
      author,
      commentCount: stats.count,
      totalLikes: stats.likes,
      avgLikes: parseFloat((stats.likes / stats.count).toFixed(1)),
    }))
    .sort((a, b) => b.commentCount - a.commentCount)
    .slice(0, 10) // Top 10
}

/**
 * Calculate community engagement metrics
 */
export function calculateCommunityMetrics(
  comments: FormattedCommentData[],
  videoViews: number
): {
  commentRate: number
  avgCommentLikes: number
  avgReplies: number
  topCommentLikes: number
  engagementScore: number
  responseRate: number
} {
  if (comments.length === 0) {
    return {
      commentRate: 0,
      avgCommentLikes: 0,
      avgReplies: 0,
      topCommentLikes: 0,
      engagementScore: 0,
      responseRate: 0,
    }
  }

  const commentRate = (comments.length / videoViews) * 100
  const avgCommentLikes = comments.reduce((sum, c) => sum + c.likes, 0) / comments.length
  const avgReplies = comments.reduce((sum, c) => sum + c.replyCount, 0) / comments.length
  const topCommentLikes = Math.max(...comments.map(c => c.likes))

  // Comments with replies (indicates creator or community response)
  const commentsWithReplies = comments.filter(c => c.replyCount > 0).length
  const responseRate = (commentsWithReplies / comments.length) * 100

  // Engagement score (0-100)
  const engagementScore = Math.min(100,
    (commentRate * 10) + // Comment rate contribution
    (avgCommentLikes / 10) + // Avg likes contribution
    (avgReplies * 5) + // Reply activity contribution
    (responseRate / 2) // Response rate contribution
  )

  return {
    commentRate: parseFloat(commentRate.toFixed(4)),
    avgCommentLikes: parseFloat(avgCommentLikes.toFixed(1)),
    avgReplies: parseFloat(avgReplies.toFixed(1)),
    topCommentLikes,
    engagementScore: parseFloat(engagementScore.toFixed(1)),
    responseRate: parseFloat(responseRate.toFixed(1)),
  }
}

/**
 * Get comment activity timeline (comments per day/week)
 */
export function getCommentTimeline(comments: FormattedCommentData[]): {
  date: string
  count: number
}[] {
  const timeline: Record<string, number> = {}

  comments.forEach(comment => {
    const date = new Date(comment.publishedAt).toISOString().split('T')[0]
    timeline[date] = (timeline[date] || 0) + 1
  })

  return Object.entries(timeline)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Detect potentially toxic or spam comments
 */
export function detectProblematicComments(comments: FormattedCommentData[]): {
  toxic: FormattedCommentData[]
  spam: FormattedCommentData[]
} {
  const toxicKeywords = ['spam', 'scam', 'fake', 'bot', 'report', 'block']
  const toxic = comments.filter(comment => {
    const lowerText = comment.text.toLowerCase()
    return toxicKeywords.some(keyword => lowerText.includes(keyword)) ||
           comment.text.length < 10 || // Very short comments
           /(.)\1{4,}/.test(comment.text) // Repeated characters
  })

  // Spam detection: very similar comments or all caps
  const spam = comments.filter(comment => {
    const allCaps = comment.text === comment.text.toUpperCase() && comment.text.length > 20
    const hasSpamMarkers = /https?:\/\/|www\.|\.com|subscribe|check out my|click here/i.test(comment.text)
    return allCaps || hasSpamMarkers
  })

  return { toxic, spam }
}
