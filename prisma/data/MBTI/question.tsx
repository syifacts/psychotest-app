export const MBTIQuestions = [
  {
    dimension: 'EI', // Mengukur Extraversion vs Introversion
    type: "single" as const,
    content: "Pada sebuah pesta, apakah Anda:",
    options: {
      a: "Bergaul dengan banyak orang termasuk orang-orang yang baru Anda kenal.", // Pilihan 'a' mengarah ke Extraversion (E)
      b: "Bergaul dengan beberapa orang yang telah Anda kenal saja.", // Pilihan 'b' mengarah ke Introversion (I)
    }
  },
  {
    dimension: 'SN', // Mengukur Sensing vs Intuition
    type: "single" as const,
    content: "Apakah Anda lebih:",
    options: {
      a: "Realistis.", // Pilihan 'a' mengarah ke Sensing (S)
      b: "Spekulatif.", // Pilihan 'b' mengarah ke Intuition (N)
    }
  },
  {
    dimension: 'SN', // Pertanyaan ini juga bisa mengukur S vs N
    type: "single" as const,
    content: "Adalah hal yang buruk:",
    options: {
      a: "Tenggelam dalam mengandai-andai.", // Memilih ini cenderung Sensing (S)
      b: "Terlanjur basah kerepotan di tengah jalan.", // Memilih ini cenderung Intuition (N)
    }
  },
  {
    dimension: 'TF', // Mengukur Thinking vs Feeling
    type: "single" as const,
    content: "Biasanya Anda lebih terkesan dengan:",
    options: {
      a: "Prinsip.", // Pilihan 'a' mengarah ke Thinking (T)
      b: "Perasaan.", // Pilihan 'b' mengarah ke Feeling (F)
    }
  },
  {
    dimension: 'TF', // Mengukur Thinking vs Feeling
    type: "single" as const,
    content: "Apakah Anda cenderung lebih terjelaskan melalui:",
    options: {
      a: "Argumen logis.", // Pilihan 'a' mengarah ke Thinking (T)
      b: "Perasaan.", // Pilihan 'b' mengarah ke Feeling (F)
    }
  },
  // ... Tambahkan lebih banyak pertanyaan untuk semua dimensi (EI, SN, TF, JP)
];