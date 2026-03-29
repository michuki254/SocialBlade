'use client'

import { useAlertMonitor } from '@/hooks/useAlertMonitor'

/**
 * Component that monitors alerts globally
 * Place this in the app layout to enable automatic alert checking
 */
export function AlertMonitor() {
  useAlertMonitor()
  return null
}
