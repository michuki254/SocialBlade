'use client'

import { useState } from 'react'
import { Button, Input, Card } from '@/components'
import { getChannelById, getChannelByUsername } from '@/services/youtube'
import { extractChannelId, formatNumber } from '@/lib/youtube-utils'
import { GenericChart } from '@/components/GenericChart'
import type { FormattedChannelData } from '@/types/youtube'
import Image from 'next/image'

export default function CompareChannelsPage() {
  const [channelInputs, setChannelInputs] = useState<string[]>(['', '', '', '', ''])
  const [channels, setChannels] = useState<(FormattedChannelData | null)[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...channelInputs]
    newInputs[index] = value
    setChannelInputs(newInputs)
  }

  const fetchChannel = async (input: string): Promise<FormattedChannelData | null> => {
    if (!input.trim()) return null

    const channelId = extractChannelId(input)

    if (channelId) {
      if (channelId.startsWith('@')) {
        return await getChannelByUsername(channelId)
      } else {
        return await getChannelById(channelId)
      }
    } else {
      return await getChannelByUsername(input)
    }
  }

  const handleCompare = async () => {
    const validInputs = channelInputs.filter(input => input.trim())

    if (validInputs.length < 2) {
      setError('Please enter at least 2 channels to compare')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const fetchedChannels = await Promise.all(
        channelInputs.map(input => fetchChannel(input))
      )

      const validChannels = fetchedChannels.filter(c => c !== null)

      if (validChannels.length < 2) {
        setError('Could not find enough valid channels. Please check your inputs.')
        setLoading(false)
        return
      }

      setChannels(validChannels)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch channels')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCompare()
    }
  }

  const handleRemoveChannel = (index: number) => {
    const newChannels = [...channels]
    newChannels.splice(index, 1)
    setChannels(newChannels)

    const newInputs = [...channelInputs]
    newInputs[index] = ''
    setChannelInputs(newInputs)
  }

  // Calculate rankings
  const rankings = channels.length > 0 ? {
    subscribers: [...channels].sort((a, b) => b.subscribers - a.subscribers),
    views: [...channels].sort((a, b) => b.totalViews - a.totalViews),
    videos: [...channels].sort((a, b) => b.videoCount - a.videoCount),
    avgViews: [...channels].sort((a, b) => (b.totalViews / b.videoCount) - (a.totalViews / a.videoCount)),
  } : null

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Compare Channels
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Compare up to 5 YouTube channels side-by-side to analyze their performance, growth, and metrics.
          </p>

          {/* Channel Inputs */}
          <div className="space-y-4 max-w-3xl">
            {channelInputs.map((input, index) => (
              <div key={index} className="flex gap-4 items-center">
                <span className="text-white/80 font-semibold w-8">{index + 1}.</span>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={`Channel ${index + 1} URL, ID, or @username...`}
                    value={input}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="bg-white"
                    disabled={loading}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Button onClick={handleCompare} size="large" disabled={loading}>
              {loading ? 'Loading...' : 'Compare Channels'}
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
          {channels.length > 0 && (
            <div className="space-y-8">
              {/* Quick Stats Comparison */}
              <div>
                <h2 className="text-headline-2 font-semibold text-hof mb-6">
                  Quick Comparison
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-hof/20">
                        <th className="text-left py-4 px-4 text-small font-semibold text-foggy">Channel</th>
                        <th className="text-right py-4 px-4 text-small font-semibold text-foggy">Subscribers</th>
                        <th className="text-right py-4 px-4 text-small font-semibold text-foggy">Total Views</th>
                        <th className="text-right py-4 px-4 text-small font-semibold text-foggy">Videos</th>
                        <th className="text-right py-4 px-4 text-small font-semibold text-foggy">Avg Views/Video</th>
                        <th className="text-center py-4 px-4 text-small font-semibold text-foggy">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {channels.map((channel, index) => {
                        const avgViews = Math.floor(channel.totalViews / channel.videoCount)
                        const isTopSubs = rankings?.subscribers[0].id === channel.id
                        const isTopViews = rankings?.views[0].id === channel.id
                        const isTopAvg = rankings?.avgViews[0].id === channel.id

                        return (
                          <tr key={channel.id} className="border-b border-hof/10 hover:bg-hof/5">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-hof/10 flex-shrink-0">
                                  {channel.thumbnail && (
                                    <Image
                                      src={channel.thumbnail}
                                      alt={channel.title}
                                      fill
                                      className="object-cover"
                                      sizes="48px"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-small text-hof">{channel.title}</p>
                                  <p className="text-caption text-foggy">{channel.customUrl || channel.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {isTopSubs && <span className="text-babu">👑</span>}
                                <span className="font-semibold text-small text-hof">{formatNumber(channel.subscribers)}</span>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {isTopViews && <span className="text-babu">👑</span>}
                                <span className="font-semibold text-small text-hof">{formatNumber(channel.totalViews)}</span>
                              </div>
                            </td>
                            <td className="text-right py-4 px-4">
                              <span className="font-semibold text-small text-hof">{formatNumber(channel.videoCount)}</span>
                            </td>
                            <td className="text-right py-4 px-4">
                              <div className="flex items-center justify-end gap-2">
                                {isTopAvg && <span className="text-babu">👑</span>}
                                <span className="font-semibold text-small text-hof">{formatNumber(avgViews)}</span>
                              </div>
                            </td>
                            <td className="text-center py-4 px-4">
                              <button
                                onClick={() => handleRemoveChannel(index)}
                                className="text-foggy hover:text-rausch transition-colors"
                              >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Visualization Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Subscriber Comparison
                    </h3>
                    <GenericChart
                      data={{
                        labels: channels.map(c => c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title),
                        datasets: [{
                          label: 'Subscribers',
                          data: channels.map(c => c.subscribers),
                          backgroundColor: '#FF5A5F',
                        }]
                      }}
                      type="bar"
                    />
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Total Views Comparison
                    </h3>
                    <GenericChart
                      data={{
                        labels: channels.map(c => c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title),
                        datasets: [{
                          label: 'Total Views',
                          data: channels.map(c => c.totalViews),
                          backgroundColor: '#00A699',
                        }]
                      }}
                      type="bar"
                    />
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Video Count Comparison
                    </h3>
                    <GenericChart
                      data={{
                        labels: channels.map(c => c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title),
                        datasets: [{
                          label: 'Videos',
                          data: channels.map(c => c.videoCount),
                          backgroundColor: '#FC642D',
                        }]
                      }}
                      type="bar"
                    />
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-headline-3 font-semibold text-hof mb-4">
                      Average Views per Video
                    </h3>
                    <GenericChart
                      data={{
                        labels: channels.map(c => c.title.length > 20 ? c.title.substring(0, 20) + '...' : c.title),
                        datasets: [{
                          label: 'Avg Views/Video',
                          data: channels.map(c => Math.floor(c.totalViews / c.videoCount)),
                          backgroundColor: '#484848',
                        }]
                      }}
                      type="bar"
                    />
                  </div>
                </Card>
              </div>

              {/* Market Share */}
              <Card>
                <div className="p-6">
                  <h3 className="text-headline-3 font-semibold text-hof mb-4">
                    Subscriber Market Share
                  </h3>
                  <GenericChart
                    data={{
                      labels: channels.map(c => c.title),
                      datasets: [{
                        label: 'Subscribers',
                        data: channels.map(c => c.subscribers),
                        backgroundColor: [
                          '#FF5A5F',
                          '#00A699',
                          '#FC642D',
                          '#484848',
                          '#767676',
                        ],
                      }]
                    }}
                    type="doughnut"
                  />
                </div>
              </Card>

              {/* Channel Details Cards */}
              <div>
                <h2 className="text-headline-2 font-semibold text-hof mb-6">
                  Detailed Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {channels.map((channel) => (
                    <Card key={channel.id}>
                      <div className="p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden bg-hof/10">
                            {channel.thumbnail && (
                              <Image
                                src={channel.thumbnail}
                                alt={channel.title}
                                fill
                                className="object-cover"
                                sizes="64px"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-body text-hof line-clamp-2">
                              {channel.title}
                            </h3>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-small text-foggy">Subscribers</span>
                            <span className="font-semibold text-small text-rausch">
                              {formatNumber(channel.subscribers)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-small text-foggy">Total Views</span>
                            <span className="font-semibold text-small text-babu">
                              {formatNumber(channel.totalViews)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-small text-foggy">Videos</span>
                            <span className="font-semibold text-small text-arches">
                              {formatNumber(channel.videoCount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-small text-foggy">Avg Views</span>
                            <span className="font-semibold text-small text-hof">
                              {formatNumber(Math.floor(channel.totalViews / channel.videoCount))}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-hof/10">
                            <span className="text-small text-foggy">Views/Sub</span>
                            <span className="font-semibold text-small text-foggy">
                              {(channel.totalViews / channel.subscribers).toFixed(1)}
                            </span>
                          </div>
                        </div>

                        <p className="mt-4 text-caption text-foggy line-clamp-3">
                          {channel.description}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {channels.length === 0 && !loading && (
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
                Compare Channels
              </h3>
              <p className="text-foggy max-w-md mx-auto">
                Enter at least 2 channel URLs above to start comparing their performance metrics.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
