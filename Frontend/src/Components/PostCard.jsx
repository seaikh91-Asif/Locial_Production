import React, { useEffect, useRef, useState } from 'react'
import { BadgeCheck, Dot, Heart, MessageCircle, MoreHorizontal, Share2, Trash2 } from 'lucide-react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios.js'
import CommentSection from './CommentSection.jsx'

const PostCard = ({ post, onDelete }) => {

    const [likes, setLikes] = useState(post?.likes_count || [])
    const [commentsCount, setCommentsCount] = useState(post?.comments_count || 0)
    const [showComments, setShowComments] = useState(false)

    const [menuOpen, setMenuOpen] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleted, setDeleted] = useState(false)

    const menuRef = useRef(null)

    const currentUser = useSelector((state) => state.user?.value)
    const { getToken } = useAuth()
    const navigate = useNavigate()

    const isLiked = currentUser?._id && likes.includes(currentUser._id)
    const isOwner = currentUser?._id && post?.user?._id === currentUser._id

    // Menu-r baire click korle menu bondho hobe
    useEffect(() => {
        if (!menuOpen) return

        const handleOutsideClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false)
            }
        }

        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [menuOpen])

    // Esc chaple confirm popup bondho hobe
    useEffect(() => {
        if (!confirming) return

        const handleEsc = (e) => {
            if (e.key === 'Escape' && !deleting) setConfirming(false)
        }

        document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [confirming, deleting])

    // Hashtag-ke React element hishebe render kori, tai HTML inject hoy na
    const renderContent = (text) =>
        text.split(/(#\w+)/g).map((part, i) =>
            /^#\w+$/.test(part)
                ? <span key={i} className='text-indigo-600'>{part}</span>
                : part
        )

    const handleLike = async () => {
        if (!currentUser?._id) return

        try {
            const token = await getToken()
            const { data } = await api.post('/api/post/like', { postId: post._id }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success(data.message)
                setLikes((prev) =>
                    prev.includes(currentUser._id)
                        ? prev.filter((id) => id !== currentUser._id)
                        : [...prev, currentUser._id]
                )
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const handleDelete = async () => {
        if (deleting) return

        try {
            setDeleting(true)
            const token = await getToken()
            const { data } = await api.post('/api/post/delete', { postId: post._id }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success(data.message)
                setDeleted(true)
                onDelete?.(post._id)
            } else {
                toast.error(data.message)
                setConfirming(false)
            }
        } catch (error) {
            toast.error(error.message)
            setConfirming(false)
        } finally {
            setDeleting(false)
        }
    }

    // shob hook ei line-er upore
    if (deleted) return null

    return (
        <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
            {/* User Info + three dots menu */}
            <div className='flex items-start justify-between gap-2'>
                <div onClick={() => post?.user?._id && navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
                    <img src={post?.user?.profile_picture} alt="" className='w-10 h-10 rounded-full object-cover shadow' />
                    <div>
                        <div className='flex items-center space-x-1'>
                            <span>{post?.user?.full_name || 'Unknown User'}</span>
                            <BadgeCheck className='w-4 h-4 text-blue-500' />
                        </div>
                        <div className='flex items-center text-gray-500 text-sm'>
                            @{post?.user?.username || 'unknown'} <Dot className='w-4 h-4' /> {post?.createdAt ? moment(post.createdAt).fromNow() : ''}
                        </div>
                    </div>
                </div>

                {/* Shudhu nijer post-e three dots dekhabe */}
                {isOwner && (
                    <div className='relative' ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            title='More options'
                            className='p-2 rounded-full text-gray-500 hover:bg-gray-100 transition cursor-pointer'
                        >
                            <MoreHorizontal className='w-5 h-5' />
                        </button>

                        {menuOpen && (
                            <div className='absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden'>
                                <button
                                    onClick={() => {
                                        setMenuOpen(false)
                                        setConfirming(true)
                                    }}
                                    className='w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer'
                                >
                                    <Trash2 className='w-4 h-4' />
                                    Delete post
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Content */}
            {post?.content && (
                <div className='text-gray-800 text-sm whitespace-pre-line'>
                    {renderContent(post.content)}
                </div>
            )}

            {/* Images */}
            {post?.image_urls?.length > 0 && (
                <div className='grid grid-cols-2 gap-2'>
                    {post.image_urls.map((img, index) => (
                        <img
                            src={img}
                            key={index}
                            className={`w-full object-cover rounded-lg ${post.image_urls.length === 1 ? 'col-span-2 h-auto' : 'h-48'}`}
                            alt=""
                        />
                    ))}
                </div>
            )}

            {/* Action buttons */}
            <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
                <div className='flex items-center gap-1'>
                    <Heart
                        className={`w-4 h-4 cursor-pointer ${isLiked ? 'text-red-500 fill-red-500' : ''}`}
                        onClick={handleLike}
                    />
                    <span>{likes.length}</span>
                </div>

                <button
                    onClick={() => setShowComments((prev) => !prev)}
                    className={`flex items-center gap-1 cursor-pointer ${showComments ? 'text-indigo-600' : ''}`}
                >
                    <MessageCircle className='w-4 h-4' />
                    <span>{commentsCount}</span>
                </button>

                <div className='flex items-center gap-1'>
                    <Share2 className='w-4 h-4' />
                    <span>{post?.shares || 0}</span>
                </div>
            </div>

            {/* Comments */}
            {showComments && (
                <CommentSection
                    postId={post._id}
                    postOwnerId={post?.user?._id}
                    onCountChange={setCommentsCount}
                />
            )}

            {/* Delete confirmation popup */}
            {confirming && (
                <div
                    className='fixed inset-0 z-120 flex items-center justify-center bg-black/50 p-4'
                    onClick={() => !deleting && setConfirming(false)}
                >
                    <div
                        className='bg-white rounded-xl shadow-xl w-full max-w-sm p-6'
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className='flex items-center justify-center size-12 rounded-full bg-red-100 mx-auto mb-4'>
                            <Trash2 className='w-6 h-6 text-red-600' />
                        </div>
                        <h3 className='text-lg font-semibold text-gray-900 text-center'>Delete this post permanently?</h3>
                        <p className='text-sm text-gray-500 text-center mt-1'>
                            This will remove the post, its images and comments. You cannot undo this.
                        </p>

                        <div className='flex gap-3 mt-6'>
                            <button
                                onClick={() => setConfirming(false)}
                                disabled={deleting}
                                className='flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition cursor-pointer disabled:opacity-60'
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className='flex-1 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 active:scale-95 transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostCard