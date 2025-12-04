import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";
import * as aiService from "../service/ai.service.js";

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
      const responseText = await aiService.generateResponse(messagePayload.content);

      // Send back to client
      socket.emit("ai-response", {
        content: responseText,
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
