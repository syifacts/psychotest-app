// /prisma/data/BFI/questionBFI.tsx

export type Trait = "Openness" | "Conscientiousness" | "Extraversion" | "Agreeableness" | "Neuroticism";

export interface BFIQuestion {
  id: number;
  content: string;
  trait: Trait;
  reverse?: boolean; // true kalau itemnya reverse-scored
}

// Pertanyaan 1-44 sesuai gambar yang kamu kirim
export const BigFiveQuestions: BFIQuestion[] = [
  { id: 1, content: "Cenderung banyak bicara", trait: "Extraversion" },
  { id: 2, content: "Cenderung mengkritik orang lain", trait: "Agreeableness", reverse: true },
  { id: 3, content: "Melakukan tugas dengan seksama", trait: "Conscientiousness" },
  { id: 4, content: "Mudah merasa cemas", trait: "Neuroticism" },
  { id: 5, content: "Memiliki imajinasi yang aktif", trait: "Openness" },
  { id: 6, content: "Cenderung pendiam", trait: "Extraversion", reverse: true },
  { id: 7, content: "Cenderung suka menolong orang lain", trait: "Agreeableness" },
  { id: 8, content: "Kadang bersikap ceroboh", trait: "Conscientiousness", reverse: true },
  { id: 9, content: "Tenang, dapat menangani tekanan", trait: "Neuroticism", reverse: true },
  { id: 10, content: "Kurang tertarik pada seni", trait: "Openness", reverse: true },
  { id: 11, content: "Suka bersikap tegas", trait: "Extraversion" },
  { id: 12, content: "Kadang bersikap dingin dan tidak peduli", trait: "Agreeableness", reverse: true },
  { id: 13, content: "Dapat diandalkan, selalu bisa dipercaya", trait: "Conscientiousness" },
  { id: 14, content: "Mudah merasa tegang", trait: "Neuroticism" },
  { id: 15, content: "Suka berkhayal", trait: "Openness" },
  { id: 16, content: "Cenderung pasif", trait: "Extraversion", reverse: true },
  { id: 17, content: "Cenderung ramah dan hangat", trait: "Agreeableness" },
  { id: 18, content: "Suka menunda pekerjaan", trait: "Conscientiousness", reverse: true },
  { id: 19, content: "Emosional, mudah berubah perasaan", trait: "Neuroticism" },
  { id: 20, content: "Cenderung berpikiran sempit", trait: "Openness", reverse: true },
  { id: 21, content: "Penuh energi", trait: "Extraversion" },
  { id: 22, content: "Percaya pada orang lain", trait: "Agreeableness" },
  { id: 23, content: "Tepat waktu, disiplin", trait: "Conscientiousness" },
  { id: 24, content: "Mudah merasa gugup", trait: "Neuroticism" },
  { id: 25, content: "Suka dengan ide-ide baru", trait: "Openness" },
  { id: 26, content: "Cenderung pendiam di kelompok", trait: "Extraversion", reverse: true },
  { id: 27, content: "Kadang suka bersikap kasar", trait: "Agreeableness", reverse: true },
  { id: 28, content: "Bekerja dengan hati-hati", trait: "Conscientiousness" },
  { id: 29, content: "Mudah merasa sedih", trait: "Neuroticism" },
  { id: 30, content: "Memiliki minat yang luas", trait: "Openness" },
  { id: 31, content: "Suka bergaul", trait: "Extraversion" },
  { id: 32, content: "Bersikap hangat terhadap orang lain", trait: "Agreeableness" },
  { id: 33, content: "Cenderung tidak bertanggung jawab", trait: "Conscientiousness", reverse: true },
  { id: 34, content: "Stabil secara emosional", trait: "Neuroticism", reverse: true },
  { id: 35, content: "Kurang imajinatif", trait: "Openness", reverse: true },
  { id: 36, content: "Cenderung aktif", trait: "Extraversion" },
  { id: 37, content: "Kadang egois", trait: "Agreeableness", reverse: true },
  { id: 38, content: "Menyelesaikan tugas dengan baik", trait: "Conscientiousness" },
  { id: 39, content: "Kadang merasa tidak aman", trait: "Neuroticism" },
  { id: 40, content: "Tertarik pada seni, musik, atau sastra", trait: "Openness" },
  { id: 41, content: "Penuh antusiasme", trait: "Extraversion" },
  { id: 42, content: "Suka membantu orang lain", trait: "Agreeableness" },
  { id: 43, content: "Kadang kurang teliti", trait: "Conscientiousness", reverse: true },
  { id: 44, content: "Jarang merasa tertekan", trait: "Neuroticism", reverse: true }
];

export const LikertOptions = [
  { value: 1, label: "Sangat Tidak Setuju" },
  { value: 2, label: "Tidak Setuju" },
  { value: 3, label: "Netral" },
  { value: 4, label: "Setuju" },
  { value: 5, label: "Sangat Setuju" },
];
