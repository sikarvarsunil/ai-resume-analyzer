import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import useAuth from '../hooks/useAuth.js'
import { getCurrentUser, loginUser } from '../services/auth.api.js'
import AuthProvider from './AuthProvider.jsx'

vi.mock('../services/auth.api.js')

function CurrentUser() {
    const { user, isCheckingAuth, login } = useAuth()

    if (isCheckingAuth) return <p>Checking...</p>

    return (
        <>
            <p>{user ? `Signed in as ${user.username}` : "Signed out"}</p>
            <button onClick={() => login({ email: "sam@x.io", password: "password1" })}>Log in</button>
        </>
    )
}

describe("AuthProvider", () => {
    it("restores the session when the app loads", async () => {
        getCurrentUser.mockResolvedValue({ user: { username: "sam" } })

        render(<AuthProvider><CurrentUser /></AuthProvider>)

        expect(await screen.findByText("Signed in as sam")).toBeInTheDocument()
    })

    it("is signed out when there is no session", async () => {
        getCurrentUser.mockRejectedValue(new Error("Token is not provided"))

        render(<AuthProvider><CurrentUser /></AuthProvider>)

        expect(await screen.findByText("Signed out")).toBeInTheDocument()
    })

    it("signs the user in", async () => {
        getCurrentUser.mockRejectedValue(new Error("Token is not provided"))
        loginUser.mockResolvedValue({ user: { username: "sam" } })
        render(<AuthProvider><CurrentUser /></AuthProvider>)
        await screen.findByText("Signed out")

        await userEvent.click(screen.getByRole("button", { name: "Log in" }))

        expect(await screen.findByText("Signed in as sam")).toBeInTheDocument()
    })
})
