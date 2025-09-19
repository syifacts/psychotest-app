// app/api/tes/mbti/scoring/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { attemptId } = await req.json();
    if (!attemptId) {
      return NextResponse.json({ error: "attemptId wajib dikirim" }, { status: 400 });
    }

    const finalResult = await prisma.$transaction(async (tx) => {
      // 1. Ambil attempt
      const attempt = await tx.testAttempt.findUnique({ where: { id: attemptId } });
      if (!attempt) throw new Error("Attempt tidak ditemukan");

      const { userId, testTypeId } = attempt;

      // 2. Ambil semua jawaban
      const answers = await tx.answer.findMany({ where: { attemptId } });
      if (!answers.length) throw new Error("Belum ada jawaban untuk attempt ini");

      const questionCodes = answers.map(a => a.preferenceQuestionCode).filter(Boolean) as string[];
      const questions = await tx.preferenceQuestion.findMany({
        where: { code: { in: questionCodes } },
        select: { code: true, dimension: true },
      });

      const answersWithQuestion = answers.map(a => ({
        ...a,
        question: questions.find(q => q.code === a.preferenceQuestionCode) || null,
      }));

      // 3. Hitung skor per dimensi
      const dimensionMap: Record<string, [string, string]> = {
        EI: ["E", "I"],
        SN: ["S", "N"],
        TF: ["T", "F"],
        JP: ["J", "P"],
      };
      const valueMap: Record<string, number> = {
        EI: 10,
        SN: 5,
        TF: 5,
        JP: 5,
      };
      const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

      for (const ans of answersWithQuestion) {
        const dim = ans.question?.dimension;
        if (!dim || !ans.choice) continue;
        const [first, second] = dimensionMap[dim as keyof typeof dimensionMap];
        const valueToAdd = valueMap[dim as keyof typeof valueMap];
        if (ans.choice.toLowerCase() === "a") {
          scores[first] += valueToAdd;
        } else if (ans.choice.toLowerCase() === "b") {
          scores[second] += valueToAdd;
        }
      }

      // 4. Tentukan tipe MBTI
      const defaultType = { EI: "I", SN: "N", TF: "F", JP: "P" };
      const letterEI = (scores.E > 0 || scores.I > 0) ? (scores.E >= scores.I ? "E" : "I") : defaultType.EI;
      const letterSN = (scores.S > 0 || scores.N > 0) ? (scores.S >= scores.N ? "S" : "N") : defaultType.SN;
      const letterTF = (scores.T > 0 || scores.F > 0) ? (scores.T >= scores.F ? "T" : "F") : defaultType.TF;
      const letterJP = (scores.J > 0 || scores.P > 0) ? (scores.J >= scores.P ? "J" : "P") : defaultType.JP;
      const resultType = `${letterEI}${letterSN}${letterTF}${letterJP}`;

      // 5. Simpan PersonalityResult (status validasi default: false)
      const personalityResult = await tx.personalityResult.upsert({
        where: { attemptId },
        update: {
          resultType,
          scores,
          summary: `Hasil tes MBTI: ${resultType}`,
          isCompleted: false,   // belum divalidasi psikolog
          validated: false,
          validatedById: null,
          validatedAt: null,
        },
        create: {
          attemptId,
          userId,
          testTypeId,
          resultType,
          scores,
          summary: `Hasil tes MBTI: ${resultType}`,
          isCompleted: false,   // default false
          validated: false,
          validatedById: null,
          validatedAt: null,
        },
      });

      // 6. Tandai attempt selesai dikerjakan user
      await tx.testAttempt.update({
        where: { id: attemptId },
        data: {
          isCompleted: true,
          finishedAt: new Date(),
        },
      });

      // 7. Ambil detail deskripsi tipe kepribadian
      const descriptionDetails = await tx.personalityDescription.findUnique({
        where: {
          testTypeId_type: {
            testTypeId,
            type: resultType,
          },
        },
      });

      return {
        message: "Scoring berhasil",
        result: personalityResult,
        details: descriptionDetails,
      };
    });

    return NextResponse.json(finalResult);
  } catch (err: any) {
    console.error("❌ Error scoring MBTI:", err);
    return NextResponse.json({ error: "Gagal melakukan scoring", details: err.message }, { status: 500 });
  }
}
