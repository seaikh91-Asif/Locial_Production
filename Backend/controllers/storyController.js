import fs from 'fs'
import imagekit from '../configs/imagekit.js'
import Story from '../src/models/Story.js'
import User from '../src/models/User.js'

const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000

// Add User Story
export const addUserStory = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, media_type, background_color } = req.body
        const media = req.file

        if (!['text', 'image', 'video'].includes(media_type)) {
            return res.json({ success: false, message: 'Invalid story type' })
        }

        let media_url = ''
        let media_file_id = ''

        // Upload media to ImageKit
        if (media_type === 'image' || media_type === 'video') {
            if (!media) {
                return res.json({ success: false, message: 'Media file is required' })
            }

            const response = await imagekit.files.upload({
                file: fs.createReadStream(media.path),
                fileName: media.originalname,
                folder: 'stories',
            })
            media_url = response.url
            media_file_id = response.fileId
        }

        await Story.create({
            user: userId,
            content,
            media_url,
            media_file_id,
            media_type,
            background_color,
        })

        res.json({ success: true, message: 'Story added successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get User Stories (only stories from the last 24 hours)
export const getStories = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)

        if (!user) {
            return res.json({ success: false, message: 'User not found' })
        }

        // User's own stories, connections and followings
        const userIds = [userId, ...user.connections, ...user.following]
        const since = new Date(Date.now() - STORY_LIFETIME_MS)

        const stories = await Story.find({
            user: { $in: userIds },
            createdAt: { $gt: since },
        })
            .populate('user', '-email')
            .sort({ createdAt: -1 })

        res.json({ success: true, stories })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}