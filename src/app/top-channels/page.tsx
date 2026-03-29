'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components'
import { getPopularChannelsByRegion } from '@/services/youtube'
import { getUserCountry, getCountryName } from '@/lib/geo-location'
import { formatNumber } from '@/lib/youtube-utils'
import { getChannelUrl } from '@/lib/channel-url'
import type { FormattedChannelData } from '@/types/youtube'
import Image from 'next/image'
import Link from 'next/link'

type FilterType = 'top' | 'most-subscribed' | 'most-viewed'
type OrderBy = 'subscribers' | 'views' | 'videos'

const COUNTRIES = [
  { code: 'GLOBAL', name: 'Global' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'CN', name: 'China' },
  { code: 'RU', name: 'Russia' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'TR', name: 'Turkey' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'EG', name: 'Egypt' },
  { code: 'PH', name: 'Philippines' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'CO', name: 'Colombia' },
  { code: 'PE', name: 'Peru' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'GR', name: 'Greece' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IL', name: 'Israel' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'PT', name: 'Portugal' },
  { code: 'RO', name: 'Romania' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'MA', name: 'Morocco' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'GH', name: 'Ghana' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'UG', name: 'Uganda' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'NP', name: 'Nepal' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IR', name: 'Iran' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'OM', name: 'Oman' },
  { code: 'QA', name: 'Qatar' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'GE', name: 'Georgia' },
  { code: 'AM', name: 'Armenia' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'HR', name: 'Croatia' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LV', name: 'Latvia' },
  { code: 'EE', name: 'Estonia' },
  { code: 'IS', name: 'Iceland' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MT', name: 'Malta' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'PA', name: 'Panama' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'HN', name: 'Honduras' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'CU', name: 'Cuba' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'TT', name: 'Trinidad and Tobago' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'LA', name: 'Laos' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'BN', name: 'Brunei' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'NE', name: 'Niger' },
  { code: 'ML', name: 'Mali' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'SN', name: 'Senegal' },
  { code: 'CI', name: 'Ivory Coast' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'AO', name: 'Angola' },
  { code: 'ZW', name: 'Zimbabwe' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'BW', name: 'Botswana' },
  { code: 'NA', name: 'Namibia' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'RE', name: 'Reunion' },
  { code: 'MG', name: 'Madagascar' },
]

const CATEGORIES = [
  'All',
  'Gaming',
  'Music',
  'Entertainment',
  'Education',
  'Science & Technology',
  'Sports',
  'News & Politics',
  'Comedy',
  'Film & Animation',
  'Howto & Style',
  'People & Blogs',
]

const LENGTHS = [10, 25, 50, 100, 250]

export default function TopChannelsPage() {
  const [channels, setChannels] = useState<FormattedChannelData[]>([])
  const [loading, setLoading] = useState(false)
  const [country, setCountry] = useState('US')
  const [category, setCategory] = useState('All')
  const [length, setLength] = useState(100)
  const [filterType, setFilterType] = useState<FilterType>('top')
  const [orderBy, setOrderBy] = useState<OrderBy>('subscribers')

  useEffect(() => {
    // Auto-detect user's country on load
    const detectCountry = async () => {
      const userCountry = await getUserCountry()
      setCountry(userCountry)
    }
    detectCountry()
  }, [])

  useEffect(() => {
    loadChannels()
  }, [country, length, orderBy])

  const loadChannels = async () => {
    setLoading(true)
    try {
      const regionCode = country === 'GLOBAL' ? 'US' : country
      const fetchedChannels = await getPopularChannelsByRegion(regionCode, length)

      // Sort based on orderBy
      const sorted = [...fetchedChannels].sort((a, b) => {
        if (orderBy === 'subscribers') return b.subscribers - a.subscribers
        if (orderBy === 'views') return b.totalViews - a.totalViews
        return b.videoCount - a.videoCount
      })

      setChannels(sorted)
    } catch (error) {
      console.error('Error loading channels:', error)
    } finally {
      setLoading(false)
    }
  }

  const getGrade = (rank: number): { grade: string; color: string } => {
    if (rank === 1) return { grade: 'S+', color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' }
    if (rank <= 3) return { grade: 'S', color: 'bg-gradient-to-r from-orange-400 to-red-500 text-white' }
    if (rank <= 10) return { grade: 'A+', color: 'bg-gradient-to-r from-red-500 to-pink-500 text-white' }
    if (rank <= 25) return { grade: 'A', color: 'bg-rausch text-white' }
    if (rank <= 50) return { grade: 'B+', color: 'bg-arches text-white' }
    if (rank <= 100) return { grade: 'B', color: 'bg-babu text-white' }
    return { grade: 'C', color: 'bg-hof text-white' }
  }

  const handleFilter = () => {
    loadChannels()
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-rausch to-arches text-white">
        <div className="container mx-auto px-6 py-16">
          <h1 className="text-headline-1 font-bold mb-4">
            YouTube Top Channels
          </h1>
          <p className="text-xl opacity-95 max-w-2xl">
            Discover the most popular YouTube channels worldwide with advanced filtering and rankings.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-hof/10 sticky top-16 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Country Filter */}
            <div>
              <label className="block text-caption font-semibold text-foggy mb-2 uppercase">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-2 rounded-standard border border-hof/20 text-small text-hof focus:outline-none focus:ring-2 focus:ring-rausch"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-caption font-semibold text-foggy mb-2 uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 rounded-standard border border-hof/20 text-small text-hof focus:outline-none focus:ring-2 focus:ring-rausch"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Length Filter */}
            <div>
              <label className="block text-caption font-semibold text-foggy mb-2 uppercase">
                Show Top
              </label>
              <select
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full px-4 py-2 rounded-standard border border-hof/20 text-small text-hof focus:outline-none focus:ring-2 focus:ring-rausch"
              >
                {LENGTHS.map(len => (
                  <option key={len} value={len}>{len}</option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-caption font-semibold text-foggy mb-2 uppercase">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                className="w-full px-4 py-2 rounded-standard border border-hof/20 text-small text-hof focus:outline-none focus:ring-2 focus:ring-rausch"
              >
                <option value="top">Top</option>
                <option value="most-subscribed">Most Subscribed</option>
                <option value="most-viewed">Most Viewed</option>
              </select>
            </div>

            {/* Order By Filter */}
            <div>
              <label className="block text-caption font-semibold text-foggy mb-2 uppercase">
                Order By
              </label>
              <select
                value={orderBy}
                onChange={(e) => setOrderBy(e.target.value as OrderBy)}
                className="w-full px-4 py-2 rounded-standard border border-hof/20 text-small text-hof focus:outline-none focus:ring-2 focus:ring-rausch"
              >
                <option value="subscribers">Subscribers</option>
                <option value="views">Views</option>
                <option value="videos">Videos</option>
              </select>
            </div>
          </div>

          {/* Filter Button */}
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={handleFilter} disabled={loading} suppressHydrationWarning>
              {loading ? 'Loading...' : 'Apply Filters'}
            </Button>
            <span className="text-small text-foggy">
              {channels.length} channels loaded
            </span>
          </div>
        </div>
      </section>

      {/* Table */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-rausch border-t-transparent mb-4"></div>
              <p className="text-foggy text-body">Loading top channels...</p>
            </div>
          ) : (
            <div className="bg-white rounded-standard shadow-elevation-1 overflow-hidden">
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-hof/5 border-b border-hof/10">
                    <tr>
                      <th className="text-left px-6 py-4 text-caption font-bold text-foggy uppercase tracking-wide w-20">
                        #
                      </th>
                      <th className="text-left px-6 py-4 text-caption font-bold text-foggy uppercase tracking-wide w-24">
                        Grade
                      </th>
                      <th className="text-left px-6 py-4 text-caption font-bold text-foggy uppercase tracking-wide">
                        Name
                      </th>
                      <th className="text-right px-6 py-4 text-caption font-bold text-foggy uppercase tracking-wide">
                        Subscribers
                      </th>
                      <th className="text-right px-6 py-4 text-caption font-bold text-foggy uppercase tracking-wide">
                        Views
                      </th>
                      <th className="text-right px-6 py-4 text-caption font-bold text-foggy uppercase tracking-wide">
                        Videos
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {channels.map((channel, index) => {
                      const rank = index + 1
                      const { grade, color } = getGrade(rank)

                      return (
                        <tr
                          key={channel.id}
                          className="border-b border-hof/10 hover:bg-hof/5 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <span className="font-bold text-body text-hof">
                              {rank}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-standard text-caption font-bold ${color}`}>
                              {grade}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={getChannelUrl(channel)} className="flex items-center gap-3 hover:text-rausch transition-colors">
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
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-body text-hof truncate">
                                  {channel.title}
                                </div>
                                {channel.customUrl && (
                                  <div className="text-caption text-foggy truncate">
                                    @{channel.customUrl}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-body text-rausch">
                              {formatNumber(channel.subscribers)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-body text-babu">
                              {formatNumber(channel.totalViews)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-semibold text-body text-arches">
                              {formatNumber(channel.videoCount)}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden divide-y divide-hof/10">
                {channels.map((channel, index) => {
                  const rank = index + 1
                  const { grade, color } = getGrade(rank)

                  return (
                    <Link
                      key={channel.id}
                      href={getChannelUrl(channel)}
                      className="block p-4 hover:bg-hof/5 transition-colors"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-body text-hof">
                            #{rank}
                          </span>
                          <span className={`inline-block px-2 py-1 rounded text-caption font-bold ${color}`}>
                            {grade}
                          </span>
                        </div>
                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-hof/10 flex-shrink-0">
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
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-body text-hof mb-1">
                            {channel.title}
                          </div>
                          {channel.customUrl && (
                            <div className="text-caption text-foggy">
                              @{channel.customUrl}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <div className="text-caption text-foggy">Subscribers</div>
                          <div className="font-semibold text-small text-rausch">
                            {formatNumber(channel.subscribers)}
                          </div>
                        </div>
                        <div>
                          <div className="text-caption text-foggy">Views</div>
                          <div className="font-semibold text-small text-babu">
                            {formatNumber(channel.totalViews)}
                          </div>
                        </div>
                        <div>
                          <div className="text-caption text-foggy">Videos</div>
                          <div className="font-semibold text-small text-arches">
                            {formatNumber(channel.videoCount)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>

              {channels.length === 0 && !loading && (
                <div className="text-center py-20">
                  <svg
                    className="w-24 h-24 mx-auto text-foggy/30 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <h3 className="text-headline-3 font-semibold text-hof mb-2">
                    No Channels Found
                  </h3>
                  <p className="text-foggy">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
