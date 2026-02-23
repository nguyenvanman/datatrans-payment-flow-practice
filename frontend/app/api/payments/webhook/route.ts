import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

/**
 * POST /api/payments/webhook
 * Datatrans posts here; we forward the raw body + headers to FastAPI.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();

  const res = await fetch(`${BACKEND}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": req.headers.get("Content-Type") ?? "application/json",
      "Datatrans-Signature": req.headers.get("Datatrans-Signature") ?? "",
    },
    body,
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
