import { z } from 'zod';

export const loginSchema = z.object({
  email: z.email({ message: 'Invalid email address format' }),
  password: z.string().min(4, { message: 'Password must be at least 4 characters long' }),
});
