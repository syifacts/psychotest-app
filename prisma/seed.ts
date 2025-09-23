import { prisma } from "../lib/prisma";  
import bcrypt from "bcrypt";

const testTypes = [
   {name: "Test untuk CPMI", desc: "Test Calon Pekerja Migran Indonesia", duration: 12, price: 150000, img: "/cpmi.jpg" },
  { name: "IST", desc: "Intelligence Structure Test", duration: 60, price: 150000, img: "/ist.jpeg" },
  { name: "EPPS", desc: "Edwards Personal Preference Schedule", duration: 60, price: 150000, img: "/epps.png" },
  { name: "MPPI", desc: "Minnesota Multiphasic Personality Inventory", duration: 60, price: 100000, img: "/mmpi.jpg" },
  { name: "Kraepelin", desc: "Psychomotor performance and attention test", duration: 60, price: 150000, img: "/kraepelin.jpg" },
  { name: "16pf", desc: "16 Personality Factor Questionnaire", duration: 60, price: 150000, img: "/16pf.jpg" },
  { name: "Army Alpha", desc: "Army Alpha Cognitive Ability Test", duration: 60, price: 150000, img: "/armyalpha.jpg" },
  { name: "Big Five", desc: "Big Five Personality Test", duration: 60, price: 150000, img: "/bigfive.jpg" },
  { name: "Holland", desc: "Holland Career Interest Test", duration: 60, price: 150000, img: "/holland.jpg" },
  { name: "DISC", desc: "DISC Personality Assessment", duration: 60, price: 150000, img: "/disc.jpg" },
  { name: "MBTI", desc: "Myers–Briggs Type Indicator", duration: 60, price: 150000, img: "/mbti.jpg" },
  { name: "MSAI", desc: "Multiple Self-Assessment Inventory", duration: 60, price: 150000, img: "/msai.jpg" },
  { name: "MSDT", desc: "Multi-Stage Diagnostic Test", duration: 30, price: 150000, img: "/msdt.jpg" },
  { name: "Papikostick", desc: "Papikostick Handwriting Personality Test", duration: 60, price: 150000, img: "/papikostick.jpg" },
  { name: "RMIB", desc: "Rothwell-Miller Interest Blank", duration: 60, price: 150000, img: "/rmib.jpg" },
  { name: "TIU5", desc: "TIU Cognitive Ability Test Level 5", duration: 60, price: 150000, img: "/tiu.jpg" },
  { name: "TIU6", desc: "TIU Cognitive Ability Test Level 6", duration: 60, price: 150000, img: "/tiu6.jpg" },
  { name: "Wartegg", desc: "Wartegg Drawing Personality Test", duration: 60, price: 150000, img: "/wartegg.jpg" },
  { name: "Adversity Quotient", desc: "Adversity Quotient Test (Resilience Assessment)", duration: 60, price: 150000, img: "/adversity-quotient.jpg" },
  { name: "Kuder", desc: "Kuder Career Interest Survey", duration: 60, price: 150000, img: "/kuder.jpg" },
  { name: "SPM", desc: "Standard Progressive Matrices (Raven's IQ Test)", duration: 60, price: 150000, img: "/spm.jpg" },
  { name: "WPT", desc: "Wonderlic Personnel Test (Cognitive Ability)", duration: 60, price: 150000, img: "/wpt.jpg" },
  { name: "CFIT 2 FORM A", desc: "Culture Fair Intelligence Test 2 - Form A", duration: 60, price: 150000, img: "/cfit2a.jpg" },
  { name: "CFIT 2 FORM B", desc: "Culture Fair Intelligence Test 2 - Form B", duration: 60, price: 150000, img: "/cfit2b.jpg" },
  { name: "CFIT 3 FORM A", desc: "Culture Fair Intelligence Test 3 - Form A", duration: 60, price: 150000, img: "/cfit3a.jpg" },
  { name: "CFIT 3 FORM B", desc: "Culture Fair Intelligence Test 3 - Form B", duration: 60, price: 150000, img: "/cfit3b.jpg" },
  { name: "Pauli", desc: "Pauli Personality Test", duration: 60, price: 100000, img: "/pauli.jpg" },
  { name: "FRT", desc: "Figural Reasoning Test", duration: 60, price: 150000, img: "/frt.jpg" },
  { name: "Aptitude Test", desc: "General Aptitude Test", duration: 60, price: 150000, img: "/aptitude.jpg" },
  { name: "Enneagram", desc: "Enneagram Personality Typing Test", duration: 60, price: 150000, img: "/enneagram.jpg" },
];

// ==== SUBTEST IST ====
const ISTSubTests = [
  { name: "SE", duration: 6 },
  { name: "WA", duration: 6 },
  { name: "AN", duration: 7 },
  { name: "GE", duration: 8 },
  { name: "RA", duration: 10 },
  { name: "ZR", duration: 10 },
  { name: "FA", duration: 7 },
  { name: "WU", duration: 9 },
  { name: "ME", duration: 3 },
];

// ==== SEED TEST TYPES (pakai upsert) ====
async function seedTestTypes() {
  for (const test of testTypes) {
    await prisma.testType.upsert({
      where: { name: test.name },
      update: {
        desc: test.desc,
        duration: test.duration,
        price: test.price,
      },
      create: test,
    });
  }
  console.log("✅ TestType inserted/updated");
}

// ==== SEED SUBTEST ====
async function seedISTSubTests() {
  const istTest = await prisma.testType.findUnique({
    where: { name: "IST" }
  });
  if (!istTest) return console.error("❌ TestType IST belum ada");

  for (const sub of ISTSubTests) {
    await prisma.subTest.upsert({
      where: { testTypeId_name: { testTypeId: istTest.id, name: sub.name } },
      update: {
        duration: sub.duration,
        desc: `Subtest ${sub.name} IST`,
      },
      create: {
        testTypeId: istTest.id,
        name: sub.name,
        desc: `Subtest ${sub.name} IST`,
        duration: sub.duration,
      },
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
  await seedISTSubTests();
  await seedUser();
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());
