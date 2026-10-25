import React, { useState } from 'react'
import { MapPin, MessageCircle, Plus, UserPlus, Check } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { fetchUser } from '../features/user/userSlice'
import { fetchConnections } from '../features/connections/connectionSlice'
import { Navigate } from 'react-router-dom'

const UserCard = ({ user }) => {
    const currentUser = useSelector((state) => state.user.value)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { getToken } = useAuth()
    

    const [followersCount, setFollowersCount] = useState(user.followers?.length || 0)
    const [requestSent, setRequestSent] = useState(false)
    const [busy, setBusy] = useState(false)

    const isFollowing = currentUser?.following?.includes(user._id)
    const isConnected = currentUser?.connections?.includes(user._id)

    const handleFollow = async () => {
        if (busy || isFollowing) return

        try {
            setBusy(true)
            const token = await getToken()
            const { data } = await api.post('/api/user/follow', { id: user._id }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success(data.message)
                setFollowersCount((count) => count + 1)
                dispatch(fetchUser(token))
                dispatch(fetchConnections(token))
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setBusy(false)
        }
    }

    const handleConnectionRequest = async () => {
        // already connected hole message page-e jabe
        if (isConnected) {
            return navigate('/messages/' + user._id)
        }

        if (busy || requestSent) return

        try {
            setBusy(true)
            const token = await getToken()
            const { data } = await api.post('/api/user/connected', { id: user._id }, {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                toast.success(data.message)
                setRequestSent(true)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className='p-4 pt-6 flex flex-col justify-between w-72 shadow border border-gray-200 rounded-md bg-white'>
            <div className='text-center'>
                <img onClick={() => navigate(`/profile/${user._id}`)} className='cursor-pointer rounded-full w-16 h-16 object-cover shadow-md mx-auto' src={user.profile_picture} alt="" />
                <p className='mt-4 font-semibold'>{user.full_name}</p>
                {user.username && <p className='text-gray-500 font-light'>@{user.username}</p>}
                {user.bio && <p className='text-gray-600 mt-2 text-center text-sm px-4'>{user.bio}</p>}
            </div>

            <div className='flex items-center justify-center gap-2 mt-4 text-xs text-gray-600'>
                {user.location && (
                    <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                        <MapPin className='w-4 h-4' /> {user.location}
                    </div>
                )}
                <div className='flex items-center gap-1 border border-gray-300 rounded-full px-3 py-1'>
                    <span>{followersCount}</span> Followers
                </div>
            </div>

            <div className='flex mt-4 gap-2'>
                {/* Follow Button */}
                <button
                    onClick={handleFollow}
                    disabled={isFollowing || busy}
                    className='w-full py-2 rounded-md flex justify-center items-center gap-2 bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
                >
                    <UserPlus className='w-4 h-4' /> {isFollowing ? 'Following' : 'Follow'}
                </button>

                {/* Connection request button / message button */}
                <button
                    onClick={handleConnectionRequest}
                    disabled={busy || requestSent}
                    title={isConnected ? 'Message' : requestSent ? 'Request sent' : 'Send connection request'}
                    className='flex items-center justify-center w-16 border text-slate-500 group rounded-md cursor-pointer active:scale-95 transition disabled:cursor-not-allowed'
                >
                    {isConnected
                        ? <MessageCircle className='h-5 w-5 group-hover:scale-105 transition' />
                        : requestSent
                            ? <Check className='w-5 h-5 text-green-600' />
                            : <Plus className='w-5 h-5 group-hover:scale-105 transition' />
                    }
                </button>
            </div>
        </div>
    )
}

export default UserCard