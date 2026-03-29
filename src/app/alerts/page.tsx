'use client'

import { useState, useEffect } from 'react'
import { Card, Button } from '@/components'
import {
  getAlerts,
  getAlertConfig,
  saveAlertConfig,
  markAlertAsRead,
  dismissAlert,
  clearAllAlerts,
  markAllAlertsAsRead,
  type Alert,
  type AlertConfig,
  DEFAULT_ALERT_CONFIG
} from '@/lib/alerts'
import { formatNumber } from '@/lib/youtube-utils'
import Link from 'next/link'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [config, setConfig] = useState<AlertConfig>(DEFAULT_ALERT_CONFIG)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState<Alert['type'] | 'all'>('all')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadAlerts()
    setConfig(getAlertConfig())
  }, [])

  const loadAlerts = () => {
    setAlerts(getAlerts())
  }

  const handleMarkAsRead = (alertId: string) => {
    markAlertAsRead(alertId)
    loadAlerts()
  }

  const handleDismiss = (alertId: string) => {
    dismissAlert(alertId)
    loadAlerts()
  }

  const handleMarkAllAsRead = () => {
    markAllAlertsAsRead()
    loadAlerts()
  }

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all alerts? This cannot be undone.')) {
      clearAllAlerts()
      loadAlerts()
    }
  }

  const handleSaveConfig = () => {
    saveAlertConfig(config)
    setShowSettings(false)
  }

  const filteredAlerts = alerts
    .filter(alert => filter === 'all' || !alert.read)
    .filter(alert => typeFilter === 'all' || alert.type === typeFilter)

  const unreadCount = alerts.filter(a => !a.read && !a.dismissed).length

  const getAlertTypeLabel = (type: Alert['type']) => {
    switch (type) {
      case 'performance_drop': return 'Performance Drop'
      case 'performance_spike': return 'Performance Spike'
      case 'milestone': return 'Milestone'
      case 'anomaly': return 'Anomaly'
      case 'competitive': return 'Competitive'
    }
  }

  const getAlertTypeColor = (type: Alert['type']) => {
    switch (type) {
      case 'performance_drop': return 'bg-rausch/10 text-rausch'
      case 'performance_spike': return 'bg-babu/10 text-babu'
      case 'milestone': return 'bg-arches/10 text-arches'
      case 'anomaly': return 'bg-arches/10 text-arches'
      case 'competitive': return 'bg-hof/10 text-hof'
    }
  }

  const getSeverityIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return (
          <svg className="w-5 h-5 text-rausch" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warning':
        return (
          <svg className="w-5 h-5 text-arches" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'success':
        return (
          <svg className="w-5 h-5 text-babu" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-hof" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-rausch text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-headline-1 font-bold mb-4">
                Alerts & Notifications
              </h1>
              <p className="text-xl opacity-95 max-w-2xl">
                Stay informed about performance changes, milestones, and competitor activities.
              </p>
            </div>
            {unreadCount > 0 && (
              <div className="bg-white text-rausch px-4 py-2 rounded-full font-bold text-body">
                {unreadCount} unread
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          {/* Actions Bar */}
          <Card>
            <div className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={filter === 'all' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setFilter('all')}
                    suppressHydrationWarning
                  >
                    All ({alerts.length})
                  </Button>
                  <Button
                    variant={filter === 'unread' ? 'primary' : 'secondary'}
                    size="small"
                    onClick={() => setFilter('unread')}
                    suppressHydrationWarning
                  >
                    Unread ({unreadCount})
                  </Button>

                  <div className="w-px h-8 bg-hof/20" />

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                    className="px-3 py-2 rounded-standard border border-hof/20 text-small text-hof focus:outline-none focus:ring-2 focus:ring-rausch"
                  >
                    <option value="all">All Types</option>
                    <option value="performance_drop">Performance Drops</option>
                    <option value="performance_spike">Performance Spikes</option>
                    <option value="milestone">Milestones</option>
                    <option value="anomaly">Anomalies</option>
                    <option value="competitive">Competitive</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setShowSettings(!showSettings)}
                    suppressHydrationWarning
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                    </svg>
                    Settings
                  </Button>
                  {unreadCount > 0 && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleMarkAllAsRead}
                      suppressHydrationWarning
                    >
                      Mark All Read
                    </Button>
                  )}
                  {alerts.length > 0 && (
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={handleClearAll}
                      suppressHydrationWarning
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Settings Panel */}
          {showSettings && (
            <Card>
              <div className="p-6">
                <h2 className="font-bold text-headline-3 text-hof mb-6">
                  Alert Settings
                </h2>

                <div className="space-y-6">
                  {/* Alert Types */}
                  <div>
                    <h3 className="font-semibold text-body text-hof mb-3">
                      Alert Types
                    </h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={config.performanceAlerts}
                          onChange={(e) => setConfig({ ...config, performanceAlerts: e.target.checked })}
                          className="w-5 h-5 text-rausch rounded focus:ring-rausch"
                        />
                        <div>
                          <div className="font-medium text-small text-hof">Performance Alerts</div>
                          <div className="text-caption text-foggy">Get notified of significant performance changes</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={config.milestoneAlerts}
                          onChange={(e) => setConfig({ ...config, milestoneAlerts: e.target.checked })}
                          className="w-5 h-5 text-rausch rounded focus:ring-rausch"
                        />
                        <div>
                          <div className="font-medium text-small text-hof">Milestone Alerts</div>
                          <div className="text-caption text-foggy">Celebrate subscriber and view milestones</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={config.anomalyAlerts}
                          onChange={(e) => setConfig({ ...config, anomalyAlerts: e.target.checked })}
                          className="w-5 h-5 text-rausch rounded focus:ring-rausch"
                        />
                        <div>
                          <div className="font-medium text-small text-hof">Anomaly Detection</div>
                          <div className="text-caption text-foggy">Detect unusual spikes or patterns</div>
                        </div>
                      </label>

                      <label className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={config.competitiveAlerts}
                          onChange={(e) => setConfig({ ...config, competitiveAlerts: e.target.checked })}
                          className="w-5 h-5 text-rausch rounded focus:ring-rausch"
                        />
                        <div>
                          <div className="font-medium text-small text-hof">Competitive Alerts</div>
                          <div className="text-caption text-foggy">Track competitor milestones and growth</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Performance Threshold */}
                  <div>
                    <label className="block">
                      <span className="font-semibold text-body text-hof mb-2 block">
                        Performance Drop Threshold
                      </span>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          min="5"
                          max="50"
                          step="5"
                          value={config.performanceThreshold}
                          onChange={(e) => setConfig({ ...config, performanceThreshold: parseInt(e.target.value) })}
                          className="flex-1"
                        />
                        <span className="font-bold text-body text-rausch w-16 text-right">
                          {config.performanceThreshold}%
                        </span>
                      </div>
                      <p className="text-caption text-foggy mt-1">
                        Alert when metrics drop by this percentage or more
                      </p>
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-hof/10">
                    <Button
                      variant="secondary"
                      onClick={() => setShowSettings(false)}
                      suppressHydrationWarning
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveConfig}
                      suppressHydrationWarning
                    >
                      Save Settings
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Alerts List */}
          <div className="mt-8 space-y-4">
            {filteredAlerts.length === 0 ? (
              <Card>
                <div className="p-12 text-center">
                  <svg
                    className="w-24 h-24 mx-auto text-foggy/30 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <h3 className="text-headline-3 font-semibold text-hof mb-2">
                    No Alerts
                  </h3>
                  <p className="text-foggy max-w-md mx-auto mb-6">
                    {filter === 'unread'
                      ? "You're all caught up! No unread alerts."
                      : "No alerts yet. Start tracking channels to receive notifications."}
                  </p>
                  <Link href="/history">
                    <Button suppressHydrationWarning>
                      Track Channels
                    </Button>
                  </Link>
                </div>
              </Card>
            ) : (
              filteredAlerts.map(alert => (
                <Card key={alert.id}>
                  <div className={`p-6 ${!alert.read ? 'bg-rausch/5' : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* Severity Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getSeverityIcon(alert.severity)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className={`font-semibold text-body ${!alert.read ? 'text-hof' : 'text-foggy'}`}>
                              {alert.title}
                            </h3>
                            <p className="text-small text-foggy mt-1">
                              {alert.message}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded text-caption font-semibold whitespace-nowrap ${getAlertTypeColor(alert.type)}`}>
                            {getAlertTypeLabel(alert.type)}
                          </span>
                        </div>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-caption text-foggy mt-3">
                          <span>
                            {new Date(alert.timestamp).toLocaleString()}
                          </span>
                          {alert.channelName && (
                            <>
                              <span>•</span>
                              <span>{alert.channelName}</span>
                            </>
                          )}
                          {alert.metric && alert.value !== undefined && (
                            <>
                              <span>•</span>
                              <span className="font-medium">
                                {alert.metric}: {formatNumber(alert.value)}
                              </span>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 mt-4">
                          {!alert.read && (
                            <button
                              onClick={() => handleMarkAsRead(alert.id)}
                              className="text-small text-babu hover:text-babu/80 font-medium transition-colors"
                            >
                              Mark as Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="text-small text-foggy hover:text-hof font-medium transition-colors"
                          >
                            Dismiss
                          </button>
                          {alert.channelId && (
                            <Link
                              href={`/channel?id=${alert.channelId}`}
                              className="text-small text-rausch hover:text-rausch/80 font-medium transition-colors"
                            >
                              View Channel →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
