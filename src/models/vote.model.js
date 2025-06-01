import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const VoteSchema = new Schema({
    user: { type: Types.ObjectId, ref: 'User', required: true },
    poll: { type: Types.ObjectId, ref: 'Poll', required: true },
    optionId: { type: Types.ObjectId, required: true }
}, { timestamps: true });

VoteSchema.index({ user: 1, poll: 1 }, { unique: true });

const VoteModel = model('Vote', VoteSchema);
export default VoteModel;