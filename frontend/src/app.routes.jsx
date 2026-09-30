import { createBrowserRouter, Navigate } from 'react-router'
import GuestRoute from './auth/components/GuestRoute.jsx'
import ProtectedRoute from './auth/components/ProtectedRoute.jsx'
import Login from './auth/pages/Login/Login.jsx'
import Register from './auth/pages/Register/Register.jsx'
import Home from './home/pages/Home/Home.jsx'

export const router = createBrowserRouter([
    {
        element: <ProtectedRoute />,
        children: [
            { path: "/", element: <Home /> }
        ]
    },
    {
        element: <GuestRoute />,
        children: [
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> }
        ]
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
])
