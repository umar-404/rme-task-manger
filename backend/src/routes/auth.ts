import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController';
import { verifyTokenMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyTokenMiddleware, getMe);

export default router;