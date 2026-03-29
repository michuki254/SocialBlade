import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'
import { detectSpike, type SpikeDetectionResult } from './spike-detector'

export type AlertType =
  | 'performance_drop'
  | 'performance_spike'
  | 'milestone'
  | 'anomaly'
  | 'competitive'

export type AlertSeverity = 'info' | 'warning' | 'critical' | 'success'

export interface Alert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  timestamp: string
  channelId?: string
  channelName?: string
  videoId?: string
  videoTitle?: string
  metric?: string
  value?: number
  previousValue?: number
  read: boolean
  dismissed: boolean
}

export interface AlertConfig {
  performanceAlerts: boolean
  milestoneAlerts: boolean
  anomalyAlerts: boolean
  competitiveAlerts: boolean
  performanceThreshold: number // Percentage drop to trigger alert
  milestones: {
    subscribers: number[]
    views: number[]
    videos: number[]
  }
}

export interface MilestoneCheck {
  metric: 'subscribers' | 'views' | 'videos'
  milestone: number
  currentValue: number
  previousValue: number
  achieved: boolean
}

// Default configuration
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  performanceAlerts: true,
  milestoneAlerts: true,
  anomalyAlerts: true,
  competitiveAlerts: true,
  performanceThreshold: 20, // 20% drop
  milestones: {
    subscribers: [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000, 10000000],
    views: [1000, 10000, 100000, 500000, 1000000, 10000000, 100000000, 1000000000],
    videos: [10, 50, 100, 500, 1000, 5000]
  }
}

// Storage keys
const ALERTS_KEY = 'sb_alerts'
const ALERT_CONFIG_KEY = 'sb_alert_config'
const LAST_CHECK_KEY = 'sb_last_alert_check'

/**
 * Get all alerts
 */
export function getAlerts(): Alert[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(ALERTS_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch {
    return []
  }
}

/**
 * Get unread alerts
 */
export function getUnreadAlerts(): Alert[] {
  return getAlerts().filter(alert => !alert.read && !alert.dismissed)
}

/**
 * Get alert configuration
 */
export function getAlertConfig(): AlertConfig {
  if (typeof window === 'undefined') return DEFAULT_ALERT_CONFIG

  try {
    const stored = localStorage.getItem(ALERT_CONFIG_KEY)
    if (!stored) return DEFAULT_ALERT_CONFIG
    return { ...DEFAULT_ALERT_CONFIG, ...JSON.parse(stored) }
  } catch {
    return DEFAULT_ALERT_CONFIG
  }
}

/**
 * Save alert configuration
 */
export function saveAlertConfig(config: Partial<AlertConfig>): void {
  if (typeof window === 'undefined') return

  const currentConfig = getAlertConfig()
  const newConfig = { ...currentConfig, ...config }
  localStorage.setItem(ALERT_CONFIG_KEY, JSON.stringify(newConfig))
}

/**
 * Add a new alert
 */
export function addAlert(alert: Omit<Alert, 'id' | 'timestamp' | 'read' | 'dismissed'>): Alert {
  const newAlert: Alert = {
    ...alert,
    id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
    dismissed: false
  }

  const alerts = getAlerts()
  alerts.unshift(newAlert) // Add to beginning

  // Keep only last 100 alerts
  if (alerts.length > 100) {
    alerts.splice(100)
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
  }

  return newAlert
}

/**
 * Mark alert as read
 */
export function markAlertAsRead(alertId: string): void {
  if (typeof window === 'undefined') return

  const alerts = getAlerts()
  const alert = alerts.find(a => a.id === alertId)
  if (alert) {
    alert.read = true
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
  }
}

/**
 * Dismiss alert
 */
export function dismissAlert(alertId: string): void {
  if (typeof window === 'undefined') return

  const alerts = getAlerts()
  const alert = alerts.find(a => a.id === alertId)
  if (alert) {
    alert.dismissed = true
    localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
  }
}

/**
 * Clear all alerts
 */
export function clearAllAlerts(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ALERTS_KEY)
}

/**
 * Mark all alerts as read
 */
export function markAllAlertsAsRead(): void {
  if (typeof window === 'undefined') return

  const alerts = getAlerts()
  alerts.forEach(alert => alert.read = true)
  localStorage.setItem(ALERTS_KEY, JSON.stringify(alerts))
}

/**
 * Check for milestone achievements
 */
