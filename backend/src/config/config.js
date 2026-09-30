const dotenv = require("dotenv");
dotenv.config();

if(!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined in enviroment variable")
}
if(!process.env.TOKEN) {
    throw new Error("TOKEN is not defined in enviroment variable")
}

const config = {
    MONGO_URI: process.env.MONGO_URI,
    JWT_SECRET: process.env.TOKEN,
    // The token blacklist TTL index uses this too, so blacklisted tokens are deleted only after they expire.
    JWT_EXPIRES_IN_SECONDS: 24 * 60 * 60,
    PORT: Number(process.env.PORT) || 3000,
    OLLAMA_HOST: process.env.OLLAMA_HOST || "http://127.0.0.1:11434",
    OLLAMA_MODEL: process.env.OLLAMA_MODEL || "gemma3:4b"
}

module.exports = config;
