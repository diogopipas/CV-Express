import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Omit<Request, 'user'> {
  user?: IUser;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]?.trim();

      // Validate token exists and is not empty
      if (!token) {
        return res.status(401).json({ message: 'Not authorized, invalid token format' });
      }

      // Verify token
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // Get user from token
      (req as AuthRequest).user = (await User.findById(decoded.id).select('-password')) as IUser;

      if (!(req as AuthRequest).user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error: any) {
      // Reduce noise for common JWT errors that indicate token issues requiring re-authentication
      // These are expected when tokens are expired, malformed, or signed with a different secret
      const shouldLog = error.name !== 'JsonWebTokenError' || 
        (error.message !== 'jwt malformed' && error.message !== 'invalid signature');
      
      if (shouldLog) {
        console.error('Auth middleware error:', error);
      }
      
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

