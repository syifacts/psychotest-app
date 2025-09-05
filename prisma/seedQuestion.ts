import { prisma } from "../lib/prisma";

// ==== DEFINISI TYPE UNTUK SOAL ====
type SingleAnswerQuestion = {
  content: string;
  type?: "single";
  options: string[];
  answer: string; // satu jawaban benar
};

type MultipleChoiceQuestion = {
  content: string;
  type: "mc";
  options: string[];
  answer: string[]; // bisa lebih dari 1 jawaban
};

type EssayQuestion = {
  content: string;
  type: "essay";
  options: string[];
  answerScores: { keyword: string; score: number }[]; // keyword + skor
};

type ImageQuestion = {
  content: string;       // URL/path gambar soal
  type: "single";
  options: string[];     // array URL/path gambar opsi
  answer: string;        // "A", "B", "C", dst
};

// Union type
export type QuestionData =
  | SingleAnswerQuestion
  | MultipleChoiceQuestion
  | EssayQuestion
  | ImageQuestion;

// ==== IMPORT SOAL DARI FILE DATA ====
import { ISTQuestions as SEQuestions } from "./data/IST/questionSE";
import { ISTQuestions as WAQuestions } from "./data/IST/questionWA";
import { ISTQuestions as ANQuestions } from "./data/IST/questionAN";
import { ISTQuestions as GEQuestions } from "./data/IST/questionGE";
import { ISTQuestions as RAQuestions } from "./data/IST/questionRA";
import { ISTQuestions as ZRQuestions } from "./data/IST/questionZR";
import { ISTQuestions as FAQuestions } from "./data/IST/questionFA";
import { ISTQuestions as WUQuestions } from "./data/IST/questionWU";
import { ISTQuestions as MEQuestions } from "./data/IST/questionME";

// Daftar subtest yang mau di-seed
const subtests: { name: string; questions: QuestionData[] }[] = [
  { name: "SE", questions: SEQuestions },
  { name: "WA", questions: WAQuestions },
  { name: "AN", questions: ANQuestions },
  { name: "GE", questions: GEQuestions }, // masih kosong
  { name: "RA", questions: RAQuestions },
  { name: "ZR", questions: ZRQuestions },
  { name: "FA", questions: FAQuestions },
  { name: "WU", questions: WUQuestions },
  { name: "ME", questions: MEQuestions },
];

async function seedISTQuestions() {
  for (const { name, questions } of subtests) {
    // Cari subtest berdasarkan nama + test type IST
    const subTest = await prisma.subTest.findFirst({
      where: { name, TestType: { name: "IST" } },
    });

    if (!subTest) {
      console.error(`❌ SubTest ${name} belum ada`);
      continue;
    }

    // Loop dengan index → bikin code unik (SE-1, WA-3, dst)
    for (const [index, q] of questions.entries()) {
      const code = `${name}-${index + 1}`;

      await prisma.question.upsert({
  where: { code },
  update: {},
  create: {
    code,
    subTestId: subTest.id,
    content: q.content,
    options: q.options ?? [],
    type: q.type ?? "single",           // <--- tambahkan ini
    answer: "answer" in q ? q.answer : undefined,
    answerScores: "answerScores" in q ? q.answerScores : undefined,
  },
});

    }

    console.log(`✅ Semua soal ${name} berhasil di-seed!`);
  }
}

seedISTQuestions()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect());

