// import { PrismaClient } from "@prisma/client";
// import questions1to30 from "./data/HOLLAND/question1-30";
// import questions31to60 from "./data/HOLLAND/question31-60";
// import questions61to90 from "./data/HOLLAND/question61-90";
// import questions91to108 from "./data/HOLLAND/question91-108";

// const prisma = new PrismaClient();

// async function main() {
//   console.log("🌱 Seeding HOLLAND questions...");

//   const allQuestions = [
//     ...questions1to30,
//     ...questions31to60,
//     ...questions61to90,
//     ...questions91to108,
//   ];

//   for (const [index, q] of allQuestions.entries()) {
//       await prisma.question.upsert({
//         where: { code: `HOLLAND-${index + 1}` },
//         update: {},
//         create: {
//           code: `HOLLAND-${index + 1}`,
//           content: q.content,
//          // notes: q.notes,
//           type: q.type,
//          // options: q.options ?? [],
//           //image: q.image ?? null,
//          // answer: Array.isArray(q.answer) ? q.answer : (q.answer ? [q.answer] : []),
//           testTypeId: 8,
//           // isScored: index >= 3,
//         },
//       });
//     }
// }
// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


// import { prisma } from "../lib/prisma"; // Sesuaikan path jika perlu
// import questions1to30 from "./data/HOLLAND/question1-30";
// import questions31to60 from "./data/HOLLAND/question31-60";
// import questions61to90 from "./data/HOLLAND/question61-90";
// import questions91to108 from "./data/HOLLAND/question91-108";

// const allQuestions = [
//      ...questions1to30,
//      ...questions31to60,
//      ...questions61to90,
//      ...questions91to108,
//    ];

// /**
//  * Fungsi ini bertugas untuk mengisi tabel PreferenceQuestion
//  * dengan data dari file MBTIQuestions.ts.
//  */
// async function seedHolland() {
//   console.log("🚀 Memulai proses seeding untuk tabel PreferenceQuestion...");

//   // ---Cari ID dari TestType "MBTI" ---
//   const HollandTestType = await prisma.testType.findUnique({
//     where: { name: "HOLLAND" },
//   });

//   if (!HollandTestType) {
//     console.error("❌ TestType 'HOLLAND' tidak ditemukan. Harap seed TestType terlebih dahulu.");
//     return;
//   }
//   // ---------------------------------------------------

//   // Loop melalui setiap soal yang ada di file data Anda
//   for (const [index, q] of allQuestions.entries()) {
//     // Buat kode unik untuk setiap soal, contoh: MBTI-EI-1
//     const code = `HOLLAND-$-${index + 1}`;

//     // Gunakan 'upsert' untuk memasukkan data ke model PreferenceQuestion
//     await prisma.preferenceQuestion.upsert({
//       where: { code }, // Cari berdasarkan kode unik untuk menghindari duplikasi
//       update: {},      // Jika sudah ada, jangan lakukan apa-apa
//       create: {
//         code: code,
// testTypeId: HollandTestType.id,
//        // dimension: q.dimension,
//         content: q.content,
//       options: q.options ?? [], // bisa juga JSON kosong
//       },
//     });
//   }

//   console.log(`✅ ${allQuestions.length} soal MBTI berhasil dimasukkan ke database!`);
// }

// // Panggil fungsi seeder untuk dieksekusi
// seedHolland()
//   .catch((e) => {
//     console.error("Terjadi error saat menjalankan seeder HOLLAND:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });