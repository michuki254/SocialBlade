import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { getRealtimeGeography } from '@/services/youtube-analytics'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      )
    }

    const data = await getRealtimeGeography(session.accessToken)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Error fetching geography data:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch geography data' },
      { status: 500 }
    )
  }
}
