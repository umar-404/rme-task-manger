import { Response } from 'express';
import { Task } from '../models/Task';
import { AuthRequest } from '../middleware/auth';

export const getAllTasks = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const tasks = await Task.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { title, description, priority } = req.body;

        if (!title || !title.trim()) {
            res.status(400).json({ message: 'Title is required' });
            return;
        }

        const task = await Task.create({
            title: title.trim(),
            description: description?.trim() || '',
            priority: priority || 'Medium',
            userId: req.userId,
        });

        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateTaskStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['pending', 'completed'].includes(status)) {
            res.status(400).json({ message: 'Invalid status' });
            return;
        }

        const task = await Task.findOne({ _id: id, userId: req.userId });

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        task.status = status;
        await task.save();

        res.json(task);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const task = await Task.findOneAndDelete({ _id: id, userId: req.userId });

        if (!task) {
            res.status(404).json({ message: 'Task not found' });
            return;
        }

        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};