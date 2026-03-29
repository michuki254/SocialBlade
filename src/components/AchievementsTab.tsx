'use client'

import { Card } from '@/components'
import { formatNumber, formatDate } from '@/lib/youtube-utils'
import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'

interface AchievementsTabProps {
  channel: FormattedChannelData
  videos: FormattedVideoData[]
}

interface Achievement {
  title: string
  description: string
  achieved: boolean
  icon: string
  color: string
  bgColor: string
  progress?: number
}

export const AchievementsTab: React.FC<AchievementsTabProps> = ({ channel, videos }) => {
  // Calculate channel age
  const channelAge = new Date().getTime() - new Date(channel.publishedAt).getTime()
  const channelAgeInYears = channelAge / (1000 * 60 * 60 * 24 * 365)

  // Define subscriber milestones
  const subscriberMilestones: Achievement[] = [
    {
      title: '100 Subscribers',
      description: 'First 100 subscribers - The beginning of your journey!',
      achieved: channel.subscribers >= 100,
      icon: 'users',
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
      progress: Math.min((channel.subscribers / 100) * 100, 100),
    },
    {
      title: '1,000 Subscribers',
      description: 'YouTube Partner Program eligible',
      achieved: channel.subscribers >= 1000,
      icon: 'badge',
      color: 'text-babu',
      bgColor: 'bg-babu/10',
      progress: Math.min((channel.subscribers / 1000) * 100, 100),
    },
    {
      title: '10,000 Subscribers',
      description: 'Growing community',
      achieved: channel.subscribers >= 10000,
      icon: 'star',
      color: 'text-arches',
      bgColor: 'bg-arches/10',
      progress: Math.min((channel.subscribers / 10000) * 100, 100),
    },
    {
      title: '100,000 Subscribers',
      description: 'Silver Play Button awarded',
      achieved: channel.subscribers >= 100000,
      icon: 'award',
      color: 'text-foggy',
      bgColor: 'bg-foggy/10',
      progress: Math.min((channel.subscribers / 100000) * 100, 100),
    },
    {
      title: '1,000,000 Subscribers',
      description: 'Gold Play Button awarded',
      achieved: channel.subscribers >= 1000000,
      icon: 'trophy',
      color: 'text-arches',
      bgColor: 'bg-arches/10',
      progress: Math.min((channel.subscribers / 1000000) * 100, 100),
    },
    {
      title: '10,000,000 Subscribers',
      description: 'Diamond Play Button awarded',
      achieved: channel.subscribers >= 10000000,
      icon: 'sparkles',
      color: 'text-babu',
      bgColor: 'bg-babu/10',
      progress: Math.min((channel.subscribers / 10000000) * 100, 100),
    },
    {
      title: '100,000,000 Subscribers',
      description: 'Red Diamond Play Button - Elite status',
      achieved: channel.subscribers >= 100000000,
      icon: 'fire',
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
      progress: Math.min((channel.subscribers / 100000000) * 100, 100),
    },
  ]

  // Define view milestones
  const viewMilestones: Achievement[] = [
    {
      title: '10,000 Views',
      description: 'First 10K views achieved',
      achieved: channel.totalViews >= 10000,
      icon: 'eye',
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
      progress: Math.min((channel.totalViews / 10000) * 100, 100),
    },
    {
      title: '100,000 Views',
      description: '100K total views milestone',
      achieved: channel.totalViews >= 100000,
      icon: 'eye',
      color: 'text-babu',
      bgColor: 'bg-babu/10',
      progress: Math.min((channel.totalViews / 100000) * 100, 100),
    },
    {
      title: '1,000,000 Views',
      description: '1 Million views achieved',
      achieved: channel.totalViews >= 1000000,
      icon: 'star',
      color: 'text-arches',
      bgColor: 'bg-arches/10',
      progress: Math.min((channel.totalViews / 1000000) * 100, 100),
    },
    {
      title: '10,000,000 Views',
      description: '10 Million total views',
      achieved: channel.totalViews >= 10000000,
      icon: 'sparkles',
      color: 'text-hof',
      bgColor: 'bg-hof/10',
      progress: Math.min((channel.totalViews / 10000000) * 100, 100),
    },
    {
      title: '100,000,000 Views',
      description: '100 Million views - Viral success',
      achieved: channel.totalViews >= 100000000,
      icon: 'trending-up',
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
      progress: Math.min((channel.totalViews / 100000000) * 100, 100),
    },
    {
      title: '1,000,000,000 Views',
      description: '1 Billion views - Legendary status',
      achieved: channel.totalViews >= 1000000000,
      icon: 'crown',
      color: 'text-arches',
      bgColor: 'bg-arches/10',
      progress: Math.min((channel.totalViews / 1000000000) * 100, 100),
    },
  ]

  // Define video milestones
  const videoMilestones: Achievement[] = [
    {
      title: '10 Videos',
      description: 'Uploaded 10 videos',
      achieved: channel.videoCount >= 10,
      icon: 'video',
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
      progress: Math.min((channel.videoCount / 10) * 100, 100),
    },
    {
      title: '50 Videos',
      description: '50 videos published',
      achieved: channel.videoCount >= 50,
      icon: 'film',
      color: 'text-babu',
      bgColor: 'bg-babu/10',
      progress: Math.min((channel.videoCount / 50) * 100, 100),
    },
    {
      title: '100 Videos',
      description: 'Century of content',
      achieved: channel.videoCount >= 100,
      icon: 'play-circle',
      color: 'text-arches',
      bgColor: 'bg-arches/10',
      progress: Math.min((channel.videoCount / 100) * 100, 100),
    },
    {
      title: '500 Videos',
      description: 'Prolific creator',
      achieved: channel.videoCount >= 500,
      icon: 'collection',
      color: 'text-hof',
      bgColor: 'bg-hof/10',
      progress: Math.min((channel.videoCount / 500) * 100, 100),
    },
    {
      title: '1,000 Videos',
      description: 'Content machine',
      achieved: channel.videoCount >= 1000,
      icon: 'library',
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
      progress: Math.min((channel.videoCount / 1000) * 100, 100),
    },
  ]

  // Special achievements
  const specialAchievements: Achievement[] = [
    {
      title: 'Veteran Creator',
      description: 'Channel is over 5 years old',
      achieved: channelAgeInYears >= 5,
      icon: 'trophy',
      color: 'text-arches',
      bgColor: 'bg-arches/10',
    },
    {
      title: 'Decade Master',
      description: 'Channel is over 10 years old',
      achieved: channelAgeInYears >= 10,
      icon: 'shield',
      color: 'text-hof',
      bgColor: 'bg-hof/10',
    },
    {
      title: 'Consistent Creator',
      description: 'Uploaded 100+ videos',
      achieved: channel.videoCount >= 100,
      icon: 'calendar',
      color: 'text-babu',
      bgColor: 'bg-babu/10',
    },
    {
      title: 'Engagement King',
      description: 'High subscriber to video ratio',
      achieved: channel.videoCount > 0 && (channel.subscribers / channel.videoCount) >= 1000,
      icon: 'users',
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
    },
  ]

  const achievedCount = [...subscriberMilestones, ...viewMilestones, ...videoMilestones, ...specialAchievements]
    .filter(a => a.achieved).length

  const totalCount = subscriberMilestones.length + viewMilestones.length + videoMilestones.length + specialAchievements.length

  // Icon component
  const getIcon = (iconName: string) => {
    const icons: Record<string, JSX.Element> = {
      users: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      badge: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      star: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      award: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trophy: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      sparkles: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      fire: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
        </svg>
      ),
      eye: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      'trending-up': (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      crown: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l7 9-7 9V3zm14 0l-7 9 7 9V3z" />
        </svg>
      ),
      video: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      film: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
        </svg>
      ),
      'play-circle': (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      collection: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      library: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
        </svg>
      ),
      shield: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      calendar: (
        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    }
    return icons[iconName] || icons.star
  }

  const renderAchievementCard = (achievement: Achievement, index: number) => (
    <Card key={index}>
      <div
        className={`p-6 ${achievement.bgColor} ${!achievement.achieved ? 'opacity-50' : ''} transition-all hover:scale-105`}
      >
        <div className="flex items-start gap-4">
          <div className={achievement.color}>{getIcon(achievement.icon)}</div>
          <div className="flex-1">
            <h4 className={`font-semibold text-body ${achievement.color} mb-1`}>
              {achievement.title}
            </h4>
            <p className="text-small text-foggy mb-3">{achievement.description}</p>

            {achievement.progress !== undefined && (
              <div className="space-y-1">
                <div className="w-full bg-hof/20 rounded-full h-2">
                  <div
                    className={`${achievement.achieved ? achievement.color.replace('text-', 'bg-') : 'bg-foggy'} h-2 rounded-full transition-all`}
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-caption text-foggy">
                  {achievement.progress.toFixed(1)}% Complete
                </p>
              </div>
            )}

            <div className="mt-3">
              {achievement.achieved ? (
                <span className="inline-flex items-center gap-1 text-caption font-semibold text-babu">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Achieved
                </span>
              ) : (
                <span className="text-caption text-foggy">Not yet achieved</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Achievement Summary */}
      <Card>
        <div className="p-6 bg-rausch/10">
          <div className="text-center">
            <h3 className="text-headline-2 font-bold text-hof mb-2">
              {achievedCount} / {totalCount}
            </h3>
            <p className="text-body text-foggy mb-4">
              Achievements Unlocked
            </p>
            <div className="w-full bg-hof/20 rounded-full h-3 max-w-2xl mx-auto">
              <div
                className="bg-rausch h-3 rounded-full transition-all"
                style={{ width: `${(achievedCount / totalCount) * 100}%` }}
              />
            </div>
            <p className="text-caption text-foggy mt-2">
              {((achievedCount / totalCount) * 100).toFixed(1)}% Complete
            </p>
          </div>
        </div>
      </Card>

      {/* Subscriber Milestones */}
      <div>
        <h3 className="text-headline-3 font-semibold text-hof mb-4">
          Subscriber Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriberMilestones.map((achievement, index) => renderAchievementCard(achievement, index))}
        </div>
      </div>

      {/* View Milestones */}
      <div>
        <h3 className="text-headline-3 font-semibold text-hof mb-4">
          View Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {viewMilestones.map((achievement, index) => renderAchievementCard(achievement, index))}
        </div>
      </div>

      {/* Video Milestones */}
      <div>
        <h3 className="text-headline-3 font-semibold text-hof mb-4">
          Video Milestones
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videoMilestones.map((achievement, index) => renderAchievementCard(achievement, index))}
        </div>
      </div>

      {/* Special Achievements */}
      <div>
        <h3 className="text-headline-3 font-semibold text-hof mb-4">
          Special Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialAchievements.map((achievement, index) => renderAchievementCard(achievement, index))}
        </div>
      </div>

      {/* Channel Stats */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-4">
            Channel Milestones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-small text-foggy mb-1">Channel Created</p>
              <p className="text-body font-bold text-hof">
                {formatDate(channel.publishedAt)}
              </p>
              <p className="text-caption text-foggy mt-1">
                {channelAgeInYears.toFixed(1)} years ago
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-1">Total Subscribers</p>
              <p className="text-body font-bold text-rausch">
                {formatNumber(channel.subscribers)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-1">Total Views</p>
              <p className="text-body font-bold text-babu">
                {formatNumber(channel.totalViews)}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
