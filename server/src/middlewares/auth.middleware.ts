import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token';
import { UnauthorizedError } from '../utils/errors';
import User from '../models/user.model';

export interface AuthRequest extends Request {
  user?: User;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new UnauthorizedError('Not authorized to access this route'));
    }

    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new UnauthorizedError('The user belonging to this token does no longer exist.'));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
