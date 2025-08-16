import http from 'node:http';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';

import env from './config/env';
import { connectToDatabase } from './config/db';
import apiRouter from './routes';

const app = express();

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.json({ name: 'HackMate API', version: '0.1.0' });
});

app.use('/api', apiRouter);

// Not Found
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const httpServer = http.createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: { origin: env.clientOrigin, credentials: true },
});

io.on('connection', (socket) => {
  socket.on('join_team', (teamId: string) => {
    if (teamId) socket.join(`team:${teamId}`);
  });

  socket.on('leave_team', (teamId: string) => {
    if (teamId) socket.leave(`team:${teamId}`);
  });

  socket.on('message', (data: { teamId: string; text: string; authorId: string }) => {
    if (data?.teamId && data?.text) {
      io.to(`team:${data.teamId}`).emit('message', { ...data, at: new Date().toISOString() });
    }
  });
});

(async () => {
  await connectToDatabase();
  httpServer.listen(env.port, () => {
    console.log(`HackMate API listening on http://localhost:${env.port}`);
  });
})();

export { app, httpServer };