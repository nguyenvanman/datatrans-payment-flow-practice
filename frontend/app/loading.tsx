import { TableSkeleton } from "@/components/TableSkeleton";

// Next.js App Router automatically shows this while the page is loading.
export default function Loading() {
  return (
    <div className="space-y-10 animate-pulse">
      <div>
        <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-72 bg-gray-100 rounded" />
      </div>
      <div className="max-w-md">
        <div className="bg-white rounded-2xl border border-gray-200 h-64" />
      </div>
      <div>
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <TableSkeleton />
      </div>
    </div>
  );
}
