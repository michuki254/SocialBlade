import { NextRequest, NextResponse } from 'next/server'
import {
  generateContentRecommendations,
  analyzeBestUploadTime,
  generateABTestSuggestions,
  generateGrowthPredictions,
  analyzeCompetitorStrategy,
} from '@/services/ai-insights'
import { getChannelById, getChannelVideos } from '@/services/youtube'
import { getChannelSnapshotsById } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, insightType, videoId, competitors } = body

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID is required' }, { status: 400 })
    }

    // Fetch channel data
    const channel = await getChannelById(channelId)
    if (!channel) {
      return NextResponse.json({ error: 'Channel not found' }, { status: 404 })
    }

    const videos = await getChannelVideos(channelId, 50)

    switch (insightType) {
      case 'content-recommendations': {
        const recommendations = await generateContentRecommendations(channel, videos)
        return NextResponse.json({ recommendations })
      }

      case 'upload-time': {
        const analysis = await analyzeBestUploadTime(channel, videos)
        return NextResponse.json({ analysis })
      }

      case 'ab-testing': {
        if (!videoId) {
          return NextResponse.json({ error: 'Video ID is required for A/B testing' }, { status: 400 })
        }
        const video = videos.find(v => v.id === videoId)
        if (!video) {
          return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }
        const suggestions = await generateABTestSuggestions(video, videos)
        return NextResponse.json({ suggestions })
      }

      case 'growth-prediction': {
        const historicalData = getChannelSnapshotsById(channelId)
        const prediction = await generateGrowthPredictions(
          channel,
          historicalData.map(s => s.data)
        )
        return NextResponse.json({ prediction })
      }

      case 'competitor-analysis': {
        if (!competitors || !Array.isArray(competitors)) {
          return NextResponse.json({ error: 'Competitor IDs required' }, { status: 400 })
        }

        const competitorChannels = await Promise.all(
          competitors.map(id => getChannelById(id))
        )
        const validCompetitors = competitorChannels.filter(c => c !== null) as typeof channel[]

        const competitorVideos = await Promise.all(
          validCompetitors.map(c => getChannelVideos(c.id, 20))
        )

        const insight = await analyzeCompetitorStrategy(
          channel,
          validCompetitors,
          videos,
          competitorVideos
        )
        return NextResponse.json({ insight })
      }

      case 'comprehensive': {
        const historicalData = getChannelSnapshotsById(channelId)

        const [
          contentRecs,
          uploadTime,
          abTests,
          growth,
        ] = await Promise.all([
          generateContentRecommendations(channel, videos),
          analyzeBestUploadTime(channel, videos),
          videos.length > 0 ? generateABTestSuggestions(videos[0], videos) : Promise.resolve([]),
          historicalData.length > 0
            ? generateGrowthPredictions(channel, historicalData.map(s => s.data))
            : Promise.resolve(null),
        ])

        return NextResponse.json({
          contentRecommendations: contentRecs,
          uploadTimeAnalysis: uploadTime,
          abTestSuggestions: abTests,
          growthPrediction: growth,
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid insight type' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('AI Insights API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
