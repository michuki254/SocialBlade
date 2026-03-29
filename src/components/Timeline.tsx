'use client'

import { formatNumber } from '@/lib/youtube-utils'

interface TimelineEvent {
  date: string
  title: string
  value: number
  type: 'milestone' | 'growth' | 'decline' | 'event'
  description?: string
}

interface TimelineProps {
  events: TimelineEvent[]
  title?: string
}

export const Timeline: React.FC<TimelineProps> = ({ events, title }) => {
  const getEventColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return 'bg-babu border-babu text-babu'
      case 'growth':
        return 'bg-arches border-arches text-arches'
      case 'decline':
        return 'bg-rausch border-rausch text-rausch'
      case 'event':
        return 'bg-hof border-hof text-hof'
      default:
        return 'bg-foggy border-foggy text-foggy'
    }
  }

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'milestone':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )
      case 'growth':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
          </svg>
        )
      case 'decline':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="font-semibold text-body text-hof">{title}</h3>
      )}

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-hof/20" />

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const colorClass = getEventColor(event.type)
            const iconBgClass = colorClass.split(' ')[0]
            const borderClass = colorClass.split(' ')[1]
            const textClass = colorClass.split(' ')[2]

            return (
              <div key={index} className="relative flex gap-4">
                {/* Icon */}
                <div
                  className={`relative z-10 flex-shrink-0 w-12 h-12 ${iconBgClass}/20 border-2 ${borderClass} rounded-full flex items-center justify-center`}
                >
                  <div className={textClass}>
                    {getEventIcon(event.type)}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="bg-background p-4 rounded-standard border border-hof/10">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-body text-hof">
                          {event.title}
                        </h4>
                        <p className="text-caption text-foggy mt-1">
                          {new Date(event.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className={`text-headline-3 font-bold ${textClass}`}>
                        {formatNumber(event.value)}
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-small text-foggy">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
