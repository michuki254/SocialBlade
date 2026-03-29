# SocialBlade

A YouTube analytics platform built with Next.js 16 that provides real-time channel tracking, growth analytics, AI-powered insights, and global creator rankings.

## Features

- **Channel Analytics** - Subscriber counts, view stats, video history, growth trends, and historical snapshots
- **Video Analytics** - Engagement metrics, view velocity, and comment analysis
- **Top Creator Rankings** - Global and per-country rankings powered by a seed list + auto-discovery system. Channels are filtered by origin country so each region shows local creators
- **Channel Comparison** - Compare up to 5 channels side-by-side with trend charts
- **Real-time Monitoring** - Live subscriber updates, comment streams, spike and trend detection
- **AI Insights** - OpenAI-powered content recommendations, optimal upload times, and A/B testing suggestions
- **Monetization Estimator** - Revenue estimation (CPM/RPM), eligibility checker, and forecasting
- **Reports & Exports** - Generate PDF, CSV, and Excel reports with custom branding
- **Alert System** - Configurable notifications for growth spikes, milestones, and anomalies
- **SEO Analysis** - Optimization suggestions for video titles, descriptions, and tags
- **Dashboard** - Customizable widgets for stats, charts, timelines, heatmaps, and forecasts

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5.9 |
| UI | React 19, Tailwind CSS |
| Database | MongoDB Atlas + Mongoose |
| Auth | NextAuth.js (Google OAuth with YouTube API scopes) |
| APIs | YouTube Data API v3, OpenAI API |
| Charts | Chart.js + react-chartjs-2 |
| Exports | jsPDF, xlsx |
| Deployment | Vercel (with cron jobs) |
| Design | Airbnb-inspired design system (Rubik font) |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- YouTube Data API v3 key
- Google OAuth credentials (for auth)
- OpenAI API key (for AI insights)

### Installation

```bash
git clone https://github.com/michuki254/SocialBlade.git
cd SocialBlade
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# YouTube
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key
NEXT_PUBLIC_YOUTUBE_API_URL=https://www.googleapis.com/youtube/v3

# MongoDB
MONGODB_URL=your_mongodb_connection_string

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# OpenAI (for AI insights)
OPENAI_API_KEY=your_openai_api_key

# Cron
CRON_SECRET=your_cron_secret
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Populate the Database

Run the seed script to populate top channel rankings:

```bash
node scripts/populate-db.js
```

This fetches channels from the seed list + YouTube trending feeds, filters by country of origin, and stores ranked results for all supported regions.

## How Rankings Work

The top channels system uses a three-source approach:

1. **Seed List** (`src/data/seed-channels.ts`) - ~100 known top YouTube channels that are always tracked regardless of trending status
2. **Trending Discovery** - Channels extracted from trending videos across 10+ major regions
3. **Search Discovery** - YouTube Search API queries per country to find local creators

Channels are filtered by their `country` field from the YouTube API, so each region shows creators actually from that country. The database grows over time as new channels are discovered.

A cron job runs every 6 hours (via Vercel Cron) to refresh stats and discover new channels.

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    api/                  # API routes
      cron/               # Scheduled jobs
      top-channels/       # Top channels endpoint
      ai/                 # AI insights endpoint
      analytics/          # Analytics endpoints
      auth/               # NextAuth handler
    channel/              # Channel analytics page
    video/                # Video analytics page
    top-channels/         # Rankings page
    compare-channels/     # Comparison page
    dashboard/            # Customizable dashboard
    realtime/             # Live monitoring
    ai-insights/          # AI recommendations
    monetization/         # Revenue estimator
    reports/              # Export generation
    alerts/               # Alert configuration
    seo/                  # SEO analysis
  components/             # Reusable UI components
  data/                   # Seed data (top channels list)
  lib/                    # Utilities and helpers
  models/                 # Mongoose models
  services/               # YouTube & AI service layers
  types/                  # TypeScript type definitions
```

## Design System

Airbnb-inspired design with custom tokens:

- **Rausch** `#FF5A5F` - Primary brand color
- **Babu** `#00A699` - Secondary/teal
- **Arches** `#FC642D` - Accent/orange
- **Hof** `#484848` - Dark text
- **Foggy** `#767676` - Secondary text
- **Font**: Rubik (300-700 weights)

## Deployment

Configured for Vercel:

```bash
npm run build
```

The `vercel.json` includes a cron job that updates top channel rankings every 6 hours.

## License

ISC
