import 'express';

export interface User {
  id: string;
  username: string;
  // Add other user fields as needed
}

declare module 'express' {
  export interface Request {
    user?: User;
  }
} 