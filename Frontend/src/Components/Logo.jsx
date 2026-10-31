import React from 'react'
import logoLight from '../assets/logo.svg'
import logoDark from '../assets/logo-dark.svg'
import { useTheme } from '../context/ThemeContext'

const Logo = ({ className = 'w-36', onClick }) => {
    const { isDark } = useTheme()

    return (
        <img
            src={isDark ? logoDark : logoLight}
            alt="Locial"
            onClick={onClick}
            className={className}
        />
    )
}

export default Logo