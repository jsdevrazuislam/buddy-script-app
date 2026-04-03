import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

import { BadRequestError } from '../utils/errors';

export const validate =
  (schema: ZodSchema) => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        return next(new BadRequestError(message));
      }
      return next(error);
    }
  };
