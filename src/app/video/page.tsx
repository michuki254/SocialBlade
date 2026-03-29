'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button, Input, VideoStatsDetail } from '@/components'
import { getVideoById } from '@/services/youtube'
import { extractVideoId } from '@/lib/youtube-utils'
import type { FormattedVideoData } from '@/types/youtube'

export default function VideoAnalyticsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-rausch border-t-transparent"></div></div>}>
      <VideoAnalyticsContent />
    </Suspense>
  )
}

function VideoAnalyticsContent() {
  const searchParams = useSearchParams()
  const [videoInput, setVideoInput] = useState('')
  const [video, setVideo] = useState<FormattedVideoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for query parameter on mount
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setVideoInput(query)
      // Auto-search if query parameter is present
      handleSearchWithInput(query)
    }
  }, [searchParams])

  const handleSearchWithInput = async (input: string) => {
    if (!input.trim()) {
      setError('Please enter a video URL or ID')
      return
    }

    setLoading(true)
    setError(null)
    setVideo(null)

    try {
      const videoId = extractVideoId(input)

      if (!videoId) {
        setError('Invalid YouTube video URL or ID')
        setLoading(false)
        return
      }

      const videoData = await getVideoById(videoId)

      if (!videoData) {
        setError('Video not found. Please check the URL or ID.')
        setLoading(false)
        return
      }

      setVideo(videoData)
    } catch (err) {
      console.error('Error fetching video:', err)
      setError('Failed to fetch video data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    await handleSearchWithInput(videoInput)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Video Analytics
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Analyze YouTube video performance with detailed statistics and engagement metrics.
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 max-w-3xl">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter YouTube video URL or ID..."
                value={videoInput}
                onChange={(e) => setVideoInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-white"
              />
            </div>
            <Button
              onClick={handleSearch}
              size="large"
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Analyze'}
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
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-rausch border-t-transparent rounded-full animate-spin"></div>
              <p className="text-foggy mt-4">Loading video data...</p>
            </div>
          )}

          {video && !loading && (
            <VideoStatsDetail video={video} />
          )}

          {!video && !loading && !error && (
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <h3 className="text-headline-3 font-semibold text-hof mb-2">
                Search for a Video
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Enter a YouTube video URL or video ID above to get started with video analytics.
              </p>

              <div className="mt-8 max-w-lg mx-auto bg-background-secondary p-6 rounded-medium">
                <h4 className="font-semibold text-hof mb-3">Supported Formats:</h4>
                <ul className="text-small text-foggy space-y-2 text-left">
                  <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
                  <li>• https://youtu.be/VIDEO_ID</li>
                  <li>• VIDEO_ID (11 characters)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
