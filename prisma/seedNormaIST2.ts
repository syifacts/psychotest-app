// prisma/seedNormaIST.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { prisma } from "../lib/prisma";

interface NormaRecord {
  subtest: string;
  age: string;
  rw: string;
  sw: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function seedNormaIST() {
  const csvFiles = ["NormaAN.csv", "NormaGE.csv", "NormaRA.csv", "NormaZR.csv", "NormaFA.csv", "NormaWU.csv", "NormaME.csv"];
  for (const fileName of csvFiles) {
    const csvPath = path.join(__dirname, "data", "IST", fileName);

    if (!fs.existsSync(csvPath)) {
      console.warn(`⚠️ File ${fileName} tidak ditemukan, dilewati`);
      continue;
    }

    const fileContent = fs.readFileSync(csvPath, "utf-8");

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      delimiter: ";",
    }) as NormaRecord[];

    for (const r of records) {
      const ageParts: number[] = [];

      r.age.split(",").forEach((part) => {
        const trimmed = part.trim();
        if (trimmed.includes("-")) {
          const [start, end] = trimmed.split("-").map((n) => Number(n.trim()));
          if (!isNaN(start) && !isNaN(end)) {
            for (let i = start; i <= end; i++) ageParts.push(i);
          }
        } else {
          const val = Number(trimmed);
          if (!isNaN(val)) ageParts.push(val);
        }
      });

      const rwValue = Number(r.rw);
      const swValue = Number(r.sw);

      for (const ageValue of ageParts) {
        await prisma.normaIst.upsert({
          where: {
            subtest_age_rw: { subtest: r.subtest.trim(), age: ageValue, rw: rwValue },
          },
          update: {},
          create: {
            subtest: r.subtest.trim(),
            age: ageValue,
            rw: rwValue,
            sw: swValue,
          },
        });
      }
    }
    console.log(`✅ File ${fileName} berhasil di-seed`);
  }

  console.log("🎉 Semua data Norma_Ist berhasil di-seed!");
}

seedNormaIST()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
