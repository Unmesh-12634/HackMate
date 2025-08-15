import "dotenv/config";
import { createServer } from "./index";

const port = 3001;
const httpServer = createServer();

httpServer.listen(port, () => {
  console.log(`🔧 Socket.io development server running on port ${port}`);
  console.log(`💬 Real-time chat available at http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down Socket.io server gracefully");
  httpServer.close(() => {
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down Socket.io server gracefully");
  httpServer.close(() => {
    process.exit(0);
  });
});
