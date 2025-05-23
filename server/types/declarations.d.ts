// Declaration file for modules without type definitions

declare module 'bcryptjs';
declare module 'cors';
declare module 'multer';
declare module 'express-rate-limit';

// Express type augmentation
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
