import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },
    title:{
        type: String,
        required: true
    },
    lastActivity:{
        type: Date,
        default: Date.now
    }
},{ timestamps: true });

export const ChatModel = mongoose.model('Chat', chatSchema);
