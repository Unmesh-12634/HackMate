import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface Message {
	teamId: Types.ObjectId;
	authorId: Types.ObjectId;
	text: string;
	createdAt: Date;
	updatedAt: Date;
}

export type MessageDocument = HydratedDocument<Message>;
export type MessageModelType = Model<Message>;

const MessageSchema = new Schema<Message, MessageModelType>(
	{
		teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
		authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		text: { type: String, required: true },
	},
	{ timestamps: true }
);

export const MessageModel = model<Message, MessageModelType>('Message', MessageSchema);