'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Card } from '@/components'
import { getChannelById, getChannelByUsername, getChannelVideos } from '@/services/youtube'
import { extractChannelId, formatNumber } from '@/lib/youtube-utils'
import {
  exportChannelToCSV,
  exportChannelComparisonToExcel,
  generateChannelPDFReport,
  generateComparisonPDFReport,
} from '@/lib/export-utils'
import { getTrackedChannels, getChannelSnapshotsById } from '@/lib/storage'
import type { FormattedChannelData } from '@/types/youtube'
import Image from 'next/image'

export default function ReportsPage() {
  const [channelInput, setChannelInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedChannel, setSelectedChannel] = useState<FormattedChannelData | null>(null)
  const [trackedChannels, setTrackedChannels] = useState<ReturnType<typeof getTrackedChannels>>([])
  const [customBranding, setCustomBranding] = useState({
    companyName: 'SocialBlade Analytics',
    brandColor: '#FF5A5F',
  })

  // Load tracked channels on mount
  useEffect(() => {
    setTrackedChannels(getTrackedChannels())
  }, [])

  const handleFetchChannel = async () => {
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
      setError(null)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to fetch channel')
    } finally {
      setLoading(false)
    }
  }

  const handleExportChannelCSV = async () => {
    if (!selectedChannel) return

    setLoading(true)
    try {
      const videos = await getChannelVideos(selectedChannel.id, 20)
      exportChannelToCSV(selectedChannel, videos)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export data')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateChannelPDF = async () => {
    if (!selectedChannel) return

    setLoading(true)
    try {
      const videos = await getChannelVideos(selectedChannel.id, 20)
      generateChannelPDFReport(selectedChannel, videos, customBranding)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleExportTrackedChannelsComparison = async () => {
    if (trackedChannels.length === 0) {
      setError('No tracked channels available. Track some channels first.')
      return
    }

    setLoading(true)
    try {
      // Fetch current data for all tracked channels
      const channelPromises = trackedChannels.map(async (tracked) => {
        return await getChannelById(tracked.id)
      })

      const channels = (await Promise.all(channelPromises)).filter(c => c !== null) as FormattedChannelData[]

      exportChannelComparisonToExcel(channels)
    } catch (err) {
      console.error('Export error:', err)
      setError('Failed to export comparison')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateComparisonPDF = async () => {
    if (trackedChannels.length === 0) {
      setError('No tracked channels available. Track some channels first.')
      return
    }

    setLoading(true)
    try {
      const channelPromises = trackedChannels.map(async (tracked) => {
        return await getChannelById(tracked.id)
      })

      const channels = (await Promise.all(channelPromises)).filter(c => c !== null) as FormattedChannelData[]

      generateComparisonPDFReport(channels, customBranding)
    } catch (err) {
      console.error('PDF generation error:', err)
      setError('Failed to generate PDF')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleFetchChannel()
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            Reports & Export
          </h1>
          <p className="text-xl mb-8 opacity-95 max-w-2xl">
            Generate professional reports and export data in multiple formats (PDF, CSV, Excel).
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Branding Settings */}
            <div className="lg:col-span-1">
              <Card>
                <div className="p-6">
                  <h2 className="text-headline-3 font-semibold text-hof mb-4">
                    White-Label Settings
                  </h2>
                  <p className="text-small text-foggy mb-6">
                    Customize your reports with your own branding
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-small font-medium text-hof mb-2">
                        Company Name
                      </label>
                      <Input
                        type="text"
                        value={customBranding.companyName}
                        onChange={(e) => setCustomBranding({ ...customBranding, companyName: e.target.value })}
                        placeholder="Your Company Name"
                      />
                    </div>

                    <div>
                      <label className="block text-small font-medium text-hof mb-2">
                        Brand Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={customBranding.brandColor}
                          onChange={(e) => setCustomBranding({ ...customBranding, brandColor: e.target.value })}
                          className="w-16 h-10 rounded-standard cursor-pointer"
                        />
                        <Input
                          type="text"
                          value={customBranding.brandColor}
                          onChange={(e) => setCustomBranding({ ...customBranding, brandColor: e.target.value })}
                          placeholder="#FF5A5F"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="pt-4 border-t border-hof/10">
                      <div className="p-4 bg-background rounded-standard">
                        <p className="text-caption text-foggy mb-2">Preview</p>
                        <div
                          className="h-12 rounded-standard flex items-center px-4"
                          style={{ backgroundColor: customBranding.brandColor }}
                        >
                          <p className="text-white font-semibold">{customBranding.companyName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Export - Tracked Channels */}
              {trackedChannels.length > 0 && (
                <Card className="mt-6">
                  <div className="p-6">
                    <h2 className="text-headline-3 font-semibold text-hof mb-4">
                      Tracked Channels Export
                    </h2>
                    <p className="text-small text-foggy mb-4">
                      {trackedChannels.length} tracked channel{trackedChannels.length !== 1 ? 's' : ''}
                    </p>

                    <div className="space-y-3">
                      <Button
                        variant="secondary"
                        onClick={handleExportTrackedChannelsComparison}
                        disabled={loading}
                        className="w-full"
                        suppressHydrationWarning
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Export Excel
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={handleGenerateComparisonPDF}
                        disabled={loading}
                        className="w-full"
                        suppressHydrationWarning
                      >
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Generate PDF Report
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Right Column - Channel Reports */}
            <div className="lg:col-span-2">
              <Card>
                <div className="p-6">
                  <h2 className="text-headline-3 font-semibold text-hof mb-4">
                    Channel Report Generator
                  </h2>

                  {/* Channel Input */}
                  <div className="mb-6">
                    <label className="block text-small font-medium text-hof mb-2">
                      Channel URL, ID, or @username
                    </label>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          type="text"
                          placeholder="Enter channel..."
                          value={channelInput}
                          onChange={(e) => setChannelInput(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={loading}
                        />
                      </div>
                      <Button onClick={handleFetchChannel} disabled={loading}>
                        {loading ? 'Loading...' : 'Load Channel'}
                      </Button>
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-6 p-4 bg-rausch/10 border border-rausch/20 rounded-standard">
                      <p className="text-small text-rausch">{error}</p>
                    </div>
                  )}

                  {/* Selected Channel */}
                  {selectedChannel && (
                    <div className="space-y-6">
                      <div className="p-4 bg-background rounded-standard">
                        <div className="flex items-center gap-4 mb-4">
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
                          <div className="flex-1">
                            <h3 className="font-bold text-body text-hof mb-1">
                              {selectedChannel.title}
                            </h3>
                            <p className="text-small text-foggy">
                              {formatNumber(selectedChannel.subscribers)} subscribers •{' '}
                              {formatNumber(selectedChannel.totalViews)} views
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="primary"
                            onClick={handleExportChannelCSV}
                            disabled={loading}
                            className="w-full"
                            suppressHydrationWarning
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Export CSV
                          </Button>

                          <Button
                            variant="primary"
                            onClick={handleGenerateChannelPDF}
                            disabled={loading}
                            className="w-full"
                            suppressHydrationWarning
                          >
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            Generate PDF
                          </Button>
                        </div>
                      </div>

                      <div className="p-4 bg-babu/10 border border-babu/20 rounded-standard">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-babu flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-semibold text-small text-hof mb-1">Report Contents:</p>
                            <ul className="text-small text-foggy space-y-1">
                              <li>• Channel overview and statistics</li>
                              <li>• Recent videos performance (up to 20 videos)</li>
                              <li>• Engagement metrics and rates</li>
                              <li>• Custom branding (PDF only)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty State */}
                  {!selectedChannel && !error && (
                    <div className="text-center py-12">
                      <svg
                        className="w-16 h-16 mx-auto text-foggy/30 mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-foggy">
                        Enter a channel above to generate reports
                      </p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Export Formats Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <Card>
                  <div className="p-6">
                    <h3 className="font-semibold text-body text-hof mb-3">CSV/Excel Export</h3>
                    <ul className="text-small text-foggy space-y-2">
                      <li>✓ Raw data for analysis</li>
                      <li>✓ Import into spreadsheet software</li>
                      <li>✓ Create custom charts and pivots</li>
                      <li>✓ Lightweight file size</li>
                    </ul>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="font-semibold text-body text-hof mb-3">PDF Reports</h3>
                    <ul className="text-small text-foggy space-y-2">
                      <li>✓ Professional presentation format</li>
                      <li>✓ Custom branding and colors</li>
                      <li>✓ Ready to share with clients</li>
                      <li>✓ Formatted tables and charts</li>
                    </ul>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
