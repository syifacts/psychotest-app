// app/api/qrcode/route.ts
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const data = url.searchParams.get("data");
    if (!data) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    // Generate QR code base64
    const qrBase64 = await QRCode.toDataURL(data);

    // Response langsung sebagai image
    return NextResponse.json({ qr: qrBase64 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to generate QR" }, { status: 500 });
  }
}
