import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TopChannel from '@/models/TopChannel'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const region = searchParams.get('region') || 'global'
    const limit = parseInt(searchParams.get('limit') || '50')

    await connectDB()

    // Fetch top channels from database
    const channels = await TopChannel.find({ region })
      .sort({ rank: 1 })
      .limit(limit)
      .lean()

    if (!channels || channels.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No channels found. Data may need to be populated.',
        channels: [],
      })
    }

    // Transform to match FormattedChannelData interface
    const formattedChannels = channels.map((channel) => ({
      id: channel.channelId,
      title: channel.title,
      description: channel.description,
      customUrl: channel.customUrl,
      thumbnail: channel.thumbnail,
      banner: channel.banner,
      subscribers: channel.subscribers,
      totalViews: channel.totalViews,
      videoCount: channel.videoCount,
      publishedAt: channel.publishedAt,
      country: channel.country,
      rank: channel.rank,
    }))

    return NextResponse.json({
      success: true,
      channels: formattedChannels,
      lastUpdated: channels[0]?.lastUpdated,
      region,
    })
  } catch (error: any) {
    console.error('Error fetching top channels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top channels', details: error.message },
      { status: 500 }
    )
  }
}
