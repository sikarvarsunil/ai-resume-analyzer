const { startServer, authCookie, jsonRequest } = require("./helpers");
const { describe, it, before, after, mock } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../src/app");
const userModel = require("../src/models/user.model");
const blackListTokenModel = require("../src/models/blacklist.model");

async function statuses(count, send) {
    const codes = [];
    for (let i = 0; i < count; i++) {
        codes.push((await send()).status);
    }
    return codes;
}

describe("rate limits", () => {
    let server;

    before(async () => {
        server = await startServer(app);
        mock.method(userModel, "findOne", async () => null);
        mock.method(blackListTokenModel, "findOne", async () => null);
    });
    after(async () => {
        mock.restoreAll();
        await server.close();
    });

    it("blocks the 11th failed login in 15 minutes with a 429 JSON message", async () => {
        const login = () => fetch(`${server.baseUrl}/auth/login`, jsonRequest("POST", { email: "a@b.io", password: "wrong" }));

        const codes = await statuses(11, login);

        assert.deepEqual(codes, [...Array(10).fill(401), 429]);
        const res = await login();
        assert.equal(res.status, 429);
        assert.match((await res.json()).message, /Too many failed login attempts/);
        assert.ok(res.headers.get("ratelimit"));
    });

    it("blocks the 6th registration in an hour", async () => {
        const register = () => fetch(`${server.baseUrl}/auth/register`, jsonRequest("POST", {}));

        const codes = await statuses(6, register);

        assert.deepEqual(codes, [...Array(5).fill(400), 429]);
    });

    it("limits reports per user, not per IP", async () => {
        const report = (userId) => fetch(`${server.baseUrl}/interview`, { method: "POST", headers: { cookie: authCookie(userId) } });

        const firstUser = await statuses(11, () => report("64b000000000000000000001"));
        const secondUser = await report("64b000000000000000000002");

        // 400 because no resume is attached; the limiter runs before the upload is checked.
        assert.deepEqual(firstUser, [...Array(10).fill(400), 429]);
        assert.equal(secondUser.status, 400);
    });
});
