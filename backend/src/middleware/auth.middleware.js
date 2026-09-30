const jwt = require("jsonwebtoken");
const config = require("../config/config.js");
const blackListTokenModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({
            message: "Token is not provided"
        })
    }
    const tokenBlacklisisted = await blackListTokenModel.findOne({token});
    if(tokenBlacklisisted) {
        return res.status(401).json({
            message: "Token is blacklisted"
        })
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);

        req.user = decoded;
        next()
    } catch(err) {
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
}

module.exports = {
    authUser
}