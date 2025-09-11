import { PrismaClient } from '@prisma/client';
import { MBTIQuestions } from './data/MBTI/question'; // Pastikan path ini benar
import { MBTIDescriptions } from './data/MBTI/description';

const prisma = new PrismaClient();

async function main() {
  console.log(`🚀 Memulai proses seeding...`);

  // --- 1. Seed TestType "MBTI" ---
  console.log(`Seeding TestType...`);
  const mbtiTestType = await prisma.testType.upsert({
    where: { name: "MBTI" },
    update: {},
    create: {
      name: "MBTI",
      desc: "Myers-Briggs Type Indicator Test",
      duration: 20, // durasi dalam menit
    },
  });
  console.log(`✅ TestType 'MBTI' berhasil dibuat/ditemukan.`);

  // --- 2. Seed Soal-soal MBTI (PreferenceQuestion) ---
  console.log(`Seeding PreferenceQuestions...`);
  for (const [index, q] of MBTIQuestions.entries()) {
    const code = `MBTI-${q.dimension}-${index + 1}`;
    await prisma.preferenceQuestion.upsert({
      where: { code },
      update: {
        testTypeId: mbtiTestType.id,
        dimension: q.dimension,
        content: q.content,
        options: q.options,
      },
      create: {
        code: code,
        testTypeId: mbtiTestType.id,
        dimension: q.dimension,
        content: q.content,
        options: q.options,
      },
    });
  }
  console.log(`✅ ${MBTIQuestions.length} soal MBTI berhasil di-seed.`);

  // --- 3. Seed Deskripsi Tipe MBTI (PersonalityDescription) ---
  console.log(`Seeding PersonalityDescriptions...`);
  for (const data of MBTIDescriptions) {
    await prisma.personalityDescription.upsert({
      where: { testTypeId_type: { testTypeId: mbtiTestType.id, type: data.type } },
      update: {},
      create: {
        testTypeId: mbtiTestType.id,
        type: data.type,
        description: data.description,
        suggestions: data.suggestions,
        professions: data.professions,
      },
    });
  }
  console.log(`✅ ${MBTIDescriptions.length} deskripsi tipe MBTI berhasil di-seed.`);
  
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error("Terjadi error saat menjalankan seeder:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

