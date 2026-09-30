const bcrypt =  require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const userModel = require("../models/user.model");
const blackListTokenModel = require("../models/blacklist.model");

/**
 * @name registerUserController
 * @description register the new user, expect username, email and password in the required
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        // Get values from request body
        const { username, email, password } = req.body;

        // Validate required fields
        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
        }

        // Check whether username or email already exists
        const isUserAlreadyExists = await userModel.findOne({
            $or: [
                { username },
                { email }
            ]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email address or username"
            });
        }

        // Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await userModel.create({
            username,
            email,
            password: hashPassword
        });

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user._id
            },
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRES_IN_SECONDS
            }
        );

        // Set token in cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Register user error:", error);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

/**
 * @name loginUserController
 * @description login the user, expect username, email and password in the required
 * @access Public
 */

async function loginUserController(req, res) {
    try {
        // Get email and password from request body
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email });

        // User not found
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Compare plain password with hashed password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        // Password doesn't match
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email
            },
            config.JWT_SECRET,
            {
                expiresIn: config.JWT_EXPIRES_IN_SECONDS
            }
        );

        // Store JWT in HTTP-only cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: config.JWT_EXPIRES_IN_SECONDS * 1000
        });

        // Send response
        return res.status(200).json({
            message: "Logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error("Login user error:", err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

/**
 * @name logoutUserController
 * @description logout the user
 * @access Public
 */

async function logoutUserController(req, res) {
    const token = req.cookies.token;
    if(token) {
        await blackListTokenModel.create({token})
    }
    res.clearCookie('token');
    return res.status(200).json({
        message: "user logout successfully"
    })
}

/**
 * @name getMeController
 * @description Get the current user detail
 * @access Public
 */

async function getMeController(req, res) {
    try {
        const user = await userModel.findById(req.user.id)

        // The token is valid but its account was deleted, so the cookie is useless.
        if (!user) {
            res.clearCookie('token');
            return res.status(404).json({
                message: "User not found"
            });
        }

        return res.status(200).json({
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        })
    } catch (err) {
        console.error("Get me error:", err);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
}