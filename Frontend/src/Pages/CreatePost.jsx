import React, { useState } from 'react'
import { X, Image } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@clerk/react'
import api from '../api/axios.js'

const CreatePost = () => {

  const [content, setContent] = useState('')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  const user = useSelector((state) => state.user.value)
  const { getToken } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!images.length && !content.trim()) {
      throw new Error('Please add some text or an image')
    }

    setLoading(true)

    try {
      let postType = 'text'
      if (images.length > 0 && content.trim()) postType = 'text_with_image'
      else if (images.length > 0) postType = 'image'

      const formData = new FormData()
      formData.append('content', content)
      formData.append('post_type', postType)
      images.forEach((image) => formData.append('images', image))

      const token = await getToken()
      const { data } = await api.post('/api/post/add', formData, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!data.success) {
        throw new Error(data.message)
      }

      navigate('/')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e) => {
    const selected = Array.from(e.target.files)
    const all = [...images, ...selected]

    if (all.length > 4) {
      toast.error('You can add up to 4 images')
      setImages(all.slice(0, 4))
    } else {
      setImages(all)
    }

    // same file abar select korar jonno
    e.target.value = ''
  }

  if (!user) return null

  return (
    <div className='min-h-screen bg-linear-to-b from-slate-50 to-white'>
      <div className='max-w-6xl mx-auto p-6'>
        {/* Title */}
        <div className='mb-8'>
          <h1 className='text-slate-900 text-3xl font-bold mb-2'>Create Post</h1>
          <p className='text-slate-600'>Share your thoughts with the world</p>
        </div>

        {/* Form */}
        <div className='max-w-xl bg-white p-4 sm:p-8 sm:pb-3 rounded-xl shadow-md space-y-4'>
          {/* Header */}
          <div className='flex items-center gap-3'>
            <img src={user.profile_picture} alt="" className='w-12 h-12 rounded-full object-cover shadow' />
            <div>
              <h2 className='font-semibold'>{user.full_name}</h2>
              <p className='text-sm text-gray-500'>@{user.username}</p>
            </div>
          </div>

          {/* Text area */}
          <textarea
            className='w-full resize-none max-h-20 mt-4 text-sm outline-none placeholder-gray-400'
            placeholder="What's happening?"
            onChange={(e) => setContent(e.target.value)}
            value={content}
          />

          {/* Images */}
          {images.length > 0 &&
            <div className='flex flex-wrap gap-2 mt-4'>
              {images.map((image, i) => (
                <div key={i} className='relative group'>
                  <img src={URL.createObjectURL(image)} className='h-20 rounded-md' alt="" />
                  <div
                    onClick={() => setImages(images.filter((_, index) => index !== i))}
                    className='absolute hidden group-hover:flex justify-center items-center inset-0 bg-black/40 rounded-md cursor-pointer'
                  >
                    <X className='w-6 h-6 text-white' />
                  </div>
                </div>
              ))}
            </div>
          }

          {/* Bottom bar */}
          <div className='flex items-center justify-between pt-3 border-t border-gray-300'>
            <label className='flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer' htmlFor="images">
              <Image className='size-6' />
            </label>
            <input type="file" id='images' accept='image/*' hidden multiple onChange={handleImageChange} />

            <button
              disabled={loading}
              onClick={() => toast.promise(handleSubmit(), {
                loading: 'Uploading...',
                success: 'Post added',
                error: (err) => err.message || 'Post not added'
              })}
              className='text-sm bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-95 transition text-white font-medium px-8 py-2 rounded-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            >
              Publish Post
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatePost