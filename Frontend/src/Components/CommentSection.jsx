import React, { useEffect, useState } from 'react'
import { Send, Trash2 } from 'lucide-react'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios.js'

const CommentSection = ({ postId, postOwnerId, onCountChange }) => {

    const { getToken } = useAuth()
    const currentUser = useSelector((state) => state.user.value)

    const [comments, setComments] = useState([])
    const [text, setText] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)

    const fetchComments = async () => {
        try {
            setLoading(true)
            const token = await getToken()
            const { data } = await api.post('/api/comment/get', { postId }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setComments(data.comments)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [postId])

    const handleAdd = async () => {
        if (sending || !text.trim()) return

        try {
            setSending(true)
            const token = await getToken()
            const { data } = await api.post('/api/comment/add', { postId, content: text.trim() }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setComments((prev) => [data.comment, ...prev])
                setText('')
                onCountChange(data.comments_count)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setSending(false)
        }
    }

    const handleDelete = async (commentId) => {
        try {
            const token = await getToken()
            const { data } = await api.post('/api/comment/delete', { commentId }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                setComments((prev) => prev.filter((c) => c._id !== commentId))
                onCountChange(data.comments_count)
                toast.success(data.message)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    return (
        <div className='pt-3 border-t border-gray-200 space-y-3'>
            {/* Add comment */}
            <div className='flex items-center gap-2'>
                <img src={currentUser?.profile_picture} alt="" className='w-8 h-8 rounded-full object-cover shrink-0' />
                <input
                    type="text"
                    value={text}
                    maxLength={500}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                    placeholder='Write a comment...'
                    className='flex-1 min-w-0 text-sm px-4 py-2 rounded-full border border-gray-300 outline-none focus:border-indigo-400'
                />
                <button
                    onClick={handleAdd}
                    disabled={sending || !text.trim()}
                    className='p-2 rounded-full bg-linear-to-r from-indigo-500 to-purple-600 text-white active:scale-95 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    <Send className='w-4 h-4' />
                </button>
            </div>

            {/* Comments list */}
            {loading && <p className='text-xs text-gray-400'>Loading comments...</p>}

            {!loading && comments.length === 0 && (
                <p className='text-xs text-gray-400'>No comments yet. Be the first to comment.</p>
            )}

            <div className='space-y-3 max-h-72 overflow-y-auto no-scrollbar'>
                {comments.map((comment) => {
                    const canDelete = comment.user?._id === currentUser?._id || postOwnerId === currentUser?._id

                    return (
                        <div key={comment._id} className='flex items-start gap-2'>
                            <img src={comment.user?.profile_picture} alt="" className='w-8 h-8 rounded-full object-cover shrink-0' />
                            <div className='flex-1 min-w-0 bg-gray-100 rounded-2xl px-3 py-2'>
                                <div className='flex items-center justify-between gap-2'>
                                    <p className='text-xs font-semibold text-gray-800 truncate'>
                                        {comment.user?.full_name || 'Unknown User'}
                                        <span className='font-normal text-gray-400 ml-1'>
                                            {moment(comment.createdAt).fromNow()}
                                        </span>
                                    </p>
                                    {canDelete && (
                                        <button onClick={() => handleDelete(comment._id)} title='Delete' className='text-gray-400 hover:text-red-500 cursor-pointer shrink-0'>
                                            <Trash2 className='w-3.5 h-3.5' />
                                        </button>
                                    )}
                                </div>
                                <p className='text-sm text-gray-700 whitespace-pre-line wrap-break-word'>{comment.content}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

export default CommentSection