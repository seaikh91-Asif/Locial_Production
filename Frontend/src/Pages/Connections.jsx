import React, { useEffect, useState } from 'react'
import { Users, UserPlus, UserCheck, UserRoundPenIcon, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/react'
import { fetchConnections } from '../features/connections/connectionSlice'
import { fetchUser } from '../features/user/userSlice'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Connections = () => {
  const [currentTab, setCurrentTab] = useState('Followers')
  const navigate = useNavigate()
  const { getToken } = useAuth()
  const dispatch = useDispatch()

  const { connections, pendingConnections, followers, following } = useSelector((state) => state.connections)

  const dataArray = [
    { label: 'Followers', value: followers, icon: Users },
    { label: 'Following', value: following, icon: UserCheck },
    { label: 'Pending', value: pendingConnections, icon: UserRoundPenIcon },
    { label: 'Connections', value: connections, icon: UserPlus },
  ]

  const handleUnfollow = async (userId) => {
    try {
      const token = await getToken()
      const { data } = await api.post('/api/user/unfollow', { id: userId }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (data.success) {
        toast.success(data.message)
        dispatch(fetchConnections(token))
        dispatch(fetchUser(token))
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
        dispatch(fetchConnections(token))
        dispatch(fetchUser(token))
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
  }, [dispatch, getToken])

  const currentList = dataArray.find((item) => item.label === currentTab)?.value || []

  return (
    <div className='min-h-screen bg-slate-50 w-full max-w-[100vw] overflow-x-hidden flex flex-col'>
      <div className='max-w-6xl mx-auto w-full p-4 sm:p-6 flex-1 min-w-0'>
        
        <div className='mb-6'>
          <h1 className='text-2xl sm:text-3xl font-bold text-slate-900 mb-1'>Connections</h1>
          <p className='text-sm text-slate-500'>Manage your network and discover new connections</p>
        </div>

        <div className='mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3'>
          {dataArray.map((item, index) => (
            <div key={index} className='flex flex-col items-center justify-center p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-slate-100'>
              <b className='text-xl text-slate-800'>{item.value?.length || 0}</b>
              <p className='text-slate-500 text-xs font-medium mt-1'>{item.label}</p>
            </div>
          ))}
        </div>

        <div className='w-full mb-6 max-w-[100vw] sm:max-w-full -mx-4 sm:mx-0 px-4 sm:px-0'>
          <div className='flex overflow-x-auto no-scrollbar items-center gap-2 pb-2'>
            {dataArray.map((tab) => (
              <button
                onClick={() => setCurrentTab(tab.label)}
                key={tab.label}
                className={` cursor-pointer shrink-0 flex items-center px-4 py-2.5 text-sm rounded-full transition-all ${
                  currentTab === tab.label 
                  ? 'bg-slate-800 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <tab.icon className='w-4 h-4' />
                <span className='ml-2 font-medium'>{tab.label}</span>
                <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                  currentTab === tab.label ? 'bg-slate-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.value?.length || 0}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {currentList.map((user) => (
            <div key={user._id} className='flex flex-col p-4 bg-white shadow-sm border border-slate-100 rounded-2xl w-full min-w-0'>
              
              <div className='flex items-center gap-3 mb-3'>
                <img src={user.profile_picture} alt="" className='rounded-full w-12 h-12 sm:w-14 sm:h-14 object-cover border border-slate-100 shrink-0' />
                <div className='flex-1 min-w-0'>
                  <p className='font-semibold text-slate-800 text-base truncate'>{user.full_name}</p>
                  <p className='text-slate-500 text-xs sm:text-sm truncate'>@{user.username}</p>
                </div>
              </div>
              
              {user.bio && (
                <p className='text-sm text-slate-600 mb-4 line-clamp-2 w-full'>
                  {user.bio}
                </p>
              )}
              
              <div className='flex gap-2 w-full mt-auto pt-2'>
                <button 
                  onClick={() => navigate(`/profile/${user._id}`)} 
                  className='flex-1 py-2 px-2 text-sm font-medium rounded-xl bg-linear-to-r from-indigo-500 to-purple-600 hover:opacity-90 active:scale-95 transition-all text-white text-center truncate'>
                  Profile
                </button>

                {currentTab === 'Following' && (
                  <button 
                    onClick={() => handleUnfollow(user._id)} 
                    className='flex-1 py-2 px-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all text-center truncate'>
                    Unfollow
                  </button>
                )}

                {currentTab === 'Pending' && (
                  <button 
                    onClick={() => acceptConnection(user._id)} 
                    className='flex-1 py-2 px-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all text-center truncate'>
                    Accept
                  </button>
                )}

                {currentTab === 'Connections' && (
                  <button 
                    onClick={() => navigate(`/messages/${user._id}`)} 
                    className='  flex-1 py-2 px-2 text-sm font-medium rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all flex items-center justify-center gap-1.5 truncate'>
                    <MessageSquare className='w-4 h-4 shrink-0' />
                    Message
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {currentList.length === 0 && (
            <div className='col-span-full py-10 text-center text-slate-500'>
              No {currentTab.toLowerCase()} found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Connections