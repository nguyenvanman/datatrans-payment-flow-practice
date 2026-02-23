const STATUS_STYLES: Record<string, string> = {
  initialized: "bg-blue-100 text-blue-700",
  pending: "bg-yellow-100 text-yellow-700",
  authorized: "bg-indigo-100 text-indigo-700",
  settled: "bg-green-100 text-green-700",
  canceled: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-700",
};

// Server Component — no client bundle cost
export function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${cls}`}
    >
      {status}
    </span>
  );
}
