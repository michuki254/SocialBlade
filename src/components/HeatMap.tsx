'use client'

import { useEffect, useRef } from 'react'

interface HeatMapProps {
  data: Array<{
    day: string
    hour: number
    value: number
  }>
  title?: string
}

export const HeatMap: React.FC<HeatMapProps> = ({ data, title }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const width = canvas.width
    const height = canvas.height
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    const cellWidth = width / 24
    const cellHeight = height / 7

    // Find min and max values for color scale
    const values = data.map(d => d.value)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw heat map cells
    data.forEach(item => {
      const dayIndex = days.indexOf(item.day)
      if (dayIndex === -1) return

      const x = item.hour * cellWidth
      const y = dayIndex * cellHeight

      // Calculate color intensity (0-1)
      const intensity = maxValue === minValue
        ? 0.5
        : (item.value - minValue) / (maxValue - minValue)

      // Color scale: light red to dark red
      const r = 255
      const g = Math.floor(90 + (1 - intensity) * 165) // 90 to 255
      const b = Math.floor(95 + (1 - intensity) * 160) // 95 to 255

      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
      ctx.fillRect(x, y, cellWidth - 1, cellHeight - 1)

      // Add text for values
      if (cellWidth > 30 && cellHeight > 20) {
        ctx.fillStyle = intensity > 0.5 ? '#fff' : '#484848'
        ctx.font = '10px Rubik'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(
          item.value.toString(),
          x + cellWidth / 2,
          y + cellHeight / 2
        )
      }
    })

    // Draw grid lines
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1

    for (let i = 0; i <= 24; i++) {
      ctx.beginPath()
      ctx.moveTo(i * cellWidth, 0)
      ctx.lineTo(i * cellWidth, height)
      ctx.stroke()
    }

    for (let i = 0; i <= 7; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * cellHeight)
      ctx.lineTo(width, i * cellHeight)
      ctx.stroke()
    }
  }, [data])

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="font-semibold text-body text-hof">{title}</h3>
      )}

      <div className="relative">
        {/* Days labels */}
        <div className="absolute -left-12 top-0 h-full flex flex-col justify-around text-small text-foggy">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-right pr-2">{day}</div>
          ))}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={720}
          height={280}
          className="border border-hof/10 rounded-standard"
        />

        {/* Hours labels */}
        <div className="flex justify-between text-small text-foggy mt-2 ml-0">
          {[0, 6, 12, 18, 23].map(hour => (
            <span key={hour}>{hour}:00</span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4">
        <span className="text-small text-foggy">Low</span>
        <div className="flex gap-1">
          {[0, 0.25, 0.5, 0.75, 1].map(intensity => {
            const r = 255
            const g = Math.floor(90 + (1 - intensity) * 165)
            const b = Math.floor(95 + (1 - intensity) * 160)
            return (
              <div
                key={intensity}
                className="w-8 h-4 rounded"
                style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
              />
            )
          })}
        </div>
        <span className="text-small text-foggy">High</span>
      </div>
    </div>
  )
}
