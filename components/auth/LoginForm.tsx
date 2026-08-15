"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

// Zod messages are i18n keys under the "Login" namespace.
const loginSchema = z.object({
  email: z.string().min(1, "emailRequired").email("emailInvalid"),
  password: z.string().min(1, "passwordRequired"),
});

type FormValues = z.infer<typeof loginSchema>;

function mapAuthError(code: string | undefined) {
  switch (code) {
    case "invalid_credentials":
      return "errorInvalidCredentials" as const;
    case "email_not_confirmed":
      return "errorEmailNotConfirmed" as const;
    default:
      return "errorGeneric" as const;
  }
}

export default function LoginForm() {
  const t = useTranslations("Login");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema) as never,
    defaultValues: { email: "", password: "" },
  });

  function fieldError(message?: string) {
    if (!message) return null;
    return (
      <p className="mt-1 text-xs text-danger">
        {t(message as Parameters<typeof t>[0])}
      </p>
    );
  }

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(t(mapAuthError(error.code)));
      return;
    }

    router.replace("/dashboard");
  };

  const inputClass =
    "w-full rounded-[14px] bg-surface-soft px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30";
  const labelClass = "mb-1 block text-sm font-medium text-text";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {serverError && (
        <p
          role="alert"
          className="rounded-[14px] bg-danger/10 px-4 py-2.5 text-sm text-danger"
        >
          {serverError}
        </p>
      )}

      <div>
        <label htmlFor="li-email" className={labelClass}>
          {t("email")}
        </label>
        <input
          id="li-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
          className={inputClass}
        />
        {fieldError(errors.email?.message)}
      </div>

      <div>
        <label htmlFor="li-password" className={labelClass}>
          {t("password")}
        </label>
        <input
          id="li-password"
          type="password"
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          {...register("password")}
          className={inputClass}
        />
        {fieldError(errors.password?.message)}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-pill bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover disabled:opacity-50"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
