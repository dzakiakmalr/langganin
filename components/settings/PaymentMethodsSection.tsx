"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { useTranslations } from "next-intl";

import SectionCard from "@/components/settings/SectionCard";
import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";

export default function PaymentMethodsSection() {
  const t = useTranslations("Settings");
  const { paymentMethods, addPaymentMethod, removePaymentMethod } =
    useSubscriptions();
  const [input, setInput] = useState("");

  const submit = () => {
    const value = input.trim();
    if (!value) return;
    addPaymentMethod(value);
    setInput("");
  };

  return (
    <SectionCard title={t("payTitle")} description={t("payDesc")}>
      {paymentMethods.length === 0 ? (
        <p className="rounded-[14px] bg-clay-100 px-4 py-6 text-center text-sm text-text-muted">
          {t("payEmpty")}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {paymentMethods.map((m) => (
            <li
              key={m}
              className="inline-flex items-center gap-1 rounded-pill bg-clay-100 py-1 pl-3 pr-1 text-sm font-semibold text-text"
            >
              <span>{m}</span>
              <button
                type="button"
                aria-label={t("payRemove", { name: m })}
                onClick={() => removePaymentMethod(m)}
                className="flex h-6 w-6 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-clay-200 hover:text-danger"
              >
                <X size={12} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          placeholder={t("payAddPlaceholder")}
          className="rounded-pill bg-surface-soft px-4 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <button
          type="button"
          onClick={submit}
          className="inline-flex items-center gap-1.5 rounded-pill bg-brand-500 px-4 py-2 text-sm font-bold text-white shadow-clay transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-[1px] hover:shadow-clay-hover"
        >
          <Plus size={14} aria-hidden />
          {t("payAddLabel")}
        </button>
      </div>
    </SectionCard>
  );
}
