import mongoose from 'mongoose'

const storySchema = new mongoose.Schema({
    user: { type: String, ref: 'User', required: true },
    content: { type: String },
    media_url: { type: String },
    media_file_id: { type: String }, // ImageKit fileId, used to delete the file later
    media_type: { type: String, enum: ['text', 'image', 'video'], required: true },
    background_color: { type: String },
}, { timestamps: true, minimize: false })

// Safety net: MongoDB removes any story document 26 hours after creation.
// The Inngest cron below deletes at 24h (and cleans ImageKit), this catches anything it missed.
storySchema.index({ createdAt: 1 }, { expireAfterSeconds: 26 * 60 * 60 })

const Story = mongoose.model('Story', storySchema)

export default Story