import { ChatModel } from "../models/chat.models.js";

export const createChat = async (req, res) => {
    try {
        const { title } = req.body;
        const user = req.user;

        const chat = await ChatModel.create({
            user: user._id,
            title
        });

        res.status(201).json({ chat:{
            id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}