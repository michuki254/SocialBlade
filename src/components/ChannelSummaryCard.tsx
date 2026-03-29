'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components'
import { formatNumber } from '@/lib/youtube-utils'
import type { FormattedChannelData } from '@/types/youtube'

interface ChannelSummaryCardProps {
  channel: FormattedChannelData
  thirtyDayStats?: {
    subscribers: number
    views: number
  }
}

interface HistoricalGrowth {
  subscribers: number
  views: number
  videos: number
  days: number
}

export function ChannelSummaryCard({ channel, thirtyDayStats }: ChannelSummaryCardProps) {
  const [historicalGrowth, setHistoricalGrowth] = useState<HistoricalGrowth | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch historical growth data from database
  useEffect(() => {
    const fetchGrowth = async () => {
      try {
        const response = await fetch(`/api/channel-snapshots?channelId=${channel.id}&days=30`)
        const data = await response.json()

        if (data.hasData && data.growth) {
          setHistoricalGrowth(data.growth)
        }
      } catch (error) {
        console.error('Error fetching historical growth:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrowth()
  }, [channel.id])

  // Calculate estimated earnings based on views
  // Industry data: Average US YouTube CPM is $15.34
  // YouTube takes 45% cut, creators receive 55%
  // CPM varies by niche: Digital Marketing/Finance ($36), Education ($9), Gaming ($4.55), etc.
  // Using $8-$20 CPM range to account for niche variation
  const estimateMonthlyEarnings = (views: number) => {
    const cpmLow = 8
    const cpmHigh = 20
    const creatorShareLow = (views / 1000) * cpmLow * 0.55
    const creatorShareHigh = (views / 1000) * cpmHigh * 0.55
    return { low: creatorShareLow, high: creatorShareHigh }
  }

  const estimateYearlyEarnings = (monthlyLow: number, monthlyHigh: number) => {
    return {
      low: monthlyLow * 12,
      high: monthlyHigh * 12,
    }
  }

  // Use real historical data if available, otherwise estimate
  const estimatedMonthlyViewPercentage = 0.015 // 1.5% of total views
  const last30DayViews = historicalGrowth?.views || thirtyDayStats?.views || Math.round(channel.totalViews * estimatedMonthlyViewPercentage)
  const last30DaySubscribers = historicalGrowth?.subscribers || thirtyDayStats?.subscribers || 0

  const monthlyEarnings = estimateMonthlyEarnings(last30DayViews)
  const yearlyEarnings = estimateYearlyEarnings(monthlyEarnings.low, monthlyEarnings.high)

  const formatCurrency = (low: number, high: number) => {
    if (low === 0 && high === 0) return 'N/A'
    if (low >= 1000000) {
      return `$${(low / 1000000).toFixed(1)}M - $${(high / 1000000).toFixed(1)}M`
    }
    if (low >= 1000) {
      return `$${(low / 1000).toFixed(1)}K - $${(high / 1000).toFixed(1)}K`
    }
    return `$${low.toFixed(0)} - $${high.toFixed(0)}`
  }

  const summaryStats = [
    {
      label: 'Subscribers for the last 30 days',
      value: last30DaySubscribers > 0 ? `+${formatNumber(last30DaySubscribers)}` : (historicalGrowth ? '0' : 'N/A'),
      color: 'text-babu',
      bgColor: 'bg-babu/10',
    },
    {
      label: 'Views for the last 30 days',
      value: formatNumber(last30DayViews),
      color: 'text-rausch',
      bgColor: 'bg-rausch/10',
    },
    {
      label: 'Monthly Estimated Earnings',
      value: formatCurrency(monthlyEarnings.low, monthlyEarnings.high),
      color: 'text-arches',
      bgColor: 'bg-arches/10',
    },
    {
      label: 'Yearly Estimated Earnings',
      value: formatCurrency(yearlyEarnings.low, yearlyEarnings.high),
      color: 'text-hof',
      bgColor: 'bg-hof/10',
    },
  ]

  const isUsingRealData = !!historicalGrowth

  return (
    <Card>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-3 font-semibold">30-Day Summary</h3>
          <div className="flex items-center gap-2">
            {isUsingRealData ? (
              <span className="text-caption text-babu flex items-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Real Data
              </span>
            ) : (
              <span className="text-caption text-foggy">Estimated</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summaryStats.map((stat, index) => (
            <div
              key={index}
              className={`p-4 rounded-standard ${stat.bgColor} border border-transparent hover:border-hof/30 transition-colors`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-caption text-foggy mb-2">{stat.label}</p>
                <p className={`text-headline-3 font-bold ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-hof/20">
          <p className="text-caption text-foggy text-center leading-relaxed">
            <span className="font-semibold">Note:</span> {isUsingRealData ? 'Growth data is tracked from historical snapshots.' : 'Growth data will show real figures after 30 days of tracking. Currently showing estimates.'}
            {' '}Earnings estimates are based on US average CPM rates ($8-$20 per 1,000 views after YouTube's 45% revenue share).
            Actual earnings vary significantly by niche (Finance: $36, Education: $9, Gaming: $4.55), audience location, ad format, seasonality, and content quality.
          </p>
        </div>
      </div>
    </Card>
  )
}
