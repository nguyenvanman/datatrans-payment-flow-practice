"use server";

import { redirect } from "next/navigation";
import { createTransaction } from "@/lib/datatrans";

export async function initiatePaymentAction(formData: FormData) {
  const raw = formData.get("amount") as string;
  const currency = (formData.get("currency") as string) || "CHF";
  const description = (formData.get("description") as string) || undefined;

  const amountCents = Math.round(parseFloat(raw) * 100);
  if (isNaN(amountCents) || amountCents <= 0) {
    // Server Actions can't return thrown validation errors cleanly without
    // useFormState; we redirect to an error page with a message instead.
    redirect("/payment/error?reason=invalid_amount");
  }

  let paymentPageUrl: string;
  try {
    const result = await createTransaction({
      amount: amountCents,
      currency,
      description,
    });
    paymentPageUrl = result.payment_page_url;
    console.log(result);
  } catch (err: any) {
    redirect(`/payment/error?reason=${encodeURIComponent(err.message)}`);
  }

  // Hard redirect to Datatrans hosted payment page
  redirect(paymentPageUrl);
}
