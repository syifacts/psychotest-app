import { PrismaClient } from "@prisma/client";
import { CPMIquestions } from "./data/CPMI/questioncpmi";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding CPMI questions...");

  for (const [index, q] of CPMIquestions.entries()) {
    await prisma.question.upsert({
      where: { code: `CPMI-${index + 1}` },
      update: {},
      create: {
        code: `CPMI-${index + 1}`,
        content: q.content,
        notes: q.notes,
        type: q.type,
        options: q.options ?? [],
        image: q.image ?? null,
        answer: Array.isArray(q.answer) ? q.answer : (q.answer ? [q.answer] : []),
        testTypeId: 30,
         isScored: index >= 3,
      },
    });
  }

  console.log("✅ CPMI questions seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
