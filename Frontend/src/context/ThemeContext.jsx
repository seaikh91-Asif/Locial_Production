import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

// Default shobshomoy light. Shudhu user dark choose korle dark thakbe.
const getInitialTheme = () => {
    try {
        return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
    } catch {
        return 'light'
    }
}

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme)

    // <html> e "dark" class boshao ba soriye dao
    useEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark')
    }, [theme])

    const toggleTheme = () => {
        setTheme((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark'
            try {
                localStorage.setItem('theme', next)
            } catch {
                // ignore
            }
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeContext)
    if (!context) {
        throw new Error('useTheme must be used inside ThemeProvider')
    }
    return context
}