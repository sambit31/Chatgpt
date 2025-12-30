/* ============================
   📦 IMPORTS
============================ */
import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";

import { User } from "../models/user.models.js";
import { MessageModel } from "../models/message.model.js";

import * as aiService from "../service/ai.service.js";
import {createMemoryVector,queryMemoryVector} from "../service/vector.service.js";


/* ============================
   🚀 SOCKET SERVER INIT
============================ */
export default function initSocketServer(httpServer) {

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      credentials: true,
      methods: ["GET", "POST"]
    }
  });


  /* ============================
     🔐 JWT AUTH MIDDLEWARE
  ============================ */
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;
      if (!rawCookie) return next(new Error("No cookies found"));

      const cookies = cookie.parse(rawCookie);
      if (!cookies.token) return next(new Error("Token missing in cookies"));

      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await User
        .findById(decoded.userId)
        .select("-password");

      if (!user) return next(new Error("User not found"));

      socket.user = user;
      next();

    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      next(new Error("Authentication failed"));
    }
  });


  /* ============================
     🔌 SOCKET CONNECTION
  ============================ */
  io.on("connection", (socket) => {
    console.log(`🟢 User Connected: ${socket.id} (${socket.user.email})`);


    /* ============================
       🤖 AI MESSAGE HANDLER
    ============================ */
    socket.on("ai-message", async (messagePayload) => {
      console.log("Received:", messagePayload);

         /* ============================
         1️⃣ SAVE USER MESSAGE (STM)
      ============================ */
      const userMessage = await MessageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user"
      });

      /* ============================
         2️⃣ VECTORIZE USER INPUT
      ============================ */
      const vectors = await aiService.generateVector(
        messagePayload.content
      );


      /* ============================
         3️⃣ QUERY LONG-TERM MEMORY
      ============================ */
     /* ============================
   3️⃣ QUERY LONG-TERM MEMORY
============================ */
const memory = await queryMemoryVector({
  queryVector: vectors,
  limit: 3,
  metadata: {
    userId: socket.user._id.toString(),
    chatId: messagePayload.chat,
    type: "answer"
  }
});

/* ✅ FILTER HIGH-SIMILARITY (SELF-ECHO) */
const filteredMemory = memory.filter(m => m.score < 0.98);

console.log("Filtered Memory:", filteredMemory);


   

      /* ============================
         4️⃣ FETCH CHAT HISTORY (STM)
      ============================ */
      const chatHistory = await MessageModel.find({
        chat: messagePayload.chat
      })
        .sort({ createdAt: 1 })
        .limit(20)
        .lean();


      /* ============================
         5️⃣ FORMAT SHORT-TERM MEMORY
      ============================ */
    /*  const geminiMessages = chatHistory.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }));*/


     /* ============================
   🧹 FILTER DUPLICATE / TOO-SIMILAR MEMORY
===========================

/* ============================
   6️⃣ FORMAT LONG-TERM MEMORY
============================ */
const ltm = filteredMemory.length
  ? [{
      role: "system",
      parts: [{
        text: `Use the following past information only if relevant:\n\n${filteredMemory
          .map(m => m.metadata.text)
          .join("\n")}`
      }]
    }]
  : [];


      /* ============================
         7️⃣ FILTER USER STM (SAFETY)
      ============================ */
      const stm = chatHistory
        .slice(-3)
        .filter(msg => msg.role === "user")
        .map(msg => ({
          role: "user",
          parts: [{ text: msg.content }]
        }));


      /* ============================
         8️⃣ RAG → AI RESPONSE
      ============================ */
      const response = await aiService.generateResponse(
        ...ltm,
        ...stm
        //...geminiMessages
      );


      /* ============================
         9️⃣ SAVE AI RESPONSE (STM)
      ============================ */
      const aiMessage = await MessageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model"
      });


      /* ============================
         🔟 STORE USER LTM
      ============================ */
      await createMemoryVector({
        vector: vectors,
        metadata: {
          type: "question",
          text: messagePayload.content,
          chatId: messagePayload.chat,
          userId: socket.user._id.toString()
        },
        messageId: userMessage._id.toString()
      });


      /* ============================
         1️⃣1️⃣ STORE AI LTM
      ============================ */
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


      /* ============================
         📤 SEND RESPONSE
      ============================ */
      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat
      });

      console.log("AI Response:", response);
    });


    /* ============================
       🔴 DISCONNECT
    ============================ */
    socket.on("disconnect", () => {
      console.log(`🔴 User Disconnected: ${socket.id}`);
    });
  });

  return io;
}
