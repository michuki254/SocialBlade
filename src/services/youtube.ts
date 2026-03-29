import type {
  YouTubeVideoListResponse,
  YouTubeChannelListResponse,
  YouTubeSearchListResponse,
  YouTubeCommentThreadListResponse,
  YouTubePlaylistListResponse,
  YouTubePlaylistItemListResponse,
  FormattedVideoData,
  FormattedChannelData,
  FormattedCommentData,
  FormattedPlaylistData,
} from '@/types/youtube'
import { parseDuration } from '@/lib/youtube-utils'

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY
const API_URL = process.env.NEXT_PUBLIC_YOUTUBE_API_URL || 'https://www.googleapis.com/youtube/v3'

if (!API_KEY) {
  console.error('YouTube API key is not set in environment variables')
}

/**
 * Fetch video details by video ID
 */
export async function getVideoById(videoId: string): Promise<FormattedVideoData | null> {
  try {
    const url = `${API_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubeVideoListResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]

    return {
      id: video.id,
      title: video.snippet?.title || 'Untitled',
      description: video.snippet?.description || '',
      channelTitle: video.snippet?.channelTitle || '',
      channelId: video.snippet?.channelId || '',
      publishedAt: video.snippet?.publishedAt || '',
      thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || '',
      views: parseInt(video.statistics?.viewCount || '0'),
      likes: parseInt(video.statistics?.likeCount || '0'),
      comments: parseInt(video.statistics?.commentCount || '0'),
      duration: parseDuration(video.contentDetails?.duration || 'PT0S'),
      tags: video.snippet?.tags,
    }
  } catch (error) {
    console.error('Error fetching video:', error)
    throw error
  }
}

/**
 * Fetch multiple videos by IDs
 */
export async function getVideosByIds(videoIds: string[]): Promise<FormattedVideoData[]> {
  try {
    const ids = videoIds.join(',')
    const url = `${API_URL}/videos?part=snippet,statistics,contentDetails&id=${ids}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubeVideoListResponse = await response.json()

    return data.items.map(video => ({
      id: video.id,
      title: video.snippet?.title || 'Untitled',
      description: video.snippet?.description || '',
      channelTitle: video.snippet?.channelTitle || '',
      channelId: video.snippet?.channelId || '',
      publishedAt: video.snippet?.publishedAt || '',
      thumbnail: video.snippet?.thumbnails?.high?.url || video.snippet?.thumbnails?.medium?.url || '',
      views: parseInt(video.statistics?.viewCount || '0'),
      likes: parseInt(video.statistics?.likeCount || '0'),
      comments: parseInt(video.statistics?.commentCount || '0'),
      duration: parseDuration(video.contentDetails?.duration || 'PT0S'),
      tags: video.snippet?.tags,
    }))
  } catch (error) {
    console.error('Error fetching videos:', error)
    throw error
  }
}

/**
 * Fetch channel details by channel ID
 */