export function checkMilestones(
  current: FormattedChannelData,
  previous: FormattedChannelData | null,
  config: AlertConfig
): MilestoneCheck[] {
  if (!previous) return []

  const checks: MilestoneCheck[] = []

  // Check subscriber milestones
  for (const milestone of config.milestones.subscribers) {
    if (current.subscribers >= milestone && previous.subscribers < milestone) {
      checks.push({
        metric: 'subscribers',
        milestone,
        currentValue: current.subscribers,
        previousValue: previous.subscribers,
        achieved: true
      })
    }
  }

  // Check view milestones
  for (const milestone of config.milestones.views) {
    if (current.totalViews >= milestone && previous.totalViews < milestone) {
      checks.push({
        metric: 'views',
        milestone,
        currentValue: current.totalViews,
        previousValue: previous.totalViews,
        achieved: true
      })
    }
  }

  // Check video count milestones
  for (const milestone of config.milestones.videos) {
    if (current.videoCount >= milestone && previous.videoCount < milestone) {
      checks.push({
        metric: 'videos',
        milestone,
        currentValue: current.videoCount,
        previousValue: previous.videoCount,
        achieved: true
      })
    }
  }

  return checks
}

/**
 * Check for performance drops
 */
export function checkPerformanceDrop(
  current: FormattedChannelData,
  previous: FormattedChannelData,
  threshold: number
): { metric: string; dropPercentage: number; severity: AlertSeverity } | null {
  // Check subscribers
  if (previous.subscribers > 0) {
    const subsDrop = ((previous.subscribers - current.subscribers) / previous.subscribers) * 100
    if (subsDrop >= threshold) {
      return {
        metric: 'subscribers',
        dropPercentage: subsDrop,
        severity: subsDrop >= threshold * 2 ? 'critical' : 'warning'
      }
    }
  }

  return null
}

/**
 * Detect anomalies using spike detection
 */
export function detectAnomalies(
  videos: FormattedVideoData[]
): { video: FormattedVideoData; spike: SpikeDetectionResult }[] {
  if (videos.length < 5) return []

  const anomalies: { video: FormattedVideoData; spike: SpikeDetectionResult }[] = []

  // Check view anomalies
  const viewData = videos.map((v) => ({ timestamp: new Date(), value: v.views }))
  const viewSpike = detectSpike(viewData)

  if (viewSpike.isSpike) {
    anomalies.push({ video: videos[videos.length - 1], spike: viewSpike })
  }

  return anomalies
}

/**
 * Check competitive alerts
 */
export function checkCompetitiveAlerts(
  competitors: FormattedChannelData[],
  previousStates: Map<string, FormattedChannelData>,
  config: AlertConfig
): Alert[] {
  const alerts: Alert[] = []

  for (const competitor of competitors) {
    const previous = previousStates.get(competitor.id)
    if (!previous) continue

    // Check if competitor hit a milestone
    const milestones = checkMilestones(competitor, previous, config)
    for (const milestone of milestones) {
      alerts.push({
        type: 'competitive',
        severity: 'info',
        title: `Competitor Milestone: ${competitor.title}`,
        message: `${competitor.title} just reached ${milestone.milestone.toLocaleString()} ${milestone.metric}!`,
        channelId: competitor.id,
        channelName: competitor.title,
        metric: milestone.metric,
        value: milestone.currentValue,
        previousValue: milestone.previousValue
      } as any)
    }

    // Check for significant growth
    const subsGrowth = competitor.subscribers - previous.subscribers
    const subsGrowthPercent = (subsGrowth / previous.subscribers) * 100

    if (subsGrowthPercent >= 50 && subsGrowth >= 1000) {
      alerts.push({
        type: 'competitive',
        severity: 'warning',
        title: `Rapid Growth Alert: ${competitor.title}`,
        message: `${competitor.title} gained ${subsGrowth.toLocaleString()} subscribers (${subsGrowthPercent.toFixed(1)}% increase)`,
        channelId: competitor.id,
        channelName: competitor.title,
        metric: 'subscribers',
        value: competitor.subscribers,
        previousValue: previous.subscribers
      } as any)
    }
  }

  return alerts
}

/**
 * Get last alert check timestamp
 */
export function getLastAlertCheck(): Date | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = localStorage.getItem(LAST_CHECK_KEY)
    if (!stored) return null
    return new Date(stored)
  } catch {
    return null
  }
}

/**
 * Update last alert check timestamp
 */
export function updateLastAlertCheck(): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LAST_CHECK_KEY, new Date().toISOString())
}

/**
 * Format alert message with metric formatting
 */
export function formatAlertMetric(metric: string, value: number): string {
  if (metric === 'subscribers' || metric === 'views' || metric === 'videos') {
    return value.toLocaleString()
  }
  return value.toString()
}
