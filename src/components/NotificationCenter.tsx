'use client'

import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { getUnreadAlerts, dismissAlert, markAlertAsRead, type Alert } from '@/lib/alerts'

interface NotificationContextType {
  notifications: Alert[]
  showNotification: (alert: Alert) => void
  dismissNotification: (id: string) => void
  unreadCount: number
  refreshNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider')
  }
  return context
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Alert[]>([])
  const [activeToasts, setActiveToasts] = useState<Alert[]>([])

  const refreshNotifications = useCallback(() => {
    setNotifications(getUnreadAlerts())
  }, [])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  const showNotification = useCallback((alert: Alert) => {
    setActiveToasts(prev => [...prev, alert])
    setNotifications(prev => [...prev, alert])

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setActiveToasts(prev => prev.filter(t => t.id !== alert.id))
    }, 5000)
  }, [])

  const dismissNotification = useCallback((id: string) => {
    dismissAlert(id)
    setActiveToasts(prev => prev.filter(t => t.id !== id))
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        showNotification,
        dismissNotification,
        unreadCount: notifications.length,
        refreshNotifications
      }}
    >
      {children}
      <ToastContainer toasts={activeToasts} onDismiss={dismissNotification} />
    </NotificationContext.Provider>
  )
}

interface ToastContainerProps {
  toasts: Alert[]
  onDismiss: (id: string) => void
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-md">
      {toasts.map(toast => (
        <Toast key={toast.id} alert={toast} onDismiss={onDismiss} />
      ))}
    </div>
  )
}

interface ToastProps {
  alert: Alert
  onDismiss: (id: string) => void
}

function Toast({ alert, onDismiss }: ToastProps) {
  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-rausch border-rausch text-white'
      case 'warning':
        return 'bg-arches border-arches text-white'
      case 'success':
        return 'bg-babu border-babu text-white'
      default:
        return 'bg-white border-hof/20 text-hof'
    }
  }

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'milestone':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      case 'performance_spike':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        )
      case 'performance_drop':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
          </svg>
        )
      case 'anomaly':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'competitive':
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div
      className={`${getSeverityStyles(alert.severity)} border-l-4 rounded-standard shadow-elevation-2 p-4 animate-slide-in-right`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 opacity-90">
          {getIcon(alert.type)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-body mb-1">
            {alert.title}
          </h4>
          <p className={`text-small ${alert.severity === 'info' ? 'text-foggy' : 'opacity-90'}`}>
            {alert.message}
          </p>
          {alert.channelName && (
            <p className={`text-caption mt-1 ${alert.severity === 'info' ? 'text-foggy' : 'opacity-75'}`}>
              {alert.channelName}
            </p>
          )}
        </div>
        <button
          onClick={() => onDismiss(alert.id)}
          className={`flex-shrink-0 ${alert.severity === 'info' ? 'text-foggy hover:text-hof' : 'opacity-75 hover:opacity-100'} transition-opacity`}
          aria-label="Dismiss"
          suppressHydrationWarning
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  )
}
