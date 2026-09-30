require("./helpers");
const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const config = require("../src/config/config");
const blackListTokenModel = require("../src/models/blacklist.model");

function loadConfigWith(env) {
    const script = `process.stdout.write(JSON.stringify(require(${JSON.stringify(path.join(__dirname, "../src/config/config"))})))`;
    // Running from tests/ keeps dotenv from loading the developer's real backend/.env.
    return spawnSync(process.execPath, ["-e", script], {
        cwd: __dirname,
        env: { PATH: process.env.PATH, DOTENV_CONFIG_QUIET: "true", ...env },
        encoding: "utf8"
    });
}

describe("config", () => {
    it("uses defaults for the optional settings", () => {
        const result = loadConfigWith({ MONGO_URI: "mongodb://x", TOKEN: "secret" });
        const loaded = JSON.parse(result.stdout);

        assert.equal(loaded.PORT, 3000);
        assert.equal(loaded.OLLAMA_HOST, "http://127.0.0.1:11434");
        assert.equal(loaded.OLLAMA_MODEL, "gemma3:4b");
    });

    it("reads the optional settings from the environment", () => {
        const result = loadConfigWith({ MONGO_URI: "mongodb://x", TOKEN: "secret", PORT: "4000", OLLAMA_HOST: "http://ollama:11434", OLLAMA_MODEL: "llama3.2" });
        const loaded = JSON.parse(result.stdout);

        assert.equal(loaded.PORT, 4000);
        assert.equal(loaded.OLLAMA_HOST, "http://ollama:11434");
        assert.equal(loaded.OLLAMA_MODEL, "llama3.2");
    });

    it("fails fast when a required variable is missing", () => {
        assert.match(loadConfigWith({ TOKEN: "secret" }).stderr, /MONGO_URI is not defined/);
        assert.match(loadConfigWith({ MONGO_URI: "mongodb://x" }).stderr, /TOKEN is not defined/);
    });
});

describe("blacklist model", () => {
    it("has a TTL index that deletes entries once the JWT has expired", () => {
        const ttlIndex = blackListTokenModel.schema.indexes().find(([fields]) => fields.createdAt === 1);

        assert.ok(ttlIndex, "expected an index on createdAt");
        assert.equal(ttlIndex[1].expireAfterSeconds, config.JWT_EXPIRES_IN_SECONDS);
    });
});
