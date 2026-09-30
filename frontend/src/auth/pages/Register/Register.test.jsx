import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithAuth } from '../../../test/renderWithAuth.jsx'
import Register from './Register.jsx'

async function fillForm(password, confirmPassword) {
    await userEvent.type(screen.getByLabelText("Username"), "sam")
    await userEvent.type(screen.getByLabelText("Email"), "sam@x.io")
    await userEvent.type(screen.getByLabelText("Password"), password)
    await userEvent.type(screen.getByLabelText("Confirm password"), confirmPassword)
    await userEvent.click(screen.getByRole("button", { name: "Create account" }))
}

describe("Register", () => {
    it("shows an error when the passwords do not match", async () => {
        const register = vi.fn()
        renderWithAuth(<Register />, { register })

        await fillForm("password1", "password2")

        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
        expect(register).not.toHaveBeenCalled()
    })

    it("registers the user when the form is valid", async () => {
        const register = vi.fn()
        renderWithAuth(<Register />, { register })

        await fillForm("password1", "password1")

        expect(register).toHaveBeenCalledWith({ username: "sam", email: "sam@x.io", password: "password1" })
    })

    it("shows the error from the server", async () => {
        const register = vi.fn().mockRejectedValue(new Error("Account already exists"))
        renderWithAuth(<Register />, { register })

        await fillForm("password1", "password1")

        expect(await screen.findByText("Account already exists")).toBeInTheDocument()
    })
})
