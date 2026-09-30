const { startServer, authCookie, validAiReport } = require("./helpers");
const { describe, it, before, after, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const { Ollama } = require("ollama");
const { PDFParse } = require("pdf-parse");
const app = require("../src/app");
const blackListTokenModel = require("../src/models/blacklist.model");
const interviewReportModel = require("../src/models/interviewReportModel.model");

const USER_ID = "64b000000000000000000001";
const OTHER_USER_ID = "64b000000000000000000002";
const REPORT_ID = "64c000000000000000000001";

function reportForm({ withResume = true } = {}) {
    const form = new FormData();
    form.append("jobDescription", "Senior React developer");
    form.append("selfDescription", "Frontend dev");
    if (withResume) {
        form.append("resume", new Blob(["%PDF-1.4 fake"], { type: "application/pdf" }), "resume.pdf");
    }
    return form;
}

function queryChain(result) {
    const chain = {
        select: mock.fn(() => chain),
        sort: mock.fn(() => chain),
        lean: mock.fn(async () => result)
    };
    return chain;
}

describe("interview routes", () => {
    let server;

    before(async () => {
        server = await startServer(app);
    });
    after(() => server.close());

    beforeEach(() => {
        mock.method(blackListTokenModel, "findOne", async () => null);
    });
    afterEach(() => mock.restoreAll());

    describe("POST /interview", () => {
        it("requires login", async () => {
            const res = await fetch(`${server.baseUrl}/interview`, { method: "POST", body: reportForm() });

            assert.equal(res.status, 401);
        });

        it("returns 400 when no resume is uploaded", async () => {
            const res = await fetch(`${server.baseUrl}/interview`, {
                method: "POST",
                headers: { cookie: authCookie(USER_ID) },
                body: reportForm({ withResume: false })
            });

            assert.equal(res.status, 400);
            assert.equal((await res.json()).message, "Resume PDF is required");
        });

        it("parses the PDF, generates the report and saves it for the current user", async () => {
            mock.method(PDFParse.prototype, "getText", async () => ({ text: "5 years of React" }));
            mock.method(Ollama.prototype, "chat", async () => ({ message: { content: JSON.stringify(validAiReport) } }));
            const create = mock.method(interviewReportModel, "create", async (doc) => ({ _id: REPORT_ID, ...doc }));

            const res = await fetch(`${server.baseUrl}/interview`, {
                method: "POST",
                headers: { cookie: authCookie(USER_ID) },
                body: reportForm()
            });

            assert.equal(res.status, 201);
            const { report } = await res.json();
            assert.equal(report.matchScore, validAiReport.matchScore);
            assert.deepEqual(create.mock.calls[0].arguments[0], {
                user: USER_ID,
                resume: "5 years of React",
                jobDescription: "Senior React developer",
                selfDescription: "Frontend dev",
                ...validAiReport
            });
        });

        it("returns 500 with the error message when the AI fails", async () => {
            mock.method(PDFParse.prototype, "getText", async () => ({ text: "5 years of React" }));
            mock.method(Ollama.prototype, "chat", async () => { throw new Error("fetch failed"); });
            mock.method(console, "error", () => {});

            const res = await fetch(`${server.baseUrl}/interview`, {
                method: "POST",
                headers: { cookie: authCookie(USER_ID) },
                body: reportForm()
            });

            assert.equal(res.status, 500);
            assert.equal((await res.json()).message, "fetch failed");
        });
    });

    describe("GET /interview", () => {
        it("lists only the current user's reports, newest first, without the large fields", async () => {
            const summaries = [{ _id: REPORT_ID, jobDescription: "JD", matchScore: 70 }];
            const chain = queryChain(summaries);
            const find = mock.method(interviewReportModel, "find", () => chain);

            const res = await fetch(`${server.baseUrl}/interview`, { headers: { cookie: authCookie(USER_ID) } });

            assert.equal(res.status, 200);
            assert.deepEqual((await res.json()).reports, summaries);
            assert.deepEqual(find.mock.calls[0].arguments[0], { user: USER_ID });
            assert.equal(chain.select.mock.calls[0].arguments[0], "jobDescription matchScore createdAt");
            assert.deepEqual(chain.sort.mock.calls[0].arguments[0], { createdAt: -1 });
        });

        it("requires login", async () => {
            const res = await fetch(`${server.baseUrl}/interview`);

            assert.equal(res.status, 401);
        });
    });

    describe("GET /interview/:id", () => {
        it("returns the report when it belongs to the current user", async () => {
            const findOne = mock.method(interviewReportModel, "findOne", () => queryChain({ _id: REPORT_ID, user: USER_ID, ...validAiReport }));

            const res = await fetch(`${server.baseUrl}/interview/${REPORT_ID}`, { headers: { cookie: authCookie(USER_ID) } });

            assert.equal(res.status, 200);
            assert.equal((await res.json()).report.matchScore, validAiReport.matchScore);
            assert.deepEqual(findOne.mock.calls[0].arguments[0], { _id: REPORT_ID, user: USER_ID });
        });

        it("returns 404 for another user's report", async () => {
            const findOne = mock.method(interviewReportModel, "findOne", () => queryChain(null));

            const res = await fetch(`${server.baseUrl}/interview/${REPORT_ID}`, { headers: { cookie: authCookie(OTHER_USER_ID) } });

            assert.equal(res.status, 404);
            assert.deepEqual(findOne.mock.calls[0].arguments[0], { _id: REPORT_ID, user: OTHER_USER_ID });
        });

        it("returns 404 for a malformed id without querying the database", async () => {
            const findOne = mock.method(interviewReportModel, "findOne", () => queryChain(null));

            const res = await fetch(`${server.baseUrl}/interview/not-an-id`, { headers: { cookie: authCookie(USER_ID) } });

            assert.equal(res.status, 404);
            assert.equal(findOne.mock.callCount(), 0);
        });
    });
});
