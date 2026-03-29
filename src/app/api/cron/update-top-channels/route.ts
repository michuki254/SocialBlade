import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import TopChannel from '@/models/TopChannel'
import { SEED_CHANNELS } from '@/data/seed-channels'
import { getChannelsByIds, discoverChannelsFromTrending } from '@/services/youtube'

const ALL_COUNTRIES = [
  'US','GB','CA','AU','IN','DE','FR','BR','MX','JP','KR','NG','KE','ZA',
  'PH','ID','ES','IT','NL','SE','NO','PL','TR','SA','AE','EG','TH','VN',
  'MY','SG','AR','CL','CO','GH','UG','TZ','BD','PK'
]

const GLOBAL_DISCOVERY_REGIONS = ['US','IN','BR','JP','KR','GB','DE','FR','MX','ID']

async function upsertRegion(
  region: string,
  channelIds: string[],
  seedIdSet: Set<string>,
  discoveredIdSet: Set<string>
) {
  const channels = await getChannelsByIds(channelIds)
  if (channels.length === 0) return 0

  channels.sort((a, b) => b.subscribers - a.subscribers)
  const top = channels.slice(0, 50)

  const bulkOps = top.map((channel, index) => ({
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
          source: seedIdSet.has(channel.id)
            ? 'seed'
            : discoveredIdSet.has(channel.id)
              ? 'trending'
              : 'discovered',
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      upsert: true,
    },
  }))

  await TopChannel.bulkWrite(bulkOps)
  return top.length
}

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key'

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting top channels update (global + all countries)...')
    await connectDB()

    const seedIds = SEED_CHANNELS.map((c) => c.channelId)
    const seedIdSet = new Set(seedIds)

    // === GLOBAL ===
    console.log('Updating global channels...')
    const existingDocs = await TopChannel.find(
      { region: 'global' },
      { channelId: 1 }
    ).lean()
    const existingIds = existingDocs.map((d) => d.channelId)

    const globalDiscovered = await discoverChannelsFromTrending(GLOBAL_DISCOVERY_REGIONS)
    const globalDiscoveredSet = new Set(globalDiscovered)

    const globalIds = [...new Set([...seedIds, ...existingIds, ...globalDiscovered])]
    const globalCount = await upsertRegion('global', globalIds, seedIdSet, globalDiscoveredSet)
    console.log(`  Global: ${globalCount} channels updated`)

    // === PER COUNTRY ===
    const countryCounts: Record<string, number> = {}

    for (const countryCode of ALL_COUNTRIES) {
      const region = countryCode.toLowerCase()
      console.log(`Updating ${countryCode}...`)

      const existingCountryDocs = await TopChannel.find(
        { region },
        { channelId: 1 }
      ).lean()
      const existingCountryIds = existingCountryDocs.map((d) => d.channelId)

      const discovered = await discoverChannelsFromTrending([countryCode])
      const discoveredSet = new Set(discovered)

      const allIds = [...new Set([...existingCountryIds, ...discovered])]

      if (allIds.length === 0) {
        console.log(`  ${countryCode}: no channels found, skipping`)
        continue
      }

      const count = await upsertRegion(region, allIds, seedIdSet, discoveredSet)
      countryCounts[countryCode] = count
      console.log(`  ${countryCode}: ${count} channels updated`)
    }

    const totalCountries = Object.keys(countryCounts).length

    return NextResponse.json({
      success: true,
      global: globalCount,
      countries: totalCountries,
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
