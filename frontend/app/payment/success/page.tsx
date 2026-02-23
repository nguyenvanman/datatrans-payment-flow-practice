import { CheckCircle } from "lucide-react";
import { fetchPayment } from "@/lib/datatrans";
import { StatusBadge } from "@/components/StatusBadge";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ datatransTrxId?: string; transactionId?: string }>;
}

// Async Server Component — fetches the transaction details server-side.
export default async function SuccessPage({ searchParams }: Props) {
  const { datatransTrxId, transactionId: txnId } = await searchParams;
  const transactionId = datatransTrxId ?? txnId;

  let payment = null;
  if (transactionId) {
    try {
      payment = await fetchPayment(transactionId);
    } catch {
      // Non-fatal — show the success page even if details aren't available
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
      <h1 className="text-2xl font-bold">Payment Successful!</h1>
      <p className="text-gray-500">Your transaction has been processed.</p>

      {payment && (
        <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left space-y-3 text-sm">
          <Row label="Transaction ID">
            <span className="font-mono text-xs text-gray-500">
              {payment.transaction_id}
            </span>
          </Row>
          <Row label="Amount">
            <span className="font-medium">
              {(payment.amount / 100).toFixed(2)} {payment.currency}
            </span>
          </Row>
          <Row label="Reference">{payment.reference_number}</Row>
          {payment.description && (
            <Row label="Description">{payment.description}</Row>
          )}
          <Row label="Status">
            <StatusBadge status={payment.status} />
          </Row>
        </div>
      )}

      <Link
        href="/"
        className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span>{children}</span>
    </div>
  );
}
