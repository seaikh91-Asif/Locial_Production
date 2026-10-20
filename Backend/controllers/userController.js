import imagekit from "../configs/imagekit.js"
import User from "../src/models/User.js"
import fs from 'fs'

// Get User data using userId
export const getUserData = async (req, res) => {
    try {
        const { userId } = req.auth()
        const user = await User.findById(userId)
        if (!user) {
            return res.json({ success: false, message: "User not found" })
        }
        return res.json({ success: true, user })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Update User data
export const updateUserData = async (req, res) => {
    try {
        const { userId } = req.auth()
        let { username, bio, location, full_name } = req.body

        const tempUser = await User.findById(userId)

        if (!username) username = tempUser.username

        if (tempUser.username !== username) {
            const existing = await User.findOne({ username })
            if (existing) {
                // do not change if already taken
                username = tempUser.username
            }
        }

        const updatedData = { username, bio, location, full_name }

        const profile = req.files?.profile?.[0]
        const cover = req.files?.cover?.[0]

        if (profile) {
            const response = await imagekit.files.upload({
                file: fs.createReadStream(profile.path),
                fileName: profile.originalname,
            })
            updatedData.profile_picture = imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [{ quality: 'auto' }, { format: 'webp' }, { width: 512 }],
            })
        }

        if (cover) {
            const response = await imagekit.files.upload({
                file: fs.createReadStream(cover.path),
                fileName: cover.originalname,
            })
            updatedData.cover_photo = imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [{ quality: 'auto' }, { format: 'webp' }, { width: 1280 }],
            })
        }

        const user = await User.findByIdAndUpdate(userId, updatedData, { new: true })

        res.json({ success: true, user, message: "Profile updated successfully" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Find Users using username, email, location, name
export const discoverUsers = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { input } = req.body

        const allUsers = await User.find({
            $or: [
                { username: new RegExp(input, 'i') },
                { email: new RegExp(input, 'i') },
                { full_name: new RegExp(input, 'i') },
                { location: new RegExp(input, 'i') },
            ]
        })
        const filteredUsers = allUsers.filter(user => user._id !== userId)

        res.json({ success: true, users: filteredUsers })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Follow User
export const followUser = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body

        const user = await User.findById(userId)

        if (user.following.includes(id)) {
            return res.json({ success: false, message: "You are already following this user" })
        }

        user.following.push(id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers.push(userId)
        await toUser.save()

        res.json({ success: true, message: "Now you are following this user" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}

// Unfollow User
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { id } = req.body

        const user = await User.findById(userId)
        user.following = user.following.filter(u => u !== id)
        await user.save()

        const toUser = await User.findById(id)
        toUser.followers = toUser.followers.filter(u => u !== userId)
        await toUser.save()

        res.json({ success: true, message: "You are no longer following this user" })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}