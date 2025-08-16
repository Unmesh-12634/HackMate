import dotenv from 'dotenv';

dotenv.config();

export type NodeEnvironment = 'development' | 'production' | 'test';

function parsePort(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const env = {
  nodeEnv: (process.env.NODE_ENV as NodeEnvironment) || 'development',
  port: parsePort(process.env.PORT, 4000),
  mongoUri: process.env.MONGO_URI || '',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
};

export default env;