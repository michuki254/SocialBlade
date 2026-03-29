/**
 * Spike Detection Algorithm
 * Detects unusual spikes or drops in video/channel performance
 */

export interface DataPoint {
  timestamp: Date
  value: number
}

export interface SpikeDetectionResult {
  isSpike: boolean
  spikeType: 'positive' | 'negative' | 'none'
  magnitude: number
  percentageChange: number
  confidence: 'high' | 'medium' | 'low'
  description: string
  recommendation: string
}

/**
 * Calculate statistical measures
 */
function calculateStats(values: number[]): {
  mean: number
  stdDev: number
  median: number
} {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0, median: 0 }
  }

  // Mean
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length

  // Standard Deviation
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(variance)

  // Median
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid]

  return { mean, stdDev, median }
}

/**
 * Detect spike using Modified Z-Score method
 * More robust than simple standard deviation
 */
export function detectSpike(
  dataPoints: DataPoint[],
  threshold: number = 3.5
): SpikeDetectionResult {
  if (dataPoints.length < 3) {
    return {
      isSpike: false,
      spikeType: 'none',
      magnitude: 0,
      percentageChange: 0,
      confidence: 'low',
      description: 'Insufficient data for spike detection',
      recommendation: 'Collect more data points',
    }
  }

  const values = dataPoints.map(dp => dp.value)
  const currentValue = values[values.length - 1]
  const historicalValues = values.slice(0, -1)

  const stats = calculateStats(historicalValues)

  // Calculate Modified Z-Score
  const median = stats.median
  const deviationsFromMedian = historicalValues.map(val => Math.abs(val - median))
  const mad = calculateStats(deviationsFromMedian).median // Median Absolute Deviation
  const modifiedZScore = mad === 0
    ? 0
    : (0.6745 * (currentValue - median)) / mad

  const isSpike = Math.abs(modifiedZScore) > threshold
  const spikeType: 'positive' | 'negative' | 'none' = modifiedZScore > threshold
    ? 'positive'
    : modifiedZScore < -threshold
    ? 'negative'
    : 'none'

  const magnitude = Math.abs(currentValue - stats.mean)
  const percentageChange = stats.mean === 0
    ? 0
    : ((currentValue - stats.mean) / stats.mean) * 100

  // Determine confidence based on data consistency
  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (dataPoints.length >= 24) confidence = 'high'
  else if (dataPoints.length >= 12) confidence = 'medium'

  // Generate description and recommendation
  let description = ''
  let recommendation = ''

  if (!isSpike) {
    description = 'Performance is within normal range'
    recommendation = 'Continue monitoring trends'
  } else if (spikeType === 'positive') {
    description = `Significant positive spike detected: ${percentageChange.toFixed(1)}% above baseline`
    recommendation = 'Viral content detected! Analyze what worked and create similar content. Engage with new audience immediately.'
  } else {
    description = `Significant negative spike detected: ${Math.abs(percentageChange).toFixed(1)}% below baseline`
    recommendation = 'Performance drop detected. Review recent changes to content strategy, posting time, or video quality.'
  }

  return {
    isSpike,
    spikeType,
    magnitude: parseFloat(magnitude.toFixed(2)),
    percentageChange: parseFloat(percentageChange.toFixed(2)),
    confidence,
    description,
    recommendation,
  }
}

/**
 * Detect trending pattern (sustained growth over time)
 */
export function detectTrend(dataPoints: DataPoint[]): {
  isTrending: boolean
  trendDirection: 'up' | 'down' | 'stable'
  strength: number
  description: string
} {
  if (dataPoints.length < 5) {
    return {
      isTrending: false,
      trendDirection: 'stable',
      strength: 0,
      description: 'Insufficient data for trend analysis',
    }
  }

  // Simple linear regression to detect trend
  const n = dataPoints.length
  const xValues = dataPoints.map((_, i) => i)
  const yValues = dataPoints.map(dp => dp.value)

  const xMean = xValues.reduce((sum, x) => sum + x, 0) / n
  const yMean = yValues.reduce((sum, y) => sum + y, 0) / n

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < n; i++) {
    numerator += (xValues[i] - xMean) * (yValues[i] - yMean)
    denominator += Math.pow(xValues[i] - xMean, 2)
  }

  const slope = denominator === 0 ? 0 : numerator / denominator

  // Normalize slope to get strength (0-100)
  const avgValue = yMean
  const strength = avgValue === 0 ? 0 : Math.min(100, Math.abs(slope / avgValue) * 1000)

  const trendDirection: 'up' | 'down' | 'stable' = slope > 0.1
    ? 'up'
    : slope < -0.1
    ? 'down'
    : 'stable'

  const isTrending = strength > 20

  let description = ''
  if (trendDirection === 'up' && isTrending) {
    description = `Strong upward trend detected (${strength.toFixed(1)}% strength)`
  } else if (trendDirection === 'down' && isTrending) {
    description = `Downward trend detected (${strength.toFixed(1)}% strength)`
  } else {
    description = 'Performance is stable with no significant trend'
  }

  return {
    isTrending,
    trendDirection,
    strength: parseFloat(strength.toFixed(1)),
    description,
  }
}

/**
 * Compare current performance to typical performance
 */
export function compareToBaseline(
  current: number,
  historicalData: number[]
): {
  percentile: number
  isAboveAverage: boolean
  deviationFromMean: number
  description: string
} {
  if (historicalData.length === 0) {
    return {
      percentile: 50,
      isAboveAverage: false,
      deviationFromMean: 0,
      description: 'No historical data for comparison',
    }
  }

  const stats = calculateStats(historicalData)

  // Calculate percentile rank
  const belowCurrent = historicalData.filter(val => val <= current).length
  const percentile = (belowCurrent / historicalData.length) * 100

  const isAboveAverage = current > stats.mean
  const deviationFromMean = stats.mean === 0 ? 0 : ((current - stats.mean) / stats.mean) * 100

  let description = ''
  if (percentile >= 90) {
    description = 'Exceptional performance - top 10%'
  } else if (percentile >= 75) {
    description = 'Above average performance - top 25%'
  } else if (percentile >= 50) {
    description = 'Average performance'
  } else if (percentile >= 25) {
    description = 'Below average performance'
  } else {
    description = 'Significantly below typical performance'
  }

  return {
    percentile: parseFloat(percentile.toFixed(1)),
    isAboveAverage,
    deviationFromMean: parseFloat(deviationFromMean.toFixed(2)),
    description,
  }
}

/**
 * Generate alerts based on spike detection
 */
export function generateAlerts(spikeResult: SpikeDetectionResult): {
  level: 'critical' | 'warning' | 'info' | 'success'
  title: string
  message: string
  action?: string
}[] {
  const alerts: {
    level: 'critical' | 'warning' | 'info' | 'success'
    title: string
    message: string
    action?: string
  }[] = []

  if (spikeResult.isSpike) {
    if (spikeResult.spikeType === 'positive') {
      alerts.push({
        level: 'success',
        title: 'Viral Performance Detected!',
        message: spikeResult.description,
        action: 'Engage with new audience and create follow-up content',
      })
    } else if (spikeResult.spikeType === 'negative') {
      if (spikeResult.percentageChange < -50) {
        alerts.push({
          level: 'critical',
          title: 'Critical Performance Drop',
          message: spikeResult.description,
          action: 'Review content strategy immediately',
        })
      } else {
        alerts.push({
          level: 'warning',
          title: 'Performance Drop Detected',
          message: spikeResult.description,
          action: spikeResult.recommendation,
        })
      }
    }
  }

  return alerts
}
