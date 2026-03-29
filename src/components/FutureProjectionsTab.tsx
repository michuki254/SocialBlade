'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components'
import { formatNumber, formatNumberWithCommas } from '@/lib/youtube-utils'
import type { FormattedChannelData } from '@/types/youtube'

interface FutureProjectionsTabProps {
  channel: FormattedChannelData
}

interface ProjectionData {
  subscribers: number
  views: number
  estimatedEarnings: { low: number; high: number }
}

export const FutureProjectionsTab: React.FC<FutureProjectionsTabProps> = ({ channel }) => {
  const [growthData, setGrowthData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const response = await fetch(`/api/channel-snapshots?channelId=${channel.id}&days=30`)
        const data = await response.json()
        setGrowthData(data)
      } catch (error) {
        console.error('Error fetching growth data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGrowthData()
  }, [channel.id])

  // Calculate daily growth rates
  const dailySubGrowth = growthData?.growth?.subscribers
    ? Math.floor(growthData.growth.subscribers / growthData.growth.days)
    : Math.floor(channel.subscribers * 0.001) // 0.1% daily growth estimate

  const dailyViewGrowth = growthData?.growth?.views
    ? Math.floor(growthData.growth.views / growthData.growth.days)
    : Math.floor(channel.totalViews * 0.015 / 30) // Based on monthly estimate

  // Calculate projections
  const calculateProjections = (days: number): ProjectionData => {
    const projectedSubs = channel.subscribers + (dailySubGrowth * days)
    const projectedViews = channel.totalViews + (dailyViewGrowth * days)

    // Calculate monthly views from daily growth
    const monthlyViews = dailyViewGrowth * 30
    const cpmLow = 8
    const cpmHigh = 20
    const earningsLow = (monthlyViews / 1000) * cpmLow * 0.55
    const earningsHigh = (monthlyViews / 1000) * cpmHigh * 0.55

    return {
      subscribers: projectedSubs,
      views: projectedViews,
      estimatedEarnings: { low: earningsLow, high: earningsHigh }
    }
  }

  const oneMonthProjection = calculateProjections(30)
  const threeMonthProjection = calculateProjections(90)
  const sixMonthProjection = calculateProjections(180)
  const oneYearProjection = calculateProjections(365)

  const formatCurrency = (low: number, high: number) => {
    if (low >= 1000000) {
      return `$${(low / 1000000).toFixed(1)}M - $${(high / 1000000).toFixed(1)}M`
    }
    if (low >= 1000) {
      return `$${(low / 1000).toFixed(1)}K - $${(high / 1000).toFixed(1)}K`
    }
    return `$${low.toFixed(0)} - $${high.toFixed(0)}`
  }

  return (
    <div className="space-y-6">
      {/* Growth Rate Overview */}
      <Card>
        <div className="p-6">
          <h3 className="text-headline-3 font-semibold text-hof mb-4">
            Current Growth Rate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-rausch/10 rounded-standard">
              <p className="text-small text-foggy mb-2">Daily Subscriber Growth</p>
              <p className="text-headline-3 font-bold text-rausch">
                +{formatNumber(dailySubGrowth)}
              </p>
              <p className="text-caption text-foggy mt-1">
                {growthData?.growth ? 'Based on real data' : 'Estimated'}
              </p>
            </div>
            <div className="p-4 bg-babu/10 rounded-standard">
              <p className="text-small text-foggy mb-2">Daily View Growth</p>
              <p className="text-headline-3 font-bold text-babu">
                +{formatNumber(dailyViewGrowth)}
              </p>
              <p className="text-caption text-foggy mt-1">
                {growthData?.growth ? 'Based on real data' : 'Estimated'}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 1 Month Projection */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-headline-3 font-semibold text-hof">
              1 Month Projection
            </h3>
            <span className="text-caption text-foggy">+30 days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-small text-foggy mb-2">Projected Subscribers</p>
              <p className="text-headline-3 font-bold text-rausch">
                {formatNumber(oneMonthProjection.subscribers)}
              </p>
              <p className="text-caption text-babu mt-1">
                +{formatNumber(oneMonthProjection.subscribers - channel.subscribers)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Projected Total Views</p>
              <p className="text-headline-3 font-bold text-babu">
                {formatNumber(oneMonthProjection.views)}
              </p>
              <p className="text-caption text-arches mt-1">
                +{formatNumber(oneMonthProjection.views - channel.totalViews)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Est. Monthly Earnings</p>
              <p className="text-headline-3 font-bold text-arches">
                {formatCurrency(oneMonthProjection.estimatedEarnings.low, oneMonthProjection.estimatedEarnings.high)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 3 Month Projection */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-headline-3 font-semibold text-hof">
              3 Month Projection
            </h3>
            <span className="text-caption text-foggy">+90 days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-small text-foggy mb-2">Projected Subscribers</p>
              <p className="text-headline-3 font-bold text-rausch">
                {formatNumber(threeMonthProjection.subscribers)}
              </p>
              <p className="text-caption text-babu mt-1">
                +{formatNumber(threeMonthProjection.subscribers - channel.subscribers)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Projected Total Views</p>
              <p className="text-headline-3 font-bold text-babu">
                {formatNumber(threeMonthProjection.views)}
              </p>
              <p className="text-caption text-arches mt-1">
                +{formatNumber(threeMonthProjection.views - channel.totalViews)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Est. Monthly Earnings</p>
              <p className="text-headline-3 font-bold text-arches">
                {formatCurrency(threeMonthProjection.estimatedEarnings.low, threeMonthProjection.estimatedEarnings.high)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 6 Month Projection */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-headline-3 font-semibold text-hof">
              6 Month Projection
            </h3>
            <span className="text-caption text-foggy">+180 days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-small text-foggy mb-2">Projected Subscribers</p>
              <p className="text-headline-3 font-bold text-rausch">
                {formatNumber(sixMonthProjection.subscribers)}
              </p>
              <p className="text-caption text-babu mt-1">
                +{formatNumber(sixMonthProjection.subscribers - channel.subscribers)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Projected Total Views</p>
              <p className="text-headline-3 font-bold text-babu">
                {formatNumber(sixMonthProjection.views)}
              </p>
              <p className="text-caption text-arches mt-1">
                +{formatNumber(sixMonthProjection.views - channel.totalViews)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Est. Monthly Earnings</p>
              <p className="text-headline-3 font-bold text-arches">
                {formatCurrency(sixMonthProjection.estimatedEarnings.low, sixMonthProjection.estimatedEarnings.high)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* 1 Year Projection */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-headline-3 font-semibold text-hof">
              1 Year Projection
            </h3>
            <span className="text-caption text-foggy">+365 days</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-small text-foggy mb-2">Projected Subscribers</p>
              <p className="text-headline-3 font-bold text-rausch">
                {formatNumber(oneYearProjection.subscribers)}
              </p>
              <p className="text-caption text-babu mt-1">
                +{formatNumber(oneYearProjection.subscribers - channel.subscribers)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Projected Total Views</p>
              <p className="text-headline-3 font-bold text-babu">
                {formatNumber(oneYearProjection.views)}
              </p>
              <p className="text-caption text-arches mt-1">
                +{formatNumber(oneYearProjection.views - channel.totalViews)}
              </p>
            </div>
            <div>
              <p className="text-small text-foggy mb-2">Est. Monthly Earnings</p>
              <p className="text-headline-3 font-bold text-arches">
                {formatCurrency(oneYearProjection.estimatedEarnings.low, oneYearProjection.estimatedEarnings.high)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <div className="p-4 bg-hof/10 rounded-standard border border-hof/20">
        <p className="text-caption text-foggy text-center">
          <span className="font-semibold">Note:</span> Projections are based on {growthData?.growth ? 'current' : 'estimated'} growth trends and should be used for reference only.
          Actual results may vary significantly based on content quality, algorithm changes, market trends, and other factors.
        </p>
      </div>
    </div>
  )
}
