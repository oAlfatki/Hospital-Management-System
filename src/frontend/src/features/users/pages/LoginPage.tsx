import { loginSchema } from "../validation/loginSchema";
import { yupResolver } from "@hookform/resolvers/yup";

import { useForm, type SubmitHandler } from "react-hook-form";
import type { ILoginFormInput } from "../types/LoginIFormInput";
import { LOGIN_FORM } from "../types/LOGIN_FORM";
import { Input } from "../../../core/components/ui/Input";
import InputErrorMessage from "../../../core/components/ui/InputErrorMessage";
import { useLanguage } from "../../../core/providers/LanguageProvider";

import type { TranslationKey } from "../../../core/locales/i18n";
import { useState } from "react";
import { Button } from "../../../core/components/ui/Button";

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ILoginFormInput>({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<ILoginFormInput> = async (data) => {
    console.log(data);
  };

  const renderLoginForm = () => {
    return LOGIN_FORM.map((input, index) => {
      return (
        <div key={index}>
          <Input
            label={t(input.label)}
            type={input.type}
            placeholder={input.placeholder}
            autoComplete={input.name}
            {...register(input.name, input.validation)}
          />
          {errors[input.name] && (
            <InputErrorMessage
              msg={t(errors[input.name]?.message! as TranslationKey)}
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold">
        Login to get access!
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {renderLoginForm()}

        <Button
          type="submit"
          className="w-full h-10 font-bold"
          disabled={isLoading}
        >
          {isLoading ? t("verifyingCredentials") : t("signInToPortal")}
        </Button>
      </form>
    </div>

    /*<div className="space-y-6">
      <form onSubmit={handleFormSubmit} className="space-y-4">
        
        {//Email Login Input }
        <div>
          <Input
            label={t('staffEmailAddress')}
            type="email"
            value={email}
            onChange={(e : React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="e.g. physician@hms.com"
            required
            autoComplete="email"
          />
        </div>

        {// Password Login Input }
        <div>
          <Input
            label={t('staffSecurityPassword')}
            type="password"
            value={password}
            onChange={(e : React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        {// Lockout or auth error feedback alerts }
        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-lg flex items-start gap-2 text-rose-700 dark:text-rose-400">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-semibold leading-relaxed">{errorMessage}</p>
          </div>
        )}

        {// Submit }
        <Button
          type="submit"
          className="w-full h-10 font-bold"
          disabled={loading}
        >
          {loading ? t('verifyingCredentials') : t('signInToPortal')}
        </Button>
      </form>

      {// Usability Shortcut Presets for Examiners }
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
    </div>*/
  );
};
