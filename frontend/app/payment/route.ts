import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000";

/** GET /api/payments — list all transactions */
export async function GET() {
  const res = await fetch(`${BACKEND}/api/payments`, { cache: "no-store" });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
