// utils/generateIds.ts
import { prisma } from "@/lib/prisma";

/**
 * Generate UserId khusus per perusahaan
 * Format: CP{companyCode}-{runningNumber}
 * Contoh: CP001-1001, CP001-1002, dst.
 */
export async function generateUserId(companyId: number) {
  const companyCode = companyId.toString().padStart(3, "0"); // CP040
  const startNumber = 1001;

  // Ambil semua userId yang ada untuk company ini
  const users = await prisma.user.findMany({
    where: { companyId },
    select: { customId: true },
  });

  // Buat set dari nomor yang sudah dipakai
  const usedNumbers = new Set<number>();
  for (const u of users) {
    if (!u.customId) continue; // ✅ skip jika null
    const match = u.customId.match(/CP\d{3}-(\d+)/);
    if (match) {
      usedNumbers.add(parseInt(match[1], 10));
    }
  }

  // Cari nomor terkecil yang belum dipakai
  let userNumber = startNumber;
  while (true) {
    if (!usedNumbers.has(userNumber)) return `CP${companyCode}-${userNumber}`;
    userNumber++;
  }
}

/**
 * Generate TestId berdasarkan nama test type
 * Format: {testTypeName}-{increment}
 * Contoh: CPMI-1, CPMI-2, dst.
 */
export async function generateTestId(testTypeName: string) {
  const count = await prisma.token.count({
    where: { TestType: { name: testTypeName } },
  });

  return `${testTypeName}-${count + 1}`;
}
