import { PrismaClient, Prisma } from "@prisma/client";
import { MSDTquestions } from "./data/MSDT/question";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding MSDT questions...");

  for (const [index, q] of MSDTquestions.entries()) {
    await prisma.question.upsert({
      where: { code: `msdt-${index + 1}` },
      update: {},
      create: {
        code: `MSDT-${index + 1}`,
        content: q.content,
        type: q.type,
        options: q.options,
        answer: Prisma.JsonNull,
        answerScores: Prisma.JsonNull,
        testTypeId: 12, // ✅ isi sesuai TestType ID di DB
      },
    });
  }

  console.log("✅ MSDT questions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
