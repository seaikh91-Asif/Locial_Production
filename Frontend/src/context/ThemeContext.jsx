import React, { createContext, useContext, useLayoutEffect, useState } from 'react'

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
    const [forcedLight, setForcedLight] = useState(false)

    // <html> e "dark" class boshao ba soriye dao (LightOnly page-e shobshomoy soriye dao)
    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', theme === 'dark' && !forcedLight)
    }, [theme, forcedLight])

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
        <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme, setForcedLight }}>
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

// Bhitorer page shobshomoy light thakbe (jemon Login page).
// Logo-o light version dekhabe, karon useTheme() ekhane isDark = false pay.
export const LightOnly = ({ children }) => {
    const { toggleTheme, setForcedLight } = useTheme()

    useLayoutEffect(() => {
        setForcedLight(true)
        return () => setForcedLight(false)
    }, [setForcedLight])

    return (
        <ThemeContext.Provider value={{ theme: 'light', isDark: false, toggleTheme, setForcedLight }}>
            {children}
        </ThemeContext.Provider>
    )
}