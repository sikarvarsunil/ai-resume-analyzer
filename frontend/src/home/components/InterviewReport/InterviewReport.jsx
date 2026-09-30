import { useEffect, useRef } from 'react'
import './InterviewReport.scss'

const QuestionList = ({ title, questions }) => {
    if (!questions?.length) return null

    return (
        <section className="report__section">
            <h2>{title}</h2>
            <div className="report__questions">
                {questions.map((item, index) => (
                    <details key={index} className="report__question">
                        <summary>{item.question}</summary>
                        <p><strong>Why they ask:</strong> {item.intention}</p>
                        <p><strong>How to answer:</strong> {item.answer}</p>
                    </details>
                ))}
            </div>
        </section>
    )
}

const SkillGaps = ({ skillGaps }) => {
    if (!skillGaps?.length) return null

    return (
        <section className="report__section">
            <h2>Skill gaps</h2>
            <ul className="report__skills">
                {skillGaps.map((gap) => (
                    <li key={gap.skill} className={`report__skill report__skill--${gap.severity}`}>
                        {gap.skill}
                        <span>{gap.severity}</span>
                    </li>
                ))}
            </ul>
        </section>
    )
}

const PreparationPlan = ({ plan }) => {
    if (!plan?.length) return null

    return (
        <section className="report__section">
            <h2>Preparation plan</h2>
            <ol className="report__plan">
                {plan.map((step) => (
                    <li key={step.day} className="report__plan-item">
                        <span className="report__plan-day">Day {step.day}</span>
                        <div>
                            <p className="report__plan-focus">{step.focus}</p>
                            <p>{step.task}</p>
                        </div>
                    </li>
                ))}
            </ol>
        </section>
    )
}

const InterviewReport = ({ report }) => {
    const reportRef = useRef(null)

    useEffect(() => {
        reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, [report])

    return (
        <article ref={reportRef} className="report">
            <header className="report__header">
                <div>
                    <h2>Your interview report</h2>
                    <p>How well your resume matches this job, and how to prepare.</p>
                </div>
                {report.matchScore != null && (
                    <div className="report__score">
                        <strong>{report.matchScore}%</strong>
                        <span>match</span>
                    </div>
                )}
            </header>

            <SkillGaps skillGaps={report.skillGaps} />
            <QuestionList title="Technical questions" questions={report.technicalQuestions} />
            <QuestionList title="Behavioral questions" questions={report.behavioralQuestions} />
            <PreparationPlan plan={report.preparationPlan} />
        </article>
    )
}

export default InterviewReport
