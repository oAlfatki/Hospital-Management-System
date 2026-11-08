import { Result } from '@/src/core/types/result';
import { authApi } from '../api/authApi';
import type { User } from '@/src/features/users/types/User';

export interface AuthSession {
  user: User | null;
  failedAttempts: number;
  lockedUntil?: string;
}

const SESSION_KEY = 'hms_auth_session';

export const authService = {
  getCurrentSession(): AuthSession {
    try {
      const sessionStr = localStorage.getItem(SESSION_KEY);
      if (!sessionStr) {
        const initial: AuthSession = { user: null, failedAttempts: 0 };
        localStorage.setItem(SESSION_KEY, JSON.stringify(initial));
        return initial;
      }
      return JSON.parse(sessionStr);
    } catch {
      return { user: null, failedAttempts: 0 };
    }
  },

  async login(emailStr: string, passwordStr: string): Promise<Result<User>> {
    console.log("start authApi");
    try {
      const res = await authApi.login(emailStr, passwordStr);
      if (res.success && res.user) {
        return { success: true, data: res.user };
      }
      return {
        success: false,
        error: { message: res.error || 'فشل تسجيل الدخول' }
      };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.message || 'حدث خطأ غير متوقع' }
      };
    }
  },

  async logout(): Promise<Result<void>> {
    try {
      const cleared: AuthSession = { user: null, failedAttempts: 0 };
      localStorage.setItem(SESSION_KEY, JSON.stringify(cleared));
      return { success: true, data: undefined };
    } catch (err: any) {
      return {
        success: false,
        error: { message: err.message || 'Error logging out' }
      };
    }
  }
};
