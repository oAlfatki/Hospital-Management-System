import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.email({ message: 'Invalid email format' }),
  role: z.enum(['Admin', 'Doctor', 'Nurse', 'Accounts', 'Management'], {
    message: 'Please select a valid role',
  }),
  contactNumber: z.string().min(10, { message: 'Contact number must be at least 10 digits' }),
  status: z.enum(['Active', 'Inactive']),
  department: z.string().optional().nullable(),
});
