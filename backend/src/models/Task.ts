import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    status: 'pending' | 'completed';
    priority: 'Low' | 'Medium' | 'High';
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
    {
        title: { type: String, required: true },
        description: { type: String, default: '' },
        status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
        priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
);

TaskSchema.index({ userId: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);