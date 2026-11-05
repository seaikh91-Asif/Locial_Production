import { clerkClient } from '@clerk/express'
import User from '../src/models/User.js'

// Database-e user thakle seta dao, na thakle Clerk theke info niye toiri koro
export const getOrCreateUser = async (userId) => {
    const existing = await User.findById(userId)
    if (existing) return existing

    const clerkUser = await clerkClient.users.getUser(userId)

    const email = clerkUser.emailAddresses?.[0]?.emailAddress || `${userId}@no-email.locial`

    let username = clerkUser.username || email.split('@')[0]
    if (await User.findOne({ username })) {
        username = username + Math.floor(Math.random() * 10000)
    }

    const fullName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || username

    try {
        return await User.create({
            _id: userId,
            email,
            full_name: fullName,
            username,
            profile_picture: clerkUser.imageUrl,
        })
    } catch (error) {
        // Inngest ekoi shomoy toiri kore felle duplicate error ashe, tokhon ota-i dao
        if (error.code === 11000) {
            const user = await User.findById(userId)
            if (user) return user
        }
        throw error
    }
}