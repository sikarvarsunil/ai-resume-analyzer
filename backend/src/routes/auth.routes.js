const { Router } = require('express');
const authController = require("../controllers/auth.controllers.js");
const authMiddleware = require("../middleware/auth.middleware.js");
const { loginLimiter, registerLimiter } = require("../middleware/rateLimit.middleware.js");

const authRouter = Router();
const { registerUserController, loginUserController, logoutUserController, getMeController } = authController;
const { authUser } = authMiddleware

/**
 * @route POST /api/auth/register
 * @description register the user
 * @access Public
 */
authRouter.post("/register", registerLimiter, registerUserController);

/**
 * @route POST /api/auth/login
 * @description login the user
 * @access Public
 */
authRouter.post("/login", loginLimiter, loginUserController);

/**
 * @route POST /api/auth/logout
 * @description logout the user
 * @access Public
 */
authRouter.post("/logout", logoutUserController);

/**
 * @route GET /api/auth/getMe
 * @description get the current user detail
 * @access Public
 */
authRouter.get("/get-me", authUser, getMeController);


module.exports = authRouter;