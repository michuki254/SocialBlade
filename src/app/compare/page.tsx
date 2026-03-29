'use client'

import { useState } from 'react'
import { Button, Input, Card, EngagementChart } from '@/components'
import { getVideoById } from '@/services/youtube'
import { extractVideoId } from '@/lib/youtube-utils'
import {
  calculateEngagementRate,
  calculateLikeRate,
  calculateCommentRate,
  calculateViewVelocity,
  calculateAverageMetrics,
  findBestPerformer,
} from '@/lib/engagement-metrics'
import type { FormattedVideoData } from '@/types/youtube'
import { formatNumber, formatNumberWithCommas } from '@/lib/youtube-utils'
import Image from 'next/image'

export default function CompareVideosPage() {
  const [videoInput, setVideoInput] = useState('')
  const [videos, setVideos] = useState<FormattedVideoData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddVideo = async () => {
    if (!videoInput.trim()) {
      setError('Please enter a video URL or ID')
      return
    }

    if (videos.length >= 5) {
      setError('Maximum 5 videos can be compared at once')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const videoId = extractVideoId(videoInput)

      if (!videoId) {
        setError('Invalid video URL or ID')
        setLoading(false)
        return
      }

      // Check if video already added
      if (videos.find(v => v.id === videoId)) {
        setError('This video has already been added')
        setLoading(false)
        return
      }

      const videoData = await getVideoById(videoId)

      if (!videoData) {
        setError('Video not found')
        setLoading(false)
        return
      }

      setVideos([...videos, videoData])
      setVideoInput('')
    } catch (err) {
      console.error('Error fetching video:', err)
      setError('Failed to fetch video data')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveVideo = (videoId: string) => {
    setVideos(videos.filter(v => v.id !== videoId))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddVideo()
    }
  }

  const averageMetrics = calculateAverageMetrics(videos)
  const bestByViews = findBestPerformer(videos, 'views')
  const bestByEngagement = findBestPerformer(videos, 'engagement')

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Compare Videos
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Compare up to 5 videos side-by-side to analyze performance, engagement, and growth metrics.
          </p>

          {/* Add Video Input */}
          <div className="flex gap-4 max-w-3xl">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter video URL or ID..."
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white"
              />
            </div>
            <Button
              onClick={handleAddVideo}
              size="large"
              disabled={loading || videos.length >= 5}
            >
              {loading ? 'Adding...' : 'Add Video'}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}

          {/* Video Count */}
          {videos.length > 0 && (
            <div className="mt-4">
              <p className="text-white/80 text-small">
                {videos.length} of 5 videos added
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Results */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {videos.length === 0 && !loading && (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                Add Videos to Compare
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Enter video URLs or IDs above to start comparing performance metrics across multiple videos.
              </p>
            </div>
          )}

          {videos.length > 0 && (
            <div className="space-y-8">
              {/* Summary Stats */}
              {videos.length >= 2 && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card>
                    <div className="p-4 text-center">
                      <p className="text-foggy text-small mb-2">Average Views</p>
                      <p className="text-headline-3 font-bold text-rausch">
                        {formatNumber(averageMetrics.avgViews)}
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-4 text-center">
                      <p className="text-foggy text-small mb-2">Avg Engagement</p>
                      <p className="text-headline-3 font-bold text-babu">
                        {averageMetrics.avgEngagementRate}%
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-4 text-center">
                      <p className="text-foggy text-small mb-2">Best by Views</p>
                      <p className="text-body font-semibold text-hof line-clamp-2">
                        {bestByViews?.title || 'N/A'}
                      </p>
                    </div>
                  </Card>
                  <Card>
                    <div className="p-4 text-center">
                      <p className="text-foggy text-small mb-2">Best Engagement</p>
                      <p className="text-body font-semibold text-hof line-clamp-2">
                        {bestByEngagement?.title || 'N/A'}
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Comparison Charts */}
              {videos.length >= 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <div className="p-6">
                      <h3 className="text-headline-3 font-semibold text-hof mb-4">
                        Engagement Rate Comparison
                      </h3>
                      <EngagementChart videos={videos} type="bar" />
                    </div>
                  </Card>
                  <Card>
                    <div className="p-6">
                      <h3 className="text-headline-3 font-semibold text-hof mb-4">
                        Engagement Trend
                      </h3>
                      <EngagementChart videos={videos} type="line" />
                    </div>
                  </Card>
                </div>
              )}

              {/* Video List */}
              <div>
                <h2 className="text-headline-2 font-semibold text-hof mb-6">
                  Videos ({videos.length})
                </h2>
                <div className="space-y-4">
                  {videos.map((video) => {
                    const engagementRate = calculateEngagementRate(video)
                    const viewVelocity = calculateViewVelocity(video)

                    return (
                      <Card key={video.id}>
                        <div className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-hof/10 rounded-standard overflow-hidden">
                              {video.thumbnail && (
                                <Image
                                  src={video.thumbnail}
                                  alt={video.title}
                                  fill
                                  className="object-cover"
                                  sizes="(max-width: 768px) 100vw, 25vw"
                                />
                              )}
                            </div>

                            {/* Video Info */}
                            <div className="md:col-span-2">
                              <h3 className="font-semibold text-body text-hof mb-2 line-clamp-2">
                                {video.title}
                              </h3>
                              <p className="text-small text-foggy mb-4">
                                {video.channelTitle}
                              </p>

                              <div className="grid grid-cols-3 gap-4">
                                <div>
                                  <p className="text-caption text-foggy">Views</p>
                                  <p className="font-semibold text-small text-rausch">
                                    {formatNumber(video.views)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-caption text-foggy">Likes</p>
                                  <p className="font-semibold text-small text-babu">
                                    {formatNumber(video.likes)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-caption text-foggy">Comments</p>
                                  <p className="font-semibold text-small text-arches">
                                    {formatNumber(video.comments)}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Metrics */}
                            <div className="flex flex-col justify-between">
                              <div className="space-y-2">
                                <div>
                                  <p className="text-caption text-foggy">Engagement</p>
                                  <p className="text-body font-bold text-rausch">
                                    {engagementRate}%
                                  </p>
                                </div>
                                <div>
                                  <p className="text-caption text-foggy">Views/Day</p>
                                  <p className="text-body font-semibold text-hof">
                                    {formatNumber(viewVelocity)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => handleRemoveVideo(video.id)}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
