import { sendError } from '../utils/response.util.js';

export const authorize = (roles = []) => {
    if (typeof roles === 'string') {
        roles = [roles];
    }
    return (req, res, next) => {
        if (!req.user || (roles.length && !roles.includes(req.user.role))) {
            return sendError(res, 'Forbidden: You do not have permission to perform this action.', 403);
        }
        next();
    };
};