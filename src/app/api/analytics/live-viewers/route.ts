import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getLiveConcurrentViewers } from '@/services/youtube-analytics'

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

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId parameter is required' },
        { status: 400 }
      )
    }

    const data = await getLiveConcurrentViewers(session.accessToken, videoId)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching live viewers:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch live viewers' },
      { status: 500 }
    )
  }
}
