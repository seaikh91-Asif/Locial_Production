import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import Loding from '../Components/Loding'
import UserProfileInfo from '../Components/UserProfileInfo'

const Profile = () => {
  const { profileId } = useParams()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [activeTab, setActiveTab] = useState('post')
  const [showEdit, setShowEdit] = useState(false)

  const fetchUser = async () => {
  setUser(dummyUserData)
  setPosts(dummyPostsData)
}

  useEffect(() => {
    fetchUser()
  },[])

  return user ? (
    <div className='relative h-full overflow-y-scroll bg-gray-50 p-6'>
      <div className=' max-w-3xl mx-auto'>
        {/* Profile Card */}
        <div className='bg-white rounded-2xl shadow overflow-hidden '>
          {/* Cover Image */}
          <div className='h-40 md:h-56 bg-linear-to-r from-indigo-200 via-purple-200 to-pink-200'>
            {user.cover_photo && <img src = {user.cover_photo} alt='' className=' w-full h-full object-cover'/> }
          </div>

          {/* User Info */}
          <UserProfileInfo user={user} posts={posts} profileId={profileId} setShowEdit={setShowEdit} />
        </div>
      </div>
    </div>
  ) : (<Loding/>)
}

export default Profile