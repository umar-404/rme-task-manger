import mongoose, { Document, Schema } from 'mongoose';

export interface IBlacklistedToken extends Document {
    token: string;
    expiresAt: Date;
}

const BlacklistedTokenSchema = new Schema<IBlacklistedToken>({
    token: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true }
});

BlacklistedTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const BlacklistedToken = mongoose.model<IBlacklistedToken>('BlacklistedToken', BlacklistedTokenSchema);