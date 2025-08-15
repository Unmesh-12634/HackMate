import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();
  const httpServer = createHttpServer(app);

  // Initialize Socket.io
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  // Store active chat rooms and users
  const chatRooms = new Map();
  const userSockets = new Map();

  // Socket.io connection handling
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join team chat room
    socket.on("join_team", (data) => {
      const { teamId, userId, userName } = data;
      socket.join(`team_${teamId}`);

      // Store user info
      userSockets.set(socket.id, { teamId, userId, userName });

      // Notify team members
      socket.to(`team_${teamId}`).emit("user_joined", {
        userId,
        userName,
        message: `${userName} joined the chat`,
        timestamp: new Date().toISOString()
      });
    });

    // Handle chat messages
    socket.on("send_message", (data) => {
      const { teamId, message, userId, userName } = data;

      const messageData = {
        id: Date.now().toString(),
        message,
        userId,
        userName,
        timestamp: new Date().toISOString()
      };

      // Broadcast to all team members including sender
      io.to(`team_${teamId}`).emit("receive_message", messageData);
    });

    // Handle typing indicators
    socket.on("typing", (data) => {
      const { teamId, userId, userName, isTyping } = data;
      socket.to(`team_${teamId}`).emit("user_typing", {
        userId,
        userName,
        isTyping
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      const userData = userSockets.get(socket.id);
      if (userData) {
        const { teamId, userName } = userData;
        socket.to(`team_${teamId}`).emit("user_left", {
          message: `${userName} left the chat`,
          timestamp: new Date().toISOString()
        });
        userSockets.delete(socket.id);
      }
      console.log("User disconnected:", socket.id);
    });
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return httpServer;
}
