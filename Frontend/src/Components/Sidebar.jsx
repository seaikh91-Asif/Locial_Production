import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Menuitems from './Menuitems'
import { CirclePlus, LogOut } from 'lucide-react'
import { UserButton, useClerk } from '@clerk/react'
import { useSelector } from 'react-redux'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate()
    const user = useSelector((state) => state.user.value)
    const { signOut } = useClerk()

    return (
        <div className={`w-60 xl:w-72 bg-white border-r border-gray-200 flex flex-col justify-between items-center max-sm:absolute top-0 bottom-0 z-20 ${sidebarOpen ? 'translate-x-0' : 'max-sm:-translate-x-full'} transition-all duration-300 ease-in-out`}>
            <div className='w-full'>
                <Logo
                    onClick={() => {
                        navigate('/')
                        setSidebarOpen(false)
                    }}
                    className='w-36 ml-6 my-3 cursor-pointer'
                />
                <hr className='border-gray-300 mb-8' />

                <Menuitems setSidebarOpen={setSidebarOpen} />

                <Link
                    to={'/create-post'}
                    onClick={() => setSidebarOpen(false)}
                    className='flex items-center justify-center gap-2 py-2.5 mt-6 mx-6 rounded-lg bg-linear-to-r from-indigo-500 to-purple-600 hover:from-indigo-700 hover:to-purple-800 active:scale-95 transition text-white cursor-pointer'
                >
                    <CirclePlus className='w-5 h-5' />
                    Create Post
                </Link>
            </div>

            <div className='w-full'>
                {/* Light / Dark mode switch */}
                <div className='px-4 pb-3'>
                    <ThemeToggle />
                </div>

                {/* User info + logout */}
                <div className='w-full border-t border-gray-200 p-4 px-7 flex items-center justify-between gap-2'>
                    <div className='flex gap-2 items-center cursor-pointer min-w-0'>
                        <UserButton />
                        <div className='min-w-0'>
                            <h1 className='text-sm font-medium truncate'>{user?.full_name || 'Guest User'}</h1>
                            <p className='text-xs text-gray-500 truncate'>@{user?.username || 'guest'}</p>
                        </div>
                    </div>

                    <LogOut
                        onClick={() => signOut()}
                        className='w-4.5 text-gray-400 hover:text-gray-700 transition cursor-pointer shrink-0'
                    />
                </div>
            </div>
        </div>
    )
}

export default Sidebar