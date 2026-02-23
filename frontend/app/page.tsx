import { Suspense } from "react";
import { fetchPayments } from "@/lib/datatrans";
import { CreatePaymentForm } from "@/components/CreatePaymentForm";
import { PaymentsTable } from "@/components/PaymentsTable";
import { TableSkeleton } from "@/components/TableSkeleton";

// Pure Server Component — no "use client".
// Data is fetched on the server; HTML streams to the browser.

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payments</h1>
        <p className="text-sm text-gray-500">
          Create a payment below — you&apos;ll be redirected to the Datatrans
          hosted page.
        </p>
      </section>

      {/* CreatePaymentForm is a Client Component that submits a Server Action */}
      <div className="max-w-md">
        <CreatePaymentForm />
      </div>

      {/* PaymentsTable is an async Server Component.
          Suspense streams in the skeleton while data loads. */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Transaction History
        </h2>
        <Suspense fallback={<TableSkeleton />}>
          <PaymentsTableLoader />
        </Suspense>
      </section>
    </div>
  );
}

async function PaymentsTableLoader() {
  const payments = await fetchPayments();
  return <PaymentsTable payments={payments} />;
}
