import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const testTypeIdCPMI = 30; // CPMI
  const testTypeIdMSDT = 12; // Ganti sesuai TestType MSDT di DB

  // === CPMI (IQ) ===
  const summaryTemplatesCPMI = [
    {
      minScore: 59,
      maxScore: 65,
          template: "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya perlu bimbingan tambahan agar dapat menyelesaikan tugas-tugas kompleks. Daya tangkapnya terbatas, sehingga perlu pendampingan dalam memahami tugas baru.",
    },
    {
      minScore: 66,
      maxScore: 79,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya masih dapat dikembangkan sehingga lebih cakap melakukan tugas-tugas yang kompleks. Daya tangkapnya cukup memadai sehingga mudah dalam menguasai tugas baru.",
    },
    {
      minScore: 80,
      maxScore: 90,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya baik dan dapat menyelesaikan tugas-tugas dengan cukup mandiri. Daya tangkapnya memadai sehingga mudah dalam menguasai tugas baru.",
    },
    {
      minScore: 91,
      maxScore: 110,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya cukup baik dan mampu menyelesaikan tugas-tugas kompleks secara mandiri. Daya tangkapnya cepat dan adaptif dalam mempelajari hal baru.",
    },
    {
      minScore: 111,
      maxScore: 119,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya sangat baik dan mampu menguasai tugas-tugas kompleks dengan efisien. Daya tangkapnya cepat dan mudah menyesuaikan diri dengan tugas baru.",
    },
        {
      minScore: 120,
      maxScore: 127,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya unggul dan dapat menyelesaikan tugas-tugas kompleks dengan cepat dan tepat. Daya tangkapnya sangat baik sehingga mudah menguasai hal-hal baru.",
    },
        {
      minScore: 128,
      maxScore: 139,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya sangat unggul dan mampu menyelesaikan tugas-tugas kompleks dengan sangat baik. Daya tangkapnya sangat cepat sehingga mudah mempelajari hal baru secara mandiri.",
    },
        {
      minScore: 140,
      maxScore: 500,
      template:
        "Berdasarkan tes kemampuan intelektual, Sdr. {name} memiliki taraf intelektual (IQ) {scoreiq} atau kategori {keteranganiqCPMI}. Kemampuannya luar biasa dan mampu menyelesaikan tugas-tugas kompleks dengan cemerlang. Daya tangkapnya sangat cepat sehingga dapat menguasai hal-hal baru dengan mudah dan efektif.",
    },
    
    
  ];

  for (const tpl of summaryTemplatesCPMI) {
    const existing = await prisma.summaryTemplate.findFirst({
      where: {
        testTypeId: testTypeIdCPMI,
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
        data: {
          testTypeId: testTypeIdCPMI,
          minScore: tpl.minScore,
          maxScore: tpl.maxScore,
          template: tpl.template,
        },
      });
    }
  }
  
  const summaryTemplatesCPMISikap = [
    {
      section: "Sikap & Cara Kerja",
      category: "R",
      template:
        "Berdasarkan tes sikap dan cara kerja, Sdr. {name} menunjukkan kesulitan dalam mengikuti instruksi, kecepatan kerja kurang, dan memerlukan bimbingan intensif.",
    },
    {
      section: "Sikap & Cara Kerja",
      category: "K",
      template:
        "Berdasarkan tes sikap dan cara kerja, Sdr. {name} menunjukkan usaha namun belum konsisten, sering lambat merespons instruksi, dan masih memerlukan pengawasan lebih.",
    },
    {
      section: "Sikap & Cara Kerja",
      category: "C",
      template:
        "Berdasarkan tes sikap dan cara kerja, Sdr. {name} cukup responsif terhadap instruksi dan dapat menyelesaikan tugas dengan standar minimal yang memadai.",
    },
    {
      section: "Sikap & Cara Kerja",
      category: "B",
      template:
        "Berdasarkan tes sikap dan cara kerja, Sdr. {name} bersikap responsif, mampu memanfaatkan sumber daya, dan cukup cepat dalam penyelesaian tugas.",
    },
    {
      section: "Sikap & Cara Kerja",
      category: "T",
      template:
        "Berdasarkan tes sikap dan cara kerja, Sdr. {name} menunjukkan sikap kerja yang sangat baik, responsif, cepat, dan efektif dalam menyelesaikan tugas.",
    },
  ];
 for (const tpl of summaryTemplatesCPMISikap) {
    const existing = await prisma.summaryTemplate.findFirst({
      where: {
        testTypeId: testTypeIdCPMI,
        section: tpl.section,
        category: tpl.category,
      },
    });

    if (existing) {
      await prisma.summaryTemplate.update({
        where: { id: existing.id },
        data: { template: tpl.template },
      });
    } else {
      await prisma.summaryTemplate.create({
        data: {
          testTypeId: testTypeIdCPMI,
          section: tpl.section,
          category: tpl.category,
          template: tpl.template,
        },
      });
    }
  }

