import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { dummyPostsData, dummyUserData } from '../assets/assets'
import Loding from '../Components/Loding'
import UserProfileInfo from '../Components/UserProfileInfo'
import PostCard from '../Components/PostCard'
import { Link } from 'lucide-react'
import moment from 'moment'

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

        {/* Tabs */}
        <div className='mt-6'>
          <div className='bg-white rounded-xl shadow p-1 flex max-w-md mx-auto'>
            {["post", "media", "likes"].map((tab) => (
              <button onClick={() => setActiveTab(tab)} key={tab} className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${activeTab === tab ? "bg-indigo-600 text-white" : "text-gray-600 hover:text-gray-900"}`}> 
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )) }
          </div>
          {/* Posts */}
          {activeTab === 'post' && (
          <div className='mt-6 flex flex-col items-center gap-6'>
            {posts.map((post) => <PostCard key={post._id} post={post} />)}
          </div>
          )}

          {/* Media */}
          {activeTab === 'media' && (
            <div className='flex flex-wrap mt-6 max-w-6xl'>
              {posts
                .filter((post) => post.image_urls?.length > 0)
                .map((post) => (
                  <React.Fragment key={post._id}>
                    {post.image_urls.map((img, index) => (
                      <a key={index} href={img} target='_blank' rel='noreferrer' className='relative group'>
                        <img src={img} className='w-64 aspect-video object-cover' alt="" />
                        <p className='absolute bottom-0 right-0 text-xs p-1 px-3 backdrop-blur-xl text-white opacity-0 group-hover:opacity-100 transition duration-300'>
                          Posted {moment(post.createdAt).fromNow()}
                        </p>
                      </a>
                    ))}
                  </React.Fragment>
                ))}
            </div>
          )}  
        </div>
      </div>
    </div>
  ) : (<Loding/>)
}

export default Profile