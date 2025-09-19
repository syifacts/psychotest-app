// app/api/tes/submit-msdt/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { userId, attemptId, answers } = await req.json();

    if (!userId || !attemptId || !answers) {
      return NextResponse.json(
        { error: "userId, attemptId, answers wajib diisi" },
        { status: 400 }
      );
    }

    // ------------------------------
    // 1️⃣ Simpan jawaban ke Answer
    // ------------------------------
    await Promise.all(
      answers.map((a: any) =>
        prisma.answer.upsert({
          where: {
            attemptId_questionCode: {
              attemptId,
              questionCode: a.questionCode,
            },
          },
          update: { choice: a.choice },
          create: {
            attemptId,
            userId,
            questionCode: a.questionCode,
            choice: a.choice,
          },
        })
      )
    );

    // ------------------------------
    // 2️⃣ Mapping kelompok soal
    // ------------------------------
    const kelompokA: number[][] = [
      [1, 2, 3, 4, 5, 6, 7, 8],
      [9, 10, 11, 12, 13, 14, 15, 16],
      [17, 18, 19, 20, 21, 22, 23, 24],
      [25, 26, 27, 28, 29, 30, 31, 32],
      [33, 34, 35, 36, 37, 38, 39, 40],
      [41, 42, 43, 44, 45, 46, 47, 48],
      [49, 50, 51, 52, 53, 54, 55, 56],
      [57, 58, 59, 60, 61, 62, 63, 64],
    ];

    const kelompokB: number[][] = [
      [1, 9, 17, 25, 33, 41, 49, 57],
      [2, 10, 18, 26, 34, 42, 50, 58],
      [3, 11, 19, 27, 35, 43, 51, 59],
      [4, 12, 20, 28, 36, 44, 52, 60],
      [5, 13, 21, 29, 37, 45, 53, 61],
      [6, 14, 22, 30, 38, 46, 54, 62],
      [7, 15, 23, 31, 39, 47, 55, 63],
      [8, 16, 24, 32, 40, 48, 56, 64],
    ];

    // tabel koreksi
    const koreksi: number[] = [1, 2, 1, 0, 3, -1, 0, -4];


    // ------------------------------
   // 3️⃣ Lookup jawaban {noSoal: "A" / "B"}
const jawaban: Record<number, string> = {};
answers.forEach((a: any) => {
  const no = parseInt(a.questionCode.split("-")[1], 10);
  if (!isNaN(no)) {
    // Ambil huruf pertama saja (A atau B)
    jawaban[no] = a.choice.trim().charAt(0).toUpperCase();
  }
});


    // ------------------------------
    // 4️⃣ Hitung jumlah A, B & koreksi
    // ------------------------------
    const jumlahA: number[] = [];
    const jumlahB: number[] = [];
    const jumlahkor: number[] = [];

    for (let i = 0; i < 8; i++) {
      let countA = 0;
      let countB = 0;

      // horizontal (A)
      kelompokA[i].forEach((no) => {
        if (jawaban[no] === "A") countA++;
      });

      // vertical (B)
      kelompokB[i].forEach((no) => {
        if (jawaban[no] === "B") countB++;
      });

      jumlahA[i] = countA;
      jumlahB[i] = countB;
      jumlahkor[i] = countA + countB + koreksi[i];
    }

    // ------------------------------
    // 5️⃣ Mapping koreksi → Subskala
    // ------------------------------
    const subskalaCounts = {
      Ds: jumlahkor[0],
      Mi: jumlahkor[1],
      Au: jumlahkor[2],
      Co: jumlahkor[3],
      Bu: jumlahkor[4],
      Dv: jumlahkor[5],
      Ba: jumlahkor[6],
      E: jumlahkor[7],
    };

    // ------------------------------
    // 6️⃣ Total Skala
    // ------------------------------
    const totalSkalaTO =
      subskalaCounts.Au + subskalaCounts.Co + subskalaCounts.Ba + subskalaCounts.E;
    const totalSkalaRO =
      subskalaCounts.Mi + subskalaCounts.Co + subskalaCounts.Dv + subskalaCounts.E;
    const totalSkalaE =
      subskalaCounts.Bu + subskalaCounts.Dv + subskalaCounts.Ba + subskalaCounts.E;
      const totalSkalaO = subskalaCounts.Ds;

      // ------------------------------
