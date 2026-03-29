'use client'

import { useState } from 'react'
import { Button, Input, Card, RevenueChart } from '@/components'
import { getVideoById, getChannelById, getChannelByUsername } from '@/services/youtube'
import { extractVideoId, extractChannelId, formatNumber, formatNumberWithCommas } from '@/lib/youtube-utils'
import {
  estimateVideoRevenue,
  estimateChannelRevenue,
  calculateRPM,
  checkMonetizationEligibility,
  forecastRevenue,
  getMonetizationHealthScore,
  getRevenueOptimizationTips,
  REVENUE_CONSTANTS,
} from '@/lib/revenue-estimator'
import type { FormattedVideoData, FormattedChannelData } from '@/types/youtube'
import Image from 'next/image'

type AnalysisType = 'video' | 'channel'

export default function MonetizationPage() {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('video')
  const [input, setInput] = useState('')
  const [video, setVideo] = useState<FormattedVideoData | null>(null)
  const [channel, setChannel] = useState<FormattedChannelData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError(`Please enter a ${analysisType} URL or ID`)
      return
    }

    setLoading(true)
    setError(null)
    setVideo(null)
    setChannel(null)

    try {
      if (analysisType === 'video') {
        const videoId = extractVideoId(input)
        if (!videoId) {
          setError('Invalid video URL or ID')
          setLoading(false)
          return
        }

        const videoData = await getVideoById(videoId)
        if (!videoData) {
          setError('Video not found')
          setLoading(false)
          return
        }

        setVideo(videoData)
      } else {
        const channelId = extractChannelId(input)
        let channelData: FormattedChannelData | null = null

        if (channelId) {
          if (channelId.startsWith('@')) {
            channelData = await getChannelByUsername(channelId)
          } else {
            channelData = await getChannelById(channelId)
          }
        } else {
          channelData = await getChannelByUsername(input)
        }

        if (!channelData) {
          setError('Channel not found')
          setLoading(false)
          return
        }

        setChannel(channelData)
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  // Calculate video revenue data
  const videoRevenue = video ? estimateVideoRevenue(video) : null
  const videoHealthScore = video && channel ? getMonetizationHealthScore(video, channel.subscribers) : null
  const videoOptimizationTips = video && channel ? getRevenueOptimizationTips(video, channel.subscribers) : []

  // Calculate channel revenue data
  const channelRevenue = channel ? estimateChannelRevenue(channel) : null
  const channelEligibility = channel ? checkMonetizationEligibility(channel) : null
  const revenueForecast = channelRevenue ? forecastRevenue(channelRevenue.estimatedMonthlyRevenue) : null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Revenue Estimator
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Estimate potential earnings from YouTube videos and channels based on industry averages.
          </p>

          {/* Analysis Type Toggle */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setAnalysisType('video')}
              className={`px-6 py-2 rounded-standard font-medium transition-all ${
                analysisType === 'video'
                  ? 'bg-white text-rausch'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              suppressHydrationWarning
            >
              Video Revenue
            </button>
            <button
              onClick={() => setAnalysisType('channel')}
              className={`px-6 py-2 rounded-standard font-medium transition-all ${
                analysisType === 'channel'
                  ? 'bg-white text-rausch'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
              suppressHydrationWarning
            >
              Channel Revenue
            </button>
          </div>

          {/* Search Input */}
          <div className="flex gap-4 max-w-3xl">
            <div className="flex-1">
              <Input
                type="text"
                placeholder={analysisType === 'video' ? 'Enter video URL or ID...' : 'Enter channel URL, ID, or @username...'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white"
              />
            </div>
            <Button onClick={handleAnalyze} size="large" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze'}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-white/10 rounded-standard">
            <p className="text-white/80 text-small">
              <strong>Note:</strong> These are estimated earnings based on industry averages (CPM: ${REVENUE_CONSTANTS.CPM_LOW} - ${REVENUE_CONSTANTS.CPM_HIGH}).
              Actual revenue varies significantly based on content type, audience demographics, advertiser demand, and other factors.
            </p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {/* Video Revenue Analysis */}
          {video && videoRevenue && (
            <div className="space-y-8">
              {/* Video Info Header */}
              <Card>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative aspect-video bg-hof/10 rounded-standard overflow-hidden">
                      {video.thumbnail && (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <h2 className="text-headline-2 font-bold text-hof mb-2">
                        {video.title}
                      </h2>
                      <p className="text-body text-foggy mb-4">{video.channelTitle}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-caption text-foggy">Views</p>
                          <p className="font-semibold text-body text-hof">
                            {formatNumber(video.views)}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Monetized Views</p>
                          <p className="font-semibold text-body text-babu">
                            {formatNumber(videoRevenue.monetizedViews)}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Est. CPM</p>
                          <p className="font-semibold text-body text-arches">
                            ${videoRevenue.estimatedCPM}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Revenue Estimates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <div className="p-6 text-center">
                    <p className="text-foggy text-small mb-2">Low Estimate</p>
                    <p className="text-headline-2 font-bold text-hof mb-1">
                      ${formatNumberWithCommas(videoRevenue.estimatedRevenueLow)}
                    </p>
                    <p className="text-caption text-foggy">
                      CPM: ${REVENUE_CONSTANTS.CPM_LOW}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-6 text-center bg-babu/5">
                    <p className="text-foggy text-small mb-2">Average Estimate</p>
                    <p className="text-headline-1 font-bold text-babu mb-1">
                      ${formatNumberWithCommas(videoRevenue.estimatedRevenueAverage)}
                    </p>
                    <p className="text-caption text-foggy">
                      CPM: ${videoRevenue.estimatedCPM} | RPM: ${calculateRPM(videoRevenue.estimatedCPM)}
                    </p>
                  </div>
                </Card>

                <Card>
                  <div className="p-6 text-center">
                    <p className="text-foggy text-small mb-2">High Estimate</p>
                    <p className="text-headline-2 font-bold text-hof mb-1">
                      ${formatNumberWithCommas(videoRevenue.estimatedRevenueHigh)}
                    </p>
                    <p className="text-caption text-foggy">
                      CPM: ${REVENUE_CONSTANTS.CPM_HIGH}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Monetization Health Score */}
              {videoHealthScore && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Monetization Health Score
                    </h3>
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-body font-semibold text-hof">
                          {videoHealthScore.level} ({videoHealthScore.score}/100)
                        </span>
                      </div>
                      <div className="w-full bg-hof/10 rounded-full h-3">
                        <div
                          className="bg-babu h-3 rounded-full transition-all"
                          style={{ width: `${videoHealthScore.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videoHealthScore.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-background rounded-standard">
                          <span className="text-small text-hof">{factor.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-body font-semibold text-hof">
                              {factor.score.toFixed(0)}%
                            </span>
                            <span className={`w-3 h-3 rounded-full ${
                              factor.impact === 'positive' ? 'bg-babu' :
                              factor.impact === 'negative' ? 'bg-rausch' : 'bg-foggy'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Optimization Tips */}
              {videoOptimizationTips.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Revenue Optimization Tips
                    </h3>
                    <div className="space-y-3">
                      {videoOptimizationTips.map((tip, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-background rounded-standard">
                          <svg className="w-5 h-5 text-babu flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-small text-hof">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* Channel Revenue Analysis */}
          {channel && channelRevenue && channelEligibility && revenueForecast && (
            <div className="space-y-8">
              {/* Channel Header */}
              <Card>
                <div className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full overflow-hidden bg-hof/10">
                      {channel.thumbnail && (
                        <Image
                          src={channel.thumbnail}
                          alt={channel.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-headline-2 font-bold text-hof mb-2">
                        {channel.title}
                      </h2>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-caption text-foggy">Subscribers</p>
                          <p className="font-semibold text-body text-rausch">
                            {formatNumber(channel.subscribers)}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Total Views</p>
                          <p className="font-semibold text-body text-babu">
                            {formatNumber(channel.totalViews)}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Videos</p>
                          <p className="font-semibold text-body text-arches">
                            {formatNumber(channel.videoCount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Monetization Eligibility */}
              <Card>
                <div className="p-6">
                  <h3 className="text-headline-3 font-semibold text-hof mb-4">
                    YouTube Partner Program Eligibility
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-body text-hof">Subscriber Requirement</span>
                        <span className={`text-body font-semibold ${
                          channelEligibility.meetsSubscriberRequirement ? 'text-babu' : 'text-rausch'
                        }`}>
                          {channelEligibility.meetsSubscriberRequirement ? '✓ Met' : `${channelEligibility.subscribersRequired} needed`}
                        </span>
                      </div>
                      <div className="w-full bg-hof/10 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            channelEligibility.meetsSubscriberRequirement ? 'bg-babu' : 'bg-rausch'
                          }`}
                          style={{ width: `${Math.min(100, channelEligibility.subscribersProgress)}%` }}
                        />
                      </div>
                      <p className="text-caption text-foggy mt-1">
                        {formatNumber(channel.subscribers)} / 1,000 subscribers
                      </p>
                    </div>

                    <div className="p-4 bg-background rounded-standard">
                      <p className="text-small text-hof">
                        <strong>Watch Hours (Past 12 Months):</strong> {channelEligibility.estimatedWatchHoursNeeded}
                      </p>
                      <p className="text-caption text-foggy mt-1">
                        4,000 watch hours required (estimated based on available data)
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Total Revenue Estimates */}
              <div>
                <h3 className="text-headline-3 font-semibold text-hof mb-4">
                  Estimated Total Earnings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Low Estimate</p>
                      <p className="text-headline-3 font-bold text-hof">
                        ${formatNumber(channelRevenue.estimatedTotalRevenueLow)}
                      </p>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center bg-babu/5">
                      <p className="text-foggy text-small mb-2">Average Estimate</p>
                      <p className="text-headline-2 font-bold text-babu">
                        ${formatNumber(channelRevenue.estimatedTotalRevenueAverage)}
                      </p>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">High Estimate</p>
                      <p className="text-headline-3 font-bold text-hof">
                        ${formatNumber(channelRevenue.estimatedTotalRevenueHigh)}
                      </p>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center bg-arches/5">
                      <p className="text-foggy text-small mb-2">Monthly Revenue</p>
                      <p className="text-headline-3 font-bold text-arches">
                        ${formatNumber(channelRevenue.estimatedMonthlyRevenue)}
                      </p>
                    </div>
                  </Card>
                </div>
              </div>

              {/* Revenue Forecast */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Revenue Forecast (5% Growth)
                    </h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-background rounded-standard">
                        <span className="text-body text-hof">Next 30 Days</span>
                        <span className="text-body font-bold text-babu">
                          ${formatNumber(revenueForecast.next30Days)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background rounded-standard">
                        <span className="text-body text-hof">Next 60 Days</span>
                        <span className="text-body font-bold text-babu">
                          ${formatNumber(revenueForecast.next60Days)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-background rounded-standard">
                        <span className="text-body text-hof">Next 90 Days</span>
                        <span className="text-body font-bold text-babu">
                          ${formatNumber(revenueForecast.next90Days)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-babu/10 rounded-standard">
                        <span className="text-body font-semibold text-hof">Yearly Projection</span>
                        <span className="text-headline-3 font-bold text-babu">
                          ${formatNumber(revenueForecast.yearly)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Revenue Trend
                    </h3>
                    <RevenueChart
                      data={{
                        labels: ['Current', '30 Days', '60 Days', '90 Days'],
                        values: [
                          channelRevenue.estimatedMonthlyRevenue,
                          revenueForecast.next30Days,
                          revenueForecast.next60Days / 2,
                          revenueForecast.next90Days / 3,
                        ]
                      }}
                      type="line"
                      color="#00A699"
                    />
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!video && !channel && !loading && (
            <div className="text-center py-12">
              <div className="mb-6">
                <svg
                  className="w-24 h-24 mx-auto text-foggy/30"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                Analyze Revenue Potential
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Enter a video or channel above to estimate potential YouTube revenue based on views and engagement.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
