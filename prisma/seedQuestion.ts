import { prisma } from "../lib/prisma"; // ✅ benar
import { ISTQuestions } from "./data/IST/questionSE";


async function seedSEQuestions() {
  // ambil subtest SE
  const seSubTest = await prisma.subTest.findFirst({
    where: { name: "SE", TestType: { name: "IST" } },
  });

  if (!seSubTest) return console.error("❌ SubTest SE belum ada");

  for (const q of ISTQuestions) {
    await prisma.question.upsert({
      where: { subTestId_content: { subTestId: seSubTest.id, content: q.content } },
      update: {},
      create: {
        subTestId: seSubTest.id,
        content: q.content,
        options: q.options,
        answer: q.answer,
      }
    });
  }

  console.log("✅ Semua soal SE berhasil di-seed!");
}

seedSEQuestions()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
