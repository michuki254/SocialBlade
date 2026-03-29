import React from 'react'
import Image from 'next/image'
import type { FormattedChannelData } from '@/types/youtube'
import { formatNumber, formatNumberWithCommas, formatDate } from '@/lib/youtube-utils'
import { Card } from './Card'

interface ChannelCardProps {
  channel: FormattedChannelData
  onClick?: () => void
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel, onClick }) => {
  return (
    <Card hover={!!onClick} onClick={onClick}>
      <div className="flex items-start gap-4 p-2">
        {/* Channel Avatar */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-hof/10">
          {channel.thumbnail && (
            <Image
              src={channel.thumbnail}
              alt={channel.title}
              fill
              className="object-cover"
              sizes="80px"
            />
          )}
        </div>

        {/* Channel Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-body text-hof truncate mb-1">
            {channel.title}
          </h3>

          {channel.customUrl && (
            <p className="text-small text-foggy mb-2">
              @{channel.customUrl.replace('@', '')}
            </p>
          )}

          <p className="text-small text-foggy line-clamp-2 mb-3">
            {channel.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-caption text-foggy">Subscribers</p>
              <p className="font-semibold text-small text-rausch">
                {formatNumber(channel.subscribers)}
              </p>
            </div>
            <div>
              <p className="text-caption text-foggy">Videos</p>
              <p className="font-semibold text-small text-babu">
                {formatNumber(channel.videoCount)}
              </p>
            </div>
            <div>
              <p className="text-caption text-foggy">Views</p>
              <p className="font-semibold text-small text-arches">
                {formatNumber(channel.totalViews)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

interface ChannelStatsDetailProps {
  channel: FormattedChannelData
  children?: React.ReactNode
}

export const ChannelStatsDetail: React.FC<ChannelStatsDetailProps> = ({ channel, children }) => {
  const avgViewsPerVideo = channel.videoCount > 0
    ? Math.floor(channel.totalViews / channel.videoCount)
    : 0

  return (
    <div className="space-y-6">
      {/* Channel Header */}
      <Card>
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Channel Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 bg-hof/10">
              {channel.thumbnail && (
                <Image
                  src={channel.thumbnail}
                  alt={channel.title}
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              )}
            </div>

            {/* Channel Info */}
            <div className="flex-1">
              <h1 className="text-headline-2 font-bold text-hof mb-2">
                {channel.title}
              </h1>

              {channel.customUrl && (
                <p className="text-body text-foggy mb-3">
                  youtube.com/@{channel.customUrl.replace('@', '')}
                </p>
              )}

              <p className="text-small text-hof mb-4">
                {channel.description}
              </p>

              <div className="flex items-center gap-4 text-small text-foggy">
                <span>Joined {formatDate(channel.publishedAt)}</span>
                {channel.country && (
                  <>
                    <span>•</span>
                    <span>{channel.country}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center p-6">
            <p className="text-foggy text-small mb-2">Total Subscribers</p>
            <p className="text-headline-2 font-bold text-rausch mb-1">
              {formatNumberWithCommas(channel.subscribers)}
            </p>
            <p className="text-caption text-foggy">
              {formatNumber(channel.subscribers)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-6">
            <p className="text-foggy text-small mb-2">Total Videos</p>
            <p className="text-headline-2 font-bold text-babu mb-1">
              {formatNumberWithCommas(channel.videoCount)}
            </p>
            <p className="text-caption text-foggy">
              {formatNumber(channel.videoCount)} uploads
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-6">
            <p className="text-foggy text-small mb-2">Total Views</p>
            <p className="text-headline-2 font-bold text-arches mb-1">
              {formatNumberWithCommas(channel.totalViews)}
            </p>
            <p className="text-caption text-foggy">
              {formatNumber(channel.totalViews)}
            </p>
          </div>
        </Card>
      </div>

      {/* Insert children here (e.g., Summary Card) */}
      {children}

      {/* Performance Metrics */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-6">
            Performance Metrics
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Average Views Per Video */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-small text-foggy mb-1">Average Views Per Video</p>
                  <p className="text-headline-3 font-bold text-hof">
                    {formatNumberWithCommas(avgViewsPerVideo)}
                  </p>
                </div>
                <p className="text-caption text-foggy">
                  {formatNumber(avgViewsPerVideo)}
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-babu h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((avgViewsPerVideo / 100000) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Subscriber to Video Ratio */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-small text-foggy mb-1">Subscribers Per Video</p>
                  <p className="text-headline-3 font-bold text-hof">
                    {formatNumberWithCommas(
                      channel.videoCount > 0
                        ? Math.floor(channel.subscribers / channel.videoCount)
                        : 0
                    )}
                  </p>
                </div>
                <p className="text-caption text-foggy">
                  {formatNumber(
                    channel.videoCount > 0
                      ? Math.floor(channel.subscribers / channel.videoCount)
                      : 0
                  )}
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-rausch h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (channel.videoCount > 0
                        ? (channel.subscribers / channel.videoCount / 10000) * 100
                        : 0
                      ), 100
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Channel Health Score */}
          <div className="mt-6 pt-6 border-t border-hof/10">
            <p className="text-small text-foggy mb-3">Channel Engagement Rate</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="w-full bg-hof/10 rounded-full h-3">
                  <div
                    className="bg-rausch h-3 rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        (channel.totalViews / (channel.subscribers || 1)) * 10,
                        100
                      )}%`
                    }}
                  />
                </div>
              </div>
              <p className="font-semibold text-body text-hof">
                {((channel.totalViews / (channel.subscribers || 1)) * 10).toFixed(1)}%
              </p>
            </div>
            <p className="text-caption text-foggy mt-2">
              Based on total views vs subscribers ratio
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
