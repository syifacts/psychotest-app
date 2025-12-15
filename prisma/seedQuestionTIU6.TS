import { PrismaClient, Prisma } from "@prisma/client";
import { TIU6questions } from "./data/TIU6/questionTIU6";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding TIU6 questions...");

  for (const [index, q] of TIU6questions.entries()) {
    await prisma.question.upsert({
      where: { code: `tiu6-${index + 1}` },
      update: {},
     create: {
  code: `TIU6-${index + 1}`,
  content: q.content,
          notes: q.notes,
  type: q.type,
  options: q.options,
          image: q.image ?? null,

  answer: q.answer ?? null,      // pakai jawaban dari TIU6questions
        answerScores: Prisma.JsonNull,
  testTypeId: 16, // ✅ isi sesuai TestType ID di DB
},

    });
  }

  console.log("✅ TIU6 questions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
