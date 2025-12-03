import { Response, NextFunction } from 'express';
import { getAuth } from '../config/firebase';
import { logger } from '../services/logger';
import { AuthenticatedRequest } from '../types';

/**
 * Middleware to verify Firebase ID token
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: No token provided',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token format',
      });
      return;
    }

    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };

      logger.debug(`Authenticated user: ${decodedToken.uid}`);
      next();
    } catch (error) {
      logger.error('Token verification failed:', error);
      res.status(401).json({
        success: false,
        error: 'Unauthorized: Invalid token',
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

/**
 * Optional auth middleware - doesn't fail if no token provided
 */
export const optionalAuthMiddleware = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token) {
      next();
      return;
    }

    try {
      const auth = getAuth();
      const decodedToken = await auth.verifyIdToken(token);

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };

      logger.debug(`Optionally authenticated user: ${decodedToken.uid}`);
    } catch (error) {
      logger.debug('Optional auth: Invalid token, continuing without auth');
    }

    next();
  } catch (error) {
    logger.error('Optional auth middleware error:', error);
    next();
  }
};

export default authMiddleware;
