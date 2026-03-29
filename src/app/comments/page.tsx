'use client'

import { useState } from 'react'
import { Button, Input, Card } from '@/components'
import { getVideoById, getVideoComments } from '@/services/youtube'
import { extractVideoId, formatNumber, formatNumberWithCommas, getRelativeTime } from '@/lib/youtube-utils'
import {
  analyzeCommentsSentiment,
  extractCommentKeywords,
  getTopCommenters,
  calculateCommunityMetrics,
  detectProblematicComments,
} from '@/lib/comment-analyzer'
import type { FormattedVideoData, FormattedCommentData } from '@/types/youtube'
import Image from 'next/image'

export default function CommentsAnalyticsPage() {
  const [videoInput, setVideoInput] = useState('')
  const [video, setVideo] = useState<FormattedVideoData | null>(null)
  const [comments, setComments] = useState<FormattedCommentData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async () => {
    if (!videoInput.trim()) {
      setError('Please enter a video URL or ID')
      return
    }

    setLoading(true)
    setError(null)
    setVideo(null)
    setComments([])

    try {
      const videoId = extractVideoId(videoInput)
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

      // Fetch comments
      const commentsData = await getVideoComments(videoId, 100)
      setComments(commentsData)

      if (commentsData.length === 0) {
        setError('No comments found. Comments may be disabled for this video.')
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

  // Analytics
  const sentimentAnalysis = comments.length > 0 ? analyzeCommentsSentiment(comments) : null
  const keywords = comments.length > 0 ? extractCommentKeywords(comments) : []
  const topCommenters = comments.length > 0 ? getTopCommenters(comments) : []
  const communityMetrics = video && comments.length > 0 ? calculateCommunityMetrics(comments, video.views) : null
  const problematicComments = comments.length > 0 ? detectProblematicComments(comments) : null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Comments Analytics
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Analyze comment sentiment, community engagement, and identify top contributors.
          </p>

          {/* Search Input */}
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
            <Button onClick={handleAnalyze} size="large" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Comments'}
            </Button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-white/10 rounded-standard">
              <p className="text-white">{error}</p>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {video && (
            <div className="space-y-8">
              {/* Video Header */}
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
                      <h2 className="text-headline-2 font-bold text-hof mb-2 line-clamp-2">
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
                          <p className="text-caption text-foggy">Comments</p>
                          <p className="font-semibold text-body text-rausch">
                            {formatNumber(comments.length)}
                          </p>
                        </div>
                        <div>
                          <p className="text-caption text-foggy">Loaded</p>
                          <p className="font-semibold text-body text-babu">
                            {comments.length}/{video.comments}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {sentimentAnalysis && (
                <>
                  {/* Sentiment Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                      <div className="p-6 text-center">
                        <p className="text-foggy text-small mb-2">Overall Sentiment</p>
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full text-headline-3 font-bold mb-2 ${
                          sentimentAnalysis.overall.sentiment === 'positive' ? 'bg-babu text-white' :
                          sentimentAnalysis.overall.sentiment === 'negative' ? 'bg-rausch text-white' :
                          'bg-foggy text-white'
                        }`}>
                          {sentimentAnalysis.overall.sentiment === 'positive' ? '😊' :
                           sentimentAnalysis.overall.sentiment === 'negative' ? '😞' : '😐'}
                        </div>
                        <p className="text-body font-semibold text-hof capitalize">
                          {sentimentAnalysis.overall.sentiment}
                        </p>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6 text-center">
                        <p className="text-foggy text-small mb-2">Positive</p>
                        <p className="text-headline-2 font-bold text-babu mb-1">
                          {sentimentAnalysis.percentages.positive}%
                        </p>
                        <p className="text-caption text-foggy">
                          {sentimentAnalysis.distribution.positive} comments
                        </p>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6 text-center">
                        <p className="text-foggy text-small mb-2">Neutral</p>
                        <p className="text-headline-2 font-bold text-foggy mb-1">
                          {sentimentAnalysis.percentages.neutral}%
                        </p>
                        <p className="text-caption text-foggy">
                          {sentimentAnalysis.distribution.neutral} comments
                        </p>
                      </div>
                    </Card>

                    <Card>
                      <div className="p-6 text-center">
                        <p className="text-foggy text-small mb-2">Negative</p>
                        <p className="text-headline-2 font-bold text-rausch mb-1">
                          {sentimentAnalysis.percentages.negative}%
                        </p>
                        <p className="text-caption text-foggy">
                          {sentimentAnalysis.distribution.negative} comments
                        </p>
                      </div>
                    </Card>
                  </div>

                  {/* Sentiment Bars */}
                  <Card>
                    <div className="p-6">
                      <h3 className="text-headline-3 font-semibold text-hof mb-4">
                        Sentiment Distribution
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-small mb-1">
                            <span className="text-babu font-medium">Positive</span>
                            <span className="text-hof">{sentimentAnalysis.percentages.positive}%</span>
                          </div>
                          <div className="w-full bg-hof/10 rounded-full h-3">
                            <div
                              className="bg-babu h-3 rounded-full transition-all"
                              style={{ width: `${sentimentAnalysis.percentages.positive}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-small mb-1">
                            <span className="text-foggy font-medium">Neutral</span>
                            <span className="text-hof">{sentimentAnalysis.percentages.neutral}%</span>
                          </div>
                          <div className="w-full bg-hof/10 rounded-full h-3">
                            <div
                              className="bg-foggy h-3 rounded-full transition-all"
                              style={{ width: `${sentimentAnalysis.percentages.neutral}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-small mb-1">
                            <span className="text-rausch font-medium">Negative</span>
                            <span className="text-hof">{sentimentAnalysis.percentages.negative}%</span>
                          </div>
                          <div className="w-full bg-hof/10 rounded-full h-3">
                            <div
                              className="bg-rausch h-3 rounded-full transition-all"
                              style={{ width: `${sentimentAnalysis.percentages.negative}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Community Metrics */}
              {communityMetrics && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Community Engagement
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div className="p-4 bg-background rounded-standard">
                        <p className="text-caption text-foggy mb-1">Comment Rate</p>
                        <p className="text-body font-bold text-rausch">
                          {communityMetrics.commentRate}%
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-standard">
                        <p className="text-caption text-foggy mb-1">Avg Likes</p>
                        <p className="text-body font-bold text-babu">
                          {communityMetrics.avgCommentLikes}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-standard">
                        <p className="text-caption text-foggy mb-1">Avg Replies</p>
                        <p className="text-body font-bold text-arches">
                          {communityMetrics.avgReplies}
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-standard">
                        <p className="text-caption text-foggy mb-1">Top Comment</p>
                        <p className="text-body font-bold text-hof">
                          {formatNumber(communityMetrics.topCommentLikes)} likes
                        </p>
                      </div>
                      <div className="p-4 bg-background rounded-standard">
                        <p className="text-caption text-foggy mb-1">Response Rate</p>
                        <p className="text-body font-bold text-hof">
                          {communityMetrics.responseRate}%
                        </p>
                      </div>
                      <div className="p-4 bg-babu/10 rounded-standard">
                        <p className="text-caption text-babu mb-1">Engagement</p>
                        <p className="text-body font-bold text-babu">
                          {communityMetrics.engagementScore}/100
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Keywords Word Cloud */}
              {keywords.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Most Common Keywords
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {keywords.slice(0, 30).map((kw, i) => {
                        const fontSize = Math.max(12, Math.min(24, 12 + (kw.count / keywords[0].count) * 12))
                        const color = kw.sentiment > 0.2 ? 'text-babu' :
                                     kw.sentiment < -0.2 ? 'text-rausch' : 'text-hof'
                        return (
                          <span
                            key={i}
                            className={`${color} font-medium px-3 py-2 bg-hof/5 rounded-standard`}
                            style={{ fontSize: `${fontSize}px` }}
                          >
                            {kw.word} ({kw.count})
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              )}

              {/* Top Commenters */}
              {topCommenters.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Top Commenters
                    </h3>
                    <div className="space-y-3">
                      {topCommenters.map((commenter, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-background rounded-standard">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rausch flex items-center justify-center text-white font-bold">
                              #{i + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-body text-hof">{commenter.author}</p>
                              <p className="text-caption text-foggy">
                                {commenter.commentCount} comments • {commenter.totalLikes} total likes
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-body font-semibold text-babu">
                              {commenter.avgLikes}
                            </p>
                            <p className="text-caption text-foggy">avg likes</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Problematic Comments */}
              {problematicComments && (problematicComments.toxic.length > 0 || problematicComments.spam.length > 0) && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Moderation Insights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-rausch/10 rounded-standard">
                        <p className="font-semibold text-body text-rausch mb-2">
                          Potentially Toxic: {problematicComments.toxic.length}
                        </p>
                        <p className="text-small text-foggy">
                          Comments that may contain inappropriate content or spam markers
                        </p>
                      </div>
                      <div className="p-4 bg-arches/10 rounded-standard">
                        <p className="font-semibold text-body text-arches mb-2">
                          Potential Spam: {problematicComments.spam.length}
                        </p>
                        <p className="text-small text-foggy">
                          Comments with spam indicators like links or promotional content
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Recent Comments Sample */}
              <Card>
                <div className="p-6">
                  <h3 className="text-headline-3 font-semibold text-hof mb-4">
                    Recent Comments ({Math.min(10, comments.length)})
                  </h3>
                  <div className="space-y-4">
                    {comments.slice(0, 10).map((comment) => (
                      <div key={comment.id} className="p-4 bg-background rounded-standard">
                        <div className="flex items-start gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-hof/10">
                            {comment.authorImage && (
                              <Image
                                src={comment.authorImage}
                                alt={comment.author}
                                fill
                                className="object-cover"
                                sizes="40px"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-small text-hof">{comment.author}</p>
                              <p className="text-caption text-foggy">{getRelativeTime(comment.publishedAt)}</p>
                            </div>
                            <p className="text-small text-hof mb-2">{comment.text}</p>
                            <div className="flex items-center gap-4 text-caption text-foggy">
                              <span>{formatNumber(comment.likes)} likes</span>
                              {comment.replyCount > 0 && (
                                <span>{comment.replyCount} replies</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!video && !loading && (
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                Analyze Comments
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Enter a video URL above to analyze comment sentiment, engagement, and community insights.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
