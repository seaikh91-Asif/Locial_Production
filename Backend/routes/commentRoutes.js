import express from 'express'
import { addComment, deleteComment, getComments } from '../controllers/commentController.js'
import { protect } from '../middlewares/auth.js'

const commentRouter = express.Router()

commentRouter.post('/add', protect, addComment)
commentRouter.post('/get', protect, getComments)
commentRouter.post('/delete', protect, deleteComment)

export default commentRouter