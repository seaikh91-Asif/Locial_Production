import React, { useEffect, useState } from 'react'
import {dummyPostsData} from '../assets/assets'
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
      <div>
        <div>
          <h1>Sponsered</h1>
        </div>

        <h1>Recent messages</h1>
      </div>
    </div>
  ) : <Loding/>
}

export default Feed