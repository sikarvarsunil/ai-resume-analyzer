const { Router } = require('express');
const authMiddleware = require("../middleware/auth.middleware.js")
const interviewController = require("../controllers/interview.controllers.js")
const upload = require("../middleware/file.middleware.js")
const { reportLimiter } = require("../middleware/rateLimit.middleware.js")


const interviewRouter = Router();

const { authUser } = authMiddleware
const { generateInterviewReportController, listInterviewReportsController, getInterviewReportController } = interviewController


/**
 * @route POST /api/interview/
 * @description generate the new interview report on the basis of user self description, resume pdf and job description
 * @access private
 */

interviewRouter.post("/", authUser, reportLimiter, upload.single("resume"), generateInterviewReportController)

/**
 * @route GET /api/interview/
 * @description list the current user's past reports (summary only)
 * @access private
 */
interviewRouter.get("/", authUser, listInterviewReportsController)

/**
 * @route GET /api/interview/:id
 * @description get one full report owned by the current user
 * @access private
 */
interviewRouter.get("/:id", authUser, getInterviewReportController)

module.exports = interviewRouter;
