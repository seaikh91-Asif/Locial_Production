import fs from 'fs'
import mongoose from 'mongoose'
import imagekit from '../configs/imagekit.js'
import { deleteImageKitFiles } from '../configs/deleteImages.js'
import Post from '../src/models/Post.js'
import User from '../src/models/User.js'
import Comment from '../src/models/Comment.js' // COMMENTS: remove if you have no comments feature

// Add Post
export const addPost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { content, post_type } = req.body
        const images = req.files

        let image_urls = []
        let image_file_ids = []

        if (images?.length) {
            const uploaded = await Promise.all(
                images.map(async (image) => {
                    const response = await imagekit.files.upload({
                        file: fs.createReadStream(image.path),
                        fileName: image.originalname,
                        folder: 'posts',
                    })

                    const url = imagekit.helper.buildSrc({
                        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                        src: response.filePath,
                        transformation: [
                            { quality: 'auto' },
                            { format: 'webp' },
                            { width: 1280 }
                        ],
                    })

                    return { url, fileId: response.fileId }
                })
            )

            image_urls = uploaded.map((item) => item.url)
            image_file_ids = uploaded.map((item) => item.fileId)
        }

        await Post.create({
            user: userId,
            content,
            image_urls,
            image_file_ids,
            post_type
        })

        res.json({ success: true, message: 'Post created successfully' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get Feed Posts
export const getFeedPosts = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)

        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({ user: { $in: userIds } })
            .populate('user', '-email')
            .sort({ createdAt: -1 })
            .limit(20)

        res.json({ success: true, posts })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Like Post
export const likePost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { postId } = req.body

        const post = await Post.findById(postId)
        if (!post) {
            return res.json({ success: false, message: 'Post not found' })
        }

        if (post.likes_count.includes(userId)) {
            post.likes_count = post.likes_count.filter((user) => user !== userId)
            await post.save()
            res.json({ success: true, message: 'Post unliked' })
        } else {
            post.likes_count.push(userId)
            await post.save()
            res.json({ success: true, message: 'Post liked' })
        }
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Delete Post (only the owner can delete)
export const deletePost = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { postId } = req.body

        if (!mongoose.isValidObjectId(postId)) {
            return res.json({ success: false, message: 'Invalid post' })
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.json({ success: false, message: 'Post not found' })
        }

        if (post.user !== userId) {
            return res.json({ success: false, message: 'You can only delete your own posts' })
        }

        // Delete the post first so it disappears for everyone
        await Post.findByIdAndDelete(postId)

        await Comment.deleteMany({ post: postId }) // COMMENTS: remove if you have no comments feature

        // Then remove the images from ImageKit (best effort, never fails the request)
        await deleteImageKitFiles(post.image_file_ids)

        res.json({ success: true, message: 'Post deleted' })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}