import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import ChannelSnapshot from '@/models/ChannelSnapshot'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { channelId, channelTitle, subscribers, totalViews, videoCount } = body

    if (!channelId || subscribers === undefined || totalViews === undefined || videoCount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    await connectDB()

    // Create snapshot
    const snapshot = await ChannelSnapshot.create({
      channelId,
      channelTitle,
      subscribers,
      totalViews,
      videoCount,
      timestamp: new Date(),
    })

    return NextResponse.json({
      success: true,
      snapshot: {
        id: snapshot._id,
        channelId: snapshot.channelId,
        timestamp: snapshot.timestamp,
      },
    })
  } catch (error: any) {
    console.error('Error creating channel snapshot:', error)
    return NextResponse.json(
      { error: 'Failed to create snapshot', details: error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const channelId = searchParams.get('channelId')
    const days = parseInt(searchParams.get('days') || '30')

    if (!channelId) {
      return NextResponse.json(
        { error: 'channelId is required' },
        { status: 400 }
      )
    }

    await connectDB()

    // Get snapshot from X days ago
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - days)

    // Get the most recent snapshot from that time period
    const oldSnapshot = await ChannelSnapshot.findOne({
      channelId,
      timestamp: { $lte: targetDate },
    })
      .sort({ timestamp: -1 })
      .limit(1)

    // Get the most recent snapshot
    const currentSnapshot = await ChannelSnapshot.findOne({ channelId })
      .sort({ timestamp: -1 })
      .limit(1)

    if (!currentSnapshot) {
      return NextResponse.json({
        hasData: false,
        message: 'No snapshots found for this channel',
      })
    }

    if (!oldSnapshot) {
      return NextResponse.json({
        hasData: true,
        growth: null,
        message: `No snapshot found from ${days} days ago`,
        current: {
          subscribers: currentSnapshot.subscribers,
          totalViews: currentSnapshot.totalViews,
          videoCount: currentSnapshot.videoCount,
          timestamp: currentSnapshot.timestamp,
        },
      })
    }

    // Calculate growth
    const subscriberGrowth = currentSnapshot.subscribers - oldSnapshot.subscribers
    const viewGrowth = currentSnapshot.totalViews - oldSnapshot.totalViews
    const videoGrowth = currentSnapshot.videoCount - oldSnapshot.videoCount

    return NextResponse.json({
      hasData: true,
      growth: {
        subscribers: subscriberGrowth,
        views: viewGrowth,
        videos: videoGrowth,
        days: Math.ceil((currentSnapshot.timestamp.getTime() - oldSnapshot.timestamp.getTime()) / (1000 * 60 * 60 * 24)),
      },
      current: {
        subscribers: currentSnapshot.subscribers,
        totalViews: currentSnapshot.totalViews,
        videoCount: currentSnapshot.videoCount,
        timestamp: currentSnapshot.timestamp,
      },
      previous: {
        subscribers: oldSnapshot.subscribers,
        totalViews: oldSnapshot.totalViews,
        videoCount: oldSnapshot.videoCount,
        timestamp: oldSnapshot.timestamp,
      },
    })
  } catch (error: any) {
    console.error('Error fetching channel snapshots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch snapshots', details: error.message },
      { status: 500 }
    )
  }
}
