import React from 'react'
import { Eye, MessageSquare } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const Messages = () => {                        

  const navigate = useNavigate()
  const { connections } = useSelector((state) => state.connections)

  return (
    <div className='min-h-screen relative bg-slate-50'>
      <div className='max-w-6xl mx-auto p-4 sm:p-6'>
        {/* Title */}
        <div className='mb-8 pr-14 sm:pr-0'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Messages</h1>
          <p className='text-slate-600'>Talk to your friends and family</p>
        </div>

        {/* Connected Users */}
        <div className='flex flex-col gap-3'>
          {connections?.map((user) => (
            <div key={user._id} className='max-w-xl flex flex-wrap gap-5 p-6 bg-white shadow rounded-md'>
              <img src={user.profile_picture} alt="" className='rounded-full size-12 object-cover shrink-0' />
              <div className='flex-1 min-w-0'>
                <p className='font-medium text-slate-700'>{user.full_name}</p>
                <p className='text-slate-500'>@{user.username}</p>
                <p className='text-sm text-gray-600 truncate'>{user.bio}</p>
              </div>

              <div className='flex flex-col gap-2'>
                <button
                  onClick={() => navigate(`/messages/${user._id}`)}
                  className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'
                >
                  <MessageSquare className='h-4 w-4' />
                </button>

                <button
                  onClick={() => navigate(`/profile/${user._id}`)}
                  className='size-10 flex items-center justify-center text-sm rounded bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition cursor-pointer'
                >
                  <Eye className='h-4 w-4' />
                </button>
              </div>
            </div>
          ))}

          {connections?.length === 0 && (
            <p className='text-slate-500'>
              No connections yet. Go to Discover and send a connection request to start chatting.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages