import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithAuth } from '../../../test/renderWithAuth.jsx'
import Home from './Home.jsx'

const user = { username: "sam" }

describe("Home", () => {
    it("greets the signed-in user", () => {
        renderWithAuth(<Home />, { user })

        expect(screen.getByText("sam")).toBeInTheDocument()
    })

    it("rejects a resume that is not a PDF", async () => {
        renderWithAuth(<Home />, { user })
        const wordFile = new File(["hello"], "resume.docx", { type: "application/msword" })

        await userEvent.upload(screen.getByLabelText("Resume (PDF)"), wordFile, { applyAccept: false })

        expect(screen.getByText("Resume must be a PDF file")).toBeInTheDocument()
    })

    it("rejects a resume larger than 3 MB", async () => {
        renderWithAuth(<Home />, { user })
        const bigFile = new File(["x".repeat(4 * 1024 * 1024)], "resume.pdf", { type: "application/pdf" })

        await userEvent.upload(screen.getByLabelText("Resume (PDF)"), bigFile)

        expect(screen.getByText("Resume must be smaller than 3 MB")).toBeInTheDocument()
    })

    it("logs out when the button is clicked", async () => {
        const logout = vi.fn()
        renderWithAuth(<Home />, { user, logout })

        await userEvent.click(screen.getByRole("button", { name: "Log out" }))

        expect(logout).toHaveBeenCalled()
    })
})
