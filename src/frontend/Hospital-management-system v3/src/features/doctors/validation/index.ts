import { z } from 'zod';

export const doctorSchema = z.object({
  name: z.string().min(2, { message: 'Physician name is required (min 2 chars)' }),
  departmentId: z.string().min(1, { message: 'Please select an active department' }),
  specialty: z.string().min(2, { message: 'Medical specialty is required' }),
  contactNumber: z.string().min(10, { message: 'Contact number must be at least 10 digits' }),
  email: z.email({ message: 'Invalid email address format' }),
  status: z.enum(['Active', 'Inactive']),
});

export const departmentSchema = z.object({
  name: z.string().min(2, { message: 'Department name is required' }),
  headOfDepartment: z.string().min(2, { message: 'Head of department is required' }),
  description: z.string().min(5, { message: 'Please enter a detailed description' }),
});
