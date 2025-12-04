import { Server } from "socket.io";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

export default function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // 🔒 AUTH MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const rawCookie = socket.handshake.headers.cookie;

      if (!rawCookie) {
        return next(new Error("No cookies found"));
      }

      const cookies = cookie.parse(rawCookie);

      if (!cookies.token) {
        return next(new Error("Authentication error: No token found"));
      }

      // ✔ Verify JWT
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      // ✔ Fetch user from database (IMPORTANT: await) //userId comes from jwt payload 
      const user = await User.findById(decoded.userId).select("-password");

      if (!user) {
        return next(new Error("User not found"));
      }

      // Attach real user object to socket
      socket.user = user;

      next(); // allow connection
    } catch (err) {
      console.log("Socket Auth Error:", err.message);
      return next(new Error("Authentication error"));
    }
  });


  io.on("connection", (socket) => {
    socket.on("ai-message", async(messagePayload) => {
      console.log("Received ai-message:", messagePayload);
    });
  });

  // 🔌 CONNECTION EVENT
  io.on("connection", (socket) => {
    console.log("🟢 New User Connected:", socket.id, "User:", socket.user.email);

    // Example event (optional)
    socket.on("ai-message", (data) => {
      console.log("Message from user:", socket.user._id, data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 User Disconnected:", socket.id);
    });
  });

  return io;
}
