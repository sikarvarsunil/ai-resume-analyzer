// Must be required before anything under src/, because config.js reads these at load time.
process.env.MONGO_URI = "mongodb://127.0.0.1:27017/ats-resume-test";
process.env.TOKEN = "test-jwt-secret";
process.env.DOTENV_CONFIG_QUIET = "true";

const { once } = require("node:events");
const jwt = require("jsonwebtoken");
const config = require("../src/config/config");

async function startServer(app) {
    const server = app.listen(0);
    await once(server, "listening");
    return {
        baseUrl: `http://127.0.0.1:${server.address().port}/api`,
        close: () => new Promise((resolve) => server.close(resolve))
    };
}

function signToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRES_IN_SECONDS });
}

function authCookie(userId) {
    return `token=${signToken({ id: userId })}`;
}

function jsonRequest(method, body, headers = {}) {
    return {
        method,
        headers: { "content-type": "application/json", ...headers },
        body: body === undefined ? undefined : JSON.stringify(body)
    };
}

const validAiReport = {
    matchScore: 72,
    technicalQuestions: [{ question: "What is a closure?", intention: "JS basics", answer: "A function with its scope" }],
    behavioralQuestions: [{ question: "Tell me about a conflict", intention: "Teamwork", answer: "Use STAR" }],
    skillGaps: [{ skill: "Kubernetes", severity: "high" }],
    preparationPlan: [{ day: 1, focus: "Kubernetes", task: "Deploy a sample app" }]
};

module.exports = {
    startServer,
    signToken,
    authCookie,
    jsonRequest,
    validAiReport
};
