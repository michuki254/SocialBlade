/**
 * Extract YouTube video ID from various URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - Just the VIDEO_ID
 */
export function extractVideoId(input: string): string | null {
  if (!input) return null

  // If it's already just an ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim()
  }

  // Regular expression patterns for different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ]

  for (const pattern of patterns) {
    const match = input.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }

  return null
}

/**
 * Extract YouTube channel ID from URL
 * Supports:
 * - https://www.youtube.com/channel/CHANNEL_ID
 * - https://www.youtube.com/@username
 */
export function extractChannelId(input: string): string | null {
  if (!input) return null

  // If it's already just a channel ID (24 characters starting with UC)
  if (/^UC[a-zA-Z0-9_-]{22}$/.test(input.trim())) {
    return input.trim()
  }

  // Pattern for channel URL
  const channelPattern = /youtube\.com\/channel\/([a-zA-Z0-9_-]{24})/
  const match = input.match(channelPattern)

  if (match && match[1]) {
    return match[1]
  }

  // For @username, we'll need to search for it
  const usernamePattern = /youtube\.com\/@([a-zA-Z0-9_-]+)/
  const usernameMatch = input.match(usernamePattern)

  if (usernameMatch && usernameMatch[1]) {
    return `@${usernameMatch[1]}`
  }

  return null
}

/**
 * Extract YouTube playlist ID from URL
 * Supports:
 * - https://www.youtube.com/playlist?list=PLAYLIST_ID
 * - Just the PLAYLIST_ID
 */
export function extractPlaylistId(input: string): string | null {
  if (!input) return null

  // If it's already just a playlist ID (starts with PL, UU, LL, FL, RD, etc.)
  if (/^[A-Z]{2}[a-zA-Z0-9_-]+$/.test(input.trim())) {
    return input.trim()
  }

  // Pattern for playlist URL
  const playlistPattern = /[?&]list=([A-Z]{2}[a-zA-Z0-9_-]+)/
  const match = input.match(playlistPattern)

  if (match && match[1]) {
    return match[1]
  }

  return null
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(1) + 'B'
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M'
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K'
  }
  return num.toString()
}

/**
 * Format number with commas
 */
export function formatNumberWithCommas(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * Parse ISO 8601 duration to readable format
 * Example: PT4M13S -> 4:13
 */
export function parseDuration(duration: string): string {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)

  if (!match) return '0:00'

  const hours = (match[1] || '').replace('H', '')
  const minutes = (match[2] || '').replace('M', '')
  const seconds = (match[3] || '').replace('S', '')

  const parts = []

  if (hours) parts.push(hours)
  parts.push(minutes || '0')
  parts.push(seconds.padStart(2, '0') || '00')

  return parts.join(':')
}

/**
 * Format date to relative time (e.g., "2 days ago")
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

/**
 * Format date to readable string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
