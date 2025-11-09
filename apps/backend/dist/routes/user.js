"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userValidator_1 = require("../zod/userValidator");
const client_1 = require("../lib/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../middleware/auth");
const library_1 = require("@prisma/client/runtime/library");
const router = (0, express_1.Router)();
/**
 * Normalize a username by trimming extra spaces and capitalizing each word.
 *
 * This function:
 * - Removes leading and trailing whitespace
 * - Splits the input string by one or more whitespace characters
 * - Capitalizes the first letter of each word
 * - Converts the rest of the letters in each word to lowercase
 * - Joins the words back together with a single space
 *
 * Example:
 * ```
 * normalizeUsername("nITH in kUMar") // returns "Nith In Kumar"
 * normalizeUsername("  alice   JOHNSON ") // returns "Alice Johnson"
 * ```
 *
 * @param {string} name - The username string to normalize.
 * @returns {string} The normalized username with proper capitalization.
 */
function normalizeUsername(name) {
    return name
        .trim()
        .split(/\s+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}
/**
 * @route   POST /signup
 * @desc    Register a new user (or update unverified user) and generate OTP
 * @access  Public
 *
 * Expected Request Body:
 * {
 *   "username": "JohnDoe",
 *   "mobile": "9876543210"
 * }
 *
 * Success Response:
 * {
 *   "success": true,
 *   "message": "OTP sent successfully."
 * }
 *
 * Error Responses:
 * 400 - Invalid input or existing verified user
 * 500 - Internal server error
 */
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ✅ Step 1: Validate incoming request body using Zod (or any validator)
        const isValidSignup = userValidator_1.signupValidator.safeParse(req.body);
        if (!isValidSignup.success) {
            return res.status(400).json({
                success: false,
                message: isValidSignup.error.message
            });
        }
        const { username, mobile } = isValidSignup.data;
        // ✅ Step 2: Check if user already exists and is verified
        const existingUser = yield client_1.prisma.user.findUnique({
            where: { mobile },
            select: { userId: true }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists."
            });
        }
        //  Normalise the username
        const normalizedUsername = normalizeUsername(username);
        yield client_1.prisma.user.create({
            data: {
                username: normalizedUsername,
                mobile
            }
        });
        // ✅ Step 5: Respond with success (OTP sending to be handled separately)
        return res.status(200).json({
            success: true,
            message: "Signup successful."
        });
    }
    catch (error) {
        if (error instanceof library_1.PrismaClientKnownRequestError && error.code === "P2002") {
            return res.status(400).json({
                success: false,
                message: "User already exists.",
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}));
/**
 * @route   POST /signin
 * @desc    Initiate login for an existing user by generating and storing OTP
 * @access  Public
 *
 * Expected Request Body:
 * {
 *   "mobile": "9876543210"
 * }
 *
 * Success Response:
 * {
 *   "success": true,
 *   "message": "OTP sent successfully."
 * }
 *
 * Error Responses:
 * 400 - Invalid input
 * 500 - Internal server error
 */
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        // ✅ Step 1: Validate incoming request body using Zod (or any validator)
        const isValidLogin = userValidator_1.loginValidator.safeParse(req.body);
        if (!isValidLogin.success) {
            return res.status(400).json({
                success: false,
                message: isValidLogin.error.message
            });
        }
        const { mobile } = isValidLogin.data;
        // ✅ Step 2: Check if the user exists
        const user = yield client_1.prisma.user.findUnique({
            where: { mobile }
        });
        // 🛡️ Step 3: Respond with generic failure if user doesn't exist
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not registered."
            });
        }
        const data = {
            user: {
                userId: user.userId,
                username: user.username,
                mobile: user.mobile,
                createdAt: user.createdAt,
            }
        };
        // ✅ Step 7: Sign JWT tokens
        const authToken = jsonwebtoken_1.default.sign(data, `${(_a = process.env.JWT_SECRET) !== null && _a !== void 0 ? _a : "secret"}`, { expiresIn: "15d" });
        const refreshToken = jsonwebtoken_1.default.sign(data, `${(_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : "secret"}`, { expiresIn: "20d" });
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            authToken,
            refreshToken
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error."
        });
    }
}));
/**
 * @route   PUT /update
 * @desc    Update authenticated user's username and return refreshed JWT tokens
 * @access  Private (requires valid session)
 */
