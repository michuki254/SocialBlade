/**
 * Forecasting and Trend Analysis Utilities
 * Uses simple linear regression and moving averages for predictions
 */

export interface DataPoint {
  x: number
  y: number
  date?: string
}

export interface TrendLine {
  slope: number
  intercept: number
  equation: string
  r2: number // Coefficient of determination
}

export interface Forecast {
  predictions: DataPoint[]
  confidence: 'high' | 'medium' | 'low'
  trendLine: TrendLine
}

/**
 * Calculate linear regression trend line
 */
export function calculateTrendLine(data: DataPoint[]): TrendLine {
  if (data.length < 2) {
    return { slope: 0, intercept: 0, equation: 'y = 0', r2: 0 }
  }

  const n = data.length
  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0

  for (let i = 0; i < n; i++) {
    sumX += data[i].x
    sumY += data[i].y
    sumXY += data[i].x * data[i].y
    sumX2 += data[i].x * data[i].x
    sumY2 += data[i].y * data[i].y
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Calculate R² (coefficient of determination)
  const yMean = sumY / n
  let ssTotal = 0
  let ssResidual = 0

  for (let i = 0; i < n; i++) {
    const yPredicted = slope * data[i].x + intercept
    ssTotal += Math.pow(data[i].y - yMean, 2)
    ssResidual += Math.pow(data[i].y - yPredicted, 2)
  }

  const r2 = 1 - (ssResidual / ssTotal)

  const equation = `y = ${slope.toFixed(2)}x + ${intercept.toFixed(2)}`

  return {
    slope: parseFloat(slope.toFixed(2)),
    intercept: parseFloat(intercept.toFixed(2)),
    equation,
    r2: parseFloat(Math.max(0, r2).toFixed(4))
  }
}

/**
 * Generate forecast based on trend line
 */
export function generateForecast(
  historicalData: DataPoint[],
  periods: number = 7
): Forecast {
  if (historicalData.length < 3) {
    return {
      predictions: [],
      confidence: 'low',
      trendLine: { slope: 0, intercept: 0, equation: 'y = 0', r2: 0 }
    }
  }

  const trendLine = calculateTrendLine(historicalData)
  const lastX = historicalData[historicalData.length - 1].x

  const predictions: DataPoint[] = []
  for (let i = 1; i <= periods; i++) {
    const x = lastX + i
    const y = Math.max(0, trendLine.slope * x + trendLine.intercept)
    predictions.push({
      x,
      y: Math.round(y)
    })
  }

  // Determine confidence based on R²
  let confidence: 'high' | 'medium' | 'low' = 'low'
  if (trendLine.r2 >= 0.8) confidence = 'high'
  else if (trendLine.r2 >= 0.5) confidence = 'medium'

  return {
    predictions,
    confidence,
    trendLine
  }
}

/**
 * Calculate moving average
 */
export function calculateMovingAverage(
  data: number[],
  windowSize: number = 7
): number[] {
  if (data.length < windowSize) return data

  const result: number[] = []
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      result.push(data[i])
    } else {
      const window = data.slice(i - windowSize + 1, i + 1)
      const average = window.reduce((sum, val) => sum + val, 0) / windowSize
      result.push(Math.round(average))
    }
  }

  return result
}

/**
 * Calculate exponential moving average (EMA)
 */
export function calculateEMA(
  data: number[],
  periods: number = 7
): number[] {
  if (data.length === 0) return []

  const multiplier = 2 / (periods + 1)
  const ema: number[] = [data[0]]

  for (let i = 1; i < data.length; i++) {
    const value = (data[i] - ema[i - 1]) * multiplier + ema[i - 1]
    ema.push(Math.round(value))
  }

  return ema
}

/**
 * Detect seasonality patterns
 */
export function detectSeasonality(data: number[]): {
  hasSeasonality: boolean
  period: number | null
  strength: number
} {
  if (data.length < 14) {
    return { hasSeasonality: false, period: null, strength: 0 }
  }

  // Check for weekly patterns (7 days)
  const weeklyCorrelation = calculateAutocorrelation(data, 7)

  // Check for monthly patterns (30 days)
  const monthlyCorrelation = data.length >= 30
    ? calculateAutocorrelation(data, 30)
    : 0

  if (weeklyCorrelation > 0.6) {
    return {
      hasSeasonality: true,
      period: 7,
      strength: parseFloat(weeklyCorrelation.toFixed(2))
    }
  }

  if (monthlyCorrelation > 0.6) {
    return {
      hasSeasonality: true,
      period: 30,
      strength: parseFloat(monthlyCorrelation.toFixed(2))
    }
  }

  return { hasSeasonality: false, period: null, strength: 0 }
}

/**
 * Calculate autocorrelation for lag
 */
function calculateAutocorrelation(data: number[], lag: number): number {
  if (data.length <= lag) return 0

  const mean = data.reduce((sum, val) => sum + val, 0) / data.length

  let numerator = 0
  let denominator = 0

  for (let i = 0; i < data.length - lag; i++) {
    numerator += (data[i] - mean) * (data[i + lag] - mean)
  }

  for (let i = 0; i < data.length; i++) {
    denominator += Math.pow(data[i] - mean, 2)
  }

  return denominator === 0 ? 0 : numerator / denominator
}

/**
 * Calculate growth rate
 */
export function calculateGrowthRate(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0
  return parseFloat(((current - previous) / previous * 100).toFixed(2))
}

/**
 * Predict future value based on growth rate
 */
export function predictByGrowthRate(
  currentValue: number,
  growthRatePercentage: number,
  periods: number
): number[] {
  const predictions: number[] = []
  let value = currentValue

  for (let i = 0; i < periods; i++) {
    value = value * (1 + growthRatePercentage / 100)
    predictions.push(Math.round(value))
  }

  return predictions
}
