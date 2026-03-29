'use client'

import { useState } from 'react'
import { Button, Input, Card, VideoCard } from '@/components'
import { getPlaylistById, getPlaylistVideos } from '@/services/youtube'
import { extractPlaylistId, formatNumber, formatDate } from '@/lib/youtube-utils'
import {
  analyzePlaylistPerformance,
  analyzeVideoSequencing,
  calculatePlaylistEngagementScore,
  generatePlaylistRecommendations,
  estimatePlaylistWatchTime,
} from '@/lib/playlist-analyzer'
import type { FormattedPlaylistData, FormattedVideoData } from '@/types/youtube'
import Image from 'next/image'

export default function PlaylistAnalyticsPage() {
  const [playlistInput, setPlaylistInput] = useState('')
  const [playlist, setPlaylist] = useState<FormattedPlaylistData | null>(null)
  const [videos, setVideos] = useState<FormattedVideoData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!playlistInput.trim()) {
      setError('Please enter a playlist URL or ID')
      return
    }

    setLoading(true)
    setError(null)
    setPlaylist(null)
    setVideos([])

    try {
      const playlistId = extractPlaylistId(playlistInput)
      if (!playlistId) {
        setError('Invalid playlist URL or ID')
        setLoading(false)
        return
      }

      const playlistData = await getPlaylistById(playlistId)
      if (!playlistData) {
        setError('Playlist not found')
        setLoading(false)
        return
      }

      setPlaylist(playlistData)

      // Fetch playlist videos
      const playlistVideos = await getPlaylistVideos(playlistId, 50)
      setVideos(playlistVideos)

      if (playlistVideos.length === 0) {
        setError('No videos found in this playlist')
      }
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch playlist data')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAnalyze()
    }
  }

  // Analytics
  const performance = videos.length > 0 ? analyzePlaylistPerformance(videos) : null
  const sequencing = videos.length > 0 ? analyzeVideoSequencing(videos) : null
  const engagementScore = playlist && videos.length > 0 ? calculatePlaylistEngagementScore(playlist, videos) : null
  const recommendations = playlist && videos.length > 0 ? generatePlaylistRecommendations(playlist, videos) : []
  const watchTime = videos.length > 0 ? estimatePlaylistWatchTime(videos) : null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Playlist Analytics
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Analyze playlist performance, video sequencing, and get optimization recommendations.
          </p>

          {/* Search Input */}
          <div className="flex gap-4 max-w-3xl">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter playlist URL or ID..."
                value={playlistInput}
                onChange={(e) => setPlaylistInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white"
              />
            </div>
            <Button onClick={handleAnalyze} size="large" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Playlist'}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}

          {/* Supported Formats */}
          <div className="mt-6 p-4 bg-white/10 rounded-standard max-w-2xl">
            <p className="text-white/80 text-small">
              <strong>Supported formats:</strong> https://www.youtube.com/playlist?list=PLAYLIST_ID or just the playlist ID
            </p>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {playlist && (
            <div className="space-y-8">
              {/* Playlist Header */}
              <Card>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative aspect-video bg-hof/10 rounded-standard overflow-hidden">
                      {playlist.thumbnail && (
                        <Image
                          src={playlist.thumbnail}
                          alt={playlist.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <h2 className="text-headline-2 font-bold text-hof mb-2">
                        {playlist.title}
                      </h2>
                      <p className="text-body text-foggy mb-4">{playlist.channelTitle}</p>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-caption text-foggy">Total Videos</p>
                          <p className="font-semibold text-body text-rausch">
                            {playlist.itemCount}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Analyzed</p>
                          <p className="font-semibold text-body text-babu">
                            {videos.length}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Created</p>
                          <p className="font-semibold text-body text-hof">
                            {formatDate(playlist.publishedAt).split(',')[0]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Engagement Score */}
              {engagementScore && (
                <Card>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-headline-3 font-semibold text-hof">
                        Playlist Engagement Score
                      </h3>
                      <div className="text-center">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full text-headline-1 font-bold ${
                          engagementScore.grade === 'A' ? 'bg-babu text-white' :
                          engagementScore.grade === 'B' ? 'bg-arches text-white' :
                          engagementScore.grade === 'C' ? 'bg-foggy text-white' :
                          'bg-rausch text-white'
                        }`}>
                          {engagementScore.grade}
                        </div>
                        <p className="text-small text-foggy mt-2">{engagementScore.score}/100</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {engagementScore.factors.map((factor, index) => (
                        <div key={index} className="p-4 bg-background rounded-standard">
                          <p className="text-caption text-foggy mb-2">{factor.name}</p>
                          <div className="w-full bg-hof/10 rounded-full h-2 mb-1">
                            <div
                              className={`h-2 rounded-full ${
                                factor.score >= 80 ? 'bg-babu' :
                                factor.score >= 60 ? 'bg-arches' :
                                'bg-rausch'
                              }`}
                              style={{ width: `${factor.score}%` }}
                            />
                          </div>
                          <p className="text-body font-semibold text-hof">{factor.score}/100</p>
                          <p className="text-caption text-foggy">Weight: {(factor.weight * 100).toFixed(0)}%</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Performance Overview */}
              {performance && watchTime && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Total Views</p>
                      <p className="text-headline-2 font-bold text-rausch">
                        {formatNumber(performance.totalViews)}
                      </p>
                      <p className="text-caption text-foggy mt-1">
                        Avg: {formatNumber(performance.avgViews)}
                      </p>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Total Engagement</p>
                      <p className="text-headline-2 font-bold text-babu">
                        {formatNumber(performance.totalLikes + performance.totalComments)}
                      </p>
                      <p className="text-caption text-foggy mt-1">
                        {performance.avgEngagementRate}% rate
                      </p>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Watch Time</p>
                      <p className="text-headline-2 font-bold text-arches">
                        {watchTime.formattedTotal}
                      </p>
                      <p className="text-caption text-foggy mt-1">
                        Avg: {watchTime.avgVideoLength}
                      </p>
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6 text-center">
                      <p className="text-foggy text-small mb-2">Total Likes</p>
                      <p className="text-headline-2 font-bold text-hof">
                        {formatNumber(performance.totalLikes)}
                      </p>
                      <p className="text-caption text-foggy mt-1">
                        Comments: {formatNumber(performance.totalComments)}
                      </p>
                    </div>
                  </Card>
                </div>
              )}

              {/* Video Sequencing Analysis */}
              {sequencing && sequencing.viewDropoff.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Video Sequencing & Drop-off
                    </h3>

                    <div className="mb-6 p-4 bg-background rounded-standard">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-body font-semibold text-hof">Average Drop-off Rate</p>
                          <p className="text-small text-foggy">Between consecutive videos</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-headline-2 font-bold ${
                            sequencing.avgDropoffRate < 30 ? 'text-babu' :
                            sequencing.avgDropoffRate < 50 ? 'text-arches' :
                            'text-rausch'
                          }`}>
                            {sequencing.avgDropoffRate}%
                          </p>
                          <p className="text-caption text-foggy">
                            {sequencing.avgDropoffRate < 30 ? 'Excellent' :
                             sequencing.avgDropoffRate < 50 ? 'Moderate' : 'High'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {sequencing.suggestedReordering.length > 0 && (
                      <div>
                        <p className="font-semibold text-body text-hof mb-3">
                          Suggested Video Repositioning:
                        </p>
                        <div className="space-y-3">
                          {sequencing.suggestedReordering.map((suggestion, i) => (
                            <div key={i} className="p-4 bg-babu/10 rounded-standard border-l-4 border-babu">
                              <div className="flex items-start gap-3">
                                <span className="px-2 py-1 bg-babu text-white text-caption rounded font-bold">
                                  #{suggestion.position + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="font-semibold text-small text-hof line-clamp-1">
                                    {suggestion.video.title}
                                  </p>
                                  <p className="text-caption text-foggy mt-1">
                                    {suggestion.reason}
                                  </p>
                                  <p className="text-caption text-babu mt-1">
                                    {formatNumber(suggestion.video.views)} views
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-small text-babu font-semibold">Move to Top 3</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              )}

              {/* Top & Bottom Performers */}
              {performance && performance.bestPerformer && performance.worstPerformer && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <div className="p-6">
                      <h3 className="text-headline-3 font-semibold text-babu mb-4">
                        Best Performer
                      </h3>
                      <VideoCard video={performance.bestPerformer} />
                    </div>
                  </Card>

                  <Card>
                    <div className="p-6">
                      <h3 className="text-headline-3 font-semibold text-foggy mb-4">
                        Needs Improvement
                      </h3>
                      <VideoCard video={performance.worstPerformer} />
                    </div>
                  </Card>
                </div>
              )}

              {/* Optimization Recommendations */}
              {recommendations.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Optimization Recommendations
                    </h3>
                    <div className="space-y-3">
                      {recommendations.map((rec, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-standard">
                          <svg className="w-5 h-5 text-babu flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <p className="text-small text-hof">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* All Videos in Playlist */}
              {videos.length > 0 && (
                <div>
                  <h2 className="text-headline-2 font-semibold text-hof mb-6">
                    All Videos ({videos.length})
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map((video, index) => (
                      <div key={video.id} className="relative">
                        <div className="absolute top-2 left-2 z-10 bg-black/80 text-white px-3 py-1 rounded-full text-caption font-bold">
                          #{index + 1}
                        </div>
                        <VideoCard video={video} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!playlist && !loading && (
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
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                Analyze a Playlist
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Enter a YouTube playlist URL above to analyze performance, video sequencing, and get optimization tips.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
