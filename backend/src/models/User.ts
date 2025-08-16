import { Schema, model, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'Leader' | 'Developer' | 'Designer' | 'Researcher' | 'Member';

export interface User {
	name: string;
	email: string;
	passwordHash: string;
	role: UserRole;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserMethods {
	comparePassword(plain: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<User, UserMethods>;

export type UserModelType = Model<User, {}, UserMethods>;

const UserSchema = new Schema<User, UserModelType, UserMethods>(
	{
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true, index: true },
		passwordHash: { type: String, required: true },
		role: { type: String, enum: ['Leader', 'Developer', 'Designer', 'Researcher', 'Member'], default: 'Member' },
	},
	{ timestamps: true }
);

UserSchema.methods.comparePassword = async function (plain: string): Promise<boolean> {
	return bcrypt.compare(plain, this.passwordHash);
};

export const UserModel = model<User, UserModelType>('User', UserSchema);