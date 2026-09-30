import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { AuthContext } from '../context/auth.context.js'
import GuestRoute from './GuestRoute.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'

function renderApp({ path, isAuthenticated = false, isCheckingAuth = false }) {
    render(
        <AuthContext value={{ isAuthenticated, isCheckingAuth }}>
            <MemoryRouter initialEntries={[path]}>
                <Routes>
                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<p>Home page</p>} />
                    </Route>
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<p>Login page</p>} />
                    </Route>
                </Routes>
            </MemoryRouter>
        </AuthContext>
    )
}

describe("ProtectedRoute", () => {
    it("shows a loader while checking the session", () => {
        renderApp({ path: "/", isCheckingAuth: true })

        expect(screen.getByText("Checking your session...")).toBeInTheDocument()
    })

    it("sends signed-out users to the login page", () => {
        renderApp({ path: "/", isAuthenticated: false })

        expect(screen.getByText("Login page")).toBeInTheDocument()
    })

    it("shows the page to signed-in users", () => {
        renderApp({ path: "/", isAuthenticated: true })

        expect(screen.getByText("Home page")).toBeInTheDocument()
    })
})

describe("GuestRoute", () => {
    it("sends signed-in users to the home page", () => {
        renderApp({ path: "/login", isAuthenticated: true })

        expect(screen.getByText("Home page")).toBeInTheDocument()
    })
})
