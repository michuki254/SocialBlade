import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { FormattedChannelData, FormattedVideoData } from '@/types/youtube'
import { formatNumber } from './youtube-utils'

/**
 * Export channel data to CSV
 */
export function exportChannelToCSV(channel: FormattedChannelData, videos: FormattedVideoData[] = []) {
  const data = [
    ['Channel Information'],
    ['Name', channel.title],
    ['ID', channel.id],
    ['Subscribers', channel.subscribers.toString()],
    ['Total Views', channel.totalViews.toString()],
    ['Video Count', channel.videoCount.toString()],
    ['Average Views per Video', Math.floor(channel.totalViews / channel.videoCount).toString()],
    ['Description', channel.description],
    [''],
    ['Recent Videos'],
    ['Title', 'Views', 'Likes', 'Comments', 'Published Date'],
    ...videos.map(video => [
      video.title,
      video.views.toString(),
      video.likes.toString(),
      video.comments.toString(),
      new Date(video.publishedAt).toLocaleDateString()
    ])
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Channel Data')

  const fileName = `${channel.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export video data to CSV
 */
export function exportVideoToCSV(video: FormattedVideoData) {
  const engagementRate = video.views > 0
    ? ((video.likes + video.comments) / video.views * 100).toFixed(2)
    : '0'

  const data = [
    ['Video Information'],
    ['Title', video.title],
    ['ID', video.id],
    ['Channel', video.channelTitle],
    ['Published', new Date(video.publishedAt).toLocaleDateString()],
    [''],
    ['Statistics'],
    ['Views', video.views.toString()],
    ['Likes', video.likes.toString()],
    ['Comments', video.comments.toString()],
    ['Duration', video.duration],
    ['Engagement Rate', engagementRate + '%'],
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Video Data')

  const fileName = `${video.title.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`
  XLSX.writeFile(wb, fileName)
}

/**
 * Export multiple channels comparison to Excel
 */
export function exportChannelComparisonToExcel(channels: FormattedChannelData[]) {
  const data = [
    ['Channel', 'Subscribers', 'Total Views', 'Videos', 'Avg Views/Video', 'Views/Subscriber'],
    ...channels.map(channel => [
      channel.title,
      channel.subscribers,
      channel.totalViews,
      channel.videoCount,
      Math.floor(channel.totalViews / channel.videoCount),
      (channel.totalViews / channel.subscribers).toFixed(2)
    ])
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Channel Comparison')

  XLSX.writeFile(wb, `Channel_Comparison_${Date.now()}.xlsx`)
}

/**
 * Export video comparison to Excel
 */
export function exportVideoComparisonToExcel(videos: FormattedVideoData[]) {
  const data = [
    ['Title', 'Channel', 'Views', 'Likes', 'Comments', 'Engagement Rate', 'Published'],
    ...videos.map(video => {
      const engagementRate = video.views > 0
        ? ((video.likes + video.comments) / video.views * 100).toFixed(2)
        : '0'
      return [
        video.title,
        video.channelTitle,
        video.views,
        video.likes,
        video.comments,
        engagementRate + '%',
        new Date(video.publishedAt).toLocaleDateString()
      ]
    })
  ]

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Video Comparison')

  XLSX.writeFile(wb, `Video_Comparison_${Date.now()}.xlsx`)
}

/**
 * Generate PDF report for channel
 */
export function generateChannelPDFReport(
  channel: FormattedChannelData,
  videos: FormattedVideoData[] = [],
  options: {
    includeLogo?: boolean
    brandColor?: string
    companyName?: string
  } = {}
) {
  const doc = new jsPDF()
  const brandColor = options.brandColor || '#FF5A5F'
  const companyName = options.companyName || 'SocialBlade Analytics'

  // Header
  doc.setFillColor(brandColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text(companyName, 15, 20)

  doc.setFontSize(16)
  doc.text('Channel Analytics Report', 15, 32)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Channel Information
  doc.setFontSize(18)
  doc.text('Channel Overview', 15, 55)

  doc.setFontSize(12)
  let y = 65

  doc.text(`Channel: ${channel.title}`, 15, y)
  y += 8
  doc.text(`Subscribers: ${formatNumber(channel.subscribers)}`, 15, y)
  y += 8
  doc.text(`Total Views: ${formatNumber(channel.totalViews)}`, 15, y)
  y += 8
  doc.text(`Videos: ${formatNumber(channel.videoCount)}`, 15, y)
  y += 8
  doc.text(`Avg Views/Video: ${formatNumber(Math.floor(channel.totalViews / channel.videoCount))}`, 15, y)
  y += 15

  // Description
  if (channel.description) {
    doc.setFontSize(14)
    doc.text('Description:', 15, y)
    y += 8
    doc.setFontSize(10)
    const splitDescription = doc.splitTextToSize(channel.description, 180)
    doc.text(splitDescription.slice(0, 5), 15, y) // Limit to 5 lines
    y += splitDescription.slice(0, 5).length * 5 + 10
  }

  // Videos Table
  if (videos.length > 0) {
    doc.setFontSize(18)
    doc.text('Recent Videos', 15, y)
    y += 10

    autoTable(doc, {
      startY: y,
      head: [['Title', 'Views', 'Likes', 'Comments', 'Engagement']],
      body: videos.slice(0, 10).map(video => {
        const engagementRate = video.views > 0
          ? ((video.likes + video.comments) / video.views * 100).toFixed(2) + '%'
          : '0%'
        return [
          video.title.substring(0, 40) + (video.title.length > 40 ? '...' : ''),
          formatNumber(video.views),
          formatNumber(video.likes),
          formatNumber(video.comments),
          engagementRate
        ]
      }),
      theme: 'grid',
      headStyles: { fillColor: brandColor },
      styles: { fontSize: 9 },
    })
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      15,
      285
    )
  }

  doc.save(`${channel.title.replace(/[^a-z0-9]/gi, '_')}_Report_${Date.now()}.pdf`)
}

/**
 * Generate PDF report for video
 */
export function generateVideoPDFReport(
  video: FormattedVideoData,
  options: {
    brandColor?: string
    companyName?: string
  } = {}
) {
  const doc = new jsPDF()
  const brandColor = options.brandColor || '#FF5A5F'
  const companyName = options.companyName || 'SocialBlade Analytics'

  // Header
  doc.setFillColor(brandColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text(companyName, 15, 20)

  doc.setFontSize(16)
  doc.text('Video Analytics Report', 15, 32)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Video Information
  doc.setFontSize(18)
  doc.text('Video Overview', 15, 55)

  doc.setFontSize(12)
  let y = 65

  const titleLines = doc.splitTextToSize(video.title, 180)
  doc.text(`Title: ${titleLines[0]}`, 15, y)
  y += 8

  doc.text(`Channel: ${video.channelTitle}`, 15, y)
  y += 8
  doc.text(`Published: ${new Date(video.publishedAt).toLocaleDateString()}`, 15, y)
  y += 8
  doc.text(`Duration: ${video.duration}`, 15, y)
  y += 15

  // Statistics
  doc.setFontSize(18)
  doc.text('Performance Metrics', 15, y)
  y += 10

  const engagementRate = video.views > 0
    ? ((video.likes + video.comments) / video.views * 100).toFixed(2)
    : '0'

  const likeRate = video.views > 0
    ? (video.likes / video.views * 100).toFixed(2)
    : '0'

  const commentRate = video.views > 0
    ? (video.comments / video.views * 100).toFixed(2)
    : '0'

  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value']],
    body: [
      ['Views', formatNumber(video.views)],
      ['Likes', formatNumber(video.likes)],
      ['Comments', formatNumber(video.comments)],
      ['Engagement Rate', engagementRate + '%'],
      ['Like Rate', likeRate + '%'],
      ['Comment Rate', commentRate + '%'],
    ],
    theme: 'grid',
    headStyles: { fillColor: brandColor },
    styles: { fontSize: 11 },
  })

  // Footer
  doc.setFontSize(10)
  doc.setTextColor(128, 128, 128)
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    15,
    285
  )

  doc.save(`${video.title.substring(0, 50).replace(/[^a-z0-9]/gi, '_')}_Report_${Date.now()}.pdf`)
}

/**
 * Generate comparison PDF report
 */
export function generateComparisonPDFReport(
  channels: FormattedChannelData[],
  options: {
    brandColor?: string
    companyName?: string
    title?: string
  } = {}
) {
  const doc = new jsPDF()
  const brandColor = options.brandColor || '#FF5A5F'
  const companyName = options.companyName || 'SocialBlade Analytics'
  const reportTitle = options.title || 'Channel Comparison Report'

  // Header
  doc.setFillColor(brandColor)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text(companyName, 15, 20)

  doc.setFontSize(16)
  doc.text(reportTitle, 15, 32)

  // Reset text color
  doc.setTextColor(0, 0, 0)

  // Comparison Table
  doc.setFontSize(18)
  doc.text('Channel Comparison', 15, 55)

  autoTable(doc, {
    startY: 65,
    head: [['Channel', 'Subscribers', 'Views', 'Videos', 'Avg Views']],
    body: channels.map(channel => [
      channel.title.substring(0, 30) + (channel.title.length > 30 ? '...' : ''),
      formatNumber(channel.subscribers),
      formatNumber(channel.totalViews),
      formatNumber(channel.videoCount),
      formatNumber(Math.floor(channel.totalViews / channel.videoCount))
    ]),
    theme: 'grid',
    headStyles: { fillColor: brandColor },
    styles: { fontSize: 10 },
  })

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
      15,
      285
    )
  }

  doc.save(`Channel_Comparison_${Date.now()}.pdf`)
}
