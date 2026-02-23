import { Payment } from "@/lib/datatrans";
import { StatusBadge } from "./StatusBadge";
import { revalidatePath } from "next/cache";

function formatAmount(amount: number, currency: string) {
  return (amount / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
  });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Server Action for the Refresh button
async function refreshPayments() {
  "use server";
  revalidatePath("/");
}

/**
 * Pure Server Component — receives already-fetched data as props.
 * The Refresh button uses an inline Server Action to revalidate the cache.
 */
export function PaymentsTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 px-6 py-14 text-center text-gray-400 text-sm">
        No transactions yet. Create one above.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <span className="text-sm text-gray-500">
          {payments.length} transaction{payments.length !== 1 ? "s" : ""}
        </span>
        {/* Inline Server Action — no client JS needed for refresh */}
        <form action={refreshPayments}>
          <button
            type="submit"
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            ↻ Refresh
          </button>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left font-medium">Reference</th>
              <th className="px-6 py-3 text-left font-medium">Description</th>
              <th className="px-6 py-3 text-right font-medium">Amount</th>
              <th className="px-6 py-3 text-center font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-3 font-mono text-xs text-gray-400 truncate max-w-[160px]">
                  {p.transaction_id}
                </td>
                <td className="px-6 py-3 text-gray-700">
                  {p.reference_number}
                </td>
                <td className="px-6 py-3 text-gray-500">
                  {p.description || "—"}
                </td>
                <td className="px-6 py-3 text-right font-medium tabular-nums">
                  {formatAmount(p.amount, p.currency)}
                </td>
                <td className="px-6 py-3 text-center">
                  <StatusBadge status={p.status} />
                </td>
                <td className="px-6 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {formatDate(p.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
