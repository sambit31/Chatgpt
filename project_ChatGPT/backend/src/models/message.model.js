import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel',
        required: true
    },
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatModel',
        required: true
    },
    role:{
        type: String,
        enum: ['user', 'model'],
        default: 'user'
    },
    content:{
        type: String,
        required: true
    }
});

export const messageModel = mongoose.model("Message", messageSchema);
