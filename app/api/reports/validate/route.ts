// pages/api/reports/validate.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

async function getLoggedUserId(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token) return null;

    const payload: any = jwt.verify(token, JWT_SECRET);
    return payload.id;
  } catch (err) {
    console.error("JWT error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const {
      reportId,
      kesimpulan,
      ttd,
      editDescription,
      editSuggestion,
      editProfession,
      type = "result",
    } = await req.json();

    const userId = await getLoggedUserId(req);
    if (!reportId || !userId) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);

    if (type === "personality") {
      // 🔹 VALIDASI UNTUK PersonalityResult
      const personalityResult = await prisma.personalityResult.findUnique({
        where: { id: reportId },
        include: { ValidatedBy: true },
      });

      if (!personalityResult) {
        return NextResponse.json(
          { error: "Personality Result tidak ditemukan" },
          { status: 404 }
        );
      }

      let barcodeId = personalityResult.barcode;
      let barcodeURL = barcodeId
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`
        : undefined;

      if (!barcodeId) {
        barcodeId = nanoid(10);
        barcodeURL = `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`;
      }

      await prisma.personalityResult.update({
        where: { id: reportId },
        data: {
          validated: true,
          validatedById: personalityResult.validated
            ? personalityResult.validatedById
            : userId,
          validatedAt: personalityResult.validated
            ? personalityResult.validatedAt
            : new Date(),
          kesimpulan: kesimpulan ?? personalityResult.kesimpulan,
          ttd: ttd ?? personalityResult.ttd,
          editDescription: editDescription ?? personalityResult.editDescription,
          editSuggestion: editSuggestion ?? personalityResult.editSuggestion,
          editProfession: editProfession ?? personalityResult.editProfession,
          barcode: barcodeId,
          expiresAt: expiry,
          isCompleted: true,
        },
      });

      const validationNotes = `Hasil Personality Test divalidasi oleh ${
        personalityResult.ValidatedBy?.fullName || "Psikolog"
      } pada ${
        personalityResult.validated
          ? personalityResult.validatedAt?.toLocaleDateString("id-ID")
          : new Date().toLocaleDateString("id-ID")
      }. Berlaku sampai: ${expiry.toLocaleDateString("id-ID")}`;

      return NextResponse.json({
        success: true,
        barcodeURL,
        barcodeId,
        expiresAt: expiry,
        validationNotes,
      });
    } else {
      // 🔹 VALIDASI UNTUK Result
      const result = await prisma.result.findUnique({
        where: { id: reportId },
        include: { ValidatedBy: true },
      });

      if (!result) {
        return NextResponse.json(
          { error: "Result tidak ditemukan" },
          { status: 404 }
        );
      }

      let barcodeId = result.barcode;
      let barcodeURL = barcodeId
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`
        : undefined;

      if (!barcodeId) {
        barcodeId = nanoid(10);
        barcodeURL = `${process.env.NEXT_PUBLIC_BASE_URL}/report/view/${barcodeId}`;
      }

      await prisma.result.update({
        where: { id: reportId },
        data: {
          validated: true,
          validatedById: result.validated ? result.validatedById : userId,
          validatedAt: result.validated ? result.validatedAt : new Date(),
          kesimpulan: kesimpulan ?? result.kesimpulan,
          ttd: ttd ?? result.ttd,
          barcode: barcodeId,
          expiresAt: expiry,
          isCompleted: true,
        },
      });

      const validationNotes = `Hasil Assessment divalidasi oleh ${
        result.ValidatedBy?.fullName || "Psikolog"
      } pada ${
        result.validated
          ? result.validatedAt?.toLocaleDateString("id-ID")
          : new Date().toLocaleDateString("id-ID")
      }. Berlaku sampai: ${expiry.toLocaleDateString("id-ID")}`;

      return NextResponse.json({
        success: true,
        barcodeURL,
        barcodeId,
        expiresAt: expiry,
        validationNotes,
      });
    }
  } catch (err: any) {
    console.error("Error validating report:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
