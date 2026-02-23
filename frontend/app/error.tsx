"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

// Next.js App Router error boundary — must be a Client Component.
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
      <AlertTriangle className="w-12 h-12 text-red-400" />
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-gray-500 max-w-sm">{error.message}</p>
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
