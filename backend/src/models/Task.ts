import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export type TaskStatus = 'Pending' | 'In Progress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
	teamId: Types.ObjectId;
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	deadline?: Date;
	assignedTo?: Types.ObjectId; // User
	dependencies: Types.ObjectId[]; // Task references
	createdBy: Types.ObjectId; // User
	createdAt: Date;
	updatedAt: Date;
}

export type TaskDocument = HydratedDocument<Task>;
export type TaskModelType = Model<Task>;

const TaskSchema = new Schema<Task, TaskModelType>(
	{
		teamId: { type: Schema.Types.ObjectId, ref: 'Team', required: true, index: true },
		title: { type: String, required: true },
		description: { type: String },
		status: { type: String, enum: ['Pending', 'In Progress', 'Done'], default: 'Pending', index: true },
		priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
		deadline: { type: Date },
		assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
		dependencies: { type: [Schema.Types.ObjectId], ref: 'Task', default: [] },
		createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
	},
	{ timestamps: true }
);

export const TaskModel = model<Task, TaskModelType>('Task', TaskSchema);