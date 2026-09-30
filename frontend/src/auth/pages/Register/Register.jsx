import { useState } from 'react'
import { Link } from 'react-router'
import FormField from '../../../components/FormField/FormField.jsx'
import SubmitButton from '../../../components/SubmitButton/SubmitButton.jsx'
import useApi from '../../../hooks/useApi.js'
import useAuth from '../../hooks/useAuth.js'
import '../../auth.form.scss'

const Register = () => {
    const { register } = useAuth()
    const { execute, isLoading, error } = useApi(register)
    const [passwordError, setPasswordError] = useState(null)

    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const password = formData.get("password")

        if (password !== formData.get("confirmPassword")) {
            setPasswordError("Passwords do not match")
            return
        }
        setPasswordError(null)

        execute({
            username: formData.get("username").trim(),
            email: formData.get("email").trim(),
            password
        })
    }

    return (
        <main className="auth">
            <title>Create account | ATS Resume</title>
            <section className="auth__card">
                <header className="auth__header">
                    <h1>Create your account</h1>
                    <p>Start building ATS-friendly resumes in minutes.</p>
                </header>

                <form onSubmit={handleSubmit} className="auth__form">
                    <FormField
                        label="Username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="johndoe"
                        required
                    />
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
                        autoComplete="new-password"
                        placeholder="At least 8 characters"
                        minLength={8}
                        required
                    />
                    <FormField
                        label="Confirm password"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        placeholder="Re-enter your password"
                        minLength={8}
                        error={passwordError}
                        required
                    />

                    {error && <p className="alert alert--error" role="alert">{error}</p>}

                    <SubmitButton isLoading={isLoading} loadingText="Creating account...">Create account</SubmitButton>
                </form>

                <p className="auth__switch">
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </section>
        </main>
    )
}

export default Register
