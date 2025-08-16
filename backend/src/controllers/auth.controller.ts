import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserModel } from '../models/User';
import { signJwt } from '../utils/jwt';

const registerSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(['Leader', 'Developer', 'Designer', 'Researcher', 'Member']).optional(),
});

const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export async function register(req: Request, res: Response): Promise<void> {
	const parsed = registerSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
		return;
	}
	const { name, email, password, role } = parsed.data;

	const existing = await UserModel.findOne({ email }).lean();
	if (existing) {
		res.status(409).json({ error: 'Email already in use' });
		return;
	}

	const passwordHash = await bcrypt.hash(password, 10);
	const user = await UserModel.create({ name, email, passwordHash, role: role || 'Member' });

	const token = signJwt({ userId: user._id.toString(), role: user.role });
	res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function login(req: Request, res: Response): Promise<void> {
	const parsed = loginSchema.safeParse(req.body);
	if (!parsed.success) {
		res.status(400).json({ error: 'Invalid payload', details: parsed.error.flatten() });
		return;
	}
	const { email, password } = parsed.data;
	const user = await UserModel.findOne({ email });
	if (!user) {
		res.status(401).json({ error: 'Invalid credentials' });
		return;
	}
	const ok = await user.comparePassword(password);
	if (!ok) {
		res.status(401).json({ error: 'Invalid credentials' });
		return;
	}
	const token = signJwt({ userId: user._id.toString(), role: user.role });
	res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function me(_req: Request, res: Response): Promise<void> {
	res.json({ ok: true });
}