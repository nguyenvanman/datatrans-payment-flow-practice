import Link from "next/link";
import { XCircle } from "lucide-react";

export default function CancelPage() {
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      <XCircle className="w-16 h-16 text-yellow-400 mx-auto" />
      <h1 className="text-2xl font-bold">Payment Cancelled</h1>
      <p className="text-gray-500">
        You cancelled the payment. No charge was made.
      </p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </Link>
    </div>
  );
}
