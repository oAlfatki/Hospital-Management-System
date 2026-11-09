import type { Result } from '@/src/core/types/result';
import { authApi } from '../api/authApi';
import { UserMapper } from '@/src/features/users/mappers/userMapper';
import type { User } from '@/src/features/users/types/User';
export const authService = {
  getSession: async (): Promise<User> => UserMapper.toDomain(await authApi.getSession()),
  logout: (): Promise<void> => authApi.logout(),
  async login(email: string, password: string): Promise<Result<User>> {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.user) return { success: true, data: UserMapper.toDomain(res.user) };
      return { success: false, error: { message: res.error || 'فشل تسجيل الدخول' } };
    } catch (error) {
      return { success: false, error: { message: error instanceof Error ? error.message : 'فشل تسجيل الدخول' } };
    }
  },
};
