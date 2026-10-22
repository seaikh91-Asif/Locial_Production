import React, { useState } from 'react'
import { BadgeCheck, Dot, Heart, MessageCircle, Share2 } from 'lucide-react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

const PostCard = ({post}) => {
    // Optional chaining ব্যবহার করা হয়েছে
    const postWithHashtags = post?.content?.replace(/(#\w+)/g, '<span class="text-indigo-600">$1</span>') || ''
    
    // likes_count যদি Array না হয়ে থাকে, তবে API থেকে Array (যেমন post.likes) রিসিভ করা উচিত। আপাতত একটি ডিফল্ট এম্পটি অ্যারে [] দেওয়া হলো।
    const [likes, setLikes] = useState(post?.likes || []) 
    const currentUser = useSelector((state) => state.user?.value)

    const handleLike = async () => {
        // লাইক হ্যান্ডেল করার লজিক
    }

    const navigate = useNavigate()

    return (
        <div className='bg-white rounded-xl shadow p-4 space-y-4 w-full max-w-2xl'>
            {/* User Info */}
            <div onClick={() => post?.user?._id && navigate('/profile/' + post.user._id)} className='inline-flex items-center gap-3 cursor-pointer'>
                <img src={post?.user?.profile_picture || 'default-avatar-url'} alt="" className='w-10 h-10 rounded-full shadow' />
                <div>
                    <div className='flex items-center space-x-1'>
                        <span>{post?.user?.full_name || 'Unknown User'}</span>
                        <BadgeCheck className=' w-4 h-4 text-blue-500'/> 
                    </div>
                    <div className='flex items-center text-gray-500 text-sm'>
                        @{post?.user?.username || 'unknown'} <Dot className='w-4 h-4'/> {post?.createdAt ? moment(post.createdAt).fromNow() : ''}
                    </div>
                </div>
            </div>

            {/* Content */}
            {post?.content && <div className='text-gray-800 text-sm whitespace-pre-line ' dangerouslySetInnerHTML={{__html: postWithHashtags}} /> }

            {/* Images */}
            <div className='grid grid-cols-2 gap-2'>
                {/* অপশনাল চেইনিং (?.) ব্যবহার করে map করা হয়েছে */}
                {post?.image_urls?.map((img, index)=>(
                    <img src={img} key={index} className={`w-full h-48 object-cover rounded-lg ${post.image_urls.length === 1 ? 'col-span-2 h-auto' : ''}`} alt="" />
                ))}
            </div>

            {/* Action buttons */}
            <div className='flex items-center gap-4 text-gray-600 text-sm pt-2 border-t border-gray-300'>
                <div className='flex items-center gap-1'>
                    {/* currentUser null কিনা তা চেক করা হয়েছে */}
                    <Heart 
                        className={`w-4 h-4 cursor-pointer ${currentUser?._id && likes?.includes(currentUser._id) ? 'text-red-500 fill-red-500' : ''}`} 
                        onClick={handleLike}
                    /> 
                    <span>{likes?.length || 0}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <MessageCircle className='w-4 h-4 '/>
                    <span>{post?.comments?.length || 12}</span>
                </div>
                <div className='flex items-center gap-1'>
                    <Share2 className='w-4 h-4 '/>
                    <span>{post?.shares || 7}</span>
                </div>
            </div>
        </div>
    )
}

export default PostCard