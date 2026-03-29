import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getRealtimeMetrics } from '@/services/youtube-analytics'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    const data = await getRealtimeMetrics(session.accessToken, videoId || undefined)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching realtime metrics:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch realtime metrics' },
      { status: 500 }
    )
  }
}
