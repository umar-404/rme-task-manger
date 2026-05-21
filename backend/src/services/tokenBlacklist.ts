import jwt from 'jsonwebtoken';
import { BlacklistedToken } from '../models/BlacklistedToken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = '7d';

export const blacklistToken = async (token: string): Promise<void> => {
    try {
        const decoded = jwt.decode(token) as { exp?: number } | null;
        let expiresAt = new Date();

        if (decoded && decoded.exp) {
            expiresAt = new Date(decoded.exp * 1000);
        } else {
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            expiresAt = sevenDaysFromNow;
        }

        await BlacklistedToken.create({ token, expiresAt });
    } catch (error) {
        console.error('Error blacklisting token:', error);
    }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
    const found = await BlacklistedToken.findOne({ token });
    return !!found;
};

export const signToken = (userId: string): string => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token: string): { userId: string } => {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
};