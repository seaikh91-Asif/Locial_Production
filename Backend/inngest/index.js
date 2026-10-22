import { Inngest } from 'inngest'
import User from '../src/models/User.js'
import Connection from '../src/models/Connection.js'
import sendEmail from '../configs/nodeMailer.js'
import Story from '../src/models/Story.js'
import Message from '../src/models/Message.js'

export const inngest = new Inngest({ id: 'locial-app' })

// Save user to database when created in Clerk
const syncUserCreation = inngest.createFunction(
    { id: 'sync-user-from-clerk', triggers: { event: 'clerk/user.created' } },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data

        let username = email_addresses[0].email_address.split('@')[0]

        // Check availability of username
        const user = await User.findOne({ username })
        if (user) {
            username = username + Math.floor(Math.random() * 10000)
        }

        const userData = {
            _id: id,
            email: email_addresses[0].email_address,
            full_name: `${first_name || ''} ${last_name || ''}`.trim(),
            profile_picture: image_url,
            username
        }
        await User.create(userData)
    }
)

// Update user data in database
const syncUserUpdation = inngest.createFunction(
    { id: 'update-user-from-clerk', triggers: { event: 'clerk/user.updated' } },
    async ({ event }) => {
        const { id, first_name, last_name, email_addresses, image_url } = event.data

        const updateUserdata = {
            email: email_addresses[0].email_address,
            full_name: `${first_name || ''} ${last_name || ''}`.trim(),
            profile_picture: image_url
        }
        await User.findByIdAndUpdate(id, updateUserdata)
    }
)

// Delete user from database
const syncUserDeletion = inngest.createFunction(
    { id: 'delete-user-from-clerk', triggers: { event: 'clerk/user.deleted' } },
    async ({ event }) => {
        const { id } = event.data
        await User.findByIdAndDelete(id)
    }
)

// Send reminder when a new connection request is added
const sendNewConnectionRequestReminder = inngest.createFunction(
    { id: 'send-new-connection-request-remainder', triggers: { event: 'app/connection-request-remainder' } },
    async ({ event, step }) => {
        const { connectionId } = event.data

        await step.run('send-connection-request-mail', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')
            if (!connection) return { message: 'Connection not found' }

            const subject = '👋 New Connection Request'
            const body = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${connection.to_user_id.full_name},</h2>
                <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
                <br/>
                <p>Thanks,<br/>Locial - Stay Connected</p>
                </div>`

            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })
        })

        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)
        await step.sleepUntil('wait-for-24-hours', in24Hours)

        await step.run('send-connection-request-remainder', async () => {
            const connection = await Connection.findById(connectionId).populate('from_user_id to_user_id')

            if (!connection || connection.status === 'accepted') {
                return { message: 'Already accepted' }
            }

            const subject = '⏰ Reminder: Pending Connection Request'
            const body = `
                <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2>Hi ${connection.to_user_id.full_name},</h2>
                <p>${connection.from_user_id.full_name} - @${connection.from_user_id.username} is still waiting for you to respond to their connection request.</p>
                <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color: #10b981;">here</a> to accept or reject the request</p>
                <br/>
                <p>Thanks,<br/>Locial - Stay Connected</p>
                </div>`

            await sendEmail({
                to: connection.to_user_id.email,
                subject,
                body
            })

            return { message: 'Reminder sent.' }
        })
    }
)

// Delete story after 24 hours
const deleteStory = inngest.createFunction(
    { id: 'story-delete', triggers: { event: 'app/story.delete' } },
    async ({ event, step }) => {
        const { storyId } = event.data
        const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000)

        await step.sleepUntil('wait-for-24-hours', in24Hours)

        await step.run('delete-story', async () => {
            await Story.findByIdAndDelete(storyId)
            return { message: 'story deleted.' }
        })
    }
)

   // Send daily notification for unseen messages
const sendNotificationOfUnseenMessages = inngest.createFunction(
    { id: 'send-unseen-messages-notification', triggers: { cron: 'TZ=Asia/Kolkata 0 9 * * *' } }, // every day at 9 AM
    async ({ step }) => {
        const unseenCount = await step.run('count-unseen-messages', async () => {
            const messages = await Message.find({ seen: false })
            const counts = {}

            messages.forEach((message) => {
                counts[message.to_user_id] = (counts[message.to_user_id] || 0) + 1
            })

            return counts
        })

        for (const userId in unseenCount) {
            await step.run(`send-email-${userId}`, async () => {
                const user = await User.findById(userId)
                if (!user) return { message: 'User not found' }

                const subject = `📬 You have ${unseenCount[userId]} unseen messages`

                const body = `
                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                        <h2>Hi ${user.full_name},</h2>
                        <p>You have ${unseenCount[userId]} unseen messages</p>
                        <p>Click <a href="${process.env.FRONTEND_URL}/messages" style="color: #10b981;">here</a> to view them</p>
                        <br/>
                        <p>Thanks,<br/>Locial - Stay Connected</p>
                    </div>`

                await sendEmail({
                    to: user.email,
                    subject,
                    body
                })
            })
        }

        return { message: 'Notification sent.' }
    }
)

export const functions = [
    syncUserCreation,
    syncUserUpdation,
    syncUserDeletion,
    sendNewConnectionRequestReminder, 
    deleteStory, 
    sendNotificationOfUnseenMessages
]