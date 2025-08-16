import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export type ResourceType = 'link' | 'file';

export interface Resource {
	teamId: Types.ObjectId;
	type: ResourceType;
	title: string;
	url?: string; // for links
	filePath?: string; // for files stored locally
	pinned: boolean;
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export type ResourceDocument = HydratedDocument<Resource>;
export type ResourceModelType = Model<Resource>;

const ResourceSchema = new Schema<Resource, ResourceModelType>(
	{
		teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
		type: { type: String, enum: ['link', 'file'], required: true },
		title: { type: String, required: true },
		url: { type: String },
		filePath: { type: String },
		pinned: { type: Boolean, default: false },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ timestamps: true }
);

export const ResourceModel = model<Resource, ResourceModelType>('Resource', ResourceSchema);