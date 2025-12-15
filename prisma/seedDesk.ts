import { PrismaClient } from "@prisma/client";
import { testTypes } from "./data/DeskripsiTest/testTypes";

const prisma = new PrismaClient();

async function main() {
  for (const test of testTypes) {
    await prisma.testType.upsert({
      where: { id: test.id }, // karena kamu pakai id: 30
      update: {
        name: test.name,
        desc: test.desc,
        judul: test.judul,
        deskripsijudul: test.deskripsijudul,
        juduldesk1: test.juduldesk1,
        desk1: test.desk1,
        juduldesk2: test.juduldesk2,
        desk2: test.desk2,
        duration: test.duration,
        price: test.price,
        img: test.img,
        judulbenefit: test.judulbenefit,
        pointbenefit: test.pointbenefit,
      },
      create: {
        id: test.id,
        name: test.name,
        desc: test.desc,
        judul: test.judul,
        deskripsijudul: test.deskripsijudul,
        juduldesk1: test.juduldesk1,
        desk1: test.desk1,
        juduldesk2: test.juduldesk2,
        desk2: test.desk2,
        duration: test.duration,
        price: test.price,
        img: test.img,
        judulbenefit: test.judulbenefit,
        pointbenefit: test.pointbenefit,
      },
    });
  }

  console.log("✅ Seed deskTest berhasil!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding deskTest:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
