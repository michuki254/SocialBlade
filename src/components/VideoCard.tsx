import React from 'react'
import Image from 'next/image'
import type { FormattedVideoData } from '@/types/youtube'
import { formatNumber, formatNumberWithCommas, getRelativeTime, formatDate } from '@/lib/youtube-utils'
import {
  calculateEngagementRate,
  calculateLikeRate,
  calculateCommentRate,
  calculateViewVelocity,
  calculateLikesToCommentsRatio,
  calculateEngagementScore,
  getEngagementLevel,
} from '@/lib/engagement-metrics'
import { Card } from './Card'
import { EngagementChart } from './EngagementChart'

interface VideoCardProps {
  video: FormattedVideoData
  onClick?: () => void
}

export const VideoCard: React.FC<VideoCardProps> = ({ video, onClick }) => {
  return (
    <Card hover={!!onClick} onClick={onClick} className="overflow-hidden">
      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-hof/10">
        {video.thumbnail && (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {video.duration}
          </div>
        )}
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-body text-hof line-clamp-2 mb-2">
          {video.title}
        </h3>

        <p className="text-small text-foggy mb-3">{video.channelTitle}</p>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-caption text-foggy">Views</p>
            <p className="font-semibold text-small text-hof">
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

        <p className="text-caption text-foggy">
          {getRelativeTime(video.publishedAt)}
        </p>
      </div>
    </Card>
  )
}

interface VideoStatsDetailProps {
  video: FormattedVideoData
}

export const VideoStatsDetail: React.FC<VideoStatsDetailProps> = ({ video }) => {
  const engagementRate = calculateEngagementRate(video)
  const engagementScore = calculateEngagementScore(video)
  const engagementLevel = getEngagementLevel(engagementRate)
  const viewVelocity = calculateViewVelocity(video)
  const likesToCommentsRatio = calculateLikesToCommentsRatio(video)

  return (
    <div className="space-y-6">
      {/* Thumbnail and Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative w-full aspect-video bg-hof/10 rounded-medium overflow-hidden">
          {video.thumbnail && (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h1 className="text-headline-2 font-bold text-hof mb-2">
              {video.title}
            </h1>
            <p className="text-body text-foggy">{video.channelTitle}</p>
          </div>

          <div className="flex items-center gap-4 text-small text-foggy">
            <span>{formatDate(video.publishedAt)}</span>
            <span>•</span>
            <span>{video.duration}</span>
          </div>

          {/* Engagement Score Badge */}
          <div className="inline-block">
            <div
              className="px-4 py-2 rounded-standard"
              style={{ backgroundColor: `${engagementLevel.color}20`, borderLeft: `4px solid ${engagementLevel.color}` }}
            >
              <p className="text-caption font-semibold" style={{ color: engagementLevel.color }}>
                {engagementLevel.level} Engagement
              </p>
              <p className="text-small text-hof mt-1">
                {engagementRate}% engagement rate
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center p-4">
            <p className="text-foggy text-small mb-2">Total Views</p>
            <p className="text-headline-2 font-bold text-rausch">
              {formatNumberWithCommas(video.views)}
            </p>
            <p className="text-caption text-foggy mt-1">
              {formatNumber(video.views)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-4">
            <p className="text-foggy text-small mb-2">Total Likes</p>
            <p className="text-headline-2 font-bold text-babu">
              {formatNumberWithCommas(video.likes)}
            </p>
            <p className="text-caption text-foggy mt-1">
              {formatNumber(video.likes)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center p-4">
            <p className="text-foggy text-small mb-2">Total Comments</p>
            <p className="text-headline-2 font-bold text-arches">
              {formatNumberWithCommas(video.comments)}
            </p>
            <p className="text-caption text-foggy mt-1">
              {formatNumber(video.comments)}
            </p>
          </div>
        </Card>
      </div>

      {/* Advanced Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-headline-3 font-semibold text-hof mb-4">
              Engagement Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-small mb-1">
                  <span className="text-foggy">Engagement Rate</span>
                  <span className="font-semibold text-hof">
                    {engagementRate}%
                  </span>
                </div>
                <div className="w-full bg-hof/10 rounded-full h-2">
                  <div
                    className="bg-rausch h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(engagementRate * 10, 100)}%` }}
                  />
                </div>
                <p className="text-caption text-foggy mt-1">
                  {engagementLevel.description}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-small mb-1">
                  <span className="text-foggy">Like Rate</span>
                  <span className="font-semibold text-hof">
                    {calculateLikeRate(video)}%
                  </span>
                </div>
                <div className="w-full bg-hof/10 rounded-full h-2">
                  <div
                    className="bg-babu h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(calculateLikeRate(video) * 10, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-small mb-1">
                  <span className="text-foggy">Comment Rate</span>
                  <span className="font-semibold text-hof">
                    {calculateCommentRate(video)}%
                  </span>
                </div>
                <div className="w-full bg-hof/10 rounded-full h-2">
                  <div
                    className="bg-arches h-2 rounded-full transition-all"
                    style={{ width: `${Math.min(calculateCommentRate(video) * 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-headline-3 font-semibold text-hof mb-4">
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-hof/10">
                <span className="text-small text-foggy">Engagement Score</span>
                <span className="text-body font-semibold text-hof">{engagementScore}/100</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-hof/10">
                <span className="text-small text-foggy">Views per Day</span>
                <span className="text-body font-semibold text-rausch">
                  {formatNumber(viewVelocity)}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-hof/10">
                <span className="text-small text-foggy">Likes / Comments</span>
                <span className="text-body font-semibold text-babu">
                  {likesToCommentsRatio}:1
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-small text-foggy">Total Engagement</span>
                <span className="text-body font-semibold text-arches">
                  {formatNumber(video.likes + video.comments)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Engagement Visualization */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-4">
            Engagement Breakdown
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <EngagementChart videos={[video]} type="bar" />
            </div>
            <div>
              <EngagementChart videos={[video]} type="doughnut" />
            </div>
          </div>
        </div>
      </Card>

      {/* Description */}
      {video.description && (
        <Card>
          <div className="p-6">
            <h3 className="text-headline-3 font-semibold text-hof mb-3">
              Description
            </h3>
            <p className="text-small text-hof whitespace-pre-wrap">
              {video.description}
            </p>
          </div>
        </Card>
      )}

      {/* Tags */}
      {video.tags && video.tags.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="text-headline-3 font-semibold text-hof mb-3">
              Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              {video.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-hof/10 text-hof text-caption rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