export async function getChannelById(channelId: string): Promise<FormattedChannelData | null> {
  try {
    const url = `${API_URL}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubeChannelListResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const channel = data.items[0]

    return {
      id: channel.id,
      title: channel.snippet?.title || 'Untitled',
      description: channel.snippet?.description || '',
      customUrl: channel.snippet?.customUrl,
      thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || '',
      banner: channel.brandingSettings?.image?.bannerExternalUrl,
      subscribers: parseInt(channel.statistics?.subscriberCount || '0'),
      totalViews: parseInt(channel.statistics?.viewCount || '0'),
      videoCount: parseInt(channel.statistics?.videoCount || '0'),
      publishedAt: channel.snippet?.publishedAt || '',
      country: channel.snippet?.country,
    }
  } catch (error) {
    console.error('Error fetching channel:', error)
    throw error
  }
}

/**
 * Search for videos by keyword
 */
export async function searchVideos(
  query: string,
  maxResults: number = 10
): Promise<YouTubeSearchListResponse> {
  try {
    const url = `${API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubeSearchListResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error searching videos:', error)
    throw error
  }
}

/**
 * Search for channels by keyword
 */
export async function searchChannels(
  query: string,
  maxResults: number = 10
): Promise<YouTubeSearchListResponse> {
  try {
    const url = `${API_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=channel&maxResults=${maxResults}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubeSearchListResponse = await response.json()
    return data
  } catch (error) {
    console.error('Error searching channels:', error)
    throw error
  }
}

/**
 * Get channel by username (for @username format)
 */
export async function getChannelByUsername(username: string): Promise<FormattedChannelData | null> {
  try {
    // Remove @ if present
    const cleanUsername = username.replace('@', '')

    // Try with forHandle parameter (for @username handles)
    let url = `${API_URL}/channels?part=snippet,statistics,brandingSettings&forHandle=${cleanUsername}&key=${API_KEY}`
    let response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    let data: YouTubeChannelListResponse = await response.json()

    // If forHandle doesn't work, try forUsername (legacy)
    if (!data.items || data.items.length === 0) {
      url = `${API_URL}/channels?part=snippet,statistics,brandingSettings&forUsername=${cleanUsername}&key=${API_KEY}`
      response = await fetch(url)

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`)
      }

      data = await response.json()
    }

    if (!data.items || data.items.length === 0) {
      // Try searching for the channel as last resort
      const searchResults = await searchChannels(cleanUsername, 1)
      if (searchResults.items.length > 0 && searchResults.items[0].id.channelId) {
        return getChannelById(searchResults.items[0].id.channelId)
      }
      return null
    }

    const channel = data.items[0]

    return {
      id: channel.id,
      title: channel.snippet?.title || 'Untitled',
      description: channel.snippet?.description || '',
      customUrl: channel.snippet?.customUrl,
      thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || '',
      banner: channel.brandingSettings?.image?.bannerExternalUrl,
      subscribers: parseInt(channel.statistics?.subscriberCount || '0'),
      totalViews: parseInt(channel.statistics?.viewCount || '0'),
      videoCount: parseInt(channel.statistics?.videoCount || '0'),
      publishedAt: channel.snippet?.publishedAt || '',
      country: channel.snippet?.country,
    }
  } catch (error) {
    console.error('Error fetching channel by username:', error)
    throw error
  }
}

/**
 * Get channel's uploaded videos
 */
export async function getChannelVideos(
  channelId: string,
  maxResults: number = 10
): Promise<FormattedVideoData[]> {
  try {
    // First, get the channel's uploads playlist ID
    const channelUrl = `${API_URL}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
    const channelResponse = await fetch(channelUrl)

    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.status}`)
    }

    const channelData = await channelResponse.json()

    if (!channelData.items || channelData.items.length === 0) {
      return []
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails?.relatedPlaylists?.uploads

    if (!uploadsPlaylistId) {
      return []
    }

    // Get videos from the uploads playlist
    const playlistUrl = `${API_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${API_KEY}`
    const playlistResponse = await fetch(playlistUrl)

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`)
    }

    const playlistData = await playlistResponse.json()

    if (!playlistData.items || playlistData.items.length === 0) {
      return []
    }

    // Extract video IDs
    const videoIds = playlistData.items
      .map((item: any) => item.snippet?.resourceId?.videoId)
      .filter((id: string) => id)

    // Fetch full video details
    return await getVideosByIds(videoIds)
  } catch (error) {
    console.error('Error fetching channel videos:', error)
    throw error
  }
}

/**
 * Get comments for a video
 */
export async function getVideoComments(
  videoId: string,
  maxResults: number = 100
): Promise<FormattedCommentData[]> {
  try {
    const url = `${API_URL}/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=relevance&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      // Comments might be disabled
      if (response.status === 403) {
        return []
      }
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubeCommentThreadListResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return []
    }

    return data.items.map(thread => {
      const comment = thread.snippet.topLevelComment
      return {
        id: comment.id,
        author: comment.snippet.authorDisplayName,
        authorImage: comment.snippet.authorProfileImageUrl,
        text: comment.snippet.textOriginal,
        likes: comment.snippet.likeCount,
        publishedAt: comment.snippet.publishedAt,
        replyCount: thread.snippet.totalReplyCount,
      }
    })
  } catch (error) {
    console.error('Error fetching comments:', error)
    // Return empty array if comments are disabled or error occurs
    return []
  }
}

