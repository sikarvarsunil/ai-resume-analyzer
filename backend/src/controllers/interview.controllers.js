const mongoose = require("mongoose");
const parsePdf = require("pdf-parse");
const generateInterviewAIReport = require("../services/ai.service")
const interviewReportModel = require("../models/interviewReportModel.model")


async function generateInterviewReportController(req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "Resume PDF is required" })
    }

    try {
        const resumeContent = await (new parsePdf.PDFParse(Uint8Array.from(req.file.buffer))).getText();
        const { selfDescription, jobDescription } = req.body

        const aiReport = await generateInterviewAIReport({
            jobDescription,
            resume: resumeContent.text,
            selfDescription
        })

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent.text,
            jobDescription,
            selfDescription,
            ...aiReport
        })

        res.status(201).json({
            message: "Interview Report created successfully",
            report: interviewReport
        })
    } catch (error) {
        console.error("Failed to generate interview report:", error)
        res.status(500).json({ message: error.message || "Failed to generate interview report" })
    }
}

/**
 * @name listInterviewReportsController
 * @description list the current user's reports, newest first, without the large question/plan fields
 * @access Private
 */
async function listInterviewReportsController(req, res) {
    try {
        const reports = await interviewReportModel
            .find({ user: req.user.id })
            .select("jobDescription matchScore createdAt")
            .sort({ createdAt: -1 })
            .lean()

        res.status(200).json({ reports })
    } catch (error) {
        console.error("Failed to list interview reports:", error)
        res.status(500).json({ message: "Failed to load interview reports" })
    }
}

/**
 * @name getInterviewReportController
 * @description get one full report that belongs to the current user
 * @access Private
 */
async function getInterviewReportController(req, res) {
    const { id } = req.params

    if (!mongoose.isValidObjectId(id)) {
        return res.status(404).json({ message: "Interview report not found" })
    }

    try {
        // Filtering by user returns 404 for other users' reports, so their existence isn't revealed.
        const report = await interviewReportModel.findOne({ _id: id, user: req.user.id }).lean()

        if (!report) {
            return res.status(404).json({ message: "Interview report not found" })
        }

        res.status(200).json({ report })
    } catch (error) {
        console.error("Failed to get interview report:", error)
        res.status(500).json({ message: "Failed to load interview report" })
    }
}

module.exports = {
    generateInterviewReportController,
    listInterviewReportsController,
    getInterviewReportController
};
