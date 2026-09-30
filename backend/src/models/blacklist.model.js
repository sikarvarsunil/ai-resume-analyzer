const mongoose = require("mongoose");
const config = require("../config/config");


const blackListTokenSchema = new mongoose.Schema({
    token:{
        type: String,
        required: [true, "token is required to be added in blacklist"]
    }
}, {
    timestamps: true
});

blackListTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: config.JWT_EXPIRES_IN_SECONDS });

const blackListTokenModel = mongoose.model("blackListToken", blackListTokenSchema)

module.exports = blackListTokenModel;