/**
 * Get playlist details by ID
 */
export async function getPlaylistById(playlistId: string): Promise<FormattedPlaylistData | null> {
  try {
    const url = `${API_URL}/playlists?part=snippet,contentDetails&id=${playlistId}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubePlaylistListResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const playlist = data.items[0]

    return {
      id: playlist.id,
      title: playlist.snippet?.title || 'Untitled Playlist',
      description: playlist.snippet?.description || '',
      channelTitle: playlist.snippet?.channelTitle || '',
      channelId: playlist.snippet?.channelId || '',
      publishedAt: playlist.snippet?.publishedAt || '',
      thumbnail: playlist.snippet?.thumbnails?.high?.url || playlist.snippet?.thumbnails?.medium?.url || '',
      itemCount: playlist.contentDetails?.itemCount || 0,
    }
  } catch (error) {
    console.error('Error fetching playlist:', error)
    throw error
  }
}

/**
 * Get all videos in a playlist
 */
export async function getPlaylistVideos(
  playlistId: string,
  maxResults: number = 50
): Promise<FormattedVideoData[]> {
  try {
    const url = `${API_URL}/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubePlaylistItemListResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return []
    }

    // Extract video IDs
    const videoIds = data.items
      .map(item => item.snippet?.resourceId?.videoId)
      .filter((id): id is string => !!id)

    // Fetch full video details
    return await getVideosByIds(videoIds)
  } catch (error) {
    console.error('Error fetching playlist videos:', error)
    throw error
  }
}

/**
 * Get channel's playlists
 */
