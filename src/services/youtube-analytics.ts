import { google } from 'googleapis'

const youtube = google.youtube('v3')
const youtubeAnalytics = google.youtubeAnalytics('v2')

/**
 * Get real-time metrics for the last 48 hours
 * Requires OAuth access token
 */
export async function getRealtimeMetrics(accessToken: string, videoId?: string) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const endDate = new Date()
    const startDate = new Date()
    startDate.setHours(startDate.getHours() - 48) // Last 48 hours

    const params: any = {
      auth,
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost',
      dimensions: 'day',
    }

    if (videoId) {
      params.filters = `video==${videoId}`
    }

    const response = await youtubeAnalytics.reports.query(params)
    return response.data
  } catch (error) {
    console.error('Error fetching realtime metrics:', error)
    throw error
  }
}

/**
 * Get real-time traffic sources
 */
export async function getRealtimeTrafficSources(accessToken: string) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const endDate = new Date()
    const startDate = new Date()
    startDate.setHours(startDate.getHours() - 48)

    const response = await youtubeAnalytics.reports.query({
      auth,
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'views,estimatedMinutesWatched',
      dimensions: 'insightTrafficSourceType',
      sort: '-views',
      maxResults: 10,
    })

    return response.data
  } catch (error) {
    console.error('Error fetching traffic sources:', error)
    throw error
  }
}

/**
 * Get real-time geographic data
 */
export async function getRealtimeGeography(accessToken: string) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const endDate = new Date()
    const startDate = new Date()
    startDate.setHours(startDate.getHours() - 48)

    const response = await youtubeAnalytics.reports.query({
      auth,
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'views,estimatedMinutesWatched',
      dimensions: 'country',
      sort: '-views',
      maxResults: 10,
    })

    return response.data
  } catch (error) {
    console.error('Error fetching geography data:', error)
    throw error
  }
}

/**
 * Get live concurrent viewers for a live stream
 */
export async function getLiveConcurrentViewers(accessToken: string, videoId: string) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const response = await youtube.videos.list({
      auth,
      part: ['liveStreamingDetails', 'statistics'],
      id: [videoId],
    })

    const video = response.data.items?.[0]
    if (!video) return null

    return {
      concurrentViewers: video.liveStreamingDetails?.concurrentViewers
        ? parseInt(video.liveStreamingDetails.concurrentViewers)
        : 0,
      actualStartTime: video.liveStreamingDetails?.actualStartTime,
      scheduledStartTime: video.liveStreamingDetails?.scheduledStartTime,
      views: parseInt(video.statistics?.viewCount || '0'),
      likes: parseInt(video.statistics?.likeCount || '0'),
    }
  } catch (error) {
    console.error('Error fetching live concurrent viewers:', error)
    throw error
  }
}

/**
 * Get channel's own videos (for authenticated user)
 */
export async function getMyVideos(accessToken: string, maxResults: number = 10) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    // First, get the authenticated user's uploads playlist
    const channelResponse = await youtube.channels.list({
      auth,
      part: ['contentDetails'],
      mine: true,
    })

    const uploadsPlaylistId = channelResponse.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) return []

    // Get videos from uploads playlist
    const playlistResponse = await youtube.playlistItems.list({
      auth,
      part: ['snippet', 'contentDetails'],
      playlistId: uploadsPlaylistId,
      maxResults,
    })

    const videoIds = playlistResponse.data.items?.map(item => item.contentDetails?.videoId).filter(Boolean) as string[]

    if (videoIds.length === 0) return []

    // Get detailed statistics for these videos
    const videosResponse = await youtube.videos.list({
      auth,
      part: ['snippet', 'statistics', 'contentDetails', 'liveStreamingDetails'],
      id: videoIds,
    })

    return videosResponse.data.items || []
  } catch (error) {
    console.error('Error fetching my videos:', error)
    throw error
  }
}

/**
 * Get channel analytics for authenticated user
 */
export async function getMyChannelAnalytics(accessToken: string) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Last 30 days

    const response = await youtubeAnalytics.reports.query({
      auth,
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'views,estimatedMinutesWatched,averageViewDuration,averageViewPercentage,subscribersGained,subscribersLost',
      dimensions: 'day',
    })

    return response.data
  } catch (error) {
    console.error('Error fetching channel analytics:', error)
    throw error
  }
}

/**
 * Get video performance over time (hourly for recent videos)
 */
export async function getVideoPerformanceTimeline(
  accessToken: string,
  videoId: string,
  hours: number = 48
) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const endDate = new Date()
    const startDate = new Date()
    startDate.setHours(startDate.getHours() - hours)

    const response = await youtubeAnalytics.reports.query({
      auth,
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'views,estimatedMinutesWatched,likes,comments,shares',
      dimensions: 'day',
      filters: `video==${videoId}`,
    })

    return response.data
  } catch (error) {
    console.error('Error fetching video performance timeline:', error)
    throw error
  }
}

/**
 * Get revenue data (if channel is monetized)
 */
export async function getRevenueData(accessToken: string) {
  try {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const response = await youtubeAnalytics.reports.query({
      auth,
      ids: 'channel==MINE',
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      metrics: 'estimatedRevenue,estimatedAdRevenue,estimatedRedPartnerRevenue,grossRevenue,adImpressions,cpm',
      dimensions: 'day',
    })

    return response.data
  } catch (error) {
    // Revenue data may not be available for all channels
    console.error('Error fetching revenue data:', error)
    return null
  }
}
