import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createHttpServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import multer from "multer";
import path from "path";
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

  // Configure multer for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/'); // Store files in uploads directory
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB limit
    },
    fileFilter: (req, file, cb) => {
      // Allow common file types
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|mp4|mov|avi|mp3|wav/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only images, documents, videos, and audio files are allowed!'));
      }
    }
  });

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Serve uploaded files statically
  app.use('/uploads', express.static('uploads'));

  // File upload endpoint
  app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileData = {
      filename: req.file.filename,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`
    };

    res.json(fileData);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  return httpServer;
}
