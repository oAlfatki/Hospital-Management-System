import React, { useState } from 'react';
import { useAuth, useLanguage } from '@/src/core/providers';
import { Button, Input, useToast } from '@/src/core';
import { Lock, Mail, HelpCircle, AlertTriangle, Key } from 'lucide-react';

const PRESETS = [
  { label: 'Admin', email: 'admin@hms.com', pass: 'Admin123!', color: 'bg-red-50 border-red-200 text-red-700' },
  { label: 'Doctor', email: 'doctor@hms.com', pass: 'Doctor123!', color: 'bg-green-50 border-green-200 text-green-700' },
  { label: 'Nurse', email: 'nurse@hms.com', pass: 'Nurse123!', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { label: 'Accounts', email: 'accounts@hms.com', pass: 'Accounts123!', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { label: 'Management', email: 'mgmt@hms.com', pass: 'Mgmt123!', color: 'bg-purple-50 border-purple-200 text-purple-700' },
];

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

  const applyPreset = (em: string, ps: string) => {
    setEmail(em);
    setPassword(ps);
    setErrorMessage(null);
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

      {/* Usability Shortcut Presets for Examiners */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 justify-center">
          <Key className="h-3.5 w-3.5 text-blue-600" />
          {t('hmsRoleBasedAccountPresets')}
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => applyPreset(preset.email, preset.pass)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border hover:scale-[1.03] transition-all cursor-pointer ${preset.color}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
