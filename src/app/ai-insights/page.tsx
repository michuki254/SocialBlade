'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Card } from '@/components'
import { getChannelById, getChannelByUsername, getChannelVideos } from '@/services/youtube'
import { extractChannelId, formatNumber } from '@/lib/youtube-utils'
import { getTrackedChannels } from '@/lib/storage'
import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'
import Image from 'next/image'

interface ContentRecommendation {
  topic: string
  reason: string
  trendScore: number
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedViews: string
}

interface UploadTimeAnalysis {
  bestDays: string[]
  bestHours: number[]
  reasoning: string
  confidence: number
  timezone: string
}

interface ABTestSuggestion {
  element: 'title' | 'thumbnail'
  variantA: string
  variantB: string
  hypothesis: string
  expectedImpact: string
}

interface GrowthPrediction {
  timeframe: string
  predictedSubscribers: number
  predictedViews: number
  confidence: number
  factors: string[]
  recommendations: string[]
}

interface CompetitorInsight {
  strategy: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  actionableAdvice: string[]
}

export default function AIInsightsPage() {
  const [channelInput, setChannelInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<FormattedChannelData | null>(null)
  const [videos, setVideos] = useState<FormattedVideoData[]>([])
  const [trackedChannels, setTrackedChannels] = useState<ReturnType<typeof getTrackedChannels>>([])
  const [activeInsight, setActiveInsight] = useState<'content' | 'upload' | 'ab-test' | 'growth' | 'competitor'>('content')

  // Insights data
  const [contentRecs, setContentRecs] = useState<ContentRecommendation[]>([])
  const [uploadTime, setUploadTime] = useState<UploadTimeAnalysis | null>(null)
  const [abTests, setABTests] = useState<ABTestSuggestion[]>([])
  const [growth, setGrowth] = useState<GrowthPrediction | null>(null)
  const [competitor, setCompetitor] = useState<CompetitorInsight | null>(null)

  useEffect(() => {
    setTrackedChannels(getTrackedChannels())
  }, [])

  const handleLoadChannel = async () => {
    if (!channelInput.trim()) {
      setError('Please enter a channel URL, ID, or username')
      return
    }

    setLoading(true)
    setError(null)

    try {
      let channel: FormattedChannelData | null = null
      const channelId = extractChannelId(channelInput)

      if (channelId) {
        if (channelId.startsWith('@')) {
          channel = await getChannelByUsername(channelId)
        } else {
          channel = await getChannelById(channelId)
        }
      } else {
        channel = await getChannelByUsername(channelInput)
      }

      if (!channel) {
        setError('Channel not found')
        return
      }

      setSelectedChannel(channel)

      // Fetch videos
      const channelVideos = await getChannelVideos(channel.id, 50)
      setVideos(channelVideos)

      // Load comprehensive insights
      await loadInsights(channel.id)

      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load channel')
    } finally {
      setLoading(false)
    }
  }

  const loadInsights = async (channelId: string) => {
    setInsightsLoading(true)
    setError(null)
    try {
      console.log('Fetching AI insights for channel:', channelId)

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId,
          insightType: 'comprehensive'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('AI insights received:', data)

      setContentRecs(data.contentRecommendations || [])
      setUploadTime(data.uploadTimeAnalysis || null)
      setABTests(data.abTestSuggestions || [])
      setGrowth(data.growthPrediction || null)
    } catch (err: any) {
      console.error('Error loading AI insights:', err)
      setError(err.message || 'Failed to generate AI insights. Please check your OpenAI API key.')
    } finally {
      setInsightsLoading(false)
    }
  }

  const loadCompetitorInsights = async () => {
    if (!selectedChannel) return
    if (trackedChannels.length < 2) {
      setError('You need at least 2 tracked channels for competitor analysis')
      return
    }

    setLoading(true)
    try {
      const competitorIds = trackedChannels
        .filter(c => c.id !== selectedChannel.id)
        .map(c => c.id)
        .slice(0, 3)

      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channelId: selectedChannel.id,
          insightType: 'competitor-analysis',
          competitors: competitorIds
        })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze competitors')
      }

      const data = await response.json()
      setCompetitor(data.insight || null)
      setActiveInsight('competitor')
    } catch (err: any) {
      setError(err.message || 'Failed to analyze competitors')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-babu/20 text-babu'
      case 'medium': return 'bg-arches/20 text-arches'
      case 'hard': return 'bg-rausch/20 text-rausch'
      default: return 'bg-hof/20 text-hof'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleLoadChannel()
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-br from-rausch to-arches text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
            </svg>
            <h1 className="text-headline-1 font-bold">
              AI-Powered Insights
            </h1>
          </div>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Get intelligent recommendations powered by GPT-4 to grow your channel faster.
          </p>

          {/* Channel Input */}
          <div className="max-w-3xl">
            <div className="flex gap-4">
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
              <Button onClick={handleLoadChannel} size="large" disabled={loading}>
                {loading ? 'Analyzing...' : 'Generate Insights'}
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {selectedChannel ? (
            <div className="space-y-8">
              {/* Channel Header */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-hof/10">
                        {selectedChannel.thumbnail && (
                          <Image
                            src={selectedChannel.thumbnail}
                            alt={selectedChannel.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div>
                        <h2 className="font-bold text-headline-2 text-hof">
                          {selectedChannel.title}
                        </h2>
                        <p className="text-small text-foggy">
                          {formatNumber(selectedChannel.subscribers)} subscribers • {formatNumber(selectedChannel.videoCount)} videos
                        </p>
                      </div>
                    </div>
                    {trackedChannels.length >= 2 && (
                      <Button
                        variant="secondary"
                        onClick={loadCompetitorInsights}
                        disabled={loading}
                        suppressHydrationWarning
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                        Analyze Competitors
                      </Button>
                    )}
                  </div>
                </div>
              </Card>

              {/* Insights Tabs */}
              <Card>
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Button
                      variant={activeInsight === 'content' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => setActiveInsight('content')}
                      suppressHydrationWarning
                    >
                      Content Ideas
                    </Button>
                    <Button
                      variant={activeInsight === 'upload' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => setActiveInsight('upload')}
                      suppressHydrationWarning
                    >
                      Upload Timing
                    </Button>
                    <Button
                      variant={activeInsight === 'ab-test' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => setActiveInsight('ab-test')}
                      suppressHydrationWarning
                    >
                      A/B Testing
                    </Button>
                    <Button
                      variant={activeInsight === 'growth' ? 'primary' : 'secondary'}
                      size="small"
                      onClick={() => setActiveInsight('growth')}
                      suppressHydrationWarning
                    >
                      Growth Forecast
                    </Button>
                    {competitor && (
                      <Button
                        variant={activeInsight === 'competitor' ? 'primary' : 'secondary'}
                        size="small"
                        onClick={() => setActiveInsight('competitor')}
                        suppressHydrationWarning
                      >
                        Competitor Analysis
                      </Button>
                    )}
                  </div>

                  {/* Content Recommendations */}
                  {activeInsight === 'content' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-headline-3 text-hof mb-4">
                        Content Recommendations
                      </h3>
                      {insightsLoading ? (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rausch border-t-transparent mb-4"></div>
                          <p className="text-foggy">Generating AI recommendations...</p>
                          <p className="text-caption text-foggy mt-2">This may take 10-15 seconds</p>
                        </div>
                      ) : contentRecs.length > 0 ? (
                        <div className="grid gap-4">
                          {contentRecs.map((rec, idx) => (
                            <div key={idx} className="p-4 bg-background rounded-standard border border-hof/10">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-body text-hof flex-1">
                                  {rec.topic}
                                </h4>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded text-caption font-semibold ${getDifficultyColor(rec.difficulty)}`}>
                                    {rec.difficulty.toUpperCase()}
                                  </span>
                                  <div className="flex items-center gap-1 text-arches">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="text-small font-bold">{rec.trendScore}/10</span>
                                  </div>
                                </div>
                              </div>
                              <p className="text-small text-foggy mb-2">{rec.reason}</p>
                              <p className="text-caption text-babu font-medium">
                                Est. Views: {rec.estimatedViews}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-foggy text-center py-8">No recommendations available. Try generating insights again.</p>
                      )}
                    </div>
                  )}

                  {/* Upload Time Analysis */}
                  {activeInsight === 'upload' && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-headline-3 text-hof mb-4">
                        Best Time to Upload
                      </h3>
                      {insightsLoading ? (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-babu border-t-transparent mb-4"></div>
                          <p className="text-foggy">Analyzing upload patterns...</p>
                          <p className="text-caption text-foggy mt-2">This may take 10-15 seconds</p>
                        </div>
                      ) : uploadTime ? (
                        <>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-babu/10 rounded-standard">
                          <h4 className="font-semibold text-body text-babu mb-3">Best Days</h4>
                          <div className="space-y-2">
                            {uploadTime.bestDays.map((day, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-babu" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-body font-medium text-hof">{day}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-6 bg-arches/10 rounded-standard">
                          <h4 className="font-semibold text-body text-arches mb-3">Best Hours ({uploadTime.timezone})</h4>
                          <div className="space-y-2">
                            {uploadTime.bestHours.map((hour, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <svg className="w-5 h-5 text-arches" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span className="text-body font-medium text-hof">{hour}:00</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="p-4 bg-background rounded-standard border border-hof/10">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-body font-semibold text-hof">AI Analysis:</span>
                          <span className={`px-2 py-1 rounded text-caption font-semibold ${
                            uploadTime.confidence >= 70 ? 'bg-babu/20 text-babu' :
                            uploadTime.confidence >= 40 ? 'bg-arches/20 text-arches' :
                            'bg-foggy/20 text-foggy'
                          }`}>
                            {uploadTime.confidence}% Confidence
                          </span>
                        </div>
                        <p className="text-small text-foggy">{uploadTime.reasoning}</p>
                      </div>
                        </>
                      ) : (
                        <p className="text-foggy text-center py-8">No upload time data available. Try generating insights again.</p>
                      )}
                    </div>
                  )}

                  {/* A/B Testing Suggestions */}
                  {activeInsight === 'ab-test' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-headline-3 text-hof mb-4">
                        A/B Testing Suggestions
                      </h3>
                      {insightsLoading ? (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-arches border-t-transparent mb-4"></div>
                          <p className="text-foggy">Generating A/B test ideas...</p>
                          <p className="text-caption text-foggy mt-2">This may take 10-15 seconds</p>
                        </div>
                      ) : abTests.length > 0 ? (
                        <div className="grid gap-4">
                          {abTests.map((test, idx) => (
                            <div key={idx} className="p-6 bg-background rounded-standard border border-hof/10">
                              <div className="flex items-center gap-2 mb-4">
                                <span className={`px-3 py-1 rounded text-caption font-bold ${
                                  test.element === 'title' ? 'bg-rausch/20 text-rausch' : 'bg-babu/20 text-babu'
                                }`}>
                                  {test.element.toUpperCase()}
                                </span>
                                <h4 className="font-semibold text-body text-hof">Test #{idx + 1}</h4>
                              </div>
                              <div className="grid md:grid-cols-2 gap-4 mb-4">
                                <div className="p-4 bg-hof/5 rounded-standard">
                                  <p className="text-caption text-foggy mb-1">Variant A</p>
                                  <p className="text-small text-hof font-medium">{test.variantA}</p>
                                </div>
                                <div className="p-4 bg-hof/5 rounded-standard">
                                  <p className="text-caption text-foggy mb-1">Variant B</p>
                                  <p className="text-small text-hof font-medium">{test.variantB}</p>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-caption text-foggy">Hypothesis:</p>
                                  <p className="text-small text-hof">{test.hypothesis}</p>
                                </div>
                                <div>
                                  <p className="text-caption text-foggy">Expected Impact:</p>
                                  <p className="text-small text-babu font-medium">{test.expectedImpact}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-foggy text-center py-8">No A/B test suggestions available. Try generating insights again.</p>
                      )}
                    </div>
                  )}

                  {/* Growth Prediction */}
                  {activeInsight === 'growth' && (
                    <div className="space-y-6">
                      <h3 className="font-bold text-headline-3 text-hof mb-4">
                        Growth Forecast
                      </h3>
                      {insightsLoading ? (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-babu border-t-transparent mb-4"></div>
                          <p className="text-foggy">Analyzing growth patterns...</p>
                          <p className="text-caption text-foggy mt-2">This may take 10-15 seconds</p>
                        </div>
                      ) : growth ? (
                        <>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-gradient-to-br from-babu/20 to-babu/5 rounded-standard">
                          <p className="text-caption text-foggy mb-2">Predicted Subscribers</p>
                          <p className="text-headline-2 font-bold text-babu">
                            {formatNumber(growth.predictedSubscribers)}
                          </p>
                          <p className="text-small text-foggy mt-1">
                            +{formatNumber(growth.predictedSubscribers - selectedChannel.subscribers)} from current
                          </p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-arches/20 to-arches/5 rounded-standard">
                          <p className="text-caption text-foggy mb-2">Predicted Total Views</p>
                          <p className="text-headline-2 font-bold text-arches">
                            {formatNumber(growth.predictedViews)}
                          </p>
                          <p className="text-small text-foggy mt-1">
                            +{formatNumber(growth.predictedViews - selectedChannel.totalViews)} from current
                          </p>
                        </div>
                      </div>
                      <div className="p-4 bg-background rounded-standard border border-hof/10">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-body font-semibold text-hof">Confidence:</span>
                          <div className="flex-1 bg-hof/10 rounded-full h-2">
                            <div
                              className="bg-babu rounded-full h-2"
                              style={{ width: `${growth.confidence}%` }}
                            />
                          </div>
                          <span className="text-small font-bold text-babu">{growth.confidence}%</span>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h5 className="font-semibold text-small text-hof mb-2">Growth Factors:</h5>
                            <ul className="space-y-1">
                              {growth.factors.map((factor, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-small text-foggy">
                                  <svg className="w-4 h-4 mt-0.5 text-babu flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-semibold text-small text-hof mb-2">Recommendations:</h5>
                            <ul className="space-y-1">
                              {growth.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-small text-foggy">
                                  <svg className="w-4 h-4 mt-0.5 text-arches flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                  </svg>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                        </>
                      ) : (
                        <p className="text-foggy text-center py-8">No growth forecast available. Ensure you have historical data tracked.</p>
                      )}
                    </div>
                  )}

                  {/* Competitor Analysis */}
                  {activeInsight === 'competitor' && (
                    insightsLoading || loading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rausch border-t-transparent mb-4"></div>
                        <p className="text-foggy">Analyzing competitors...</p>
                        <p className="text-caption text-foggy mt-2">This may take 15-20 seconds</p>
                      </div>
                    ) : competitor ? (
                      <>

                    <div className="space-y-6">
                      <h3 className="font-bold text-headline-3 text-hof mb-4">
                        Competitive Analysis
                      </h3>
                      <div className="p-6 bg-background rounded-standard border border-hof/10">
                        <h4 className="font-semibold text-body text-hof mb-2">Strategy Overview</h4>
                        <p className="text-small text-foggy">{competitor.strategy}</p>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 bg-babu/10 rounded-standard">
                          <h5 className="font-semibold text-small text-babu mb-3">Strengths</h5>
                          <ul className="space-y-2">
                            {competitor.strengths.map((s, idx) => (
                              <li key={idx} className="text-small text-hof flex items-start gap-2">
                                <span className="text-babu mt-1">✓</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-rausch/10 rounded-standard">
                          <h5 className="font-semibold text-small text-rausch mb-3">Weaknesses</h5>
                          <ul className="space-y-2">
                            {competitor.weaknesses.map((w, idx) => (
                              <li key={idx} className="text-small text-hof flex items-start gap-2">
                                <span className="text-rausch mt-1">!</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-4 bg-arches/10 rounded-standard">
                          <h5 className="font-semibold text-small text-arches mb-3">Opportunities</h5>
                          <ul className="space-y-2">
                            {competitor.opportunities.map((o, idx) => (
                              <li key={idx} className="text-small text-hof flex items-start gap-2">
                                <span className="text-arches mt-1">→</span>
                                {o}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="p-6 bg-gradient-to-br from-rausch/10 to-transparent rounded-standard border-l-4 border-rausch">
                        <h5 className="font-semibold text-body text-hof mb-3">Actionable Recommendations</h5>
                        <ul className="space-y-2">
                          {competitor.actionableAdvice.map((advice, idx) => (
                            <li key={idx} className="flex items-start gap-3 text-small text-foggy">
                              <span className="bg-rausch text-white rounded-full w-6 h-6 flex items-center justify-center text-caption font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              {advice}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                      </>
                    ) : (
                      <p className="text-foggy text-center py-8">No competitor analysis available. Click "Analyze Competitors" button above.</p>
                    )
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="w-24 h-24 mx-auto text-foggy/30 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                AI-Powered Channel Insights
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Enter a channel above to get intelligent recommendations powered by GPT-4.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
