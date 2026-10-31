import React, { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Login from './Pages/Login.jsx'
import Feed from './Pages/Feed.jsx'
import Messages from './Pages/Messages.jsx'
import ChatBox from './Pages/ChatBox.jsx'
import Connections from './Pages/Connections.jsx'
import Discover from './Pages/Discover.jsx'
import Profile from './Pages/Profile.jsx'
import CreatePost from './Pages/CreatePost.jsx'
import { useUser, useAuth } from '@clerk/react'
import Layout from './Pages/Layout.jsx'
import toast, { Toaster } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { fetchUser } from './features/user/userSlice.js'
import { fetchConnections } from './features/connections/connectionSlice.js'
import { addMessage } from './features/messages/messagesSlice.js'
import { useTheme } from './context/ThemeContext.jsx'

const App = () => {

  const { isDark } = useTheme()
  const { user } = useUser()
  const { getToken } = useAuth()
  const dispatch = useDispatch()
  const { pathname } = useLocation()
  const pathnameRef = useRef(pathname)

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        const token = await getToken()
        dispatch(fetchUser(token))
        dispatch(fetchConnections(token))
      }
    }

    fetchData()
  }, [user, getToken, dispatch])

  useEffect(() => {
    pathnameRef.current = pathname
  }, [pathname])

  useEffect(() => {
    if (!user) return

    const eventSource = new EventSource(import.meta.env.VITE_BASEURL + '/api/message/' + user.id)

    eventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        const fromId = message.from_user_id?._id || message.from_user_id

        if (pathnameRef.current === '/messages/' + fromId) {
          // oi user-er chat khola ache, message sorasori dekhao
          dispatch(addMessage(message))
        } else {
          // onno page-e thakle notification dao
          const sender = message.from_user_id?.full_name || 'Someone'
          toast(`${sender}: ${message.text || 'sent a photo'}`, { icon: '💬' })
        }
      } catch {
        // prothom "connected" event JSON na, ignore
      }
    }

    return () => {
      eventSource.close()
    }
  }, [user, dispatch])

  return (
    <>
      <Toaster
        toastOptions={isDark ? {
          style: { background: '#151b2e', color: '#f1f5fb', border: '1px solid #263150' },
        } : undefined}
      />
      <Routes>
        <Route path='/' element={!user ? <Login /> : <Layout />}>
          <Route index element={<Feed />} />
          <Route path='messages' element={<Messages />} />
          <Route path='messages/:userId' element={<ChatBox />} />
          <Route path='connections' element={<Connections />} />
          <Route path='discover' element={<Discover />} />
          <Route path='profile' element={<Profile />} />
          <Route path='profile/:profileId' element={<Profile />} />
          <Route path='create-post' element={<CreatePost />} />
        </Route>
      </Routes>
    </>
  )
}

export default App