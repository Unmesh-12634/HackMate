import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { createServer } from "./server";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    fs: {
      allow: ["./client", "./shared"],
      deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**", "server/**"],
    },
  },
  build: {
    outDir: "dist/spa",
  },
  plugins: [react(), expressPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
}));

function expressPlugin(): Plugin {
  return {
    name: "express-plugin",
    apply: "serve", // Only apply during development (serve mode)
    configureServer(server) {
      const httpServer = createServer();

      // Start the HTTP server on a separate port for Socket.io
      const port = 3001;
      httpServer.listen(port, () => {
        console.log(`🔧 Express + Socket.io server running on port ${port}`);
      });

      // Proxy API requests to the Express server
      server.middlewares.use('/api', (req, res, next) => {
        req.url = req.url || '';
        const proxyUrl = `http://localhost:${port}${req.url}`;

        // Simple proxy implementation
        import('node:http').then(({ default: http }) => {
          const proxyReq = http.request(proxyUrl, {
            method: req.method,
            headers: req.headers
          }, (proxyRes) => {
            res.writeHead(proxyRes.statusCode!, proxyRes.headers);
            proxyRes.pipe(res);
          });

          req.pipe(proxyReq);
        });
      });
    },
  };
}
