import fs from 'fs'
import imagekit from '../configs/imagekit.js'
import Message from '../src/models/Message.js'

// Stores SSE connections, one per user
const connections = {}

// Controller function for the SSE endpoint
export const sseController = (req, res) => {
    const { userId } = req.params
    console.log('New client connected', userId)

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.flushHeaders()

    // Add the client's response object to connections
    connections[userId] = res

    // Send an initial event to the client
    res.write('data: connected to SSE stream\n\n')

    // Handle client disconnect
    req.on('close', () => {
        delete connections[userId]
        console.log('Client disconnected')
    })
}

// Send Message
export const sendMessage = async (req, res) => {
    try {
        const { userId } = req.auth()
        const { to_user_id, text } = req.body
        const image = req.file

        let media_url = ''
        const message_type = image ? 'image' : 'text'

        if (message_type === 'image') {
            const response = await imagekit.files.upload({
                file: fs.createReadStream(image.path),
                fileName: image.originalname,
            })
            media_url = imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [
                    { quality: 'auto' },
                    { format: 'webp' },
                    { width: 1280 }
                ],
            })
        }

        const message = await Message.create({
            from_user_id: userId,
            to_user_id,
            text,
            message_type,
            media_url
        })

        // Send message to to_user_id using SSE
        const messageWithUserData = await Message.findById(message._id).populate('from_user_id')

        if (connections[to_user_id]) {
            connections[to_user_id].write(`data: ${JSON.stringify(messageWithUserData)}\n\n`)
        }

        res.json({ success: true, message: messageWithUserData })

    } catch (error) {
        console.log(error)
        res.json({ success: false, message: error.message })
    }
}