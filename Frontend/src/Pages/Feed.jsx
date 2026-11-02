import React, { useCallback, useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import { assets } from '../assets/assets'
import Loding from '../Components/Loding'
import StoriesBar from '../Components/StoriesBar'
import PostCard from '../Components/PostCard'
import RecentMessages from '../Components/RecentMessages'
import { useAuth } from '@clerk/react'
import api from '../api/axios'
import toast from 'react-hot-toast'

const Feed = () => {

  const [feeds, setFeeds] = useState([])
  const [loading, setLoading] = useState(true)
  const { getToken } = useAuth()
  const scrollRef = useRef(null)

  const fetchFeeds = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      const { data } = await api.get('/api/post/feed', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (data.success) {
        setFeeds(data.posts)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = useCallback((id) => {
    setFeeds((prev) => prev.filter((p) => p._id !== id))
  }, [])

  useEffect(() => {
    fetchFeeds()
  }, [])

  // Smooth scroll (Lenis). Loading shesh hole container toiri hoy, tai tokhon start hoy
  useEffect(() => {
    const el = scrollRef.current
    if (loading || !el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      wrapper: el,
      content: el.firstElementChild,
      duration: 1.1,
      smoothWheel: true,
    })

    let frameId
    const raf = (time) => {
      lenis.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frameId)
      lenis.destroy()
    }
  }, [loading])

  return !loading ? (
    <div ref={scrollRef} className='h-full overflow-y-auto overflow-x-hidden no-scrollbar overscroll-contain'>
      <div className='py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
        {/* Stories and post list */}
        <div className='w-full max-w-2xl min-w-0'>
          <StoriesBar />
          <div className='p-4 space-y-6'>
            {feeds.map((post) => (
              <PostCard key={post._id} post={post} onDelete={handleDelete} />
            ))}
          </div>
        </div>

        {/* Right side bar */}
        <div className='max-xl:hidden sticky top-0 shrink-0'>
          <div className='max-w-xs bg-white text-xs p-4 rounded-md inline-flex flex-col gap-2 shadow'>
            <h3 className='text-slate-800 font-semibold'>Sponsored</h3>
            <img src={assets.sponsored_img} className='w-75 h-50 rounded-md' alt="" />
            <p className='text-slate-600'>Email Marketing</p>
            <p className='text-slate-400'>Supercharge your marketing with a powerful, easy-to-use platform built for results.</p>
          </div>
          <RecentMessages />
        </div>
      </div>
    </div>
  ) : <Loding />
}

export default Feed