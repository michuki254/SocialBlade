/**
 * Client-side storage utilities using localStorage
 * For production, this should be replaced with a database
 */

import type { HistoricalSnapshot, VideoSnapshot } from './historical-tracker'

const CHANNEL_SNAPSHOTS_KEY = 'sb_channel_snapshots'
const VIDEO_SNAPSHOTS_KEY = 'sb_video_snapshots'

/**
 * Save a channel snapshot to localStorage
 */
export function saveChannelSnapshot(snapshot: HistoricalSnapshot): void {
  try {
    const existing = getChannelSnapshots()
    existing.push(snapshot)
    localStorage.setItem(CHANNEL_SNAPSHOTS_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Error saving channel snapshot:', error)
  }
}

/**
 * Get all channel snapshots from localStorage
 */
export function getChannelSnapshots(): HistoricalSnapshot[] {
  try {
    const data = localStorage.getItem(CHANNEL_SNAPSHOTS_KEY)
    if (!data) return []

    const snapshots = JSON.parse(data)
    // Convert timestamp strings back to Dates
    return snapshots.map((s: any) => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }))
  } catch (error) {
    console.error('Error getting channel snapshots:', error)
    return []
  }
}

/**
 * Get snapshots for a specific channel
 */
export function getChannelSnapshotsById(channelId: string): HistoricalSnapshot[] {
  const all = getChannelSnapshots()
  return all.filter(s => s.channelId === channelId)
}

/**
 * Clear all channel snapshots
 */
export function clearChannelSnapshots(): void {
  try {
    localStorage.removeItem(CHANNEL_SNAPSHOTS_KEY)
  } catch (error) {
    console.error('Error clearing channel snapshots:', error)
  }
}

/**
 * Save a video snapshot to localStorage
 */
export function saveVideoSnapshot(snapshot: VideoSnapshot): void {
  try {
    const existing = getVideoSnapshots()
    existing.push(snapshot)
    localStorage.setItem(VIDEO_SNAPSHOTS_KEY, JSON.stringify(existing))
  } catch (error) {
    console.error('Error saving video snapshot:', error)
  }
}

/**
 * Get all video snapshots from localStorage
 */
export function getVideoSnapshots(): VideoSnapshot[] {
  try {
    const data = localStorage.getItem(VIDEO_SNAPSHOTS_KEY)
    if (!data) return []

    const snapshots = JSON.parse(data)
    // Convert timestamp strings back to Dates
    return snapshots.map((s: any) => ({
      ...s,
      timestamp: new Date(s.timestamp)
    }))
  } catch (error) {
    console.error('Error getting video snapshots:', error)
    return []
  }
}

/**
 * Get snapshots for a specific video
 */
export function getVideoSnapshotsById(videoId: string): VideoSnapshot[] {
  const all = getVideoSnapshots()
  return all.filter(s => s.videoId === videoId)
}

/**
 * Clear all video snapshots
 */
export function clearVideoSnapshots(): void {
  try {
    localStorage.removeItem(VIDEO_SNAPSHOTS_KEY)
  } catch (error) {
    console.error('Error clearing video snapshots:', error)
  }
}

/**
 * Get unique tracked channels
 */
export function getTrackedChannels(): Array<{ id: string; title: string; snapshotCount: number }> {
  const snapshots = getChannelSnapshots()
  const channelsMap = new Map<string, { id: string; title: string; snapshotCount: number }>()

  snapshots.forEach(snapshot => {
    if (channelsMap.has(snapshot.channelId)) {
      const existing = channelsMap.get(snapshot.channelId)!
      existing.snapshotCount++
    } else {
      channelsMap.set(snapshot.channelId, {
        id: snapshot.channelId,
        title: snapshot.channelTitle,
        snapshotCount: 1,
      })
    }
  })

  return Array.from(channelsMap.values())
}

/**
 * Delete snapshots for a specific channel
 */
export function deleteChannelSnapshots(channelId: string): void {
  try {
    const all = getChannelSnapshots()
    const filtered = all.filter(s => s.channelId !== channelId)
    localStorage.setItem(CHANNEL_SNAPSHOTS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting channel snapshots:', error)
  }
}
