import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const testTypeId = 30; // Ganti sesuai TestType CPMI di DB

  const summaryTemplates = [
    {
      minScore: 78,
      maxScore: 84,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori di bawah rata-rata. Diperlukan bimbingan tambahan agar dapat menyelesaikan tugas-tugas kompleks.",
    },
    {
      minScore: 85,
      maxScore: 88,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori sedikit di bawah rata-rata. Kemampuannya masih dapat dikembangkan sehingga lebih cakap melakukan tugas-tugas yang kompleks. Daya tangkap cukup memadai untuk menguasai tugas baru.",
    },
    {
      minScore: 89,
      maxScore: 108,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori rata - rata. Kemampuannya sangat baik dalam menyelesaikan tugas kompleks dan cepat menangkap hal-hal baru.",
    },
        {
      minScore: 109,
      maxScore: 110,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori di atas rata - rata. Kemampuannya sangat baik dalam menyelesaikan tugas kompleks dan cepat menangkap hal-hal baru.",
    },
            {
      minScore: 111,
      maxScore: 120,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori superior. Kemampuannya sangat baik dalam menyelesaikan tugas kompleks dan cepat menangkap hal-hal baru.",
    },
  ];

for (const tpl of summaryTemplates) {
  const existing = await prisma.summaryTemplate.findFirst({
    where: {
      testTypeId,
      minScore: tpl.minScore,
      maxScore: tpl.maxScore,
    },
  });

  if (existing) {
    await prisma.summaryTemplate.update({
      where: { id: existing.id },
      data: { template: tpl.template },
    });
  } else {
    await prisma.summaryTemplate.create({
      data: { testTypeId, minScore: tpl.minScore, maxScore: tpl.maxScore, template: tpl.template },
    });
  }
}


  console.log("✅ Summary templates seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
