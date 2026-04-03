import jwt, { SignOptions } from 'jsonwebtoken';

interface Payload {
  id: string;
}

// ─── Secret Resolution ──────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const getAccessSecret = (): string => {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    if (isProduction) throw new Error('[FATAL] JWT_ACCESS_SECRET is not set in production.');
    return 'dev_access_secret_NOT_FOR_PRODUCTION';
  }
  return secret;
};

const getRefreshSecret = (): string => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (isProduction) throw new Error('[FATAL] JWT_REFRESH_SECRET is not set in production.');
    return 'dev_refresh_secret_NOT_FOR_PRODUCTION';
  }
  return secret;
};

// ─── Token Utilities ─────────────────────────────────────────────────────────

export const generateAccessToken = (payload: Payload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getAccessSecret(), options);
};

export const generateRefreshToken = (payload: Payload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, getRefreshSecret(), options);
};

export const verifyAccessToken = (token: string): Payload => {
  return jwt.verify(token, getAccessSecret()) as Payload;
};

export const verifyRefreshToken = (token: string): Payload => {
  return jwt.verify(token, getRefreshSecret()) as Payload;
};
