import pollService from '../services/poll.service.js';
import { sendSuccess, sendError } from '../utils/response.util.js';

class PollController {
    async createPoll(req, res, next) {
        try {
            const poll = await pollService.createPoll(req.body, req.user.id);
            sendSuccess(res, 'Poll created successfully', poll, 201);
        } catch (error) {
            next(error);
        }
    }

    async getAllPolls(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const result = await pollService.getAllPolls(page, limit, req.user.id);
            sendSuccess(res, 'Get all Poll successfully', result);
        } catch (error) {
            next(error);
        }
    }

    async getPollById(req, res, next) {
        try {
            const poll = await pollService.getPollById(req.params.id, req.user.id);
            sendSuccess(res, 'Get Poll successfully', poll);
        } catch (error) {
            if (error.message.includes("Poll not found")) return sendError(res, error.message, 404);
            next(error);
        }
    }

    async updatePoll(req, res, next) {
        try {
            const poll = await pollService.updatePoll(req.params.id, req.body, req.user.id);
            sendSuccess(res, 'Poll updated successfully', poll);
        } catch (error) {
            if (error.message.includes("Poll not found")) return sendError(res, error.message, 404);
            if (error.message.includes("Forbidden")) return sendError(res, error.message, 403);
            next(error);
        }
    }

    async deletePoll(req, res, next) {
        try {
            await pollService.deletePoll(req.params.id, req.user.id);
            sendSuccess(res, 'Poll deleted successfully');
        } catch (error) {
            if (error.message.includes("Poll not found")) return sendError(res, error.message, 404);
            if (error.message.includes("Forbidden")) return sendError(res, error.message, 403);
            next(error);
        }
    }

    async lockPoll(req, res, next) {
        try {
            const poll = await pollService.lockPoll(req.params.id, req.user.id);
            sendSuccess(res, 'Poll locked successfully', poll);
        } catch (error) {
            if (error.message.includes("Poll not found")) return sendError(res, error.message, 404);
            next(error);
        }
    }

    async unlockPoll(req, res, next) {
        try {
            const poll = await pollService.unlockPoll(req.params.id, req.user.id);
            sendSuccess(res, 'Poll unlocked successfully', poll);
        } catch (error) {
             if (error.message.includes("Poll not found")) return sendError(res, error.message, 404);
            next(error);
        }
    }

    async addOption(req, res, next) {
        try {
            const poll = await pollService.addOptionToPoll(req.params.id, req.body, req.user.id);
            sendSuccess(res, 'Option added successfully', poll);
        } catch (error) {
            if (error.message.includes("Poll not found")) return sendError(res, error.message, 404);
            if (error.message.includes("locked")) return sendError(res, error.message, 403);
            next(error);
        }
    }

    async removeOption(req, res, next) {
        try {
            const poll = await pollService.removeOptionFromPoll(req.params.id, req.params.optionId, req.user.id);
            sendSuccess(res, 'Option removed successfully', poll);
        } catch (error) {
            if (error.message.includes("Poll not found") || error.message.includes("Option not found")) return sendError(res, error.message, 404);
            if (error.message.includes("locked")) return sendError(res, error.message, 403);
            next(error);
        }
    }

    async vote(req, res, next) {
        try {
            const { optionId } = req.body;
            const result = await pollService.voteOnPoll(req.params.id, optionId, req.user.id);
            sendSuccess(res, result.message, result.vote);
        } catch (error) {
            if (error.message.includes("Poll not found") || error.message.includes("Invalid option")) return sendError(res, error.message, 404);
            if (error.message.includes("locked") || error.message.includes("expired") || error.message.includes("already voted")) return sendError(res, error.message, 403);
            next(error);
        }
    }

    async unvote(req, res, next) {
        try {
            const result = await pollService.unvoteFromPoll(req.params.id, req.user.id);
            sendSuccess(res, result.message);
        } catch (error) {
            if (error.message.includes("Poll not found") || error.message.includes("not voted")) return sendError(res, error.message, 404);
             if (error.message.includes("locked")) return sendError(res, error.message, 403);
            next(error);
        }
    }
}
export default new PollController();
