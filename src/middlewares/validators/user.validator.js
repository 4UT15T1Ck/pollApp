import { sendError } from '../../utils/response.util.js';

export const validateUserRegistration = (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return sendError(res, 'Name, email, and password are required fields', 400);
    }
    if (typeof password !== 'string' || password.length < 6) {
        return sendError(res, 'Password must be a string and at least 6 characters long', 400);
    }
    next();
};

export const validateUserLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return sendError(res, 'Email and password are required', 400);
    }
    next();
};

export const validateUserUpdate = (req, res, next) => {
     const { email } = req.body;
     if (email !== undefined && typeof email !== 'string') {
         return sendError(res, 'If provided, email must be a string', 400);
     }
     next();
 };