import React, { useState } from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button, Input, useToast } from '@/src/core';
import { Lock, Mail, HelpCircle, AlertTriangle, Key } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('toastEmailPasswordRequired'));
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      toast.success(t('toastSuccessfullyAuthenticated'));
    } else {
      setErrorMessage(res.error || t('toastAuthenticationFailed'));
      toast.error(res.error || t('toastInvalidCredentials'));
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        
        {/* Email Login Input */}
        <div>
          <Input
            label={t('staffEmailAddress')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. physician@hms.com"
            required
            autoComplete="email"
          />
        </div>

        {/* Password Login Input */}
        <div>
          <Input
            label={t('staffSecurityPassword')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {/* Lockout or auth error feedback alerts */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full h-10 font-bold"
          disabled={loading}
        >
          {loading ? t('verifyingCredentials') : t('signInToPortal')}
        </Button>
      </form>

    </div>
  );
};
