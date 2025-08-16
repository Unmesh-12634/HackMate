import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import env from '../config/env';

export interface JwtUserPayload {
  userId: string;
  role?: string;
}

export function signJwt(payload: JwtUserPayload, options: SignOptions = {}): string {
  return jwt.sign(payload, env.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: options.expiresIn || '7d',
    ...options,
  });
}

export function verifyJwt<T = unknown>(token: string): T | null {
  try {
    return jwt.verify(token, env.jwtSecret) as T;
  } catch (_err) {
    return null;
  }
}