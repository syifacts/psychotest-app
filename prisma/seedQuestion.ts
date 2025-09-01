import { prisma } from "../lib/prisma";

// Import soal untuk tiap subtest
import { ISTQuestions as SEQuestions } from "./data/IST/questionSE";
import { ISTQuestions as WAQuestions } from "./data/IST/questionWA";
import { ISTQuestions as ANQuestions } from "./data/IST/questionAN";

// Daftar subtest yang mau di-seed
const subtests = [
  { name: "SE", questions: SEQuestions },
  { name: "WA", questions: WAQuestions },
  {name : "AN", questions: ANQuestions},
];

async function seedISTQuestions() {
  for (const { name, questions } of subtests) {
    // Cari subtest berdasarkan nama + test type IST
    const subTest = await prisma.subTest.findFirst({
      where: { name, TestType: { name: "IST" } },
    });

    if (!subTest) {
      console.error(`❌ SubTest ${name} belum ada`);
      continue;
    }

    // Loop dengan index → bikin code unik (SE-1, WA-3, dst)
    for (const [index, q] of questions.entries()) {
      const code = `${name}-${index + 1}`;

      await prisma.question.upsert({
        where: { code }, // pakai code unik
        update: {},
        create: {
          code,
          subTestId: subTest.id,
          content: q.content,
          options: q.options,
          answer: q.answer,
        },
      });
    }

    console.log(`✅ Semua soal ${name} berhasil di-seed!`);
  }
}

seedISTQuestions()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