const summaryTemplatesCPMIKepribadian = [
  {
    section: "Kepribadian",
    category: "R",
    template:
      "Berdasarkan tes kepribadian, Sdr. {name} menunjukkan motivasi yang masih rendah, cenderung ragu terhadap kemampuannya, dan membutuhkan dorongan dari lingkungan untuk menyelesaikan tugas.",
  },
  {
    section: "Kepribadian",
    category: "K",
    template:
      "Berdasarkan tes kepribadian, Sdr. {name} menunjukkan usaha dalam menyesuaikan diri, namun terkadang kurang yakin dan masih membutuhkan arahan untuk meningkatkan kepercayaan dirinya.",
  },
  {
    section: "Kepribadian",
    category: "C",
    template:
      "Berdasarkan tes kepribadian, Sdr. {name} memiliki konsep diri yang cukup positif, merasa cukup yakin dengan kemampuannya, dan mampu mengambil keputusan sederhana secara mandiri.",
  },
  {
    section: "Kepribadian",
    category: "B",
    template:
      "Berdasarkan tes kepribadian, Sdr. {name} menunjukkan kepercayaan diri yang baik, mampu menilai situasi dengan cukup objektif, dan cenderung mampu bekerja mandiri dengan efektif.",
  },
  {
    section: "Kepribadian",
    category: "T",
    template:
      "Berdasarkan tes kepribadian, Sdr. {name} menunjukkan kepribadian yang matang, sangat yakin dengan kemampuannya, memiliki motivasi tinggi, serta mampu mengambil keputusan dengan tepat dan percaya diri.",
  },
];

for (const tpl of summaryTemplatesCPMIKepribadian) {
  const existing = await prisma.summaryTemplate.findFirst({
    where: {
      testTypeId: testTypeIdCPMI,
      section: tpl.section,
      category: tpl.category,
    },
  });

  if (existing) {
    await prisma.summaryTemplate.update({
      where: { id: existing.id },
      data: { template: tpl.template },
    });
  } else {
    await prisma.summaryTemplate.create({
      data: {
        testTypeId: testTypeIdCPMI,
        section: tpl.section,
        category: tpl.category,
        template: tpl.template,
      },
    });
  }
}

