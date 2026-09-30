import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './auth.context.js'
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../services/auth.api.js'
import { setUnauthorizedHandler } from '../../services/api.service.js'

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isCheckingAuth, setIsCheckingAuth] = useState(true)

    useEffect(() => {
        setUnauthorizedHandler(() => setUser(null))
        return () => setUnauthorizedHandler(null)
    }, [])

    useEffect(() => {
        let ignore = false

        getCurrentUser()
            .then((data) => {
                if (!ignore) setUser(data.user)
            })
            .catch(() => {
                if (!ignore) setUser(null)
            })
            .finally(() => {
                if (!ignore) setIsCheckingAuth(false)
            })

        return () => {
            ignore = true
        }
    }, [])

    const login = useCallback(async (credentials) => {
        const data = await loginUser(credentials)
        setUser(data.user)
        return data
    }, [])

    const register = useCallback(async (details) => {
        const data = await registerUser(details)
        setUser(data.user)
        return data
    }, [])

    const logout = useCallback(async () => {
        try {
            await logoutUser()
        } finally {
            setUser(null)
        }
    }, [])

    const value = useMemo(() => ({
        user,
        isAuthenticated: Boolean(user),
        isCheckingAuth,
        login,
        register,
        logout
    }), [user, isCheckingAuth, login, register, logout])

    return <AuthContext value={value}>{children}</AuthContext>
}

export default AuthProvider
