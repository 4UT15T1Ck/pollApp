import { sendError } from '../../utils/response.util.js';
import mongoose from 'mongoose';
export const validatePollCreation = (req, res, next) => {
    const { title, options } = req.body;
    if (!title || !title.trim()) {
        return sendError(res, 'Poll title is required', 400);
    }
    if (!options || !Array.isArray(options) || options.length < 2) {
        return sendError(res, 'Poll must have at least two options', 400);
    }
    if (options.some(opt => !opt.text || !opt.text.trim())) {
        return sendError(res, 'All options must have non-empty text', 400);
    }
    next();
};

export const validateAddOption = (req, res, next) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
        return sendError(res, 'Option text is required', 400);
    }
    next();
};

export const validateVote = (req, res, next) => {
    const { optionId } = req.body;
    if (!optionId || !mongoose.Types.ObjectId.isValid(optionId)) {
        return sendError(res, 'Valid optionId is required to vote', 400);
    }
    next();
};