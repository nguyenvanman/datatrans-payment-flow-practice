/**
 * Server-only helpers for talking to the FastAPI backend.
 * Import only in Server Components, Server Actions, and Route Handlers.
 */

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

export interface Payment {
  id: number;
  transaction_id: string;
  reference_number: string;
  amount: number;
  currency: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function fetchPayments(): Promise<Payment[]> {
  const res = await fetch(`${BACKEND}/api/payments`, {
    // Opt out of caching so the list is always fresh
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch payments");
  return res.json();
}

export async function fetchPayment(transactionId: string): Promise<Payment> {
  const res = await fetch(`${BACKEND}/api/payments/${transactionId}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Payment not found");
  return res.json();
}

export async function createTransaction(payload: {
  amount: number;
  currency: string;
  description?: string;
}): Promise<{ transaction_id: string; payment_page_url: string }> {
  const res = await fetch(`${BACKEND}/api/payments/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).detail ?? "Failed to initialize payment");
  }

  return res.json();
}
