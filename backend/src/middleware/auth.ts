import type { Request, Response, NextFunction } from 'express';
import { verifyJwt } from '../utils/jwt';
import type { JwtUserPayload } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
	user?: JwtUserPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
	const authHeader = req.headers.authorization;
	const tokenFromHeader = authHeader?.startsWith('Bearer ')
		? authHeader.slice('Bearer '.length).trim()
		: undefined;
	const token = tokenFromHeader || (req.cookies?.token as string | undefined);
	if (!token) {
		res.status(401).json({ error: 'Unauthorized' });
		return;
	}
	const payload = verifyJwt<JwtUserPayload>(token);
	if (!payload) {
		res.status(401).json({ error: 'Invalid token' });
		return;
	}
	req.user = payload;
	next();
}