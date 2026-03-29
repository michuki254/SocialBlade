'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input } from '@/components'
import { getPopularChannelsByRegion } from '@/services/youtube'
import { getUserCountry, getCountryName } from '@/lib/geo-location'
import { formatNumber } from '@/lib/youtube-utils'
import { getChannelUrl } from '@/lib/channel-url'
import type { FormattedChannelData } from '@/types/youtube'
import Image from 'next/image'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()
  const countrySelectorRef = useRef<HTMLDivElement>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchType, setSearchType] = useState<'video' | 'channel'>('video')
  const [popularChannels, setPopularChannels] = useState<FormattedChannelData[]>([])
  const [loading, setLoading] = useState(true)
  const [userCountry, setUserCountry] = useState('US')
  const [countryName, setCountryName] = useState('United States')
  const [showCountrySelector, setShowCountrySelector] = useState(false)
  const [countrySearch, setCountrySearch] = useState('')
  const [isAutoDetected, setIsAutoDetected] = useState(true)

  const POPULAR_COUNTRIES = [
    { code: 'GLOBAL', name: 'Global (Worldwide)', flag: '🌍' },
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺' },
    { code: 'IN', name: 'India', flag: '🇮🇳' },
    { code: 'DE', name: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name: 'France', flag: '🇫🇷' },
    { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
    { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
    { code: 'NG', name: 'Nigeria', flag: '🇳🇬' },
    { code: 'KE', name: 'Kenya', flag: '🇰🇪' },
    { code: 'ZA', name: 'South Africa', flag: '🇿🇦' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭' },
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩' },
    { code: 'ES', name: 'Spain', flag: '🇪🇸' },
    { code: 'IT', name: 'Italy', flag: '🇮🇹' },
    { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
    { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
    { code: 'NO', name: 'Norway', flag: '🇳🇴' },
    { code: 'PL', name: 'Poland', flag: '🇵🇱' },
    { code: 'TR', name: 'Turkey', flag: '🇹🇷' },
    { code: 'SA', name: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name: 'UAE', flag: '🇦🇪' },
    { code: 'EG', name: 'Egypt', flag: '🇪🇬' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
    { code: 'VN', name: 'Vietnam', flag: '🇻🇳' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'GH', name: 'Ghana', flag: '🇬🇭' },
    { code: 'UG', name: 'Uganda', flag: '🇺🇬' },
    { code: 'TZ', name: 'Tanzania', flag: '🇹🇿' },
    { code: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
    { code: 'PK', name: 'Pakistan', flag: '🇵🇰' },
  ]

  const filteredCountries = POPULAR_COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearch.toLowerCase())
  )

  const loadPopularChannels = async (countryCode?: string, isManual: boolean = false) => {
    setLoading(true)
    try {
      // Get user's country via IP geolocation or use provided country
      const country = countryCode || await getUserCountry()
      console.log('Loading popular channels for country:', country, isManual ? '(manually selected)' : '(auto-detected)')

      setUserCountry(country)
      setCountryName(getCountryName(country))
      setIsAutoDetected(!isManual)

      let channels

      // Fetch from database for all regions (global + per-country)
      const region = country === 'GLOBAL' ? 'global' : country.toLowerCase()
      try {
        const response = await fetch(`/api/top-channels?region=${region}&limit=10`)
        const data = await response.json()

        if (data.success && data.channels.length > 0) {
          channels = data.channels
          console.log(`Loaded ${channels.length} channels for ${region} from database`)
        } else {
          // Fallback to real-time API if no data in database
          console.log('No data in database, fetching from YouTube API...')
          channels = await getPopularChannelsByRegion(country, 10)
        }
      } catch (error) {
        console.error('Error fetching from database, using API:', error)
        channels = await getPopularChannelsByRegion(country, 10)
      }

      setPopularChannels(channels)

      // Save user's manual selection to localStorage
      if (isManual && countryCode) {
        localStorage.setItem('user_selected_country', countryCode)
      }
    } catch (error) {
      console.error('Error loading popular channels:', error)
      // Fallback to US if geolocation fails
      setUserCountry('US')
      setCountryName('United States')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if user has manually selected a country before
    const savedCountry = typeof window !== 'undefined'
      ? localStorage.getItem('user_selected_country')
      : null

    loadPopularChannels(savedCountry || undefined, !!savedCountry)
  }, [])

  const handleCountryChange = (countryCode: string) => {
    console.log('User manually selected country:', countryCode)
    setShowCountrySelector(false)
    setCountrySearch('')
    loadPopularChannels(countryCode, true)
  }

  const handleResetToAutoDetect = async () => {
    console.log('Resetting to auto-detected country')
    localStorage.removeItem('user_selected_country')
    setShowCountrySelector(false)
    setCountrySearch('')
    loadPopularChannels(undefined, false)
  }

  // Click away listener for country selector
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        countrySelectorRef.current &&
        !countrySelectorRef.current.contains(event.target as Node)
      ) {
        setShowCountrySelector(false)
      }
    }

    if (showCountrySelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showCountrySelector])

  const handleSearch = () => {
    if (searchInput.trim()) {
      const page = searchType === 'video' ? '/video' : '/channel'
      router.push(`${page}?q=${encodeURIComponent(searchInput)}`)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const stats = [
    { label: 'Total Users', value: '2.5M', color: 'text-rausch' },
    { label: 'Channels Tracked', value: '450K', color: 'text-babu' },
    { label: 'Daily Updates', value: '1.2M', color: 'text-arches' },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="text-headline-1 font-bold mb-4">
              Track Social Media Statistics
            </h1>
            <p className="text-xl mb-8 opacity-95">
              Analyze channel performance, track growth, and discover trending creators with real-time analytics.
            </p>

            {/* Search Type Toggle */}
            <div className="flex gap-2 mb-4" suppressHydrationWarning>
              <button
                onClick={() => setSearchType('video')}
                className={`px-6 py-2 rounded-standard text-small font-medium transition-all ${
                  searchType === 'video'
                    ? 'bg-white text-rausch'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                suppressHydrationWarning
              >
                Video
              </button>
              <button
                onClick={() => setSearchType('channel')}
                className={`px-6 py-2 rounded-standard text-small font-medium transition-all ${
                  searchType === 'channel'
                    ? 'bg-white text-babu'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
                suppressHydrationWarning
              >
                Channel
              </button>
            </div>

            {/* Search Bar */}
            <div className="flex gap-4 max-w-2xl">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder={
                    searchType === 'video'
                      ? 'Enter YouTube video URL or ID...'
                      : 'Enter channel URL, ID, or @username...'
                  }
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white"
                />
              </div>
              <Button onClick={handleSearch} size="large">
                Analyze
              </Button>
            </div>
            <p className="text-sm opacity-90 mt-3">
              {searchType === 'video'
                ? 'Try: https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                : 'Try: @MrBeast or https://www.youtube.com/@MrBeast'}
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-background-secondary">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} hover>
                <div className="text-center">
                  <p className="text-foggy text-small mb-2">{stat.label}</p>
                  <p className={`text-headline-2 font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Top Popular Creators Section */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="text-center">
              <h2 className="text-headline-2 font-semibold mb-2">
                Top 10 {userCountry === 'GLOBAL' ? 'Most Subscribed' : 'Popular'} YouTube Creators
              </h2>
              <div className="flex flex-col items-center gap-2">
                {userCountry !== 'GLOBAL' && (
                  <p className="text-small text-foggy">
                    Showing trending creators in
                  </p>
                )}
                <div className="relative" ref={countrySelectorRef}>
                  <button
                    onClick={() => setShowCountrySelector(!showCountrySelector)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rausch/10 to-arches/10 rounded-full border-2 border-rausch/30 hover:border-rausch/60 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <span className="text-2xl">
                      {POPULAR_COUNTRIES.find(c => c.code === userCountry)?.flag || '🌍'}
                    </span>
                    <div className="flex flex-col items-start">
                      <span className="text-body font-bold text-rausch">{countryName}</span>
                      <span className="text-caption text-foggy flex items-center gap-1">
                        {isAutoDetected ? (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            Auto-detected
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                            Manually selected
                          </>
                        )}
                      </span>
                    </div>
                    <div className="ml-2 flex items-center gap-1">
                      <span className="text-caption text-rausch group-hover:text-rausch font-medium">Change</span>
                      <svg className="w-4 h-4 text-rausch group-hover:translate-y-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </button>

                  {/* Country Selector Dropdown */}
                  {showCountrySelector && (
                    <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-white rounded-standard shadow-lift border border-hof/20 py-2 z-50 w-80">
                      <div className="px-4 py-3 border-b border-hof/20">
                        <p className="text-caption font-semibold text-foggy uppercase tracking-wide mb-2">
                          Select Your Location
                        </p>
                        <Input
                          type="text"
                          placeholder="Search countries..."
                          value={countrySearch}
                          onChange={(e) => setCountrySearch(e.target.value)}
                          className="text-small"
                        />
                      </div>

                      {!isAutoDetected && (
                        <div className="px-4 py-2 border-b border-hof/20 bg-babu/5">
                          <button
                            onClick={handleResetToAutoDetect}
                            className="w-full text-left text-small text-babu hover:text-babu/80 flex items-center gap-2 font-medium"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                            </svg>
                            Reset to Auto-Detect My Location
                          </button>
                        </div>
                      )}

                      <div className="max-h-80 overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              onClick={() => handleCountryChange(country.code)}
                              className={`w-full text-left px-4 py-2.5 hover:bg-rausch/5 transition-colors flex items-center gap-3 ${
                                userCountry === country.code ? 'bg-rausch/10' : ''
                              }`}
                            >
                              <span className="text-2xl">{country.flag}</span>
                              <div className="flex-1">
                                <span className="text-small font-medium">{country.name}</span>
                                <span className="text-caption text-foggy ml-2">({country.code})</span>
                              </div>
                              {userCountry === country.code && (
                                <svg className="w-5 h-5 text-rausch" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center text-foggy text-small">
                            No countries found matching "{countrySearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Link href="/top-channels">
              <Button variant="secondary" size="small" suppressHydrationWarning>
                View Full Rankings →
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-rausch border-t-transparent mb-4"></div>
                <p className="text-foggy flex items-center justify-center gap-2">
                  <span className="text-2xl">
                    {POPULAR_COUNTRIES.find(c => c.code === userCountry)?.flag || '🌍'}
                  </span>
                  {userCountry === 'GLOBAL'
                    ? 'Loading most subscribed channels worldwide...'
                    : `Loading popular creators in ${countryName}...`
                  }
                </p>
              </div>
            ) : popularChannels.length > 0 ? (
              <div className="space-y-4">
                {popularChannels.map((channel, index) => (
                  <Link key={channel.id} href={getChannelUrl(channel)}>
                    <Card hover>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-rausch to-arches rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-xl">
                              {index + 1}
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
                            <h3 className="font-semibold text-body truncate">{channel.title}</h3>
                            <p className="text-foggy text-small">{formatNumber(channel.subscribers)} subscribers</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-babu font-semibold">{formatNumber(channel.totalViews)}</p>
                          <p className="text-foggy text-small">total views</p>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-foggy">
                  {userCountry === 'GLOBAL'
                    ? 'No channels found'
                    : `No popular channels found for ${countryName}`
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-hof text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-headline-2 font-semibold mb-4">
            Ready to track your growth?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join thousands of creators using our platform to monitor their social media performance.
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="primary" size="large">
              Get Started Free
            </Button>
            <Button variant="tertiary" size="large" className="bg-white/10 text-white hover:bg-white/20">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background-secondary py-8">
        <div className="container mx-auto px-6 text-center text-foggy text-small">
          <p>Built with Next.js and Airbnb Design System</p>
        </div>
      </footer>
    </main>
  )
}
