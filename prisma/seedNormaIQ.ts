// prisma/seedNormaIq.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { prisma } from "../lib/prisma";

interface NormaIqRecord {
  sw: string;
  iq: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedNormaIq() {
  const csvPath = path.join(__dirname, "data", "ist", "NormaIq.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File NormaIq.csv tidak ditemukan di ${csvPath}`);
    return;
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
  }) as NormaIqRecord[];

  for (const r of records) {
    const swValue = Number(r.sw);
    const iqValue = Number(r.iq);

    await prisma.normaIq.create({
      data: {
        sw: swValue,
        iq: iqValue,
      },
    });
  }

  console.log("✅ Semua data NormaIq berhasil di-seed!");
}

seedNormaIq()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
