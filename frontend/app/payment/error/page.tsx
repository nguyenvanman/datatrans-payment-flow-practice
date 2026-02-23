import Link from "next/link";
import { AlertTriangle } from "lucide-react";

interface Props {
  searchParams: { reason?: string };
}

export default function ErrorPage({ searchParams }: Props) {
  const reason = searchParams.reason ?? "An unexpected error occurred.";
  return (
    <div className="max-w-md mx-auto py-20 text-center space-y-6">
      <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
      <h1 className="text-2xl font-bold">Payment Failed</h1>
      <p className="text-gray-500">{decodeURIComponent(reason)}</p>
      <Link
        href="/"
        className="inline-block rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Try Again
      </Link>
    </div>
  );
}
