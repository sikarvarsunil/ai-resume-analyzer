import { Navigate, Outlet, useLocation } from 'react-router'
import Loader from '../../components/Loader/Loader.jsx'
import useAuth from '../hooks/useAuth.js'

const ProtectedRoute = () => {
    const { isAuthenticated, isCheckingAuth } = useAuth()
    const location = useLocation()

    if (isCheckingAuth) return <Loader label="Checking your session..." />

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />
    }

    return <Outlet />
}

export default ProtectedRoute
