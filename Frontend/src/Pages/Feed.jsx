import React, { useEffect, useState } from 'react'
import {assets, dummyPostsData} from '../assets/assets'
import Loding from '../Components/Loding'
import StoriesBar from '../Components/StoriesBar'
import PostCard from '../Components/PostCard'

const Feed = () => {

  const [feeds, setfeeds] = useState([])
  const [loding, setLoding] = useState(true)

  const fetcFeeds = async () => {
    setfeeds(dummyPostsData)
    setLoding(false)
  }

  useEffect(() => {
    fetcFeeds()
  }, [])

  return !loding ?  (
    <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
      {/* Stories and post list */}
      <div>
        <StoriesBar/>
        <div className='p-4 space-y-6'> 
          {feeds.map((post) => (
            <PostCard key={post._id} post={post}/>
          ))}
        </div>
      </div>

      {/* Right side bar */}
      <div className='max-xl:hidden sticky top-0'>
        <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
          <h3 className='text-slate-800 font-semibold'>Sponsered</h3>
          <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="" />
          <p className= 'text-slate-600'>Email Marketing</p>
          <p className='text-slate-400' > Supercharge your marketign with a powerful, easy-to-use platform build for resulsts.</p>
        </div>
        <h1>Recent messages</h1>
      </div>
    </div>
  ) : <Loding/>
}

export default Feed