const summaryTemplatesCPMIKemampuanBelajar = [
  {
    section: "Kemampuan Belajar",
    category: "R",
    template:
      "Berdasarkan tes kemampuan belajar, Sdr. {name} menunjukkan kesulitan dalam menyerap materi baru, kurang memiliki minat untuk mengembangkan diri, dan membutuhkan banyak arahan dalam proses pembelajaran.",
  },
  {
    section: "Kemampuan Belajar",
    category: "K",
    template:
      "Berdasarkan tes kemampuan belajar, Sdr. {name} menunjukkan usaha untuk belajar, namun belum konsisten. Ia masih perlu dorongan dan bimbingan agar lebih terbuka terhadap hal-hal baru.",
  },
  {
    section: "Kemampuan Belajar",
    category: "C",
    template:
      "Berdasarkan tes kemampuan belajar, Sdr. {name} cukup terbuka terhadap pengetahuan baru, menunjukkan kemauan untuk belajar, dan berusaha meningkatkan keterampilannya meskipun masih bertahap.",
  },
  {
    section: "Kemampuan Belajar",
    category: "B",
    template:
      "Berdasarkan tes kemampuan belajar, Sdr. {name} menunjukkan keinginan yang baik untuk semakin terampil dalam pekerjaannya. Ia terbuka pada hal-hal baru dan berupaya meningkatkan standar kerjanya secara konsisten.",
  },
  {
    section: "Kemampuan Belajar",
    category: "T",
    template:
      "Berdasarkan tes kemampuan belajar, Sdr. {name} sangat antusias dalam mengembangkan diri, cepat menyerap pengetahuan baru, serta memiliki dorongan kuat untuk terus meningkatkan standar dan keterampilannya.",
  },
];

