import PollModel from '../models/poll.model.js';
import VoteModel from '../models/vote.model.js';
import UserModel from '../models/user.model.js';
import mongoose from 'mongoose';

class PollService {
    async createPoll(pollData, creatorId) {
        const poll = new PollModel({ ...pollData, creator: creatorId });
        await poll.save();
        return poll;
    }

    async getAllPolls(page = 1, limit = 10, userId) {
        const skip = (page - 1) * limit;
        const polls = await PollModel.find()
            .populate('creator', 'id username name') // username if available, else name
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Use .lean() for faster queries, manually add votesCount

        const total = await PollModel.countDocuments();

        // Enhance polls with votesCount
        for (const poll of polls) {
            poll.votesCount = await VoteModel.countDocuments({ poll: poll._id });
            poll.id = poll._id; // for consistency if _id is not directly used in frontend
             poll.options = poll.options.map(opt => ({ id: opt._id, text: opt.text }));
        }
        return { polls, total, page, limit };
    }

    async getPollById(pollId, requestingUserId) {
        const poll = await PollModel.findById(pollId)
            .populate('creator', 'id username name')
            .lean(); // Use lean for manipulation

        if (!poll) throw new Error('Poll not found');
        
        poll.id = poll._id;

        const votesForPoll = await VoteModel.find({ poll: pollId }).populate('user', 'id name');
        const optionVotesMap = new Map();

        votesForPoll.forEach(vote => {
            const optionIdStr = vote.optionId.toString();
            if (!optionVotesMap.has(optionIdStr)) {
                optionVotesMap.set(optionIdStr, { votes: 0, userVote: [] });
            }
            const currentOptionData = optionVotesMap.get(optionIdStr);
            currentOptionData.votes++;
            currentOptionData.userVote.push({ id: vote.user._id, name: vote.user.name });
        });

        poll.options = poll.options.map(opt => {
            const optionIdStr = opt._id.toString();
            const voteData = optionVotesMap.get(optionIdStr) || { votes: 0, userVote: [] };
            return {
                id: opt._id,
                text: opt.text,
                votes: voteData.votes,
                userVote: voteData.userVote,
            };
        });

        poll.totalVotes = votesForPoll.length;
        return poll;
    }

    async updatePoll(pollId, updateData, userId) {
        const poll = await PollModel.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.creator.toString() !== userId.toString()) { // Ensure admin or creator logic if needed. For now, admin only
            throw new Error('Forbidden: Not authorized to update this poll');
        }

        Object.assign(poll, updateData);
        await poll.save();
        return poll;
    }

    async deletePoll(pollId, userId) {
        const poll = await PollModel.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.creator.toString() !== userId.toString()) { // As per spec admin can manage, so this check is fine
             // Or allow any admin to delete: if (req.user.role !== 'admin' && poll.creator.toString() !== userId.toString())
            // For now, only creator or any admin (checked by route middleware)
        }
        await PollModel.findByIdAndDelete(pollId);
        await VoteModel.deleteMany({ poll: pollId }); // Cascade delete votes
        return { message: 'Poll deleted successfully' };
    }

    async lockPoll(pollId, userId) {
        const poll = await PollModel.findOneAndUpdate(
            { _id: pollId /*, creator: userId */ }, // Creator check can be here or rely on route auth
            { isLocked: true },
            { new: true }
        );
        if (!poll) throw new Error('Poll not found or not authorized');
        return poll;
    }

    async unlockPoll(pollId, userId) {
        const poll = await PollModel.findOneAndUpdate(
            { _id: pollId /*, creator: userId */ },
            { isLocked: false },
            { new: true }
        );
        if (!poll) throw new Error('Poll not found or not authorized');
        return poll;
    }

    async addOptionToPoll(pollId, optionData, userId) {
        const poll = await PollModel.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        // if (poll.creator.toString() !== userId.toString()) throw new Error('Forbidden');
        if (poll.isLocked) throw new Error('Poll is locked, cannot add options');

        const newOption = { _id: new mongoose.Types.ObjectId(), text: optionData.text };
        poll.options.push(newOption);
        await poll.save();
        return poll;
    }

    async removeOptionFromPoll(pollId, optionId, userId) {
        const poll = await PollModel.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        // if (poll.creator.toString() !== userId.toString()) throw new Error('Forbidden');
        if (poll.isLocked) throw new Error('Poll is locked, cannot remove options');

        const optionIndex = poll.options.findIndex(opt => opt._id.toString() === optionId);
        if (optionIndex === -1) throw new Error('Option not found in poll');

        poll.options.splice(optionIndex, 1);
        // Also remove votes for this option
        await VoteModel.deleteMany({ poll: pollId, optionId: optionId });
        await poll.save();
        return poll;
    }

    async voteOnPoll(pollId, optionId, userId) {
        const poll = await PollModel.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.isLocked) throw new Error('Poll is locked, voting is disabled');
        if (poll.expiresAt && new Date() > poll.expiresAt) throw new Error('Poll has expired');

        const optionExists = poll.options.some(opt => opt._id.toString() === optionId);
        if (!optionExists) throw new Error('Invalid option selected');

        const existingVote = await VoteModel.findOne({ user: userId, poll: pollId });
        if (existingVote) {
             // If allowing vote change:
             // existingVote.optionId = optionId;
             // await existingVote.save();
             // return { message: 'Vote changed successfully', vote: existingVote };
            throw new Error('You have already voted on this poll');
        }

        const vote = new VoteModel({ user: userId, poll: pollId, optionId });
        await vote.save();
        return { message: 'Voted successfully', vote };
    }

    async unvoteFromPoll(pollId, userId) {
        const poll = await PollModel.findById(pollId);
        if (!poll) throw new Error('Poll not found');
        if (poll.isLocked) throw new Error('Poll is locked, cannot unvote');

        const result = await VoteModel.findOneAndDelete({ user: userId, poll: pollId });
        if (!result) throw new Error('You have not voted on this poll or vote already removed');
        return { message: 'Unvoted successfully' };
    }
}
export default new PollService();
