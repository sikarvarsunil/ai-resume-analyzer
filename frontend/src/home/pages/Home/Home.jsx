import { useState } from 'react'
import FileField from '../../../components/FileField/FileField.jsx'
import FormField from '../../../components/FormField/FormField.jsx'
import SubmitButton from '../../../components/SubmitButton/SubmitButton.jsx'
import useApi from '../../../hooks/useApi.js'
import useAuth from '../../../auth/hooks/useAuth.js'
import InterviewReport from '../../components/InterviewReport/InterviewReport.jsx'
import { generateInterviewReport } from '../../services/interview.api.js'
import './Home.scss'

const MAX_RESUME_SIZE_MB = 3

function validateResume(file) {
    if (!file || file.size === 0) return "Please upload your resume"
    if (file.type !== "application/pdf") return "Resume must be a PDF file"
    if (file.size > MAX_RESUME_SIZE_MB * 1024 * 1024) return `Resume must be smaller than ${MAX_RESUME_SIZE_MB} MB`
    return null
}

const Home = () => {
    const { user, logout } = useAuth()
    const interview = useApi(generateInterviewReport)
    const logoutRequest = useApi(logout)
    const [resumeError, setResumeError] = useState(null)

    const handleResumeChange = (file) => {
        setResumeError(file ? validateResume(file) : null)
    }

    const handleSubmit = (event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        const resume = formData.get("resume")

        const validationError = validateResume(resume)
        setResumeError(validationError)
        if (validationError) return

        interview.execute({
            selfDescription: formData.get("selfDescription").trim(),
            jobDescription: formData.get("jobDescription").trim(),
            resume
        })
    }

    return (
        <div className="home">
            <title>Analyze Resume & Generate Interview Plan</title>

            <header className="home__topbar">
                <span className="home__brand">Analyze Resume & Generate Interview Plan </span>
                <div className="home__account">
                    <span className="home__greeting">Hi, <strong>{user.username}</strong></span>
                    <button
                        type="button"
                        className="button button--ghost"
                        onClick={() => logoutRequest.execute()}
                        disabled={logoutRequest.isLoading}
                    >
                        {logoutRequest.isLoading ? "Logging out..." : "Log out"}
                    </button>
                </div>
            </header>

            <main className="home__content">
                <section className="home__intro">
                    <h1>Tailor your resume to the job</h1>
                    <p>Share a bit about yourself, upload your resume and paste the job description you&apos;re targeting.</p>
                </section>

                <form onSubmit={handleSubmit} className="home__form">
                    <div className="home__grid">
                        <FormField
                            as="textarea"
                            label="Job description"
                            name="jobDescription"
                            placeholder="Paste the full job description here..."
                            rows={14}
                            required
                        />

                        <div className="home__column">
                            <FileField
                                label="Resume (PDF)"
                                name="resume"
                                accept="application/pdf"
                                hint={`PDF only, up to ${MAX_RESUME_SIZE_MB} MB`}
                                error={resumeError}
                                onFileChange={handleResumeChange}
                                required
                            />
                            <FormField
                                as="textarea"
                                label="Self description"
                                name="selfDescription"
                                placeholder="Briefly describe your experience, key skills and the role you're aiming for..."
                                rows={6}
                                required
                            />
                        </div>
                    </div>

                    {interview.error && <p className="alert alert--error" role="alert">{interview.error}</p>}

                    <div className="home__actions">
                        <SubmitButton isLoading={interview.isLoading} loadingText="Generating report...">
                            Generate interview report
                        </SubmitButton>
                    </div>
                </form>

                {interview.data?.report && <InterviewReport report={interview.data.report} />}
            </main>
        </div>
    )
}

export default Home
