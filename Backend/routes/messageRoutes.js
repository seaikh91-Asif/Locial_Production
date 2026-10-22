import express from 'express'
import { getChatMessage, getUserRecentMessage, sendMessage, sseController } from '../controllers/messageController.js'
import { upload } from '../configs/multer.js'
import { protect } from '../middlewares/auth.js'

const messageRouter = express.Router()

messageRouter.get('/recent', protect, getUserRecentMessage)
messageRouter.get('/:userId', sseController)
messageRouter.post('/send', protect, upload.single('image'), sendMessage)
messageRouter.post('/get', protect, getChatMessage)

export default messageRouter