import React, { useEffect, useRef, useState } from 'react'
import { ImageIcon, SendHorizonal } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { addMessage, fetchMessages, resetMessages } from '../features/messages/messagesSlice'

const ChatBox = () => {
  const { userId } = useParams() // jar shathe chat hocche
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const currentUser = useSelector((state) => state.user.value)
  const { connections } = useSelector((state) => state.connections)
  const { messages } = useSelector((state) => state.messages)

  const [text, setText] = useState('')
  const [image, setImage] = useState(null)
  const [chatUser, setChatUser] = useState(null)
  const [sending, setSending] = useState(false)

  const messageEndRef = useRef(null)

  // Chat partner-er info
  useEffect(() => {
    const found = connections?.find((c) => c._id === userId)
    if (found) {
      setChatUser(found)
      return
    }

    const loadUser = async () => {
      try {
        const token = await getToken()
        const { data } = await api.post('/api/user/profiles', { profileId: userId }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (data.success) setChatUser(data.profile)
      } catch (error) {
        toast.error(error.message)
      }
    }
    loadUser()
  }, [userId, connections])

  // Purono message ana
  const loadMessages = async () => {
    try {
      const token = await getToken()
      dispatch(fetchMessages({ token, userId }))
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    dispatch(resetMessages())
    loadMessages()

    return () => {
      dispatch(resetMessages())
    }
  }, [userId])

  // Live message: SSE, fail hole 5 second por por refresh
  useEffect(() => {
    if (!currentUser?._id) return

    const source = new EventSource(`${import.meta.env.VITE_BASEURL}/api/message/${currentUser._id}`)
    let pollId

    source.onmessage = (e) => {
      try {
        const message = JSON.parse(e.data)
        const fromId = message.from_user_id?._id || message.from_user_id
        // shudhu ei chat-er message dekhao
        if (fromId === userId) {
          dispatch(addMessage(message))
        }
      } catch {
        // prothom "connected" event JSON na
      }
    }

    source.onerror = () => {
      source.close()
      pollId = setInterval(loadMessages, 5000)
    }

    return () => {
      source.close()
      clearInterval(pollId)
    }
  }, [currentUser?._id, userId])

  // Notun message-e niche scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 4 * 1024 * 1024) {
      toast.error('Image size cannot exceed 4 MB')
      e.target.value = ''
      return
    }

    setImage(file)
    e.target.value = ''
  }

  const sendMessage = async () => {
    if (sending) return
    if (!text.trim() && !image) return

    try {
      setSending(true)
      const token = await getToken()

      const formData = new FormData()
      formData.append('to_user_id', userId)
      formData.append('text', text)
      if (image) formData.append('image', image)

      const { data } = await api.post('/api/message/send', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setText('')
        setImage(null)
        dispatch(addMessage(data.message))
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSending(false)
    }
  }

  if (!chatUser) {
    return <div className='p-6 text-slate-500'>Loading chat...</div>
  }

  return (
    <div className='flex flex-col h-screen'>
      {/* Header */}
      <div className='flex items-center gap-2 p-2 md:px-10 xl:pl-42 bg-linear-to-r from-indigo-50 to-purple-50 border-b border-gray-300'>
        <img src={chatUser.profile_picture} alt="" className='size-8 rounded-full object-cover' />
        <div>
          <p className='font-medium'>{chatUser.full_name}</p>
          <p className='text-sm text-gray-500 -mt-1.5'>@{chatUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className='p-5 md:px-10 h-full overflow-y-scroll'>
        <div className='space-y-4 max-w-4xl mx-auto'>
          {messages.map((message, index) => {
            const fromId = message.from_user_id?._id || message.from_user_id
            const isMine = fromId === currentUser?._id

            return (
              <div key={message._id || index} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div className={`p-2 text-sm max-w-sm rounded-lg shadow ${isMine ? 'bg-indigo-500 text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none'}`}>
                  {message.message_type === 'image' && (
                    <img src={message.media_url} className='w-full max-w-sm rounded-lg mb-1' alt="" />
                  )}
                  {message.text && <p>{message.text}</p>}
                </div>
              </div>
            )
          })}
          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className='px-4'>
        <div className='flex items-center gap-3 pl-5 p-1.5 bg-white w-full max-w-xl mx-auto border border-gray-200 shadow rounded-full mb-5'>
          <input
            type="text"
            className='flex-1 outline-none text-slate-700'
            placeholder='Type a message...'
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            onChange={(e) => setText(e.target.value)}
            value={text}
          />

          <label htmlFor="image">
            {image
              ? <img src={URL.createObjectURL(image)} alt="" className='h-8 rounded' />
              : <ImageIcon className='size-7 text-gray-400 cursor-pointer' />
            }
            <input type="file" id='image' accept='image/*' hidden onChange={handleImageChange} />
          </label>

          <button
            onClick={sendMessage}
            disabled={sending}
            className='bg-linear-to-br from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 cursor-pointer text-white p-2 rounded-full disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <SendHorizonal size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatBox