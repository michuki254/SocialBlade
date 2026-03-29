import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TopChannel from '@/models/TopChannel'
import { SEED_CHANNELS } from '@/data/seed-channels'
import {
  getChannelsByIds,
  discoverChannelsFromTrending,
  searchChannelsByCountry,
} from '@/services/youtube'

const ALL_COUNTRIES = [
  'US','GB','CA','AU','IN','DE','FR','BR','MX','JP','KR','NG','KE','ZA',
  'PH','ID','ES','IT','NL','SE','NO','PL','TR','SA','AE','EG','TH','VN',
  'MY','SG','AR','CL','CO','GH','UG','TZ','BD','PK'
]

const GLOBAL_DISCOVERY_REGIONS = ['US','IN','BR','JP','KR','GB','DE','FR','MX','ID']

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Starting top channels update...')
    await connectDB()

    const seedIds = SEED_CHANNELS.map((c) => c.channelId)
    const seedIdSet = new Set(seedIds)

    // ===== PHASE 1: Build master channel pool =====
    // Gather all channel IDs from: seeds + existing DB + trending + search
    const allChannelIds = new Set(seedIds)

    // Existing channels in DB
    const existingDocs = await TopChannel.find({}, { channelId: 1 }).lean()
    existingDocs.forEach((d) => allChannelIds.add(d.channelId))

    // Discover from trending across all regions
    console.log('Discovering from trending...')
    const trendingIds = await discoverChannelsFromTrending([
      ...GLOBAL_DISCOVERY_REGIONS,
      ...ALL_COUNTRIES,
    ])
    const trendingIdSet = new Set(trendingIds)
    trendingIds.forEach((id) => allChannelIds.add(id))

    // Search for local channels per country
    console.log('Searching for local channels per country...')
    for (const countryCode of ALL_COUNTRIES) {
      try {
        const searchIds = await searchChannelsByCountry(countryCode)
        searchIds.forEach((id) => allChannelIds.add(id))
      } catch (error) {
        console.warn(`Search failed for ${countryCode}`)
      }
    }

    console.log(`Total unique channel IDs: ${allChannelIds.size}`)

    // ===== PHASE 2: Fetch live stats for all channels =====
    console.log('Fetching channel details...')
    const masterPool = await getChannelsByIds([...allChannelIds])
    console.log(`Got details for ${masterPool.length} channels`)

    if (masterPool.length === 0) {
      return NextResponse.json(
        { error: 'No channels returned from YouTube API' },
        { status: 500 }
      )
    }

    // ===== PHASE 3: Index channels by country =====
    const channelsByCountry = new Map<string, typeof masterPool>()
    masterPool.forEach((ch) => {
      if (ch.country) {
        const cc = ch.country.toUpperCase()
        if (!channelsByCountry.has(cc)) channelsByCountry.set(cc, [])
        channelsByCountry.get(cc)!.push(ch)
      }
    })

    // ===== PHASE 4: Upsert global rankings =====
    console.log('Upserting global rankings...')
    masterPool.sort((a, b) => b.subscribers - a.subscribers)

    const globalOps = masterPool.map((channel, index) => ({
      updateOne: {
        filter: { channelId: channel.id, region: 'global' },
        update: {
          $set: {
            title: channel.title,
            description: channel.description || '',
            customUrl: channel.customUrl,
            thumbnail: channel.thumbnail,
            banner: '',
            subscribers: channel.subscribers,
            totalViews: channel.totalViews,
            videoCount: channel.videoCount,
            publishedAt: channel.publishedAt,
            country: channel.country,
            region: 'global',
            rank: index + 1,
            lastUpdated: new Date(),
            source: seedIdSet.has(channel.id) ? 'seed'
              : trendingIdSet.has(channel.id) ? 'trending' : 'discovered',
          },
          $setOnInsert: { createdAt: new Date() },
        },
        upsert: true,
      },
    }))

    await TopChannel.bulkWrite(globalOps)
    console.log(`  Global: ${masterPool.length} channels`)

    // ===== PHASE 5: Upsert per-country rankings (only channels FROM that country) =====
    const countryCounts: Record<string, number> = {}

    for (const countryCode of ALL_COUNTRIES) {
      const countryChannels = channelsByCountry.get(countryCode) || []
      if (countryChannels.length === 0) {
        console.log(`  ${countryCode}: no local channels`)
        continue
      }

      countryChannels.sort((a, b) => b.subscribers - a.subscribers)
      const top = countryChannels.slice(0, 50)
      const region = countryCode.toLowerCase()

      const countryOps = top.map((channel, index) => ({
        updateOne: {
          filter: { channelId: channel.id, region },
          update: {
            $set: {
              title: channel.title,
              description: channel.description || '',
              customUrl: channel.customUrl,
              thumbnail: channel.thumbnail,
              banner: '',
              subscribers: channel.subscribers,
              totalViews: channel.totalViews,
              videoCount: channel.videoCount,
              publishedAt: channel.publishedAt,
              country: channel.country,
              region,
              rank: index + 1,
              lastUpdated: new Date(),
              source: seedIdSet.has(channel.id) ? 'seed' : 'trending',
            },
            $setOnInsert: { createdAt: new Date() },
          },
          upsert: true,
        },
      }))

      await TopChannel.bulkWrite(countryOps)
      countryCounts[countryCode] = top.length
      console.log(`  ${countryCode}: ${top.length} channels (top: ${top[0]?.title})`)
    }

    return NextResponse.json({
      success: true,
      totalChannels: masterPool.length,
      global: masterPool.length,
      countries: Object.keys(countryCounts).length,
      countryCounts,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error updating top channels:', error)
    return NextResponse.json(
      { error: 'Failed to update top channels', details: error.message },
      { status: 500 }
    )
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}
