import jwt, { SignOptions } from 'jsonwebtoken';

interface Payload {
  id: string;
}

export const generateAccessToken = (payload: Payload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET || 'secret', options);
};

export const generateRefreshToken = (payload: Payload): string => {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'refresh_secret', options);
};

export const verifyAccessToken = (token: string): Payload => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret') as Payload;
};

export const verifyRefreshToken = (token: string): Payload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'refresh_secret') as Payload;
};
