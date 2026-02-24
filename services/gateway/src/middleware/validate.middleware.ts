import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Generic Zod validation middleware
 * Usage: router.post('/route', validate(MySchema), controller.handler)
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        res.status(400).json({
          status: 'error',
          message: 'Validation failed',
          errors,
        });
        return;
      }

      next(error);
    }
  };
}