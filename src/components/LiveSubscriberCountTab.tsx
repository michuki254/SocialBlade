'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components'
import { formatNumberWithCommas } from '@/lib/youtube-utils'
import type { FormattedChannelData } from '@/types/youtube'

interface LiveSubscriberCountTabProps {
  channel: FormattedChannelData
}

export const LiveSubscriberCountTab: React.FC<LiveSubscriberCountTabProps> = ({ channel }) => {
  const [liveCount, setLiveCount] = useState(channel.subscribers)
  const [growthData, setGrowthData] = useState<any>(null)
  const [totalGain, setTotalGain] = useState(0)

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await fetch(`/api/channel-snapshots?channelId=${channel.id}&days=30`)
        const data = await response.json()
        setGrowthData(data)
      } catch (error) {
        console.error('Error fetching growth data:', error)
      }
    }

    fetchGrowthData()
  }, [channel.id])

  // Calculate growth rate per second
  const dailyGrowth = growthData?.growth?.subscribers
    ? growthData.growth.subscribers / growthData.growth.days
    : channel.subscribers * 0.001 // 0.1% daily growth estimate

  const growthPerSecond = dailyGrowth / (24 * 60 * 60)

  // Simulate live counter
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveCount(prev => {
        const newCount = prev + growthPerSecond
        return Math.floor(newCount)
      })
      setTotalGain(prev => prev + growthPerSecond)
    }, 1000)

    return () => clearInterval(interval)
  }, [growthPerSecond])

  const statsCards = [
    {
      label: 'Subscribers Gained (Today)',
      value: formatNumberWithCommas(Math.floor(dailyGrowth)),
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
    },
    {
      label: 'Subscribers Gained (This Hour)',
      value: formatNumberWithCommas(Math.floor(dailyGrowth / 24)),
      color: 'text-babu',
      bgColor: 'bg-babu/10',
    },
    {
      label: 'Subscribers Per Minute',
      value: formatNumberWithCommas(Math.floor(dailyGrowth / (24 * 60))),
      color: 'text-arches',
      bgColor: 'bg-arches/10',
    },
    {
      label: 'Since You Started Watching',
      value: `+${Math.floor(totalGain)}`,
      color: 'text-hof',
      bgColor: 'bg-hof/10',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Live Counter Display */}
      <Card>
        <div className="p-8 md:p-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 bg-rausch rounded-full animate-pulse"></div>
            <p className="text-small text-foggy uppercase tracking-wide">Live Subscriber Count</p>
          </div>

          <div className="relative inline-block">
            <p className="text-6xl md:text-8xl font-bold text-hof tabular-nums tracking-tight mb-2">
              {formatNumberWithCommas(liveCount)}
            </p>
            <div className="absolute -bottom-1 left-1/4 right-1/4 h-1 bg-rausch opacity-50"></div>
          </div>

          <p className="text-small text-foggy mt-4">
            {growthData?.growth ? 'Based on recent growth trends' : 'Estimated growth rate'}
          </p>
        </div>
      </Card>

      {/* Growth Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <div className={`text-center p-6 ${stat.bgColor} rounded-standard`}>
              <p className="text-caption text-foggy mb-2">{stat.label}</p>
              <p className={`text-headline-3 font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Growth Visualization */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-6">
            Growth Breakdown
          </h3>

          <div className="space-y-6">
            {/* Per Second */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-small text-foggy">Subscribers Per Second</p>
                <p className="text-body font-semibold text-hof">
                  {growthPerSecond.toFixed(3)}
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-rausch h-2 rounded-full transition-all animate-pulse"
                  style={{
                    width: `${Math.min((growthPerSecond / 0.1) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Per Minute */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-small text-foggy">Subscribers Per Minute</p>
                <p className="text-body font-semibold text-hof">
                  {(growthPerSecond * 60).toFixed(2)}
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-babu h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((growthPerSecond * 60 / 5) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Per Hour */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-small text-foggy">Subscribers Per Hour</p>
                <p className="text-body font-semibold text-hof">
                  {formatNumberWithCommas(Math.floor(dailyGrowth / 24))}
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-arches h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((dailyGrowth / 24 / 100) * 100, 100)}%`
                  }}
                />
              </div>
            </div>

            {/* Per Day */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-small text-foggy">Subscribers Per Day</p>
                <p className="text-body font-semibold text-hof">
                  {formatNumberWithCommas(Math.floor(dailyGrowth))}
                </p>
              </div>
              <div className="w-full bg-hof/10 rounded-full h-2">
                <div
                  className="bg-rausch h-2 rounded-full transition-all"
                  style={{
                    width: `${Math.min((dailyGrowth / 1000) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Milestones */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-6">
            Next Milestones
          </h3>

          <div className="space-y-4">
            {/* Calculate next milestones */}
            {[
              { milestone: Math.ceil(channel.subscribers / 100000) * 100000, label: 'K' },
              { milestone: Math.ceil(channel.subscribers / 1000000) * 1000000, label: 'M' },
              { milestone: Math.ceil(channel.subscribers / 10000000) * 10000000, label: 'M' },
            ]
              .filter(m => m.milestone > channel.subscribers)
              .slice(0, 3)
              .map((item, index) => {
                const remaining = item.milestone - liveCount
                const daysToReach = remaining / dailyGrowth
                const percentage = ((liveCount / item.milestone) * 100)

                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-body font-semibold text-hof">
                        {formatNumberWithCommas(item.milestone)} Subscribers
                      </p>
                      <p className="text-small text-foggy">
                        {daysToReach < 1
                          ? 'Less than a day'
                          : daysToReach < 30
                          ? `~${Math.ceil(daysToReach)} days`
                          : `~${Math.ceil(daysToReach / 30)} months`}
                      </p>
                    </div>
                    <div className="w-full bg-hof/10 rounded-full h-3">
                      <div
                        className="bg-babu h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-caption text-foggy mt-1">
                      {formatNumberWithCommas(Math.floor(remaining))} subscribers to go
                    </p>
                  </div>
                )
              })}
          </div>
        </div>
      </Card>

      {/* Info Note */}
      <div className="p-4 bg-hof/10 rounded-standard border border-hof/20">
        <p className="text-caption text-foggy text-center">
          <span className="font-semibold">Note:</span> The live counter simulates real-time growth based on {growthData?.growth ? 'actual' : 'estimated'} daily growth trends.
          For the most accurate count, refresh the page. YouTube's official subscriber count updates periodically.
        </p>
      </div>
    </div>
  )
}
