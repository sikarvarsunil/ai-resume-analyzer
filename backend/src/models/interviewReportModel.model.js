const mongoose = require("mongoose");
/**
 * Technical Interview Question
 */
const technicalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Technical question is required"],
    },

    intention: {
      type: String,
      required: [true, "Intention is required"],
    },

    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false }
);

/**
 * Behavioral Interview Question
 */
const behavioralQuestionsSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Behavioral question is required"],
    },

    intention: {
      type: String,
      required: [true, "Intention is required"],
    },

    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
  },
  { _id: false }
);

/**
 * Skill Gap
 */
const skillGapSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "Skill is required"],
    },

    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity is required"],
    },
  },
  { _id: false }
);

/**
 * Preparation Plan
 */
const preparationPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, "Day is required"],
    },

    focus: {
      type: String,
      required: [true, "Focus is required"],
    },

    task: {
      type: String,
      required: [true, "Task is required"],
    },
  },
  { _id: false }
);

/**
 * Interview Report
 */
const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },

    resume: {
      type: String,
    },

    selfDescription: {
      type: String,
    },

    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },

    technicalQuestions: {
      type: [technicalQuestionSchema],
      default: [],
    },

    behavioralQuestions: {
      type: [behavioralQuestionsSchema],
      default: [],
    },

    skillGaps: {
      type: [skillGapSchema],
      default: [],
    },

    preparationPlan: {
      type: [preparationPlanSchema],
      default: [],
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    }
  },
  {
    timestamps: true,
  }
);

const InterviewReport = mongoose.model(
  "InterviewReport",
  interviewReportSchema
);

module.exports = InterviewReport;