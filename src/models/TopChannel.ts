import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ITopChannel extends Document {
  channelId: string
  title: string
  description: string
  customUrl?: string
  thumbnail: string
  banner?: string
  subscribers: number
  totalViews: number
  videoCount: number
  publishedAt: string
  country?: string
  region: string
  rank: number
  source: 'seed' | 'trending' | 'discovered'
  lastUpdated: Date
  createdAt: Date
}

const TopChannelSchema = new Schema<ITopChannel>({
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  customUrl: {
    type: String,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  banner: {
    type: String,
  },
  subscribers: {
    type: Number,
    required: true,
  },
  totalViews: {
    type: Number,
    required: true,
  },
  videoCount: {
    type: Number,
    required: true,
  },
  publishedAt: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  region: {
    type: String,
    required: true,
    index: true,
  },
  rank: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ['seed', 'trending', 'discovered'],
    default: 'discovered',
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Unique compound index — one entry per channel per region
TopChannelSchema.index({ channelId: 1, region: 1 }, { unique: true })
// Efficient querying by rank within a region
TopChannelSchema.index({ region: 1, rank: 1 })
TopChannelSchema.index({ region: 1, lastUpdated: -1 })

// Prevent model recompilation in development
const TopChannel: Model<ITopChannel> =
  mongoose.models.TopChannel || mongoose.model<ITopChannel>('TopChannel', TopChannelSchema)

export default TopChannel
