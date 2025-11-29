import { NextRequest, NextResponse } from "next/server";

const TRIPAY_API_KEY = process.env.TRIPAY_API_KEY!;

export async function GET(req: NextRequest) {
  const res = await fetch("https://tripay.co.id/api/merchant/payment-channel", {
    headers: { Authorization: `Bearer ${TRIPAY_API_KEY}` },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
