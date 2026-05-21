import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth';
import taskRoutes from './routes/tasks';
import { verifyTokenMiddleware, AuthRequest } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task_manager_db';

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/protected', verifyTokenMiddleware, (req: AuthRequest, res) => {
    res.json({ message: 'You accessed a protected route', userId: req.userId });
});

app.get('/', (_req, res) => {
    res.send('Task Manager API is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});