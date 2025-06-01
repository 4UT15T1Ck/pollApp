// src/controllers/user.controller.js
import userService from "../services/user.service.js";
import { sendSuccess, sendError } from "../utils/response.util.js";

class UserController {
    async register(req, res, next) {
        try {
            const user = await userService.register(req.body);
            sendSuccess(res, "User registered successfully", { user }, 201);
        } catch (error) {
            if (error.message.includes("User already exists")) {
                return sendError(res, error.message, 409);
            }
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const data = await userService.login(email, password);
            sendSuccess(res, "Login successful", data);
        } catch (error) {
             if (error.message.includes("Invalid email or password")) {
                return sendError(res, error.message, 401);
            }
            next(error);
        }
    }

    async getMyProfile(req, res, next) {
        try {
            const user = await userService.getProfile(req.user.id);
            sendSuccess(res, "Profile fetched successfully", user);
        } catch (error) {
            next(error);
        }
    }

    async updateMyProfile(req, res, next) {
        try {
            const updatedUser = await userService.updateProfile(req.user.id, req.body);
            sendSuccess(res, "Profile updated successfully", updatedUser);
        } catch (error) {
            next(error);
        }
    }

    async createUser(req, res, next) {
        try {
            const user = await userService.createUser(req.body);
            sendSuccess(res, "User created successfully by admin", { user }, 201);
        } catch (error) {
            if (error.message.includes("User already exists")) {
                return sendError(res, error.message, 409);
            }
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await userService.getAllUsers(page, limit);
            sendSuccess(res, "Users fetched successfully", result);
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            sendSuccess(res, "User fetched successfully", user);
        } catch (error) {
            if (error.message.includes("User not found")) {
                return sendError(res, error.message, 404);
            }
            next(error);
        }
    }

    async updateUserById(req, res, next) {
        try {
            const updatedUser = await userService.updateUserById(req.params.id, req.body);
            sendSuccess(res, "User updated successfully by admin", updatedUser);
        } catch (error) {
             if (error.message.includes("User not found")) {
                return sendError(res, error.message, 404);
            }
            next(error);
        }
    }

    async deleteUserById(req, res, next) {
        try {
            const result = await userService.deleteUserById(req.params.id);
            sendSuccess(res, result.message);
        } catch (error) {
            if (error.message.includes("User not found")) {
                return sendError(res, error.message, 404);
            }
            next(error);
        }
    }
    // Removed ForgotPassword and ResetPassword methods
}

export default new UserController();