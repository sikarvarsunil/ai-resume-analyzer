import { api } from '../../services/api.service.js'

export function generateInterviewReport({ selfDescription, jobDescription, resume }) {
    const formData = new FormData()
    formData.append("selfDescription", selfDescription)
    formData.append("jobDescription", jobDescription)
    formData.append("resume", resume)

    return api.post("/interview", formData, { timeout: 120000 })
}
