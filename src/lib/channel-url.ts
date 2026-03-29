import type { FormattedChannelData } from '@/types/youtube'

/**
 * Generate a SocialBlade-style URL for a channel
 * Format: /youtube/handle/{handle} or /youtube/channel/{id}
 */
export function getChannelUrl(channel: FormattedChannelData | { id: string; customUrl?: string }): string {
  // If channel has a custom URL (like @mrbeast), use handle format
  if (channel.customUrl) {
    // Remove @ symbol if present and any leading/trailing slashes
    const handle = channel.customUrl.replace(/^@/, '').replace(/^\/|\/$/g, '')
    return `/youtube/handle/${handle}`
  }

  // Otherwise use channel ID format
  return `/youtube/channel/${channel.id}`
}

/**
 * Extract handle from custom URL
 */
export function extractHandle(customUrl: string): string {
  return customUrl.replace(/^@/, '').replace(/^\/|\/$/g, '')
}
