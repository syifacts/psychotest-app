import { prisma } from "../lib/prisma";  // Ganti require
import bcrypt from "bcrypt";

// ==== DATA TEST TYPES ====
const testTypes = [
  { name: "IST", desc: "Intelligence Structure Test" },
  { name: "EPPS", desc: "Edwards Personal Preference Schedule" },
  { name: "MPPI", desc: "Minnesota Multiphasic Personality Inventory" },
  { name: "Kraepelin", desc: "Psychomotor performance and attention test" },
  { name: "16pf", desc: "16 Personality Factor Questionnaire" },
  { name: "Army Alpha", desc: "Army Alpha Cognitive Ability Test" },
  { name: "Big Five", desc: "Big Five Personality Test" },
  { name: "Holland", desc: "Holland Career Interest Test" },
  { name: "DISC", desc: "DISC Personality Assessment" },
  { name: "MBTI", desc: "Myers–Briggs Type Indicator" },
  { name: "MSAI", desc: "Multiple Self-Assessment Inventory" },
  { name: "MSDT", desc: "Multi-Stage Diagnostic Test" },
  { name: "Papikostick", desc: "Papikostick Handwriting Personality Test" },
  { name: "RMIB", desc: "Edwards Personal Preference Schedule" },
  { name: "TIU5", desc: "TIU Cognitive Ability Test Level 5" },
  { name: "TIU6", desc: "TIU Cognitive Ability Test Level 6" },
  { name: "Wartegg", desc: "Wartegg Drawing Personality Test" },
  { name: "Adversity Quotient", desc: "Adversity Quotient Test (Resilience Assessment)" },
  { name: "Kuder", desc: "Kuder Career Interest Survey" },
  { name: "SPM", desc: "Standard Progressive Matrices (Raven's IQ Test)" },
  { name: "WPT", desc: "Wonderlic Personnel Test (Cognitive Ability)" },
  { name: "CFIT 2 FORM A", desc: "Culture Fair Intelligence Test 2 - Form A" },
  { name: "CFIT 2 FORM B", desc: "Culture Fair Intelligence Test 2 - Form B" },
  { name: "CFIT 3 FORM A", desc: "Culture Fair Intelligence Test 3 - Form A" },
  { name: "CFIT 3 FORM B", desc: "Culture Fair Intelligence Test 3 - Form B" },
  { name: "Pauli", desc: "Pauli Personality Test" },
  { name: "FRT", desc: "Figural Reasoning Test" },
  { name: "Aptitude Test", desc: "General Aptitude Test" },
  { name: "Enneagram", desc: "Enneagram Personality Typing Test" },
];

// ==== SUBTEST IST ====
const ISTSubTests = ["SE", "WA", "AN", "GE", "RA", "ZR", "FA", "WU", "ME"];

// ==== SEED TEST TYPES ====
async function seedTestTypes() {
  await prisma.testType.createMany({ data: testTypes, skipDuplicates: true });
  console.log("✅ TestType inserted");
}

// ==== SEED SUBTEST ====
async function seedISTSubTests() {
  // Ambil TestType IST
  const istTest = await prisma.testType.findUnique({
    where: { name: "IST" }
  });
  if (!istTest) return console.error("❌ TestType IST belum ada");

  for (const subName of ISTSubTests) {
    await prisma.subTest.upsert({
      where: { testTypeId_name: { testTypeId: istTest.id, name: subName } },
      update: {},
      create: {
        testTypeId: istTest.id,
        name: subName,
        desc: `Subtest ${subName} IST`
      }
    });
  }

  console.log("✅ Semua subtest IST berhasil di-seed!");
}

// ==== SEED SUPERADMIN USER ====
async function seedUser() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@klinikym.com" },
    update: { 
      password: hashedPassword, 
      fullName: "Super Admin", 
      role: "SUPERADMIN"       
    },
    create: {
      fullName: "Super Admin",
      email: "admin@klinikym.com",
      password: hashedPassword,
      role: "SUPERADMIN",
    },
  });
  console.log("✅ Superadmin berhasil dibuat");
}

// ==== MAIN FUNCTION ====
async function main() {
  await seedTestTypes();
  await seedISTSubTests();  // <-- seed subtest IST dulu
  await seedUser();
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
