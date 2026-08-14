"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SubscriptionInput } from "@/components/subscriptions/SubscriptionsProvider";
import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";
import {
  calculateNextBillingDate,
  calculateTrialEndDate,
} from "@/lib/services/billing-dates";
import { findBrandByName, buildLogoUrl } from "@/lib/brands/brand-registry";
import { STANDARD_PAYMENT_METHODS } from "@/lib/payment-methods";
import { CURRENCIES } from "@/lib/currencies";
import BrandLogo from "@/components/ui/BrandLogo";

// ── Zod schema ──────────────────────────────────────────────────────────
const subscriptionSchema = z.object({
  name: z.string().min(1, "Nama layanan wajib diisi"),
  category_id: z.string().nullable(),
  price: z.coerce.number().positive("Harga harus lebih dari 0"),
  currency: z.string().default("IDR"),
  billing_cycle: z.enum(["weekly", "monthly", "yearly", "custom_days"] as const),
  custom_cycle_days: z.coerce.number().positive().nullable(),
  start_date: z.string().min(1, "Tanggal mulai wajib diisi"),
  is_trial: z.boolean().default(false),
  trial_duration: z.coerce.number().positive().nullable(),
  trial_duration_unit: z.enum(["days", "months", "years"] as const).default("days"),
  payment_method: z.string().min(1, "Metode pembayaran wajib diisi"),
  notes: z.string().nullable(),
});

type FormValues = z.infer<typeof subscriptionSchema>;

// ── Props ───────────────────────────────────────────────────────────────
type SubscriptionFormProps = {
  mode: "add" | "edit";
  defaultValues?: Partial<SubscriptionInput>;
  categories: { id: string; name: string }[];
  onSubmit: (data: SubscriptionInput) => void;
  onCancel: () => void;
  /** Show a delete icon button next to Cancel/Save (edit mode). */
  onDelete?: () => void;
};

function fieldError(message?: string) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-danger">{message}</p>;
}

export default function SubscriptionForm({
  mode,
  defaultValues,
  categories,
  onSubmit,
  onCancel,
  onDelete,
}: SubscriptionFormProps) {
  const t = useTranslations("SubscriptionForm");
  const ts = useTranslations("Subscriptions");
  const { paymentMethods, defaultCurrency } = useSubscriptions();

  // Dropdown options. Payment: favorites first (standard list as fallback);
  // the current value is always included so edit mode never blanks a select.
  const paymentOptions = useMemo(() => {
    const base =
      paymentMethods.length > 0
        ? paymentMethods
        : [...STANDARD_PAYMENT_METHODS];
    const current = defaultValues?.payment_method;
    return current && !base.includes(current) ? [...base, current] : base;
  }, [paymentMethods, defaultValues?.payment_method]);

  const currencyOptions = useMemo(() => {
    const current = defaultValues?.currency ?? defaultCurrency;
    const list = new Set<string>(CURRENCIES);
    if (current) list.add(current);
    return Array.from(list);
  }, [defaultValues?.currency, defaultCurrency]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(subscriptionSchema) as never,
    defaultValues: {
      name: defaultValues?.name ?? "",
      category_id: defaultValues?.category_id ?? null,
      price: defaultValues?.price ?? 0,
      currency: defaultValues?.currency ?? defaultCurrency,
      billing_cycle: defaultValues?.billing_cycle ?? "monthly",
      custom_cycle_days: defaultValues?.custom_cycle_days ?? null,
      start_date: defaultValues?.start_date ?? "",
      is_trial: defaultValues?.is_trial ?? false,
      trial_duration: defaultValues?.trial_duration ?? null,
      trial_duration_unit: defaultValues?.trial_duration_unit ?? "days",
      payment_method: defaultValues?.payment_method ?? paymentOptions[0] ?? "",
      notes: defaultValues?.notes ?? null,
    },
  });

  // Pre-fill trial fields when in edit mode with existing trial data
  useEffect(() => {
    if (mode === "edit" && defaultValues) {
      reset({
        name: defaultValues.name ?? "",
        category_id: defaultValues.category_id ?? null,
        price: defaultValues.price ?? 0,
        currency: defaultValues.currency ?? defaultCurrency,
        billing_cycle: defaultValues.billing_cycle ?? "monthly",
        custom_cycle_days: defaultValues.custom_cycle_days ?? null,
        start_date: defaultValues.start_date ?? "",
        is_trial: defaultValues.is_trial ?? false,
        trial_duration: defaultValues.trial_duration ?? null,
        trial_duration_unit: defaultValues.trial_duration_unit ?? "days",
        payment_method: defaultValues.payment_method ?? paymentOptions[0] ?? "",
        notes: defaultValues.notes ?? null,
      });
    }
  }, [mode, defaultValues, reset, defaultCurrency, paymentOptions]);

  const billingCycle = watch("billing_cycle");
  const isTrial = watch("is_trial");
  const startDate = watch("start_date");
  const watchedName = watch("name");
  const trialDuration = watch("trial_duration");
  const trialDurationUnit = watch("trial_duration_unit");

  // Live brand detection — updates the preview as the user types
  const detectedBrand = useMemo(
    () => findBrandByName(watchedName ?? ""),
    [watchedName],
  );

  const handleFormSubmit = (values: FormValues) => {
    // Trial semantics: the first charge happens AFTER the trial ends — the
    // trial period is free. So for a trial, next_billing_date == trial end.
    let trialEnd: string | null = null;
    if (values.is_trial && values.start_date && values.trial_duration) {
      trialEnd = calculateTrialEndDate(
        values.start_date,
        values.trial_duration,
        values.trial_duration_unit,
      );
    }

    const nextBilling =
      values.is_trial && trialEnd
        ? trialEnd
        : calculateNextBillingDate(
            values.start_date,
            values.billing_cycle,
            values.custom_cycle_days,
          );

    // Re-resolve at submit in case name was edited since last preview.
    // Curated match → use the registry's clean name. Otherwise fall back
    // to Logo.dev with whatever the user typed — Logo.dev's name index
    // covers most real services (Paramount+, iQIYI, Babbel, …) and
    // returns a monogram if it doesn't know the name. If the typed name
    // is empty/whitespace, no logo URL is set.
    const brand = findBrandByName(values.name);
    const logoUrl = brand
      ? buildLogoUrl(brand.name)
      : values.name.trim()
        ? buildLogoUrl(values.name.trim())
        : null;

    const input: SubscriptionInput = {
      name: values.name,
      category_id: values.category_id,
      price: values.price,
      currency: values.currency,
      billing_cycle: values.billing_cycle,
      custom_cycle_days: values.billing_cycle === "custom_days" ? values.custom_cycle_days : null,
      start_date: values.start_date,
      next_billing_date: nextBilling,
      status: values.is_trial ? "trial" : "active",
      is_trial: values.is_trial,
      trial_start_date: values.is_trial ? values.start_date : null,
      trial_end_date: trialEnd,
      trial_duration: values.is_trial ? values.trial_duration : null,
      trial_duration_unit: values.trial_duration_unit,
      payment_method: values.payment_method,
      notes: values.notes,
      logo_url: logoUrl,
    };

    onSubmit(input);
  };

  const inputClass =
    "w-full rounded-[14px] bg-surface-soft px-4 py-2.5 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30";
  const labelClass = "mb-1 block text-sm font-medium text-text";
  const selectClass =
    "w-full rounded-[14px] bg-surface-soft px-4 py-2.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-brand-500/30";

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Name */}
      <div>
        <label htmlFor="sf-name" className={labelClass}>
          {t("name")}
        </label>
        <input
          id="sf-name"
          type="text"
          placeholder={t("namePlaceholder")}
          {...register("name")}
          className={inputClass}
        />
        {detectedBrand && (
          <div
            role="status"
            className="mt-2 flex items-center gap-2 text-xs text-text-muted"
          >
            <BrandLogo
              logoSrc={buildLogoUrl(detectedBrand.domain)}
              color={detectedBrand.color}
              name={detectedBrand.name}
              size={24}
              rounded="rounded-[6px]"
            />
            <Check size={12} className="text-success" aria-hidden />
            <span className="font-semibold text-text">
              {ts("logoDetected")}
            </span>
          </div>
        )}
        {fieldError(errors.name?.message)}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="sf-category" className={labelClass}>
          {t("category")}
        </label>
        <select
          id="sf-category"
          {...register("category_id")}
          className={selectClass}
        >
          <option value="">— {t("categoryNone")} —</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price + Currency */}
      <div className="grid grid-cols-[1fr_auto] gap-3">
        <div>
          <label htmlFor="sf-price" className={labelClass}>
            {t("price")}
          </label>
          <input
            id="sf-price"
            type="number"
            min="1"
            step="any"
            placeholder="0"
            {...register("price")}
            className={inputClass}
          />
          {fieldError(errors.price?.message)}
        </div>
        <div>
          <label htmlFor="sf-currency" className={labelClass}>
            {t("currency")}
          </label>
          <select
            id="sf-currency"
            {...register("currency")}
            className={`${selectClass} w-24`}
          >
            {currencyOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Billing cycle */}
      <div>
        <label htmlFor="sf-cycle" className={labelClass}>
          {t("billingCycle")}
        </label>
        <select
          id="sf-cycle"
          {...register("billing_cycle")}
          className={selectClass}
        >
          <option value="weekly">{t("billingWeekly")}</option>
          <option value="monthly">{t("billingMonthly")}</option>
          <option value="yearly">{t("billingYearly")}</option>
          <option value="custom_days">{t("billingCustom")}</option>
        </select>
      </div>

      {/* Custom cycle days (conditional) */}
      {billingCycle === "custom_days" && (
        <div>
          <label htmlFor="sf-custom-days" className={labelClass}>
            {t("customCycleDays")}
          </label>
          <input
            id="sf-custom-days"
            type="number"
            min="1"
            placeholder="30"
            {...register("custom_cycle_days")}
            className={inputClass}
          />
          {fieldError(errors.custom_cycle_days?.message)}
        </div>
      )}

      {/* Start date + trial toggle */}
      <div>
        <label htmlFor="sf-start-date" className={labelClass}>
          {t("startDate")}
        </label>
        <input
          id="sf-start-date"
          type="date"
          {...register("start_date")}
          className={inputClass}
        />
        {fieldError(errors.start_date?.message)}
      </div>

      {/* Trial toggle */}
      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          {...register("is_trial")}
          className="h-4 w-4 rounded accent-brand-500"
        />
        <span className="text-sm font-medium text-text">{t("isTrial")}</span>
      </label>

      {/* Trial duration (conditional) */}
      {isTrial && (
        <div>
          <label htmlFor="sf-trial-duration" className={labelClass}>
            {t("trialDuration")}
          </label>
          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input
              id="sf-trial-duration"
              type="number"
              min="1"
              placeholder="7"
              {...register("trial_duration")}
              className={inputClass}
            />
            <select
              {...register("trial_duration_unit")}
              className={`${selectClass} w-28`}
            >
              <option value="days">{t("unitDays")}</option>
              <option value="months">{t("unitMonths")}</option>
              <option value="years">{t("unitYears")}</option>
            </select>
          </div>
          {fieldError(errors.trial_duration?.message)}
        </div>
      )}

      {/* Preview of computed dates */}
      {startDate && (
        <div className="rounded-[14px] bg-brand-100/40 px-4 py-2.5 text-xs text-text-muted">
          {isTrial && trialDuration ? (
            <p>
              Trial berakhir:{" "}
              <span className="font-medium text-text">
                {calculateTrialEndDate(startDate, trialDuration, trialDurationUnit)}
              </span>
            </p>
          ) : (
            <p>
              Perpanjangan berikutnya:{" "}
              <span className="font-medium text-text">
                {calculateNextBillingDate(startDate, billingCycle, watch("custom_cycle_days"))}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Payment method */}
      <div>
        <label htmlFor="sf-payment" className={labelClass}>
          {t("paymentMethod")}
        </label>
        <select
          id="sf-payment"
          {...register("payment_method")}
          className={selectClass}
        >
          {paymentOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        {fieldError(errors.payment_method?.message)}
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="sf-notes" className={labelClass}>
          {t("notes")}
        </label>
        <textarea
          id="sf-notes"
          rows={2}
          placeholder={t("notesPlaceholder")}
          {...register("notes")}
          className={inputClass}
        />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        {onDelete && (
          <button
            type="button"
            aria-label={ts("deleteButton")}
            onClick={onDelete}
            className="mr-auto flex h-10 w-10 items-center justify-center rounded-full text-danger transition-colors hover:bg-danger/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-danger/40"
          >
            <Trash2 size={17} aria-hidden />
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="rounded-pill px-5 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:bg-clay-100 hover:text-text"
        >
          {t("cancel")}
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-pill bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover disabled:opacity-50"
        >
          {t("submit")}
        </button>
      </div>
    </form>
  );
}
