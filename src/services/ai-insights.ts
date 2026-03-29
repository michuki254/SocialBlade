import OpenAI from 'openai'
import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'
import type { Forecast } from '@/lib/forecasting'

// This service runs server-side only
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY is not set. AI features will not work.')
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
})

export interface ContentRecommendation {
  topic: string
  reason: string
  trendScore: number
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedViews: string
}

export interface UploadTimeAnalysis {
  bestDays: string[]
  bestHours: number[]
  reasoning: string
  confidence: number
  timezone: string
}

export interface ABTestSuggestion {
  element: 'title' | 'thumbnail'
  variantA: string
  variantB: string
  hypothesis: string
  expectedImpact: string
}

export interface GrowthPrediction {
  timeframe: string
  predictedSubscribers: number
  predictedViews: number
  confidence: number
  factors: string[]
  recommendations: string[]
}

export interface CompetitorInsight {
  strategy: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  actionableAdvice: string[]
}

/**
 * Generate content recommendations based on channel data
 */
export async function generateContentRecommendations(
  channel: FormattedChannelData,
  recentVideos: FormattedVideoData[]
): Promise<ContentRecommendation[]> {
  try {
    const videoTitles = recentVideos.slice(0, 10).map(v => v.title).join('\n- ')
    const avgViews = recentVideos.length > 0
      ? recentVideos.reduce((sum, v) => sum + v.views, 0) / recentVideos.length
      : 0

    const prompt = `You are a YouTube analytics expert. Analyze this channel and suggest 5 content ideas.

Channel: ${channel.title}
Subscribers: ${channel.subscribers.toLocaleString()}
Total Views: ${channel.totalViews.toLocaleString()}
Average Views per Video: ${avgViews.toLocaleString()}

Recent Video Titles:
- ${videoTitles}

Based on this data, suggest 5 specific content ideas that would perform well for this channel. For each suggestion, provide:
1. Topic (specific video idea)
2. Reason (why this would work)
3. Trend Score (1-10, how trending this topic is)
4. Difficulty (easy/medium/hard to produce)
5. Estimated Views (range)

Respond in JSON format as an array of objects with keys: topic, reason, trendScore, difficulty, estimatedViews.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) return []

    const data = JSON.parse(content)
    return data.recommendations || data.suggestions || []
  } catch (error) {
    console.error('Error generating content recommendations:', error)
    return []
  }
}

/**
 * Analyze best time to upload based on channel data
 */
export async function analyzeBestUploadTime(
  channel: FormattedChannelData,
  videos: FormattedVideoData[]
): Promise<UploadTimeAnalysis> {
  try {
    // Group videos by day and hour
    const videosByDay: Record<string, number[]> = {}
    const videosByHour: Record<number, number[]> = {}

    videos.forEach(video => {
      const date = new Date(video.publishedAt)
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      const hour = date.getHours()

      if (!videosByDay[day]) videosByDay[day] = []
      if (!videosByHour[hour]) videosByHour[hour] = []

      videosByDay[day].push(video.views)
      videosByHour[hour].push(video.views)
    })

    const dayStats = Object.entries(videosByDay).map(([day, views]) => ({
      day,
      avgViews: views.reduce((a, b) => a + b, 0) / views.length,
      count: views.length
    }))

    const hourStats = Object.entries(videosByHour).map(([hour, views]) => ({
      hour: parseInt(hour),
      avgViews: views.reduce((a, b) => a + b, 0) / views.length,
      count: views.length
    }))

    const prompt = `You are a YouTube analytics expert. Analyze the upload timing data and provide recommendations.

Channel: ${channel.title}
Total Videos Analyzed: ${videos.length}

Upload Performance by Day:
${dayStats.map(s => `${s.day}: ${s.avgViews.toLocaleString()} avg views (${s.count} videos)`).join('\n')}

Upload Performance by Hour (24h format):
${hourStats.map(s => `${s.hour}:00: ${s.avgViews.toLocaleString()} avg views (${s.count} videos)`).join('\n')}

Provide a detailed analysis with:
1. Best 3 days to upload
2. Best 3 hours to upload (in 24h format)
3. Detailed reasoning based on the data
4. Confidence level (0-100)
5. Timezone assumption

Respond in JSON format with keys: bestDays (array), bestHours (array of numbers), reasoning (string), confidence (number), timezone (string).`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return {
        bestDays: ['Monday', 'Wednesday', 'Friday'],
        bestHours: [10, 14, 18],
        reasoning: 'Unable to analyze data',
        confidence: 0,
        timezone: 'UTC'
      }
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error analyzing upload time:', error)
    return {
      bestDays: ['Monday', 'Wednesday', 'Friday'],
      bestHours: [10, 14, 18],
      reasoning: 'Error analyzing data',
      confidence: 0,
      timezone: 'UTC'
    }
  }
}

/**
 * Generate A/B testing suggestions for titles and thumbnails
 */
export async function generateABTestSuggestions(
  video: FormattedVideoData,
  channelVideos: FormattedVideoData[]
): Promise<ABTestSuggestion[]> {
  try {
    const topVideos = channelVideos
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map(v => `"${v.title}" - ${v.views.toLocaleString()} views`)
      .join('\n')

    const prompt = `You are a YouTube optimization expert. Suggest A/B tests to improve this video's performance.

Current Video: "${video.title}"
Current Views: ${video.views.toLocaleString()}
Current Likes: ${video.likes.toLocaleString()}
CTR Data: Not available (suggest improvements anyway)

Top Performing Videos on Channel:
${topVideos}

Suggest 3 A/B tests:
1. One for the title (create two variant titles)
2. One for thumbnail concept (describe two different thumbnail ideas)
3. One additional optimization test

For each test provide:
- element: "title" or "thumbnail"
- variantA: First option
- variantB: Second option
- hypothesis: Why this test matters
- expectedImpact: What improvement to expect

Respond in JSON format as an array of objects.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    })

    const content = response.choices[0].message.content
    if (!content) return []

    const data = JSON.parse(content)
    return data.tests || data.suggestions || []
  } catch (error) {
    console.error('Error generating A/B test suggestions:', error)
    return []
  }
}

