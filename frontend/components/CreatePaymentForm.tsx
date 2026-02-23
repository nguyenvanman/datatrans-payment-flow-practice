"use client";

import { useFormStatus } from "react-dom";
import { initiatePaymentAction } from "@/actions/payments";
import { CreditCard, Loader2 } from "lucide-react";

const CURRENCIES = ["CHF", "EUR", "USD", "GBP"];

// useFormStatus must live in a child component of the form
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Redirecting to payment…
        </>
      ) : (
        "Proceed to Payment"
      )}
    </button>
  );
}

/**
 * Client Component — needs interactivity (useFormStatus).
 * The `action` prop points to a Server Action, so no fetch() is needed.
 * Next.js serialises FormData and executes the action on the server.
 */
export function CreatePaymentForm() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-2 mb-5">
        <CreditCard className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold">New Payment</h2>
      </div>

      <form action={initiatePaymentAction} className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Amount
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="10.00"
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="currency"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Currency
            </label>
            <select
              id="currency"
              name="currency"
              defaultValue="CHF"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <input
            id="description"
            name="description"
            type="text"
            placeholder="e.g. Order #1234"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
