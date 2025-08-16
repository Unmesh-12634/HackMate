import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export type TeamRole = 'Leader' | 'Developer' | 'Designer' | 'Researcher' | 'Member';

export interface TeamMember {
	userId: Types.ObjectId;
	role: TeamRole;
	responsibilities?: string;
}

export interface Team {
	name: string;
	description?: string;
	competitionName?: string;
	deadline?: Date;
	members: TeamMember[];
	createdBy: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

export type TeamDocument = HydratedDocument<Team>;
export type TeamModelType = Model<Team>;

const TeamMemberSchema = new Schema<TeamMember>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		role: { type: String, enum: ['Leader', 'Developer', 'Designer', 'Researcher', 'Member'], required: true },
		responsibilities: { type: String },
	},
	{ _id: false }
);

const TeamSchema = new Schema<Team, TeamModelType>(
	{
		name: { type: String, required: true },
		description: { type: String },
		competitionName: { type: String },
		deadline: { type: Date },
		members: { type: [TeamMemberSchema], default: [] },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ timestamps: true }
);

export const TeamModel = model<Team, TeamModelType>('Team', TeamSchema);