// app/api/company/generate-ids/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateUserId, generateTestId } from "@/utils/generateIds";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = Number(searchParams.get("companyId"));
    const testTypeName = searchParams.get("testTypeName") ?? "";

    if (!companyId) {
      return NextResponse.json({ error: "companyId wajib" }, { status: 400 });
    }

    const userId = await generateUserId(companyId);
    const testId = testTypeName ? await generateTestId(testTypeName) : null;

    return NextResponse.json({ userId, testId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Gagal generate ID" }, { status: 500 });
  }
}