export async function getChannelPlaylists(
  channelId: string,
  maxResults: number = 25
): Promise<FormattedPlaylistData[]> {
  try {
    const url = `${API_URL}/playlists?part=snippet,contentDetails&channelId=${channelId}&maxResults=${maxResults}&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubePlaylistListResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return []
    }

    return data.items.map(playlist => ({
      id: playlist.id,
      title: playlist.snippet?.title || 'Untitled Playlist',
      description: playlist.snippet?.description || '',
      channelTitle: playlist.snippet?.channelTitle || '',
      channelId: playlist.snippet?.channelId || '',
      publishedAt: playlist.snippet?.publishedAt || '',
      thumbnail: playlist.snippet?.thumbnails?.high?.url || playlist.snippet?.thumbnails?.medium?.url || '',
      itemCount: playlist.contentDetails?.itemCount || 0,
    }))
  } catch (error) {
    console.error('Error fetching channel playlists:', error)
    throw error
  }
}

/**
 * Fetch channel details by an array of channel IDs (batched, max 50 per API call).
 * Reusable utility for both seed list and discovery flows.
 */
export async function getChannelsByIds(channelIds: string[]): Promise<FormattedChannelData[]> {
  const results: FormattedChannelData[] = []
  const batchSize = 50

  // Deduplicate
  const uniqueIds = [...new Set(channelIds)]

  for (let i = 0; i < uniqueIds.length; i += batchSize) {
    const batch = uniqueIds.slice(i, i + batchSize)
    const url = `${API_URL}/channels?part=snippet,statistics&id=${batch.join(',')}&key=${API_KEY}`

    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.warn(`YouTube API error fetching channel batch at index ${i}: ${response.status}`)
        continue
      }

      const data: YouTubeChannelListResponse = await response.json()

      if (data.items) {
        results.push(
          ...data.items.map((channel) => ({
            id: channel.id,
            title: channel.snippet?.title || 'Unknown Channel',
            description: channel.snippet?.description || '',
            customUrl: channel.snippet?.customUrl || '',
            thumbnail:
              channel.snippet?.thumbnails?.high?.url ||
              channel.snippet?.thumbnails?.medium?.url ||
              '',
            subscribers: parseInt(channel.statistics?.subscriberCount || '0', 10),
            totalViews: parseInt(channel.statistics?.viewCount || '0', 10),
            videoCount: parseInt(channel.statistics?.videoCount || '0', 10),
            publishedAt: channel.snippet?.publishedAt || '',
            country: channel.snippet?.country || '',
          }))
        )
      }
    } catch (error) {
      console.warn(`Error fetching channel batch starting at index ${i}:`, error)
    }
  }

  return results
}

/**
 * Discover channel IDs from trending/popular videos across multiple regions.
 * Returns only channel IDs (not full details) for efficiency.
 */
export async function discoverChannelsFromTrending(regions: string[]): Promise<string[]> {
  const uniqueChannelIds = new Set<string>()

  const fetchPromises = regions.map(async (regionCode) => {
    try {
      const url = `${API_URL}/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&maxResults=50&key=${API_KEY}`
      const response = await fetch(url)

      if (!response.ok) {
        console.warn(`Failed to fetch trending for region ${regionCode}`)
        return
      }

      const data: YouTubeVideoListResponse = await response.json()
      data.items?.forEach((video) => {
        if (video.snippet?.channelId) {
          uniqueChannelIds.add(video.snippet.channelId)
        }
      })
    } catch (error) {
      console.warn(`Error fetching trending for region ${regionCode}:`, error)
    }
  })

  await Promise.all(fetchPromises)
  return Array.from(uniqueChannelIds)
}

/**
 * Get global top channels by aggregating popular channels from multiple major regions
 * @deprecated Use getChannelsByIds + discoverChannelsFromTrending instead (used by cron job)
 */
export async function getGlobalTopChannels(maxResults: number = 10): Promise<FormattedChannelData[]> {
  try {
    console.log('Fetching global top channels by aggregating multiple regions...')

    // Major regions to aggregate from (representing different continents and large markets)
    const majorRegions = ['US', 'IN', 'BR', 'JP', 'KR', 'GB', 'DE', 'FR', 'MX', 'ID', 'PH', 'TH', 'VN', 'TR', 'AR', 'EG', 'NG', 'ZA', 'SA', 'PL']

    const allChannels = new Map<string, FormattedChannelData>()

    // Fetch popular videos from each region and extract channels
    const fetchPromises = majorRegions.slice(0, 10).map(async (regionCode) => {
      try {
        const url = `${API_URL}/videos?part=snippet&chart=mostPopular&regionCode=${regionCode}&maxResults=50&key=${API_KEY}`
        const response = await fetch(url)

        if (!response.ok) {
          console.warn(`Failed to fetch for region ${regionCode}`)
          return []
        }

        const data: YouTubeVideoListResponse = await response.json()

        // Extract unique channel IDs
        const channelIds = new Set<string>()
        data.items?.forEach(video => {
          if (video.snippet?.channelId) {
            channelIds.add(video.snippet.channelId)
          }
        })

        return Array.from(channelIds)
      } catch (error) {
        console.warn(`Error fetching region ${regionCode}:`, error)
        return []
      }
    })

    // Wait for all region fetches to complete
    const allChannelIdArrays = await Promise.all(fetchPromises)
    const uniqueChannelIds = new Set<string>()

    allChannelIdArrays.forEach(channelIds => {
      channelIds.forEach(id => uniqueChannelIds.add(id))
    })

    console.log(`Found ${uniqueChannelIds.size} unique channels across regions`)

    // Fetch channel details in batches (YouTube API allows max 50 IDs per request)
    const channelIdArray = Array.from(uniqueChannelIds)
    const batchSize = 50
    const channelDetails: FormattedChannelData[] = []

    for (let i = 0; i < Math.min(channelIdArray.length, 200); i += batchSize) {
      const batch = channelIdArray.slice(i, i + batchSize)
      const channelsUrl = `${API_URL}/channels?part=snippet,statistics&id=${batch.join(',')}&key=${API_KEY}`

      try {
        const response = await fetch(channelsUrl)
        if (!response.ok) continue

        const data: YouTubeChannelListResponse = await response.json()

        if (data.items) {
          const formattedChannels = data.items.map(channel => ({
            id: channel.id,
            title: channel.snippet?.title || 'Unknown Channel',
            description: channel.snippet?.description || '',
            customUrl: channel.snippet?.customUrl || '',
            publishedAt: channel.snippet?.publishedAt || '',
            thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || '',
            country: channel.snippet?.country || '',
            subscribers: parseInt(channel.statistics?.subscriberCount || '0', 10),
            videoCount: parseInt(channel.statistics?.videoCount || '0', 10),
            totalViews: parseInt(channel.statistics?.viewCount || '0', 10),
          }))

          channelDetails.push(...formattedChannels)
        }
      } catch (error) {
        console.warn(`Error fetching channel batch starting at ${i}:`, error)
      }
    }

    console.log(`Fetched details for ${channelDetails.length} channels`)

    // Sort by subscriber count and return top results
    const topChannels = channelDetails
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, maxResults)

    console.log(`Returning top ${topChannels.length} channels`)

    return topChannels
  } catch (error) {
    console.error('Error fetching global top channels:', error)
    return []
  }
}

/**
 * Get popular channels by region
 * Fetches most popular videos in a region and extracts unique channels
 */
export async function getPopularChannelsByRegion(regionCode: string = 'US', maxResults: number = 10): Promise<FormattedChannelData[]> {
  try {
    // Handle global case
    if (regionCode === 'GLOBAL') {
      return getGlobalTopChannels(maxResults)
    }

    // First, get most popular videos in the region
    const url = `${API_URL}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=50&key=${API_KEY}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`)
    }

    const data: YouTubeVideoListResponse = await response.json()

    if (!data.items || data.items.length === 0) {
      return []
    }

    // Extract unique channel IDs
    const channelIds = new Set<string>()
    const channelMap = new Map<string, { title: string; subscriberCount: number }>()

    data.items.forEach(video => {
      if (video.snippet?.channelId) {
        channelIds.add(video.snippet.channelId)
      }
    })

    // Fetch channel details for all unique channels
    const channelIdsArray = Array.from(channelIds).slice(0, maxResults)
    const channelsUrl = `${API_URL}/channels?part=snippet,statistics&id=${channelIdsArray.join(',')}&key=${API_KEY}`

    const channelsResponse = await fetch(channelsUrl)

    if (!channelsResponse.ok) {
      throw new Error(`YouTube API error: ${channelsResponse.status}`)
    }

    const channelsData: YouTubeChannelListResponse = await channelsResponse.json()

    if (!channelsData.items) {
      return []
    }

    // Format and sort by subscriber count
    const channels: FormattedChannelData[] = channelsData.items.map(channel => ({
      id: channel.id,
      title: channel.snippet?.title || 'Unknown Channel',
      description: channel.snippet?.description || '',
      customUrl: channel.snippet?.customUrl || '',
      publishedAt: channel.snippet?.publishedAt || '',
      thumbnail: channel.snippet?.thumbnails?.high?.url || channel.snippet?.thumbnails?.medium?.url || '',
      country: channel.snippet?.country || '',
      subscribers: parseInt(channel.statistics?.subscriberCount || '0', 10),
      videoCount: parseInt(channel.statistics?.videoCount || '0', 10),
      totalViews: parseInt(channel.statistics?.viewCount || '0', 10),
    }))

    // Sort by subscribers and return top results
    return channels
      .sort((a, b) => b.subscribers - a.subscribers)
      .slice(0, maxResults)
  } catch (error) {
    console.error('Error fetching popular channels by region:', error)
    return []
  }
}
