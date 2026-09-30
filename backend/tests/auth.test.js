const { startServer, authCookie, signToken, jsonRequest } = require("./helpers");
const { describe, it, before, after, beforeEach, afterEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const config = require("../src/config/config");
const userModel = require("../src/models/user.model");
const blackListTokenModel = require("../src/models/blacklist.model");

const USER_ID = "64b000000000000000000001";

describe("auth routes", () => {
    let server;

    before(async () => {
        server = await startServer(app);
    });
    after(() => server.close());

    beforeEach(() => {
        mock.method(blackListTokenModel, "findOne", async () => null);
    });
    afterEach(() => mock.restoreAll());

    describe("POST /auth/register", () => {
        it("returns 400 when a field is missing", async () => {
            const res = await fetch(`${server.baseUrl}/auth/register`, jsonRequest("POST", { email: "a@b.io" }));

            assert.equal(res.status, 400);
            assert.match((await res.json()).message, /username, email and password/);
        });

        it("returns 400 when the username or email is taken", async () => {
            mock.method(userModel, "findOne", async () => ({ _id: USER_ID }));

            const res = await fetch(`${server.baseUrl}/auth/register`, jsonRequest("POST", { username: "sam", email: "sam@x.io", password: "password1" }));

            assert.equal(res.status, 400);
            assert.match((await res.json()).message, /already exists/);
        });

        it("hashes the password, returns the user and sets an httpOnly token cookie", async () => {
            mock.method(userModel, "findOne", async () => null);
            const create = mock.method(userModel, "create", async (doc) => ({ _id: USER_ID, ...doc }));

            const res = await fetch(`${server.baseUrl}/auth/register`, jsonRequest("POST", { username: "sam", email: "sam@x.io", password: "password1" }));

            assert.equal(res.status, 201);
            assert.deepEqual((await res.json()).user, { username: "sam", email: "sam@x.io" });
            const saved = create.mock.calls[0].arguments[0];
            assert.notEqual(saved.password, "password1");
            assert.ok(await bcrypt.compare("password1", saved.password));
            assert.match(res.headers.get("set-cookie"), /^token=.+HttpOnly/i);
        });
    });

    describe("POST /auth/login", () => {
        const storedUser = async () => ({ _id: USER_ID, username: "sam", email: "sam@x.io", password: await bcrypt.hash("password1", 4) });

        it("returns 401 for an unknown email", async () => {
            mock.method(userModel, "findOne", async () => null);

            const res = await fetch(`${server.baseUrl}/auth/login`, jsonRequest("POST", { email: "nobody@x.io", password: "password1" }));

            assert.equal(res.status, 401);
        });

        it("returns 401 for a wrong password", async () => {
            const user = await storedUser();
            mock.method(userModel, "findOne", async () => user);

            const res = await fetch(`${server.baseUrl}/auth/login`, jsonRequest("POST", { email: "sam@x.io", password: "wrong-password" }));

            assert.equal(res.status, 401);
            assert.equal((await res.json()).message, "Invalid email or password");
        });

        it("returns the user and a token that expires after the configured lifetime", async () => {
            const user = await storedUser();
            mock.method(userModel, "findOne", async () => user);

            const res = await fetch(`${server.baseUrl}/auth/login`, jsonRequest("POST", { email: "sam@x.io", password: "password1" }));

            assert.equal(res.status, 200);
            assert.equal((await res.json()).user.username, "sam");
            const token = res.headers.get("set-cookie").match(/^token=([^;]+)/)[1];
            const decoded = jwt.verify(token, config.JWT_SECRET);
            assert.equal(decoded.id, USER_ID);
            assert.equal(decoded.exp - decoded.iat, config.JWT_EXPIRES_IN_SECONDS);
        });
    });

    describe("POST /auth/logout", () => {
        it("blacklists the token and clears the cookie", async () => {
            const create = mock.method(blackListTokenModel, "create", async (doc) => doc);
            const token = signToken({ id: USER_ID });

            const res = await fetch(`${server.baseUrl}/auth/logout`, { method: "POST", headers: { cookie: `token=${token}` } });

            assert.equal(res.status, 200);
            assert.deepEqual(create.mock.calls[0].arguments[0], { token });
            assert.match(res.headers.get("set-cookie"), /^token=;/);
        });

        it("is not available over GET", async () => {
            const res = await fetch(`${server.baseUrl}/auth/logout`);

            assert.equal(res.status, 404);
        });
    });

    describe("GET /auth/get-me", () => {
        it("returns 401 without a token", async () => {
            const res = await fetch(`${server.baseUrl}/auth/get-me`);

            assert.equal(res.status, 401);
        });

        it("returns 401 for an invalid token", async () => {
            const res = await fetch(`${server.baseUrl}/auth/get-me`, { headers: { cookie: "token=not-a-jwt" } });

            assert.equal(res.status, 401);
            assert.equal((await res.json()).message, "Invalid Token");
        });

        it("returns 401 for a blacklisted token", async () => {
            mock.method(blackListTokenModel, "findOne", async () => ({ token: "x" }));

            const res = await fetch(`${server.baseUrl}/auth/get-me`, { headers: { cookie: authCookie(USER_ID) } });

            assert.equal(res.status, 401);
            assert.equal((await res.json()).message, "Token is blacklisted");
        });

        it("returns the current user", async () => {
            mock.method(userModel, "findById", async () => ({ _id: USER_ID, username: "sam", email: "sam@x.io", password: "hash" }));

            const res = await fetch(`${server.baseUrl}/auth/get-me`, { headers: { cookie: authCookie(USER_ID) } });

            assert.equal(res.status, 200);
            assert.deepEqual((await res.json()).user, { id: USER_ID, username: "sam", email: "sam@x.io" });
        });

        it("returns 404 and clears the cookie when the user was deleted", async () => {
            mock.method(userModel, "findById", async () => null);

            const res = await fetch(`${server.baseUrl}/auth/get-me`, { headers: { cookie: authCookie(USER_ID) } });

            assert.equal(res.status, 404);
            assert.equal((await res.json()).message, "User not found");
            assert.match(res.headers.get("set-cookie"), /^token=;/);
        });
    });
});