// 6.1️⃣ Fungsi konversi
// ------------------------------
function konversiSkala(total: number): number {
  if (total >= 0 && total <= 29) return 0;
  if (total === 30 || total === 31) return 0.6;
  if (total === 32) return 1.2;
  if (total === 33) return 1.8;
  if (total === 34) return 2.4;
  if (total === 35) return 3.0;
  if (total === 36 || total === 37) return 3.6;
  if (total >= 38) return 4.0;
  return 0; // fallback
}

// ------------------------------
// 6.2️⃣ Hitung konversi
// ------------------------------
const konversiTO = konversiSkala(totalSkalaTO);
const konversiRO = konversiSkala(totalSkalaRO);
const konversiE = konversiSkala(totalSkalaE);
const konversiO = konversiSkala(totalSkalaO);

// ------------------------------
// 7️⃣ Tentukan hasil akhir
// ------------------------------
let hasilAkhir = "";

if (konversiTO >= 2) {
  if (konversiRO >= 2) {
    if (konversiE >= 2) {
      hasilAkhir = "Executive";
    } else {
      hasilAkhir = "Compromiser";
    }
  } else {
    if (konversiE >= 2) {
      hasilAkhir = "Benevolent Autocrat";
    } else {
      hasilAkhir = "Autocrat";
    }
  }
} else {
  if (konversiRO >= 2) {
    if (konversiE >= 2) {
      hasilAkhir = "Developer";
    } else {
      hasilAkhir = "Missionary";
    }
  } else {
    if (konversiE >= 2) {
      hasilAkhir = "Bureaucrat";
    } else {
      hasilAkhir = "Deserter";
    }
  }
}

// ------------------------------
// 7.1️⃣ Ambil template sesuai hasil MSDT
// ------------------------------
const templateRecord = await prisma.summaryTemplate.findFirst({
  where: {
    testTypeId: 12, // ID MSDT di TestType
    category: hasilAkhir,
  },
});

// Ambil nama user biar {name} bisa diganti (opsional)
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: { fullName: true },
});

const summaryText = templateRecord
  ? templateRecord.template.replace("{name}", user?.fullName || "USER")
  : null;

    // ------------------------------
    // 7️⃣ Data siap simpan
    // ------------------------------
    const dataResult = {
      jumlahA1: jumlahA[0], jumlahA2: jumlahA[1], jumlahA3: jumlahA[2], jumlahA4: jumlahA[3],
      jumlahA5: jumlahA[4], jumlahA6: jumlahA[5], jumlahA7: jumlahA[6], jumlahA8: jumlahA[7],
      jumlahB1: jumlahB[0], jumlahB2: jumlahB[1], jumlahB3: jumlahB[2], jumlahB4: jumlahB[3],
      jumlahB5: jumlahB[4], jumlahB6: jumlahB[5], jumlahB7: jumlahB[6], jumlahB8: jumlahB[7],
      jumlahkor1: jumlahkor[0], jumlahkor2: jumlahkor[1], jumlahkor3: jumlahkor[2], jumlahkor4: jumlahkor[3],
      jumlahkor5: jumlahkor[4], jumlahkor6: jumlahkor[5], jumlahkor7: jumlahkor[6], jumlahkor8: jumlahkor[7],

      ...subskalaCounts,
      totalSkalaTO,
      totalSkalaRO,
      totalSkalaE,
      totalSkalaO,
       konversiTO,
  konversiRO,
  konversiE,
  konversiO,
  hasilAkhir,
 summaryTemplateId: templateRecord?.id ?? null,
    };

    // ------------------------------
    // 8️⃣ Simpan ke Result
    // ------------------------------
const result = await prisma.result.upsert({
  where: {
    attemptId_testTypeId: {
      attemptId,
      testTypeId: 12, // ID MSDT di tabel TestType
    },
  },
  update: dataResult,
  create: {
    userId,
    attemptId,
    testTypeId: 12,
    ...dataResult,
  },
});

    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error("❌ Gagal submit MSDT:", err);
    return NextResponse.json({ error: "Gagal submit MSDT" }, { status: 500 });
  }
}
