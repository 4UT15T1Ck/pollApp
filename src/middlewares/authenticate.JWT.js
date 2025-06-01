import jwt from "jsonwebtoken";
import UserModel from "../models/user.model.js";
import { sendError } from "../utils/response.util.js";

export const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return sendError(res, "Authorization header is missing or malformed", 401);
        }
        const token = authHeader.split(" ")[1];

        if (!token) {
            return sendError(res, "Token not provided", 401);
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) {
            return sendError(res, "User not found for the token provided", 401);
        }
        req.user = user; 
        next();
    } catch (err) {
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
             return sendError(res, `Unauthorized: ${err.message}`, 401);
        }
        console.error("JWT Auth Error:", err);
        return sendError(res, "Unauthorized", 401);
    }
};
