import { Router } from 'express';
import { getAllTasks, createTask, updateTaskStatus, deleteTask } from '../controllers/taskController';
import { verifyTokenMiddleware } from '../middleware/auth';

const router = Router();

router.use(verifyTokenMiddleware);

router.get('/', getAllTasks);
router.post('/', createTask);
router.put('/:id', updateTaskStatus);
router.delete('/:id', deleteTask);

export default router;