/**
 * Generate growth predictions with AI analysis
 */
export async function generateGrowthPredictions(
  channel: FormattedChannelData,
  historicalData: any[],
  forecast?: Forecast
): Promise<GrowthPrediction> {
  try {
    const growthRate = historicalData.length >= 2
      ? ((historicalData[historicalData.length - 1].subscribers - historicalData[0].subscribers) / historicalData[0].subscribers) * 100
      : 0

    const prompt = `You are a YouTube growth strategist. Predict the channel's growth trajectory.

Channel: ${channel.title}
Current Subscribers: ${channel.subscribers.toLocaleString()}
Current Views: ${channel.totalViews.toLocaleString()}
Current Videos: ${channel.videoCount}
Historical Growth Rate: ${growthRate.toFixed(2)}% over ${historicalData.length} snapshots
${forecast ? `Forecast Confidence: ${forecast.confidence}` : ''}

Historical Data Points:
${historicalData.map((d, i) => `${i + 1}. ${d.subscribers.toLocaleString()} subs, ${d.totalViews.toLocaleString()} views`).join('\n')}

Provide predictions for:
1. Next 30 days
2. Next 90 days
3. Next 365 days

For each timeframe, predict:
- Subscriber count
- Total view count
- Confidence level (0-100)
- Key growth factors
- Actionable recommendations

Respond in JSON format with keys: predictions (array with timeframe, predictedSubscribers, predictedViews, confidence, factors, recommendations).`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return {
        timeframe: '30 days',
        predictedSubscribers: channel.subscribers,
        predictedViews: channel.totalViews,
        confidence: 0,
        factors: [],
        recommendations: []
      }
    }

    const data = JSON.parse(content)
    const predictions = data.predictions || []
    return predictions[0] || {
      timeframe: '30 days',
      predictedSubscribers: channel.subscribers,
      predictedViews: channel.totalViews,
      confidence: 0,
      factors: [],
      recommendations: []
    }
  } catch (error) {
    console.error('Error generating growth predictions:', error)
    return {
      timeframe: '30 days',
      predictedSubscribers: channel.subscribers,
      predictedViews: channel.totalViews,
      confidence: 0,
      factors: ['Error generating predictions'],
      recommendations: []
    }
  }
}

/**
 * Analyze competitor strategies
 */
export async function analyzeCompetitorStrategy(
  mainChannel: FormattedChannelData,
  competitors: FormattedChannelData[],
  mainVideos: FormattedVideoData[],
  competitorVideos: FormattedVideoData[][]
): Promise<CompetitorInsight> {
  try {
    const competitorSummaries = competitors.map((comp, idx) => {
      const vids = competitorVideos[idx] || []
      const avgViews = vids.length > 0 ? vids.reduce((sum, v) => sum + v.views, 0) / vids.length : 0
      return `${comp.title}: ${comp.subscribers.toLocaleString()} subs, avg ${avgViews.toLocaleString()} views/video`
    }).join('\n')

    const mainAvgViews = mainVideos.length > 0
      ? mainVideos.reduce((sum, v) => sum + v.views, 0) / mainVideos.length
      : 0

    const prompt = `You are a competitive intelligence analyst for YouTube. Analyze the competitive landscape.

Main Channel: ${mainChannel.title}
Subscribers: ${mainChannel.subscribers.toLocaleString()}
Average Views: ${mainAvgViews.toLocaleString()}

Competitors:
${competitorSummaries}

Recent Content Themes (Main):
${mainVideos.slice(0, 5).map(v => `- ${v.title}`).join('\n')}

Provide a competitive analysis with:
1. Overall strategy summary
2. Key strengths (3-5 points)
3. Weaknesses or gaps (3-5 points)
4. Opportunities to exploit (3-5 points)
5. Actionable advice (5-7 specific recommendations)

Respond in JSON format with keys: strategy, strengths (array), weaknesses (array), opportunities (array), actionableAdvice (array).`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return {
        strategy: 'Unable to analyze',
        strengths: [],
        weaknesses: [],
        opportunities: [],
        actionableAdvice: []
      }
    }

    return JSON.parse(content)
  } catch (error) {
    console.error('Error analyzing competitor strategy:', error)
    return {
      strategy: 'Error analyzing competitors',
      strengths: [],
      weaknesses: [],
      opportunities: [],
      actionableAdvice: []
    }
  }
}

/**
 * Generate comprehensive insights combining all AI features
 */
export async function generateComprehensiveInsights(
  channel: FormattedChannelData,
  videos: FormattedVideoData[],
  historicalData?: any[],
  competitors?: FormattedChannelData[]
) {
  const [
    contentRecs,
    uploadTime,
    abTests,
    growth,
  ] = await Promise.all([
    generateContentRecommendations(channel, videos),
    analyzeBestUploadTime(channel, videos),
    videos.length > 0 ? generateABTestSuggestions(videos[0], videos) : Promise.resolve([]),
    historicalData && historicalData.length > 0
      ? generateGrowthPredictions(channel, historicalData)
      : Promise.resolve(null),
  ])

  return {
    contentRecommendations: contentRecs,
    uploadTimeAnalysis: uploadTime,
    abTestSuggestions: abTests,
    growthPrediction: growth,
  }
}
