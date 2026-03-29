import { useEffect } from 'react'
import { useNotifications } from '@/components/NotificationCenter'
import {
  getTrackedChannels,
  getChannelSnapshotsById,
} from '@/lib/storage'
import {
  checkMilestones,
  checkPerformanceDrop,
  checkCompetitiveAlerts,
  addAlert,
  getAlertConfig,
  getLastAlertCheck,
  updateLastAlertCheck,
} from '@/lib/alerts'
import { getChannelById } from '@/services/youtube'
import type { FormattedChannelData } from '@/types/youtube'

const ALERT_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

/**
 * Hook to automatically monitor tracked channels and generate alerts
 */
export function useAlertMonitor() {
  const { showNotification, refreshNotifications } = useNotifications()

  useEffect(() => {
    const checkAlerts = async () => {
      try {
        const config = getAlertConfig()
        const lastCheck = getLastAlertCheck()
        const now = new Date()

        // Only check if it's been at least 5 minutes since last check
        if (lastCheck && now.getTime() - lastCheck.getTime() < ALERT_CHECK_INTERVAL) {
          return
        }

        const trackedChannels = getTrackedChannels()
        if (trackedChannels.length === 0) return

        // Store previous states for competitive alerts
        const previousStates = new Map<string, FormattedChannelData>()

        for (const tracked of trackedChannels) {
          try {
            // Fetch current channel data
            const currentChannel = await getChannelById(tracked.channelId)
            if (!currentChannel) continue

            // Get historical snapshots
            const snapshots = getChannelSnapshotsById(tracked.channelId)
            const previousSnapshot = snapshots.length > 0
              ? snapshots[snapshots.length - 1]
              : null

            if (previousSnapshot) {
              previousStates.set(currentChannel.id, previousSnapshot.data)

              // Check milestones
              if (config.milestoneAlerts) {
                const milestones = checkMilestones(currentChannel, previousSnapshot.data, config)
                for (const milestone of milestones) {
                  const alert = addAlert({
                    type: 'milestone',
                    severity: 'success',
                    title: `Milestone: ${milestone.milestone.toLocaleString()} ${milestone.metric}`,
                    message: `${currentChannel.title} reached ${milestone.milestone.toLocaleString()} ${milestone.metric}!`,
                    channelId: currentChannel.id,
                    channelName: currentChannel.title,
                    metric: milestone.metric,
                    value: milestone.currentValue,
                    previousValue: milestone.previousValue
                  })
                  showNotification(alert)
                }
              }

              // Check performance drops
              if (config.performanceAlerts) {
                const drop = checkPerformanceDrop(
                  currentChannel,
                  previousSnapshot.data,
                  config.performanceThreshold
                )
                if (drop) {
                  const alert = addAlert({
                    type: 'performance_drop',
                    severity: drop.severity,
                    title: `Performance Alert`,
                    message: `${currentChannel.title}: ${drop.metric} dropped ${drop.dropPercentage.toFixed(1)}%`,
                    channelId: currentChannel.id,
                    channelName: currentChannel.title,
                    metric: drop.metric,
                    value: currentChannel.subscribers,
                    previousValue: previousSnapshot.data.subscribers
                  })
                  showNotification(alert)
                }
              }
            }
          } catch (err) {
            console.error(`Error checking alerts for channel ${tracked.channelId}:`, err)
          }
        }

        // Check competitive alerts
        if (config.competitiveAlerts && previousStates.size > 1) {
          const currentChannels: FormattedChannelData[] = []
          for (const tracked of trackedChannels) {
            try {
              const channel = await getChannelById(tracked.channelId)
              if (channel) currentChannels.push(channel)
            } catch {
              // Skip if error
            }
          }

          const competitiveAlerts = checkCompetitiveAlerts(
            currentChannels,
            previousStates,
            config
          )

          for (const alert of competitiveAlerts) {
            const newAlert = addAlert(alert)
            showNotification(newAlert)
          }
        }

        // Update last check timestamp
        updateLastAlertCheck()
        refreshNotifications()
      } catch (err) {
        console.error('Error in alert monitoring:', err)
      }
    }

    // Run check immediately
    checkAlerts()

    // Set up interval for periodic checks
    const interval = setInterval(checkAlerts, ALERT_CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [showNotification, refreshNotifications])
}
