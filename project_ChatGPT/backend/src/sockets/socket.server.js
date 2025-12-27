import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import * as aiService from "../service/ai.service.js";
import { MessageModel } from "../models/message.model.js";
import { createMemoryVector } from "../service/vector.service.js";
import { queryMemoryVector } from "../service/vector.service.js";


export default function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  // 🔒 JWT AUTH MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("No cookies found"));

      const cookies = cookie.parse(rawCookie);
      if (!cookies.token) return next(new Error("Token missing in cookies"));

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("-password");
      if (!user) return next(new Error("User not found"));

      socket.user = user;

      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      next(new Error("Authentication failed"));
    }
  });

  // 🔌 ON USER CONNECTED
  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id} (${socket.user.email})`);

    // AI MESSAGE EVENT
    socket.on("ai-message", async (messagePayload) => {
      console.log("Received:", messagePayload);

      // Generate AI response
     // const responseText = await aiService.generateResponse(messagePayload.content);

      const vectors = await aiService.generateVector(messagePayload.content);
      console.log("Generated Vectors:", vectors);

      // Save user message
      const userMessage = await MessageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: 'user'
      });
 
  // 2️⃣ Fetch recent history
  const chatHistory = await MessageModel.find({
    chat: messagePayload.chat
  }).sort({ createdAt: 1 }).limit(20).lean();

  // 3️⃣ Convert to Gemini format
  const geminiMessages = chatHistory.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.content }]
  }));

     
// 4️⃣ Generate AI response
  const response = await aiService.generateResponse(geminiMessages);

// 5️⃣ Save AI response
    const aiMessage = await MessageModel.create({
    chat: messagePayload.chat,
    user: socket.user._id,
    content: response,
    role: "model"
  });

// 8️⃣ Store memory vectors
    await createMemoryVector({
    vector: vectors,
    metadata: {
      type: "question",
      text: messagePayload.content,
      chatId: messagePayload.chat,
      userId: socket.user._id.toString(),
    },
    messageId: userMessage._id.toString()
  });


// 6️⃣ Store vector memory
  const responsevectors = await aiService.generateVector(response);

  await createMemoryVector({
    vector: responsevectors,
    metadata: {
     type: "answer",
        text: response,
        chatId: messagePayload.chat,
        userId: socket.user._id.toString()
    },
    messageId: aiMessage._id.toString()
  });


       console.log("AI Response:", response);//responseText
      // Send back to client
      socket.emit("ai-response", {
        //content: responseText,
        content: response,
        chat: messagePayload.chat,
      });
    });

    // 🔴 DISCONNECT EVENT
    socket.on("disconnect", () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);
    });
  });

  return io;
}
