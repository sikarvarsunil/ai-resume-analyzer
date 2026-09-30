import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FileField from './FileField.jsx'

describe("FileField", () => {
    it("shows the name of the selected file", async () => {
        const onFileChange = vi.fn()
        render(<FileField label="Resume" onFileChange={onFileChange} />)
        const file = new File(["%PDF"], "my-resume.pdf", { type: "application/pdf" })

        await userEvent.upload(screen.getByLabelText("Resume"), file)

        expect(screen.getByText("my-resume.pdf")).toBeInTheDocument()
        expect(onFileChange).toHaveBeenCalledWith(file)
    })

    it("shows the error message", () => {
        render(<FileField label="Resume" error="Resume must be a PDF file" />)

        expect(screen.getByText("Resume must be a PDF file")).toBeInTheDocument()
    })
})
