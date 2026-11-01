import React, { useEffect, useState } from 'react'
import { Users, UserPlus, UserCheck, UserRoundPenIcon, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { fetchConnections } from '../features/connections/connectionSlice'
import { fetchUser } from '../features/user/userSlice'

// Prottek tab-er icon ar rong
const tabsConfig = [
  { label: 'Followers', icon: Users, accent: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-300' },
  { label: 'Following', icon: UserCheck, accent: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-300' },
  { label: 'Pending', icon: UserRoundPenIcon, accent: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300' },
  { label: 'Connections', icon: UserPlus, accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300' },
]

const Connections = () => {

  const [currentTab, setCurrentTab] = useState('Followers')

  const navigate = useNavigate()
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections)

  const lists = {
    Followers: followers,
    Following: following,
    Pending: pendingConnections,
    Connections: connections,
  }

  const dataArray = tabsConfig.map((tab) => ({ ...tab, value: lists[tab.label] || [] }))
  const currentList = lists[currentTab] || []

  const refreshData = async () => {
    const token = await getToken()
    dispatch(fetchConnections(token))
    dispatch(fetchUser(token))
  }

  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken()
      const { data } = await api.post('/api/user/unfollow', { id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success(data.message)
        refreshData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const acceptConnection = async (userId) => {
    try {
      const token = await getToken()
      const { data } = await api.post('/api/user/accept', { id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success(data.message)
        refreshData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    getToken().then((token) => {
      dispatch(fetchConnections(token))
    })
  }, [])

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>

        {/* Title */}
        <div className='mb-8 pr-14 sm:pr-0'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Connections</h1>
          <p className='text-slate-600'>Manage your network and discover new connections</p>
        </div>

        {/* Stat cards (click korle oi tab khole) */}
        <div className='mb-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5'>
          {dataArray.map((item) => (
            <button
              key={item.label}
              onClick={() => setCurrentTab(item.label)}
              className={`flex items-center gap-3 p-4 rounded-xl border bg-white shadow-sm text-left transition hover:shadow-md cursor-pointer ${
                currentTab === item.label ? 'border-indigo-400 ring-2 ring-indigo-500/20' : 'border-slate-200'
              }`}
            >
              <span className={`size-10 rounded-full flex items-center justify-center shrink-0 ${item.accent}`}>
                <item.icon className='w-5 h-5' />
              </span>
              <span>
                <span className='block text-2xl font-bold text-slate-900 leading-none'>{item.value.length}</span>
                <span className='block text-sm text-slate-500 mt-1'>{item.label}</span>
              </span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className='flex gap-2 overflow-x-auto no-scrollbar pb-1'>
          {dataArray.map((tab) => {
            const active = currentTab === tab.label

            return (
              <button
                key={tab.label}
                onClick={() => setCurrentTab(tab.label)}
                className={`shrink-0 whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition cursor-pointer ${
                  active
                    ? 'bg-linear-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                {tab.label}
                <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.value.length}
                </span>
              </button>
            )
          })}
        </div>

        {/* Users list */}
        {currentList.length === 0 ? (
          <div className='mt-16 flex flex-col items-center text-center text-slate-500'>
            <span className='size-14 rounded-full bg-slate-100 flex items-center justify-center mb-3'>
              {React.createElement(tabsConfig.find((t) => t.label === currentTab).icon, { className: 'w-6 h-6' })}
            </span>
            <p>No {currentTab.toLowerCase()} found.</p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3 mt-6'>
            {currentList.map((user) => (
              <div key={user._id} className='flex gap-4 p-4 bg-white border border-slate-200 shadow-sm rounded-xl'>
                <img src={user.profile_picture} alt="" className='rounded-full size-12 object-cover shadow-md shrink-0' />

                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-slate-800 truncate'>{user.full_name}</p>
                  <p className='text-sm text-slate-500 truncate'>@{user.username}</p>
                  {user.bio && <p className='text-sm text-slate-600 mt-1 line-clamp-2'>{user.bio}</p>}

                  <div className='flex max-sm:flex-col gap-2 mt-4'>
                    <button
                      onClick={() => navigate(`/profile/${user._id}`)}
                      className='flex-1 whitespace-nowrap py-2 px-3 text-sm rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white cursor-pointer'
                    >
                      View Profile
                    </button>

                    {currentTab === 'Following' && (
                      <button
                        onClick={() => handleUnfollow(user._id)}
                        className='flex-1 whitespace-nowrap py-2 px-3 text-sm rounded-lg border border-red-200 text-red-600 hover:bg-red-50 active:scale-95 transition cursor-pointer'
                      >
                        Unfollow
                      </button>
                    )}

                    {currentTab === 'Pending' && (
                      <button
                        onClick={() => acceptConnection(user._id)}
                        className='flex-1 whitespace-nowrap py-2 px-3 text-sm rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white active:scale-95 transition cursor-pointer'
                      >
                        Accept
                      </button>
                    )}

                    {currentTab === 'Connections' && (
                      <button
                        onClick={() => navigate(`/messages/${user._id}`)}
                        className='flex-1 whitespace-nowrap py-2 px-3 text-sm rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer flex items-center justify-center gap-1'
                      >
                        <MessageSquare className='w-4 h-4' />
                        Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Connections