import { use } from 'react'
import { AuthContext } from '../context/auth.context.js'

export default function useAuth() {
    const context = use(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used inside an AuthProvider")
    }
    return context
}
