import { Request, Response, NextFunction } from 'express';
import { verifyToken, isTokenBlacklisted } from '../services/tokenBlacklist';

export interface AuthRequest extends Request {
    userId?: string;
}

export const verifyTokenMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    let token = req.cookies?.token;

    if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Access denied. No token provided.' });
        return;
    }

    try {
        const isBlacklisted = await isTokenBlacklisted(token);
        if (isBlacklisted) {
            res.status(401).json({ message: 'Token has been invalidated.' });
            return;
        }

        const decoded = verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};