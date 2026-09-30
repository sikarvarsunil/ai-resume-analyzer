import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { AuthContext } from '../auth/context/auth.context.js'

// Renders a page as if the user is signed in, without calling the real API.
export function renderWithAuth(page, auth = {}) {
    return render(
        <AuthContext value={auth}>
            <MemoryRouter>{page}</MemoryRouter>
        </AuthContext>
    )
}
