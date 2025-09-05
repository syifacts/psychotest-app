import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { prisma } from "../lib/prisma";

interface NormaResultRecord {
  age: string;
  rw: string;
  sw: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedNormaResult() {
  const csvPath = path.join(__dirname, "data", "ist", "NormaResult.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File NormaResult.csv tidak ditemukan di ${csvPath}`);
    return;
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");

  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ";",
  }) as NormaResultRecord[];

  for (const r of records) {
    const rwValue = Number(r.rw);
    const swValue = Number(r.sw);

    // pecah umur jadi array angka
    const ageParts: number[] = [];
    r.age.split(",").forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = start; i <= end; i++) {
            ageParts.push(i);
          }
        }
      } else {
        const val = Number(trimmed);
        if (!isNaN(val)) ageParts.push(val);
      }
    });

    // insert per umur
    for (const ageValue of ageParts) {
      await prisma.normaResult.create({
        data: {
          age: ageValue,
          rw: rwValue,
          sw: swValue,
        },
      });
    }
  }

  console.log("✅ Semua data NormaResult berhasil di-seed!");
}

seedNormaResult()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
