import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { userModel } from "../models/user.models.js";
import * as aiService from "../service/ai.service.js";
import {messageModel} from "../models/message.model.js";
import { createMemory, queryMemory } from "../service/vector.service.js";


export function initSocketServer(httpServer) {

    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            allowedHeaders: [ "Content-Type", "Authorization" ],
            credentials: true
        }
    })

    io.use(async (socket, next) => {

        const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

        if (!cookies.token) {
            next(new Error("Authentication error: No token provided"));
        }

        try {

            const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

            const user = await userModel.findById(decoded.userId);

            socket.user = user

            next()

        } catch (err) {
            next(new Error("Authentication error: Invalid token"));
        }

    })

    io.on("connection", (socket) => {
        console.log(`✅ User connected: ${socket.user.email}`);

        socket.on("ai-message", async (messagePayload) => {
            try {
                console.log(`📩 Message received from ${socket.user.email}: "${messagePayload.content?.substring(0, 50)}..."`);

                /* messagePayload = { chat:chatId, content:message text } */
                
                // Validate message content
                if (!messagePayload.content || messagePayload.content.trim() === "") {
                    socket.emit('error', { message: "Message content cannot be empty" });
                    return;
                }

                const [ message, vectors ] = await Promise.all([
                    messageModel.create({
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        content: messagePayload.content,
                        role: "user"
                    }),
                    aiService.generateVector(messagePayload.content),
                ]);

                console.log(`✅ User message saved, embedding generated (${vectors.length} dims)`);

                await createMemory({
                    vectors,
                    messageId: message._id.toString(),
                    metadata: {
                        chat: messagePayload.chat,
                        user: socket.user._id.toString(),
                        text: messagePayload.content
                    }
                });

                console.log(`✅ Memory stored in vector DB`);

                const [ memory, chatHistory ] = await Promise.all([

                    queryMemory({
                        queryVector: vectors,
                        limit: 3,
                        metadata: {
                            user: socket.user._id.toString()
                        }
                    }),

                    messageModel.find({
                        chat: messagePayload.chat
                    }).sort({ createdAt: -1 }).limit(20).lean().then(messages => messages.reverse())
                ]);

                console.log(`✅ Retrieved ${chatHistory.length} history messages, ${memory.length} memory matches`);

                const stm = chatHistory.map(m => ({
                    role: m.role === "model" ? "model" : "user",
                    parts: [{ text: m.content }]
                }));

               const ltm = {
  role: "system",
  parts: [{
    text: `
You are an AI assistant.

Below is background memory from earlier conversations.
This memory may or may not be relevant.

Rules:
- Do NOT respond to this memory directly.
- Use it only if it helps answer the user's latest message.
- The user's last message is always the highest priority.

Long-term memory:
${memory.map(m => "- " + m.metadata.text).join("\n")}
`
  }]
};

                console.log(`🤖 Generating AI response...`);
                const response = await aiService.generateResponse([
  ltm,
  ...stm
]);

                console.log(`✅ AI response generated: "${response.substring(0, 50)}..."`,response);

                // Validate AI response before saving
                if (!response || response.trim() === "") {
                    console.error("❌ Empty AI response received");
                    socket.emit('error', { message: "AI generated an empty response" });
                    return;
                }

                socket.emit('ai-response', {
                    content: response,
                    chat: messagePayload.chat
                });

                const [ responseMessage, responseVectors ] = await Promise.all([
                    messageModel.create({
                        chat: messagePayload.chat,
                        user: socket.user._id,
                        content: response,
                        role: "model"
                    }),
                    aiService.generateVector(response)
                ]);

                console.log(`✅ AI message saved to DB`);

                await createMemory({
                    vectors: responseVectors,
                    messageId: responseMessage._id.toString(),
                    metadata: {
                        chat: messagePayload.chat,
                        user: socket.user._id.toString(),
                        text: response
                    }
                });

                console.log(`✅ AI response memory stored`);

            } catch (error) {
                console.error("❌ Error in ai-message handler:", error);
                socket.emit('error', { 
                    message: "Failed to process message",
                    details: error.message 
                });
            }
        });

        socket.on("disconnect", () => {
            console.log(`👋 User disconnected: ${socket.user.email}`);
        });
    });
}