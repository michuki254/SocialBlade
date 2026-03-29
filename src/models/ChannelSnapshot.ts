import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IChannelSnapshot extends Document {
  channelId: string
  channelTitle: string
  subscribers: number
  totalViews: number
  videoCount: number
  timestamp: Date
  createdAt: Date
}

const ChannelSnapshotSchema = new Schema<IChannelSnapshot>({
  channelId: {
    type: String,
    required: true,
    index: true,
  },
  channelTitle: {
    type: String,
    required: true,
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
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 365 * 24 * 60 * 60, // Auto-delete after 1 year
  },
})

// Compound index for efficient querying
ChannelSnapshotSchema.index({ channelId: 1, timestamp: -1 })

// Prevent model recompilation in development
const ChannelSnapshot: Model<IChannelSnapshot> =
  mongoose.models.ChannelSnapshot || mongoose.model<IChannelSnapshot>('ChannelSnapshot', ChannelSnapshotSchema)

export default ChannelSnapshot
