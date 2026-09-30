import { Link } from 'react-router'
import FormField from '../../../components/FormField/FormField.jsx'
import SubmitButton from '../../../components/SubmitButton/SubmitButton.jsx'
import useApi from '../../../hooks/useApi.js'
import useAuth from '../../hooks/useAuth.js'
import '../../auth.form.scss'

const Login = () => {
    const { login } = useAuth()
    const { execute, isLoading, error } = useApi(login)

    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        execute({
            email: formData.get("email").trim(),
            password: formData.get("password")
        })
    }

    return (
        <main className="auth">
            <title>Log in | ATS Resume</title>
            <section className="auth__card">
                <header className="auth__header">
                    <h1>Welcome back</h1>
                    <p>Log in to continue optimizing your resume.</p>
                </header>

                <form onSubmit={handleSubmit} className="auth__form">
                    <FormField
                        label="Email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        required
                    />
                    <FormField
                        label="Password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Your password"
                        required
                    />

                    {error && <p className="alert alert--error" role="alert">{error}</p>}

                    <SubmitButton isLoading={isLoading} loadingText="Logging in...">Log in</SubmitButton>
                </form>

                <p className="auth__switch">
                    Don&apos;t have an account? <Link to="/register">Create one</Link>
                </p>
            </section>
        </main>
    )
}

export default Login
