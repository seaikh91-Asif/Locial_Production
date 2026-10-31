import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const ThemeToggle = ({ variant = 'switch', className = '' }) => {
    const { isDark, toggleTheme } = useTheme()

    if (variant === 'icon') {
        return (
            <button
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Light mode' : 'Dark mode'}
                className={`p-2 rounded-full text-gray-500 hover:bg-slate-100 hover:text-gray-800 transition cursor-pointer ${className}`}
            >
                {isDark ? <Sun className='w-5 h-5' /> : <Moon className='w-5 h-5' />}
            </button>
        )
    }

    return (
        <button
            onClick={toggleTheme}
            role='switch'
            aria-checked={isDark}
            aria-label='Toggle dark mode'
            className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border border-gray-200 hover:bg-slate-100 transition cursor-pointer ${className}`}
        >
            <span className='flex items-center gap-2 text-sm font-medium text-gray-700'>
                {isDark ? <Moon className='w-4 h-4' /> : <Sun className='w-4 h-4' />}
                {isDark ? 'Dark mode' : 'Light mode'}
            </span>

            <span className={`relative w-10 h-6 rounded-full transition-colors ${isDark ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                <span
                    className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-[#ffffff] shadow transition-transform duration-200 ${isDark ? 'translate-x-4' : 'translate-x-0'}`}
                />
            </span>
        </button>
    )
}

export default ThemeToggle