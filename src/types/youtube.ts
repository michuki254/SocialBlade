// YouTube Data API v3 Types

export interface YouTubeVideoStatistics {
  viewCount: string
  likeCount: string
  favoriteCount: string
  commentCount: string
}

export interface YouTubeVideoSnippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: {
    default: YouTubeThumbnail
    medium: YouTubeThumbnail
    high: YouTubeThumbnail
    standard?: YouTubeThumbnail
    maxres?: YouTubeThumbnail
  }
  channelTitle: string
  tags?: string[]
  categoryId: string
}

export interface YouTubeThumbnail {
  url: string
  width: number
  height: number
}

export interface YouTubeVideoContentDetails {
  duration: string
  dimension: string
  definition: string
  caption: string
  licensedContent: boolean
  regionRestriction?: {
    allowed?: string[]
    blocked?: string[]
  }
}

export interface YouTubeVideo {
  kind: string
  etag: string
  id: string
  snippet?: YouTubeVideoSnippet
  statistics?: YouTubeVideoStatistics
  contentDetails?: YouTubeVideoContentDetails
}

export interface YouTubeVideoListResponse {
  kind: string
  etag: string
  items: YouTubeVideo[]
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
}

export interface YouTubeChannelStatistics {
  viewCount: string
  subscriberCount: string
  hiddenSubscriberCount: boolean
  videoCount: string
}

export interface YouTubeChannelSnippet {
  title: string
  description: string
  customUrl?: string
  publishedAt: string
  thumbnails: {
    default: YouTubeThumbnail
    medium: YouTubeThumbnail
    high: YouTubeThumbnail
  }
  country?: string
}

export interface YouTubeChannelBrandingSettings {
  image?: {
    bannerExternalUrl?: string
  }
}

export interface YouTubeChannel {
  kind: string
  etag: string
  id: string
  snippet?: YouTubeChannelSnippet
  statistics?: YouTubeChannelStatistics
  brandingSettings?: YouTubeChannelBrandingSettings
}

export interface YouTubeChannelListResponse {
  kind: string
  etag: string
  items: YouTubeChannel[]
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
}

export interface YouTubeSearchResult {
  kind: string
  etag: string
  id: {
    kind: string
    videoId?: string
    channelId?: string
  }
  snippet: {
    publishedAt: string
    channelId: string
    title: string
    description: string
    thumbnails: {
      default: YouTubeThumbnail
      medium: YouTubeThumbnail
      high: YouTubeThumbnail
    }
    channelTitle: string
  }
}

export interface YouTubeSearchListResponse {
  kind: string
  etag: string
  nextPageToken?: string
  prevPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YouTubeSearchResult[]
}

// Helper type for formatted video data
export interface FormattedVideoData {
  id: string
  title: string
  description: string
  channelTitle: string
  channelId: string
  publishedAt: string
  thumbnail: string
  views: number
  likes: number
  comments: number
  duration: string
  tags?: string[]
}

// Helper type for formatted channel data
export interface FormattedChannelData {
  id: string
  title: string
  description: string
  customUrl?: string
  thumbnail: string
  banner?: string
  subscribers: number
  totalViews: number
  videoCount: number
  publishedAt: string
  country?: string
}

// Comment types
export interface YouTubeCommentSnippet {
  authorDisplayName: string
  authorProfileImageUrl: string
  authorChannelUrl: string
  authorChannelId: {
    value: string
  }
  textDisplay: string
  textOriginal: string
  likeCount: number
  publishedAt: string
  updatedAt: string
}

export interface YouTubeComment {
  kind: string
  etag: string
  id: string
  snippet: YouTubeCommentSnippet
}

export interface YouTubeCommentThread {
  kind: string
  etag: string
  id: string
  snippet: {
    videoId: string
    topLevelComment: YouTubeComment
    totalReplyCount: number
  }
}

export interface YouTubeCommentThreadListResponse {
  kind: string
  etag: string
  nextPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YouTubeCommentThread[]
}

// Formatted comment data
export interface FormattedCommentData {
  id: string
  author: string
  authorImage: string
  text: string
  likes: number
  publishedAt: string
  replyCount: number
}

// Playlist types
export interface YouTubePlaylistSnippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: {
    default: YouTubeThumbnail
    medium: YouTubeThumbnail
    high: YouTubeThumbnail
    standard?: YouTubeThumbnail
    maxres?: YouTubeThumbnail
  }
  channelTitle: string
}

export interface YouTubePlaylistContentDetails {
  itemCount: number
}

export interface YouTubePlaylist {
  kind: string
  etag: string
  id: string
  snippet?: YouTubePlaylistSnippet
  contentDetails?: YouTubePlaylistContentDetails
}

export interface YouTubePlaylistListResponse {
  kind: string
  etag: string
  nextPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YouTubePlaylist[]
}

export interface YouTubePlaylistItemSnippet {
  publishedAt: string
  channelId: string
  title: string
  description: string
  thumbnails: {
    default: YouTubeThumbnail
    medium: YouTubeThumbnail
    high: YouTubeThumbnail
    standard?: YouTubeThumbnail
    maxres?: YouTubeThumbnail
  }
  channelTitle: string
  playlistId: string
  position: number
  resourceId: {
    kind: string
    videoId: string
  }
}

export interface YouTubePlaylistItem {
  kind: string
  etag: string
  id: string
  snippet?: YouTubePlaylistItemSnippet
}

export interface YouTubePlaylistItemListResponse {
  kind: string
  etag: string
  nextPageToken?: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: YouTubePlaylistItem[]
}

// Formatted playlist data
export interface FormattedPlaylistData {
  id: string
  title: string
  description: string
  channelTitle: string
  channelId: string
  publishedAt: string
  thumbnail: string
  itemCount: number
  videos?: FormattedVideoData[]
}