for (const tpl of summaryTemplatesCPMIKemampuanBelajar) {
  const existing = await prisma.summaryTemplate.findFirst({
    where: {
      testTypeId: testTypeIdCPMI,
      section: tpl.section,
      category: tpl.category,
    },
  });

  if (existing) {
    await prisma.summaryTemplate.update({
      where: { id: existing.id },
      data: { template: tpl.template },
    });
  } else {
    await prisma.summaryTemplate.create({
      data: {
        testTypeId: testTypeIdCPMI,
        section: tpl.section,
        category: tpl.category,
        template: tpl.template,
      },
    });
  }
}

  // === MSDT (Category) ===
  const summaryTemplatesMSDT = [
    {
      category: "Executive",
      template: "Gaya ini dianggap efektif karena dapat mengelola dengan baik antara tugas dan hubungan. Model ini adalah sisi efektif dari gaya kompromis. Pola yang dilakukan dapat mengintegrasikan antara tugas dan hubungan dengan baik, mengelola dan memanfaatkan kedua aspek dengan sinergi yang optimal. Pendekatan ini dapat dikatakan sebagai pendekatan konsultatif, interaktif dan pemecah masalah. Pendekatan ini memanfaatkan eksplorasi terhadap berbagai sumber daya, keragaman informasi dan dapat memanfaatkan isu negatif menjadi dorongan untuk hasil yang lebih optimal. Gaya ini melibatkan tim dalam perencanaan dan mengambil kesimpulan. Komunikasi dilakukan terhadap bawahan untuk meningkatkan kualitas informasi yang dapat menjadikan keputusan lebih baik. ",
    },
    {
      category: "Compromiser",
      template: "Mengandalkan tugas dan relasi yang seimbang, namun dianggap kurang efektif karena tidak berpendirian tetap, tidak ada keputusan yang jelas. Gaya ini akan merasa kebingungan antara pengaturan tugas dan kebutuhan untuk berinteraksi. Dalam menghadapi tekanan, maka akan cenderung kompromi sehingga berbagai tujuan seringkali menyimpang dan tidak tercapai",
    },
    {
      category: "Benevolent Autocrat",
      template: "Gaya ini dianggap efektif karena memberikan unsur komunikatif dalam melakukan gaya otokratik. Gaya ini masih mengandalkan instruksi dan intervensi. Skor tinggi dapat dilihat sebagai guru dalam memberi tugas, dimana dapat memberikan instruksi dengan tidak mengesampingkan komunikasi kepada bawahan secara lebih fleksibel. Pola yang dilakukan memberikan kesediaan untuk bertanya, membantu apabila ada hal yang dianggap salah atau menyimpang. Pola keseharian terstruktur dalam menentukan target kerja, produktivitas dan memberi perintah, tidak ragu memberikan hukuman namun bertindak adil dalam menyikapinya. Gaya ini dapat bekerjasama dengan baik namun menghindari hubungan keterdekatan antar personal ",
    },
    {
      category: "Autocrat",
      template: "Lebih perhatian hanya pada produktivitas dan hasil. Memberikan tugas ke bawahan berdasarkan instruksi dan mengawasi secara ketat proses yang terjadi. Kesalahan tidak bisa ditolerir, penyimpangan harus dihindari. Kebijakan adalah urusan atasan sementara bawahan cukup melaksanakan apa yang harus dikerjakan tanpa ada alasan.",
    },
     {
      category: "Developer",
      template: "Gaya manajemen developer adalah sisi efektif dari gaya missionary. Tujuan dari gaya seperti ini adalah untuk bertindak secara profesional tanpa mengesampingkan aspek emosi. Bawahan diberikan kesempatan untuk memberikan ide, pandangan atau peran lebih dari kebijakan yang ada untuk mengembangkan potensi. Kontribusi diberikan dan perhatian untuk pengembangan pun diperhatikan. Skor tinggi memiliki keyakinan optimis tentang individu untuk bekerja dan menghasilkan. Sifat pendekatan berupa kolegial, bawahan sebagai partner bukan hanya sebagai “pembantu” dalam mengerjakan sesuatu. Gaya seperti ini senang untuk berbagi pengetahuan dan keahlian dan potensi bawahan dapat dioptimalkan ",
    },
         {
      category: "Missionary",
      template: "Menggunakan unsur afektif yang sangat kental. Missionary berupaya mendorong situasi positif dalam manajemen dengan memberikan kandungan sensitivitas, kepedulian dan hal-hal yang mungkin dianggap penting untuk meningkatkan kinerja melalui sentuhan emosi/perasaan. Model manajerial seperti ini berupaya menjaga orang lain termasuk bawahan pada situasi bahagia dalam situasi apapun. Gaya ini dikatakan kurang efektif karena kurang ketersediaanya peluang konflik, berupaya tetap halus dalam bertindak dan kesulitan untuk menolak atau berkata tidak, padahal banyak pekerjaan perlu ketegasan dalam manajemen.",
    },
         {
      category: "Bureaucrat",
      template: "Prosedural, berdasarkan aturan atau tata pelaksanaan, menerima dengan tulus hirarki kewenangan dan menggunakan komunikasi sangat formal dalam bersikap.  Birokrat berpegang pada sistem, gaya manajemen seperti ini tampak seperti otokrat, kaku dan dapat membosankan bagi orang-orang yang fleksibel",
    },
         {
      category: "Deserter",
      template: "Suka mengabaikan masalah, cuci tangan, tidak mau bertanggung jawab (laisser-faire). Tipe gaya ini mengabaikan berbagai keterlibatan atau intervensi yang dapat menjadikan situasi dianggap sulit atau rumit. Sikapnya selalu mencoba netral terhadap apa yang terjadi di keseharian, mencari jalan untuk menghindar dari aturan yang dianggap menyulitkan. Pola yang tampak secara manajerial adalah defensif, misalkan ada kebijakan yang menyulitkan bawahan maka ia mengatakan saya hanya menjalankan perintah, kebijakan dari atasan. Bukan berarti pola seperti ini buruk, deserter hanya berupaya menjaga keadaan status-quo dan menghindari perubahan drastis atau “guncangan dalam manajemen",
    },
  ];

  for (const tpl of summaryTemplatesMSDT) {
    const existing = await prisma.summaryTemplate.findFirst({
      where: {
        testTypeId: testTypeIdMSDT,
        category: tpl.category,
      },
    });

    if (existing) {
      await prisma.summaryTemplate.update({
        where: { id: existing.id },
        data: { template: tpl.template },
      });
    } else {
      await prisma.summaryTemplate.create({
        data: {
          testTypeId: testTypeIdMSDT,
          category: tpl.category,
          template: tpl.template,
        },
      });
    }
  }

  console.log("✅ Summary templates CPMI & MSDT seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
