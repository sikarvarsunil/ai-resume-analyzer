const { validAiReport } = require("./helpers");
const { describe, it, mock, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { Ollama } = require("ollama");
const config = require("../src/config/config");
const generateInterviewAIReport = require("../src/services/ai.service");

const input = { jobDescription: "Senior React developer", resume: "5 years of React", selfDescription: "Frontend dev" };

function mockOllamaReply(content) {
    return mock.method(Ollama.prototype, "chat", async () => ({ message: { content } }));
}

describe("generateInterviewAIReport", () => {
    afterEach(() => mock.restoreAll());

    it("returns the validated report and calls the configured model in JSON mode", async () => {
        const chat = mockOllamaReply(JSON.stringify(validAiReport));

        const report = await generateInterviewAIReport(input);

        assert.deepEqual(report, validAiReport);
        const [request] = chat.mock.calls[0].arguments;
        assert.equal(request.model, config.OLLAMA_MODEL);
        assert.equal(request.format, "json");
        assert.match(request.messages[0].content, /5 years of React/);
    });

    it("rejects a missing job description or resume without calling the model", async () => {
        const chat = mockOllamaReply("{}");

        await assert.rejects(generateInterviewAIReport({ ...input, jobDescription: "  " }), /Job description is required/);
        await assert.rejects(generateInterviewAIReport({ ...input, resume: "" }), /Resume is required/);
        assert.equal(chat.mock.callCount(), 0);
    });

    it("throws when the model returns text that is not JSON", async () => {
        mockOllamaReply("Sure! Here is your report:");
        mock.method(console, "error", () => {});

        await assert.rejects(generateInterviewAIReport(input), /Ollama returned invalid JSON/);
    });

    it("throws when the JSON has the wrong shape", async () => {
        mockOllamaReply(JSON.stringify({ ...validAiReport, matchScore: 150, skillGaps: [{ skill: "Go", severity: "extreme" }] }));
        mock.method(console, "error", () => {});

        await assert.rejects(generateInterviewAIReport(input), /Invalid AI response/);
    });
});
