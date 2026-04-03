import { z } from 'zod';

import redisClient from '../../config/redis';
import userRepository from '../../repositories/user.repository';
import { ConflictError, UnauthorizedError } from '../../utils/errors';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/token';

import { registerSchema, loginSchema } from './auth.validation';

type RegisterInput = z.infer<typeof registerSchema>['body'];
type LoginInput = z.infer<typeof loginSchema>['body'];

export const register = async (userData: RegisterInput) => {
  const existingUser = await userRepository.findByEmail(userData.email);
  if (existingUser) {
    throw new ConflictError('Email already in use');
  }

  const user = await userRepository.create(userData);

  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  // Store refresh token in Redis
  await redisClient.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

export const login = async (loginData: LoginInput) => {
  const user = await userRepository.findByEmail(loginData.email);

  if (!user || !(await user.validatePassword(loginData.password))) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken({ id: user.id });
  const refreshToken = generateRefreshToken({ id: user.id });

  await redisClient.set(`refresh_token:${user.id}`, refreshToken, 'EX', 7 * 24 * 60 * 60);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};

export const refresh = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  const targetToken = await redisClient.get(`refresh_token:${decoded.id}`);

  if (targetToken !== refreshToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await userRepository.findById(decoded.id);
  if (!user) {
    throw new UnauthorizedError('User no longer exists');
  }

  const newAccessToken = generateAccessToken({ id: user.id });
  const newRefreshToken = generateRefreshToken({ id: user.id });

  await redisClient.set(`refresh_token:${user.id}`, newRefreshToken, 'EX', 7 * 24 * 60 * 60);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logout = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);

  const targetToken = await redisClient.get(`refresh_token:${decoded.id}`);

  if (targetToken === refreshToken) {
    await redisClient.del(`refresh_token:${decoded.id}`);
  }
};
