'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useNotifications } from './NotificationCenter'

export const Navigation = () => {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const megaMenuRef = useRef<HTMLDivElement>(null)
  const { unreadCount } = useNotifications()

  const isActive = (path: string) => pathname === path

  const youtubePages = [
    { href: '/video', label: 'Video Analytics', description: 'Analyze individual video performance' },
    { href: '/channel', label: 'Channel Analytics', description: 'Track channel growth and metrics' },
    { href: '/compare', label: 'Compare Videos', description: 'Side-by-side video comparison' },
    { href: '/compare-channels', label: 'Compare Channels', description: 'Compare multiple channels side-by-side' },
    { href: '/history', label: 'Historical Tracking', description: 'Track growth and industry benchmarks' },
    { href: '/monetization', label: 'Revenue Estimator', description: 'Estimate earnings and revenue' },
    { href: '/seo', label: 'SEO Tools', description: 'Optimize titles, tags, and descriptions' },
    { href: '/comments', label: 'Comments Analytics', description: 'Analyze audience sentiment' },
    { href: '/playlists', label: 'Playlist Analytics', description: 'Optimize playlist performance' },
    { href: '/realtime', label: 'Real-Time Analytics', description: 'Live channel activity monitoring' },
  ]

  const isYoutubeActive = youtubePages.some(page => pathname === page.href)

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-white shadow-elevation-1 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-rausch rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <span className="font-bold text-body text-hof hidden sm:block">
              SocialBlade Analytics
            </span>
            <span className="font-bold text-body text-hof sm:hidden">
              SBA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {/* Home Link */}
            <Link
              href="/"
              className={`px-4 py-2 rounded-standard text-small font-medium transition-all ${
                isActive('/')
                  ? 'bg-rausch text-white'
                  : 'text-hof hover:bg-hof/10'
              }`}
            >
              Home
            </Link>

            {/* YouTube Mega Menu */}
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`px-4 py-2 rounded-standard text-small font-medium transition-all flex items-center gap-2 ${
                  isYoutubeActive
                    ? 'bg-rausch text-white'
                    : 'text-hof hover:bg-hof/10'
                }`}
                suppressHydrationWarning
              >
                YouTube
                <svg
                  className={`w-4 h-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Mega Menu Dropdown */}
              {megaMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-[600px] bg-white rounded-standard shadow-elevation-2 border border-hof/10 p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {youtubePages.map((page) => (
                      <Link
                        key={page.href}
                        href={page.href}
                        onClick={() => setMegaMenuOpen(false)}
                        className={`p-4 rounded-standard transition-all hover:bg-hof/5 ${
                          isActive(page.href) ? 'bg-rausch/10 border-l-4 border-rausch' : ''
                        }`}
                      >
                        <div className="font-medium text-small text-hof mb-1">
                          {page.label}
                        </div>
                        <div className="text-caption text-foggy">
                          {page.description}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top Channels Link */}
            <Link
              href="/top-channels"
              className={`px-4 py-2 rounded-standard text-small font-medium transition-all flex items-center gap-2 ${
                isActive('/top-channels')
                  ? 'bg-rausch text-white'
                  : 'text-hof hover:bg-hof/10'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Top Channels
            </Link>

            {/* Dashboard Link */}
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-standard text-small font-medium transition-all ${
                isActive('/dashboard')
                  ? 'bg-rausch text-white'
                  : 'text-hof hover:bg-hof/10'
              }`}
            >
              Dashboard
            </Link>

            {/* AI Insights Link */}
            <Link
              href="/ai-insights"
              className={`px-4 py-2 rounded-standard text-small font-medium transition-all flex items-center gap-2 ${
                isActive('/ai-insights')
                  ? 'bg-rausch text-white'
                  : 'text-hof hover:bg-hof/10'
              }`}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              AI Insights
            </Link>

            {/* Reports & Export Link */}
            <Link
              href="/reports"
              className={`px-4 py-2 rounded-standard text-small font-medium transition-all ${
                isActive('/reports')
                  ? 'bg-rausch text-white'
                  : 'text-hof hover:bg-hof/10'
              }`}
            >
              Reports & Export
            </Link>

            {/* Notification Bell */}
            <Link
              href="/alerts"
              className={`relative px-3 py-2 rounded-standard transition-all ${
                isActive('/alerts')
                  ? 'bg-rausch text-white'
                  : 'text-hof hover:bg-hof/10'
              }`}
              suppressHydrationWarning
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-rausch text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-standard text-hof hover:bg-hof/10 transition-colors"
            aria-label="Toggle menu"
            suppressHydrationWarning
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-hof/10">
            <div className="flex flex-col gap-2">
              {/* Home Link */}
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-standard text-small font-medium transition-all ${
                  isActive('/')
                    ? 'bg-rausch text-white'
                    : 'text-hof hover:bg-hof/10'
                }`}
              >
                Home
              </Link>

              {/* YouTube Section */}
              <div className="px-4 py-2 text-caption font-bold text-foggy uppercase tracking-wide">
                YouTube Analytics
              </div>
              {youtubePages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-standard transition-all ${
                    isActive(page.href)
                      ? 'bg-rausch text-white'
                      : 'text-hof hover:bg-hof/10'
                  }`}
                >
                  <div className="font-medium text-small">
                    {page.label}
                  </div>
                  <div className={`text-caption mt-1 ${
                    isActive(page.href) ? 'text-white/80' : 'text-foggy'
                  }`}>
                    {page.description}
                  </div>
                </Link>
              ))}

              {/* Tools Section */}
              <div className="px-4 py-2 text-caption font-bold text-foggy uppercase tracking-wide mt-2">
                Tools
              </div>
              <Link
                href="/top-channels"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-standard transition-all ${
                  isActive('/top-channels')
                    ? 'bg-rausch text-white'
                    : 'text-hof hover:bg-hof/10'
                }`}
              >
                <div className="font-medium text-small flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                  Top Channels
                </div>
                <div className={`text-caption mt-1 ${
                  isActive('/top-channels') ? 'text-white/80' : 'text-foggy'
                }`}>
                  Browse top YouTube creators with advanced filters
                </div>
              </Link>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-standard transition-all ${
                  isActive('/dashboard')
                    ? 'bg-rausch text-white'
                    : 'text-hof hover:bg-hof/10'
                }`}
              >
                <div className="font-medium text-small">
                  Dashboard
                </div>
                <div className={`text-caption mt-1 ${
                  isActive('/dashboard') ? 'text-white/80' : 'text-foggy'
                }`}>
                  Build custom analytics dashboards
                </div>
              </Link>
              <Link
                href="/ai-insights"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-standard transition-all ${
                  isActive('/ai-insights')
                    ? 'bg-rausch text-white'
                    : 'text-hof hover:bg-hof/10'
                }`}
              >
                <div className="font-medium text-small flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  AI Insights
                </div>
                <div className={`text-caption mt-1 ${
                  isActive('/ai-insights') ? 'text-white/80' : 'text-foggy'
                }`}>
                  GPT-4 powered content recommendations and strategy
                </div>
              </Link>
              <Link
                href="/reports"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-standard transition-all ${
                  isActive('/reports')
                    ? 'bg-rausch text-white'
                    : 'text-hof hover:bg-hof/10'
                }`}
              >
                <div className="font-medium text-small">
                  Reports & Export
                </div>
                <div className={`text-caption mt-1 ${
                  isActive('/reports') ? 'text-white/80' : 'text-foggy'
                }`}>
                  Generate PDF/CSV reports with custom branding
                </div>
              </Link>
              <Link
                href="/alerts"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-4 py-3 rounded-standard transition-all ${
                  isActive('/alerts')
                    ? 'bg-rausch text-white'
                    : 'text-hof hover:bg-hof/10'
                }`}
              >
                <div className="font-medium text-small flex items-center gap-2">
                  Alerts & Notifications
                  {unreadCount > 0 && (
                    <span className="bg-rausch text-white text-[10px] font-bold rounded-full px-2 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <div className={`text-caption mt-1 ${
                  isActive('/alerts') ? 'text-white/80' : 'text-foggy'
                }`}>
                  Performance alerts, milestones, and competitive tracking
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
