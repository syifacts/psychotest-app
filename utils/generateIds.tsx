// utils/generateIds.ts
import { prisma } from "@/lib/prisma";

/**
 * Generate UserId khusus per perusahaan
 * Format: CP{companyCode}-{runningNumber}
 * Contoh: CP001-1001, CP001-1002, dst.
 */
export async function generateUserId(companyId: number) {
  const count = await prisma.user.count({
    where: { companyId },
  });

  const companyCode = companyId.toString().padStart(3, "0"); // CP001
  const userNumber = (1001 + count).toString(); // mulai dari 1001
  return `CP${companyCode}-${userNumber}`;
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
