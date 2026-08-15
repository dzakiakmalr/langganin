"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";

// Zod messages are i18n keys under the "Register" namespace.
const signUpSchema = z
  .object({
    full_name: z.string().min(1, "fullNameRequired"),
    email: z.string().min(1, "emailRequired").email("emailInvalid"),
    password: z.string().min(6, "passwordLength"),
    confirm_password: z.string().min(1, "passwordRequired"),
  })
  .refine((v) => v.password === v.confirm_password, {
    message: "passwordMismatch",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const t = useTranslations("Register");
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(signUpSchema) as never,
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
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
    setSuccess(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.full_name } },
    });

    if (error) {
      const key =
        error.code === "user_already_exists" ? "errorEmailTaken" : "errorGeneric";
      setServerError(t(key));
      return;
    }

    // No session → email confirmation is enabled; ask the user to check email.
    if (data.session) {
      router.replace("/dashboard");
      return;
    }

    setSuccess(t("successCheckEmail"));
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
      {success && (
        <p
          role="status"
          className="rounded-[14px] bg-success/10 px-4 py-2.5 text-sm text-success"
        >
          {success}
        </p>
      )}

      <div>
        <label htmlFor="su-name" className={labelClass}>
          {t("fullName")}
        </label>
        <input
          id="su-name"
          type="text"
          autoComplete="name"
          placeholder={t("fullNamePlaceholder")}
          {...register("full_name")}
          className={inputClass}
        />
        {fieldError(errors.full_name?.message)}
      </div>

      <div>
        <label htmlFor="su-email" className={labelClass}>
          {t("email")}
        </label>
        <input
          id="su-email"
          type="email"
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          {...register("email")}
          className={inputClass}
        />
        {fieldError(errors.email?.message)}
      </div>

      <div>
        <label htmlFor="su-password" className={labelClass}>
          {t("password")}
        </label>
        <input
          id="su-password"
          type="password"
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
          {...register("password")}
          className={inputClass}
        />
        {fieldError(errors.password?.message)}
      </div>

      <div>
        <label htmlFor="su-confirm" className={labelClass}>
          {t("confirmPassword")}
        </label>
        <input
          id="su-confirm"
          type="password"
          autoComplete="new-password"
          placeholder={t("confirmPasswordPlaceholder")}
          {...register("confirm_password")}
          className={inputClass}
        />
        {fieldError(errors.confirm_password?.message)}
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
