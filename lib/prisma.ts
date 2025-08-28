import { PrismaClient } from "@prisma/client";

// ✨ Deklarasi global agar TS tahu global.prisma ada
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Gunakan global prisma jika sudah ada, jika belum buat baru
export const prisma = global.prisma ?? new PrismaClient({
  log: ["query", "error", "warn"],
});

// Hanya set global prisma jika bukan production
if (process.env.NODE_ENV !== "production") global.prisma = prisma;
