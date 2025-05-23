// Express type extensions
import { User } from './schema.js';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export {};
