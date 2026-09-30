const { rateLimit } = require("express-rate-limit");

const FIFTEEN_MINUTES = 15 * 60 * 1000;
const ONE_HOUR = 60 * 60 * 1000;

function createLimiter({ windowMs, limit, message, ...options }) {
    return rateLimit({
        windowMs,
        limit,
        standardHeaders: "draft-8",
        legacyHeaders: false,
        message: { message },
        ...options
    });
}

/**
 * Only failed logins count, so a user who logs in successfully is never blocked.
 */
const loginLimiter = createLimiter({
    windowMs: FIFTEEN_MINUTES,
    limit: 10,
    skipSuccessfulRequests: true,
    message: "Too many failed login attempts. Please try again in 15 minutes."
});

const registerLimiter = createLimiter({
    windowMs: ONE_HOUR,
    limit: 5,
    message: "Too many accounts created from this network. Please try again in an hour."
});

/**
 * Must run after `authUser`: limits are per user, not per IP, because each report is an expensive AI call.
 */
const reportLimiter = createLimiter({
    windowMs: ONE_HOUR,
    limit: 10,
    keyGenerator: (req) => req.user.id,
    message: "You have reached the limit of 10 reports per hour. Please try again later."
});

module.exports = {
    loginLimiter,
    registerLimiter,
    reportLimiter
};
