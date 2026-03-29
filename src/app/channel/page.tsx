'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import {
  Button,
  Input,
  ChannelStatsDetail,
  ChannelSummaryCard,
  VideoCard,
  Tabs,
  VideoStatisticsTab,
  FutureProjectionsTab,
  LiveSubscriberCountTab,
  AchievementsTab
} from '@/components'
import { getChannelById, getChannelByUsername, getChannelVideos } from '@/services/youtube'
import { extractChannelId } from '@/lib/youtube-utils'
import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'

export default function ChannelAnalyticsPage() {
  const searchParams = useSearchParams()
  const [channelInput, setChannelInput] = useState('')
  const [channel, setChannel] = useState<FormattedChannelData | null>(null)
  const [videos, setVideos] = useState<FormattedVideoData[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check for query parameter on mount
  useEffect(() => {
    const query = searchParams.get('q')
    if (query) {
      setChannelInput(query)
      handleSearchWithInput(query)
    }
  }, [searchParams])

  const handleSearchWithInput = async (input: string) => {
    if (!input.trim()) {
      setError('Please enter a channel URL, ID, or username')
      return
    }

    setLoading(true)
    setError(null)
    setChannel(null)
    setVideos([])

    try {
      let channelData: FormattedChannelData | null = null

      // Try to extract channel ID from URL
      const channelId = extractChannelId(input)

      if (channelId) {
        if (channelId.startsWith('@')) {
          // Username format
          channelData = await getChannelByUsername(channelId)
        } else {
          // Channel ID format
          channelData = await getChannelById(channelId)
        }
      } else {
        // Try as username without @
        channelData = await getChannelByUsername(input)
      }

      if (!channelData) {
        setError('Channel not found. Please check the URL, ID, or username.')
        setLoading(false)
        return
      }

      setChannel(channelData)

      // Save channel snapshot to database
      try {
        await fetch('/api/channel-snapshots', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channelId: channelData.id,
            channelTitle: channelData.title,
            subscribers: channelData.subscribers,
            totalViews: channelData.totalViews,
            videoCount: channelData.videoCount,
          }),
        })
      } catch (err) {
        console.error('Error saving channel snapshot:', err)
        // Non-critical, don't block user experience
      }

      // Fetch channel videos
      setLoadingVideos(true)
      try {
        const channelVideos = await getChannelVideos(channelData.id, 12)
        setVideos(channelVideos)
      } catch (err) {
        console.error('Error fetching channel videos:', err)
      } finally {
        setLoadingVideos(false)
      }
    } catch (err) {
      console.error('Error fetching channel:', err)
      setError('Failed to fetch channel data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    await handleSearchWithInput(channelInput)
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
            Channel Analytics
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Analyze YouTube channel performance, track subscribers, and explore channel content.
          </p>

          {/* Search Bar */}
          <div className="flex gap-4 max-w-3xl">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter channel URL, ID, or @username..."
                value={channelInput}
                onChange={(e) => setChannelInput(e.target.value)}
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
              <p className="text-foggy mt-4">Loading channel data...</p>
            </div>
          )}

          {channel && !loading && (
            <div className="space-y-8">
              {/* Channel Banner */}
              {channel.banner && (
                <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-standard overflow-hidden bg-hof/10">
                  <Image
                    src={channel.banner}
                    alt={`${channel.title} banner`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Channel Header (avatar and basic info) */}
              <ChannelStatsDetail channel={channel}>
                <ChannelSummaryCard channel={channel} />
              </ChannelStatsDetail>

              {/* Tabs Section */}
              <Tabs
                defaultTab="channel-statistics"
                tabs={[
                  {
                    id: 'channel-statistics',
                    label: 'Channel Statistics',
                    content: (
                      <div className="space-y-6">
                        {/* This content is already shown above in ChannelStatsDetail, so we can show videos here */}
                        {videos.length > 0 && (
                          <div>
                            <h2 className="text-headline-2 font-semibold text-hof mb-6">
                              Recent Videos
                            </h2>

                            {loadingVideos ? (
                              <div className="text-center py-8">
                                <div className="inline-block w-8 h-8 border-4 border-rausch border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-foggy mt-3">Loading videos...</p>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {videos.map((video) => (
                                  <VideoCard key={video.id} video={video} />
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    id: 'video-statistics',
                    label: 'Video Statistics',
                    content: <VideoStatisticsTab channel={channel} videos={videos} />,
                  },
                  {
                    id: 'future-projections',
                    label: 'Future Projections',
                    content: <FutureProjectionsTab channel={channel} />,
                  },
                  {
                    id: 'live-subscriber-count',
                    label: 'Live Subscriber Count',
                    content: <LiveSubscriberCountTab channel={channel} />,
                  },
                  {
                    id: 'achievements',
                    label: 'Achievements',
                    content: <AchievementsTab channel={channel} videos={videos} />,
                  },
                ]}
              />
            </div>
          )}

          {!channel && !loading && !error && (
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
                Search for a Channel
              </h3>
              <p className="text-foggy max-w-md mx-auto mb-8">
                Enter a YouTube channel URL, channel ID, or username above to get started with channel analytics.
              </p>

              <div className="max-w-lg mx-auto bg-background-secondary p-6 rounded-medium">
                <h4 className="font-semibold text-hof mb-3">Supported Formats:</h4>
                <ul className="text-small text-foggy space-y-2 text-left">
                  <li>• https://www.youtube.com/channel/CHANNEL_ID</li>
                  <li>• https://www.youtube.com/@username</li>
                  <li>• @username</li>
                  <li>• CHANNEL_ID (24 characters)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
