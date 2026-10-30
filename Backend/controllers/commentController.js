import mongoose from 'mongoose'
import Comment from '../src/models/Comment.js'
import Post from '../src/models/Post.js'

// Add a comment
export const addComment = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { postId, content } = req.body
        const text = (content || '').trim()

        if (!mongoose.isValidObjectId(postId)) {
            return res.json({ success: false, message: 'Invalid post' })
        }
        if (!text) {
            return res.json({ success: false, message: 'Comment cannot be empty' })
        }
        if (text.length > 500) {
            return res.json({ success: false, message: 'Comment cannot exceed 500 characters' })
        }

        const post = await Post.findById(postId).select('_id')
        if (!post) {
            return res.json({ success: false, message: 'Post not found' })
        }

        const comment = await Comment.create({ post: postId, user: userId, content: text })

        // Real count diye update, tai count kokhono bhul hoy na
        const comments_count = await Comment.countDocuments({ post: postId })
        await Post.findByIdAndUpdate(postId, { comments_count })

        const fullComment = await Comment.findById(comment._id).populate('user', '-email')

        res.json({ success: true, message: 'Comment added', comment: fullComment, comments_count })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Get comments of a post (newest first)
export const getComments = async (req, res) => {
    try {
        const { postId } = req.body

        if (!mongoose.isValidObjectId(postId)) {
            return res.json({ success: false, message: 'Invalid post' })
        }

        const comments = await Comment.find({ post: postId })
            .populate('user', '-email')
            .sort({ _id: -1 })
            .limit(100)

        res.json({ success: true, comments })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Delete a comment (comment-er malik ba post-er malik pare)
export const deleteComment = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { commentId } = req.body

        if (!mongoose.isValidObjectId(commentId)) {
            return res.json({ success: false, message: 'Invalid comment' })
        }

        const comment = await Comment.findById(commentId)
        if (!comment) {
            return res.json({ success: false, message: 'Comment not found' })
        }

        const post = await Post.findById(comment.post).select('user')
        const isCommentOwner = comment.user === userId
        const isPostOwner = post?.user === userId

        if (!isCommentOwner && !isPostOwner) {
            return res.json({ success: false, message: 'You are not allowed to delete this comment' })
        }

        await Comment.findByIdAndDelete(commentId)

        const comments_count = await Comment.countDocuments({ post: comment.post })
        if (post) {
            await Post.findByIdAndUpdate(comment.post, { comments_count })
        }

        res.json({ success: true, message: 'Comment deleted', comments_count })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}