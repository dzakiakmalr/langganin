"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { useSubscriptions } from "@/components/subscriptions/SubscriptionsProvider";
import SubscriptionForm from "@/components/subscriptions/SubscriptionForm";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { SubscriptionInput } from "@/components/subscriptions/SubscriptionsProvider";

type Props = {
  id: string;
};

export default function SubscriptionEditClient({ id }: Props) {
  const t = useTranslations("SubscriptionDetail");
  const router = useRouter();
  const { getById, categories, updateSubscription, deleteSubscription } =
    useSubscriptions();

  const subscription = getById(id);

  const [showDelete, setShowDelete] = useState(false);

  if (!subscription) {
    return (
      <section className="rounded-card bg-surface p-12 text-center shadow-md">
        <p className="text-lg font-semibold text-text">{t("notFound")}</p>
        <button
          type="button"
          onClick={() => router.push("/dashboard/subscriptions")}
          className="mt-4 rounded-pill bg-brand-500 px-5 py-2 text-sm font-bold text-white shadow-clay"
        >
          {t("backToList")}
        </button>
      </section>
    );
  }

  const handleUpdate = (data: SubscriptionInput) => {
    updateSubscription(id, data);
    router.push("/dashboard/subscriptions");
  };

  const handleDelete = () => {
    deleteSubscription(id);
    router.push("/dashboard/subscriptions");
  };

  return (
    <section className="w-full max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-text">
          {t("editTitle")}
        </h1>
      </div>

      <div className="mt-6 rounded-card bg-surface p-6 shadow-md">
        <SubscriptionForm
          mode="edit"
          defaultValues={{
            name: subscription.name,
            category_id: subscription.category_id,
            price: subscription.price,
            currency: subscription.currency,
            billing_cycle: subscription.billing_cycle,
            custom_cycle_days: subscription.custom_cycle_days,
            start_date: subscription.start_date,
            is_trial: subscription.is_trial,
            trial_duration: subscription.trial_duration,
            trial_duration_unit: subscription.trial_duration_unit,
            payment_method: subscription.payment_method,
            notes: subscription.notes,
            next_billing_date: subscription.next_billing_date,
            trial_end_date: subscription.trial_end_date,
            status: subscription.status,
            logo_url: subscription.logo_url,
          }}
          categories={categories.map((c) => ({ id: c.id, name: c.name }))}
          onSubmit={handleUpdate}
          onCancel={() => router.push("/dashboard/subscriptions")}
          onDelete={() => setShowDelete(true)}
        />
      </div>

      <ConfirmDialog
        open={showDelete}
        title={t("deleteTitle")}
        body={t("deleteBody")}
        confirmLabel={t("deleteButton")}
        cancelLabel={t("deleteCancel")}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </section>
  );
}
