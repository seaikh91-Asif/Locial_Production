import React, { useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { useAuth } from '@clerk/react'
import toast from 'react-hot-toast'
import UserCard from '../Components/UserCard'
import Loding from '../Components/Loding'
import api from '../api/axios'
import { useNavigate } from 'react-router-dom'

const Discover = () => {

  const [input, setInput] = useState('')
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const fetchUsers = async (searchText = '') => {
    try {
      setUsers([])
      setLoading(true)

      const token = await getToken()
      const { data } = await api.post('/api/user/discover', { input: searchText }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setUsers(data.users)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchUsers(input.trim())
    }
  }

  // page khulle shobar list dekhabe
  useEffect(() => {
    fetchUsers('')
  }, [])

  return (
    <div className='min-h-screen bg-linear-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 mb-2'>Discover People</h1>
          <p className='text-slate-600'>Connect with amazing people and grow your network</p>
        </div>

        {/* Search */}
        <div className='mb-8 shadow-md rounded-md border border-slate-200/60 bg-white/80'>
          <div className='p-6'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none' />
              <input
                type="text"
                placeholder='Search people by name, username, bio, or location...'
                className='pl-10 sm:pl-12 py-2 w-full border border-gray-300 rounded-md max-sm:text-sm'
                onChange={(e) => setInput(e.target.value)}
                value={input}
                onKeyUp={handleSearch}
              />
            </div>
          </div>
        </div>

        
        {/* Users */}
        <div className='flex flex-wrap gap-6'>
          {users.map((user) => (
            <div 
              key={user._id} 
              onClick={() => navigate(`/profile/${user._id}`)} 
              className='cursor-pointer hover:opacity-90 transition-opacity'
            >
              <UserCard user={user} />
            </div>
          ))}
        </div>

        {!loading && users.length === 0 && (
          <p className='text-slate-500 text-center mt-10'>No users found</p>
        )}

        {loading && <Loding height='60vh' />}
      </div>
    </div>
  )
}

export default Discover