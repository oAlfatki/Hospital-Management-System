import type { Result } from '@/src/core/types/result';
import { authApi } from '../api/authApi';
import type { User } from '@/src/features/users/types/User';
export const authService = {
  async login(email: string, password: string): Promise<Result<User>> {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user) return { success: true, data: res.user };
      return { success: false, error: { message: res.error || 'فشل تسجيل الدخول' } };
    } catch (error) {
      return { success: false, error: { message: error instanceof Error ? error.message : 'فشل تسجيل الدخول' } };
    }
  },
};
