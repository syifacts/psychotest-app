import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json(); 
  // body = { answers: [...], scores: {...} }

  console.log("Jawaban user:", body);

  // sementara return JSON saja
  return NextResponse.json({
    success: true,
    message: "Jawaban berhasil diterima",
    data: body,
  });
}
