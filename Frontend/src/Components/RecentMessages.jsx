import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import moment from 'moment'
import { useAuth } from '@clerk/react'
import api from '../api/axios'

const RecentMessages = () => {

    const [conversations, setConversations] = useState([])
    const { getToken } = useAuth()
    const { pathname } = useLocation()

    const fetchRecentMessages = async () => {
        try {
            const token = await getToken()
            const { data } = await api.get('/api/user/recent-messages', {
                headers: { Authorization: `Bearer ${token}` }
            })

            if (data.success) {
                // backend newest-first pathay. Prottek sender-er shesh message ar unseen count rakho
                const grouped = {}
                data.messages.forEach((message) => {
                    const sender = message.from_user_id
                    if (!sender?._id) return

                    if (!grouped[sender._id]) {
                        grouped[sender._id] = { message, unseen: 0 }
                    }
                    if (!message.seen) grouped[sender._id].unseen += 1
                })
                setConversations(Object.values(grouped))
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    // page khulle, page bodlale, ar 30 second por por refresh
    useEffect(() => {
        fetchRecentMessages()
        const id = setInterval(fetchRecentMessages, 30000)
        return () => clearInterval(id)
    }, [pathname])

    return (
        <div className='bg-white max-w-xs mt-4 p-4 min-h-20 rounded-md shadow text-xs text-slate-800'>
            <h3 className='font-semibold text-slate-800 mb-4'>Recent Messages</h3>
            <div className='flex flex-col max-h-56 overflow-y-scroll no-scrollbar'>
                {conversations.length === 0 && (
                    <p className='text-slate-400'>No messages yet</p>
                )}

                {conversations.map(({ message, unseen }) => (
                    <Link
                        to={`/messages/${message.from_user_id._id}`}
                        key={message.from_user_id._id}
                        className='flex items-start gap-2 py-2 hover:bg-slate-100'
                    >
                        <img src={message.from_user_id.profile_picture} alt="" className='w-8 h-8 rounded-full object-cover shrink-0' />
                        <div className='w-full min-w-0'>
                            <div className='flex justify-between gap-2'>
                                <p className='font-medium truncate'>{message.from_user_id.full_name}</p>
                                <p className='text-[10px] text-slate-400 shrink-0'>{moment(message.createdAt).fromNow()}</p>
                            </div>
                            <div className='flex justify-between gap-2'>
                                <p className='text-gray-500 truncate'>{message.text ? message.text : 'Sent a photo'}</p>
                                {unseen > 0 && (
                                    <p className='bg-indigo-500 text-white min-w-4 h-4 px-1 flex items-center justify-center rounded-full text-[10px] shrink-0'>
                                        {unseen > 9 ? '9+' : unseen}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default RecentMessages