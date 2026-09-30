import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import InterviewReport from './InterviewReport.jsx'

const report = {
    matchScore: 72,
    skillGaps: [{ skill: "Kubernetes", severity: "high" }],
    technicalQuestions: [{ question: "What is a closure?", intention: "JS basics", answer: "A function with its scope" }],
    behavioralQuestions: [{ question: "Tell me about a conflict", intention: "Teamwork", answer: "Use STAR" }],
    preparationPlan: [{ day: 1, focus: "Kubernetes", task: "Deploy a sample app" }]
}

describe("InterviewReport", () => {
    it("shows the match score", () => {
        render(<InterviewReport report={report} />)

        expect(screen.getByText("72%")).toBeInTheDocument()
    })

    it("shows the skill gaps, questions and preparation plan", () => {
        render(<InterviewReport report={report} />)

        expect(screen.getByText("high")).toBeInTheDocument()
        expect(screen.getByText("What is a closure?")).toBeInTheDocument()
        expect(screen.getByText("Tell me about a conflict")).toBeInTheDocument()
        expect(screen.getByText("Deploy a sample app")).toBeInTheDocument()
    })

    it("hides sections that have no items", () => {
        render(<InterviewReport report={{ ...report, skillGaps: [], preparationPlan: [] }} />)

        expect(screen.queryByText("Skill gaps")).not.toBeInTheDocument()
        expect(screen.queryByText("Preparation plan")).not.toBeInTheDocument()
    })
})
