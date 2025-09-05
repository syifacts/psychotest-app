import { prisma } from "../lib/prisma"; // Sesuaikan path jika perlu
import { MBTIQuestions } from "./data/MBTI/question";

/**
 * Fungsi ini bertugas untuk mengisi tabel `MBTIQuestion`
 * dengan data dari file `MBTIQuestions.ts`.
 */
async function seedMBTIQuestions() {
  console.log("🚀 Memulai proses seeding (isian soal) untuk tabel MBTIQuestion...");

  // Loop melalui setiap soal yang ada di file data Anda
  for (const [index, q] of MBTIQuestions.entries()) {
    // Buat kode unik untuk setiap soal, contoh: MBTI-EI-1
    const code = `MBTI-${q.dimension}-${index + 1}`;

    // Gunakan 'upsert' untuk memasukkan data ke model MBTIQuestion yang baru
    await prisma.mBTIQuestion.upsert({
      where: { code }, // Cari berdasarkan kode unik untuk menghindari duplikasi
      update: {},      // Jika sudah ada, jangan lakukan apa-apa
      create: {
        code: code,
        dimension: q.dimension,
        type: q.type,
        content: q.content,
        options: q.options,
      },
    });
  }

  console.log(`✅ ${MBTIQuestions.length} soal MBTI berhasil dimasukkan ke database!`);
}

// Panggil fungsi seeder untuk dieksekusi
seedMBTIQuestions()
  .catch((e) => {
    console.error("Terjadi error saat menjalankan seeder MBTI:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });