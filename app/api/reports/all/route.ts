// app/api/reports/all/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const companyId = url.searchParams.get("companyId");
    const testTypeId = url.searchParams.get("testTypeId");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const search = url.searchParams.get("search");
    const status = url.searchParams.get("status");

    const whereClause: any = { AND: [] };

    // === Filter Perusahaan ===
    if (companyId && companyId !== "all") {
      if (companyId === "self") {
        whereClause.AND.push({
          User: { role: "USER" },
          OR: [
            { Attempt: { PackagePurchase: { is: null }, Payment: { is: null } } },
            { Attempt: { PackagePurchase: { companyId: null } } },
            { Attempt: { Payment: { companyId: null } } },
          ],
        });
      } else {
        const numericCompanyId = Number(companyId);
        if (!isNaN(numericCompanyId)) {
          whereClause.AND.push({
            OR: [
              { Attempt: { PackagePurchase: { companyId: numericCompanyId } } },
              { Attempt: { Payment: { companyId: numericCompanyId } } },
              {
                User: {
                  id: { equals: numericCompanyId },
                  role: "PERUSAHAAN",
                },
              },
            ],
          });
        }
      }
    }

    // === Filter Jenis Tes ===
    if (testTypeId && testTypeId !== "all") {
      const numericTestTypeId = Number(testTypeId);
      if (!isNaN(numericTestTypeId)) {
        whereClause.AND.push({ testTypeId: numericTestTypeId });
      }
    }

    // === Filter Status ===
    if (status && status !== "all") {
      if (status === "pending") {
        whereClause.AND.push({ validated: false });
      } else if (status === "selesai") {
        whereClause.AND.push({ validated: true });
      }
    }

    // === Filter Tanggal ===
    if (startDate || endDate) {
      const dateFilter: any = {};
      if (startDate) dateFilter.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateFilter.lte = end;
      }
      whereClause.AND.push({ createdAt: dateFilter });
    }

    // === Search Nama User ===
    if (search) {
      whereClause.AND.push({
        User: {
          fullName: {
            contains: search,
          },
        },
      });
    }

    // === Ambil data Result ===
    const results = await prisma.result.findMany({
      where: whereClause.AND.length > 0 ? whereClause : undefined,
      include: {
        User: { select: { id: true, fullName: true, role: true } },
        TestType: { select: { id: true, name: true } },
        Attempt: {
          select: {
            id: true,
            startedAt: true,
            PackagePurchase: {
              select: { company: { select: { id: true, fullName: true } } },
            },
            Payment: {
              select: { company: { select: { id: true, fullName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // === Ambil data PersonalityResult ===
    const personalityResults = await prisma.personalityResult.findMany({
      include: {
        User: { select: { id: true, fullName: true, role: true } },
        TestType: { select: { id: true, name: true } },
        Attempt: {
          select: {
            id: true,
            startedAt: true,
            PackagePurchase: {
              select: { company: { select: { id: true, fullName: true } } },
            },
            Payment: {
              select: { company: { select: { id: true, fullName: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // === Mapping Company (Result) ===
    const mappedResults = results.map((r) => {
      let company: { id: number; fullName: string } | null = null;
      if (r.Attempt?.PackagePurchase?.company) {
        company = r.Attempt.PackagePurchase.company;
      } else if (r.Attempt?.Payment?.company) {
        company = r.Attempt.Payment.company;
      } else if (r.User && r.User.role === "PERUSAHAAN") {
        company = { id: r.User.id, fullName: r.User.fullName };
      }
      return {
        id: r.id,
        type: "result", // 👈 penanda
        User: r.User,
        TestType: r.TestType,
        Attempt: r.Attempt
          ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt }
          : null,
        Company: company,
        validated: r.validated,
        validatedAt: r.validatedAt,
        createdAt: r.createdAt,
      };
    });

    // === Mapping Company (PersonalityResult) ===
    const mappedPersonality = personalityResults.map((r) => {
      let company: { id: number; fullName: string } | null = null;
      if (r.Attempt?.PackagePurchase?.company) {
        company = r.Attempt.PackagePurchase.company;
      } else if (r.Attempt?.Payment?.company) {
        company = r.Attempt.Payment.company;
      } else if (r.User && r.User.role === "PERUSAHAAN") {
        company = { id: r.User.id, fullName: r.User.fullName };
      }
      return {
        id: r.id,
        type: "personality", // 👈 penanda
        User: r.User,
        TestType: r.TestType,
        Attempt: r.Attempt
          ? { id: r.Attempt.id, startedAt: r.Attempt.startedAt }
          : null,
        Company: company,
        validated: r.validated,
        validatedAt: r.validatedAt,
        createdAt: r.createdAt,
      };
    });

    // Gabungkan dua hasil
    const combined = [...mappedResults, ...mappedPersonality].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    return NextResponse.json(combined);
  } catch (err) {
    console.error("❌ Gagal ambil reports:", err);
    return NextResponse.json({ error: "Gagal ambil reports" }, { status: 500 });
  }
}
