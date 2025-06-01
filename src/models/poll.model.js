import mongoose from 'mongoose';
const { Schema, model, Types } = mongoose;

const OptionSchema = new Schema({
    _id: { type: Types.ObjectId, default: () => new Types.ObjectId() },
    text: { type: String, required: true, trim: true }
});

const PollSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    options: [OptionSchema],
    creator: { type: Types.ObjectId, ref: 'User', required: true },
    isLocked: { type: Boolean, default: false },
    expiresAt: { type: Date },
}, { timestamps: true });

const PollModel = model('Poll', PollSchema);
export default PollModel;