router.put('/update', (0, auth_1.verifyAuth)("USER"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        // ✅ Step 1: Verify authenticated userId from session middleware
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid authentication."
            });
        }
        // ✅ Step 2: Fetch existing user data needed for token and response
        const user = yield client_1.prisma.user.findUnique({
            where: { userId },
            select: {
                mobile: true,
                createdAt: true,
                username: true,
                role: true
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid authentication."
            });
        }
        // ✅ Step 3: Validate incoming request body (username)
        const isValidUpdate = userValidator_1.updateValidator.safeParse(req.body);
        if (!isValidUpdate.success) {
            return res.status(400).json({
                success: false,
                message: isValidUpdate.error.message
            });
        }
        // ✅ Step 4: Extract validated username from request
        const { username } = isValidUpdate.data;
        //  Normalise the username
        const normalizedUsername = normalizeUsername(username);
        // ✅ Step 5: Update username in database is username is different
        if (user.username !== normalizedUsername) {
            yield client_1.prisma.user.update({
                where: { userId },
                data: { username: normalizedUsername }
            });
        }
        // ✅ Step 6: Prepare JWT payload with updated user info
        const tokenPayload = {
            user: {
                userId,
                username: normalizedUsername,
                mobile: user.mobile,
                createdAt: user.createdAt,
                role: user.role
            }
        };
        // ✅ Step 7: Generate new authToken and refreshToken with expiry
        const authToken = jsonwebtoken_1.default.sign(tokenPayload, (_b = process.env.JWT_SECRET) !== null && _b !== void 0 ? _b : 'secret', { expiresIn: '15d' });
        const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, (_c = process.env.JWT_SECRET) !== null && _c !== void 0 ? _c : 'secret', { expiresIn: '20d' });
        // ✅ Step 8: Return success response with new tokens
        return res.status(200).json({
            success: true,
            message: "User updated successfully.",
            authToken,
            refreshToken
        });
    }
    catch (error) {
        // ✅ Step 9: Handle unexpected errors and return 500
        console.log("User Update Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}));
/**
 * @route   GET /refresh
 * @desc    Refresh JWT tokens for authenticated user
 * @access  Private (requires valid session)
 *
 * This endpoint:
 * - Validates that the userId is present in the verified session
 * - Fetches the user data from the database to include in the new tokens
 * - Signs and returns new auth and refresh JWT tokens with updated expiration
 *
 * Success Response:
 * {
 *   "success": true,
 *   "message": "Token refreshed",
 *   "authToken": "<new JWT token>",
 *   "refreshToken": "<new refresh token>"
 * }
 *
 * Error Responses:
 * 400 - Invalid authentication (user not found)
 * 500 - Internal server error
 */
router.get('/refresh', (0, auth_1.verifyAuth)("USER"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // ✅ Step 1: Extract userId from verified session (middleware ensures validity)
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        // If userId is not present, respond with 400
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "Invalid authentication."
            });
        }
        // ✅ Step 2: Fetch user data required for token payload
        const user = yield client_1.prisma.user.findUnique({
            where: { userId },
            select: {
                username: true,
                mobile: true,
                createdAt: true,
            }
        });
        // ✅ Step 3: If user does not exist, respond with 400
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid authentication."
            });
        }
        // ✅ Step 4: Prepare JWT payload with user details
        const tokenPayload = {
            user: {
                userId,
                username: user.username,
                mobile: user.mobile,
                createdAt: user.createdAt,
            }
        };
        // ✅ Step 5: Sign new tokens using strong JWT secret and reasonable expiry
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("JWT_SECRET is not set in environment variables.");
            return res.status(500).json({
                success: false,
                message: "Server configuration error."
            });
        }
        const authToken = jsonwebtoken_1.default.sign(tokenPayload, secret, { expiresIn: '15d' });
        const refreshToken = jsonwebtoken_1.default.sign(tokenPayload, secret, { expiresIn: '20d' });
        // ✅ Step 6: Return new tokens in success response
        return res.status(200).json({
            success: true,
            message: "Server configured successfully.",
            authToken,
            refreshToken
        });
    }
    catch (error) {
        // ✅ Step 7: Handle unexpected server errors
        console.log("Token refresh error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}));
exports.default = router;
