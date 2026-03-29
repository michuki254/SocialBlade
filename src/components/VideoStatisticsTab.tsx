'use client'

import { Card } from '@/components'
import { formatNumber, formatNumberWithCommas } from '@/lib/youtube-utils'
import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'

interface VideoStatisticsTabProps {
  channel: FormattedChannelData
  videos: FormattedVideoData[]
}

export const VideoStatisticsTab: React.FC<VideoStatisticsTabProps> = ({ channel, videos }) => {
  // Calculate video statistics
  const totalVideos = channel.videoCount
  const avgViewsPerVideo = totalVideos > 0 ? Math.floor(channel.totalViews / totalVideos) : 0

  // Calculate stats from recent videos if available
  const avgLikesPerVideo = videos.length > 0
    ? Math.floor(videos.reduce((sum, v) => sum + v.likes, 0) / videos.length)
    : 0

  const avgCommentsPerVideo = videos.length > 0
    ? Math.floor(videos.reduce((sum, v) => sum + v.comments, 0) / videos.length)
    : 0

  const mostPopularVideo = videos.length > 0
    ? videos.reduce((max, v) => v.views > max.views ? v : max, videos[0])
    : null

  const mostLikedVideo = videos.length > 0
    ? videos.reduce((max, v) => v.likes > max.likes ? v : max, videos[0])
    : null

  // Calculate upload frequency (rough estimate based on channel age and video count)
  const channelAge = new Date().getTime() - new Date(channel.publishedAt).getTime()
  const channelAgeInDays = channelAge / (1000 * 60 * 60 * 24)
  const videosPerMonth = (totalVideos / channelAgeInDays) * 30

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="text-center p-6">
            <p className="text-foggy text-small mb-2">Total Videos</p>
            <p className="text-headline-2 font-bold text-rausch">
              {formatNumberWithCommas(totalVideos)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-6">
            <p className="text-foggy text-small mb-2">Avg Views/Video</p>
            <p className="text-headline-2 font-bold text-babu">
              {formatNumber(avgViewsPerVideo)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-6">
            <p className="text-foggy text-small mb-2">Avg Likes/Video</p>
            <p className="text-headline-2 font-bold text-arches">
              {formatNumber(avgLikesPerVideo)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-6">
            <p className="text-foggy text-small mb-2">Avg Comments/Video</p>
            <p className="text-headline-2 font-bold text-hof">
              {formatNumber(avgCommentsPerVideo)}
            </p>
          </div>
        </Card>
      </div>

      {/* Upload Frequency */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-4">
            Upload Frequency
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-small text-foggy mb-1">Videos Per Month</p>
              <p className="text-headline-3 font-bold text-rausch">
                {videosPerMonth.toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-1">Videos Per Week</p>
              <p className="text-headline-3 font-bold text-babu">
                {(videosPerMonth / 4).toFixed(1)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-1">Channel Age</p>
              <p className="text-headline-3 font-bold text-arches">
                {Math.floor(channelAgeInDays / 365)} years
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Engagement Metrics */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-6">
            Engagement Metrics
          </h3>

          <div className="space-y-4">
            {/* Like Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-small text-foggy">Average Like Rate</p>
                <p className="text-body font-semibold text-hof">
                  {avgViewsPerVideo > 0
                    ? ((avgLikesPerVideo / avgViewsPerVideo) * 100).toFixed(2)
                    : '0'}%
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-arches h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      avgViewsPerVideo > 0
                        ? ((avgLikesPerVideo / avgViewsPerVideo) * 100) * 20
                        : 0,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>

            {/* Comment Rate */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-small text-foggy">Average Comment Rate</p>
                <p className="text-body font-semibold text-hof">
                  {avgViewsPerVideo > 0
                    ? ((avgCommentsPerVideo / avgViewsPerVideo) * 100).toFixed(2)
                    : '0'}%
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-babu h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      avgViewsPerVideo > 0
                        ? ((avgCommentsPerVideo / avgViewsPerVideo) * 100) * 20
                        : 0,
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Top Performing Videos */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Most Popular Video */}
          {mostPopularVideo && (
            <Card>
              <div className="p-6">
                <h3 className="text-headline-3 font-semibold text-hof mb-4">
                  Most Popular Video
                </h3>
                <div className="space-y-3">
                  <p className="text-body text-hof font-semibold line-clamp-2">
                    {mostPopularVideo.title}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-caption text-foggy">Views</p>
                      <p className="text-body font-bold text-rausch">
                        {formatNumber(mostPopularVideo.views)}
                      </p>
                    </div>
                    <div>
                      <p className="text-caption text-foggy">Likes</p>
                      <p className="text-body font-bold text-babu">
                        {formatNumber(mostPopularVideo.likes)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Most Liked Video */}
          {mostLikedVideo && mostLikedVideo.id !== mostPopularVideo?.id && (
            <Card>
              <div className="p-6">
                <h3 className="text-headline-3 font-semibold text-hof mb-4">
                  Most Liked Video
                </h3>
                <div className="space-y-3">
                  <p className="text-body text-hof font-semibold line-clamp-2">
                    {mostLikedVideo.title}
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-caption text-foggy">Likes</p>
                      <p className="text-body font-bold text-arches">
                        {formatNumber(mostLikedVideo.likes)}
                      </p>
                    </div>
                    <div>
                      <p className="text-caption text-foggy">Views</p>
                      <p className="text-body font-bold text-rausch">
                        {formatNumber(mostLikedVideo.views)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
