export const CPMIquestions = [
  {
    content: "MENUAI adalah lawan kata dari ...  ",
    type: "single" as const,
    options: [
      "mendapat",
      "bersorak",
      "melanjutkan",
      "berada",
      "menabur"
    ],
     answer: "5",
     notes: "Jawaban yang benar adalah “menabur”. Maka, pilihlah jawaban angka 5.",
  },
    {
    content: "Harga setiap kotak  ‘paper clip’ adalah  23 rupiah. Berapa harga 4 kotak?  ",
    type: "essay" as const,
    options: [
    ],
    answer: [ "92"],
     //notes: "Jawabannya adalah Rp.92. Jawablah 'Rp.92' atau jawablah hanya kuantitas (angkanya) saja seperti '92'.",
     notes: "Jawabannya adalah 92. Jawablah '92'. Untuk soal dengan jawaban angka, cukup menjawab hanya angka (nominal atau kuantitas) saja tanpa spasi lebih maupun kalimat tambahan.",
    },

      {
    content: "MINER     MINOR   -  Apakah kata-kata ini ",
    type: "single" as const,
    options: [
      "memiliki arti sama",
      "memiliki arti berlawanan",
      "tidak memiliki arti sama atau berlawanan "
    ],
     answer: "3",
     notes: "Jawaban yang benar adalah ‘tidak memiliki arti sama atau berlawanan (Nomor 3). Maka, pilihlah jawaban angka 3",
  },
  //soal utama 1
    {
    content: "Bulan lalu pada awal  tahun ini adalah...  ",
    type: "single" as const,
    options: [
      "Januari",
      "Maret",
      "Juli",
      "Desember",
      "Oktober"
    ],
     answer: "4",
  },
   {
    content: "MENANGKAP adalah lawan kata dari...  ",
    type: "single" as const,
    options: [
      "meletakkan",
      "membebaskan",
      "beresiko",
      "berusaha",
      "turun tingkat"
    ],
     answer: "2",
  },
  {
    content: "Sebagian besar hal dibawah ini serupa satu sama lain. Manakah salah satu diantaranya yang kurang serupa dengan yang lain?",
    type: "single" as const,
    options: [
      "Januari",
      "Agustus",
      "Rabu",
      "Oktober",
      "Desember"
    ],
    answer: "3"
  },
  {
    content: "Jawablah dengan menuliskan YA atau TIDAK. \n  Apakah RSVP berarti ‘jawablah yang tidak perlu?",
    type: "essay" as const,
    options: [],
    answer: ["tidak", "n", "t", "no"]
  },
  {
    content: "Dalam kelompok kata berikut, manakah kata yang berbeda dari kata yang lain?",
    type: "single" as const,
    options: [
      "pasukan",
      "liga",
      "berpartisipasi",
      "pak",
      "kelompok"
    ],
    answer: "3"
  },
  {
    content: "BIASA adalah lawan kata dari...",
    type: "single" as const,
    options: [
      "jarang",
      "terbiasa",
      "tetap",
      "berhenti",
      "selalu"
    ],
    answer: "1"
  },
    {
    content: "Gambar manakah yang terbuat dari dua gambar di dalam tanda kurung?",
    image: "/WPTsoal7.jpg",
    type: "single" as const,
    options: [
      "/WPTsoal7_pilihan1.jpg",
      "/WPTsoal7_pilihan2.jpg",
      "/WPTsoal7_pilihan3.jpg",
      "/WPTsoal7_pilihan4.jpg",
      "/WPTsoal7_pilihan5.jpg"
    ],
    answer: "3"
  },
    {
    content: "Perhatikan urutan angka berikut. Angka berapa yang selanjutnya muncul?  8, 4, 2, 1, ½, ¼ ...",
    type: "essay" as const,
    answer: ["0.125", "0,125", "1/8"]
  },
  {
    content: "Klien dan Pelanggan. Apakah kata-kata ini:",
    type: "single" as const,
    options: [
      "memiliki arti yang sama",
      "memiliki arti berlawanan",
      "tidak memiliki arti sama atau berlainan"
    ],
    answer: "1"
  },
  {
    content: "Manakah kata berikut ini yang berhubungan dengan aroma saat gigi mengunyah?",
    type: "single" as const,
    options: [
      "manis",
      "bau tak sedap",
      "bau wangi",
      "hidung",
      "bersih"
    ],
    answer: "4"
  },
  {
    content: "MUSIM GUGUR adalah lawan dari:",
    type: "single" as const,
    options: [
      "liburan",
      "musim panas",
      "musim semi",
      "musim dingin",
      "musim gugur"
    ],
    answer: "3"
  },
  {
    content: "Sebuah pesawat terbang 300 kaki dalam ½ detik. Pada kecepatan yang sama berapa kaki ia terbang dalam 10 detik?",
    type: "essay" as const,
    options: [],
     answer: ["6000", "enam ribu"]
  },
  {
    content: "Anggaplah dua pernyataan pertama adalah benar. Apakah yang terakhir benar, salah, atau tidak tahu?\n1) Anak-anak lelaki ini adalah anak yang normal.\n2) Semua anak normal sifatnya aktif.\n3) Anak-anak lelaki ini aktif.",
    type: "single" as const,
    options: [
      "benar",
      "salah",
      "tidak tahu"
    ],
    answer: "1"
  },
  {
    content: "JAUH adalah lawan kata dari:",
    type: "single" as const,
    options: [
      "terpencil",
      "dekat",
      "jauh",
      "terburu-buru",
      "pasti"
    ],
    answer: "2"
  },
  {
    content: "3 permen lemon seharga 10 rupiah. Berapa harga ½ lusin?",
    type: "essay" as const,
    options: [],
     answer: ["20", "20 rupiah", "Rp.20"]
  },
    {
    //content: "Berapa banyak duplikasi yang sama dari lima pasangan angka dibawah ini? \n1) 84721  84721 \n1)  9210651  9210561 \n1) 14201201 14210210 \n1) 96101101  96101161 \n1) 88884444 88884444 ",
    content: `Berapa banyak duplikasi yang sama dari lima pasangan angka di bawah ini?
 1) 84721   84721
 2) 9210651 9210561
 3) 14201201 14210210
 4) 96101101 96101161
 5) 88884444 88884444`,
    type: "essay" as const,
    options: [],
    answer: ["2", "dua", "2 buah", "dua buah"]
    // answerScore: [
    //    { keyword: "2", score: 1 },
    //    { keyword: "dua", score: 1 },
    //    { keyword: "2 buah", score: 1 },
    //    { keyword: "dua buah", score: 1 }
    // ]
  },
{
  content: `Misalkan Anda menyusun kata-kata berikut sehingga menjadi pernyataan yang benar. 
Lalu tuliskan huruf terakhir dari kata terakhir sebagai jawaban. \n
Selalu   sebuah   kata kerja    kalimat   suatu    memiliki`,
  type: "essay" as const,
  answer: [ 'a']
  // answerScore: [
  //      { keyword: "a", score: 1 },
  // ]
},
{
  content: `Anak lelaki berumur 5 tahun dan saudara perempuannya dua kali lebih tua. 
Ketika anak lelaki itu berumur 8 tahun, berapa umur saudara perempuannya?`,
  type: "essay" as const,
  answer: ["13", "13 tahun", "Tiga Belas", "Tiga Belas Tahun"]
},
{
  content: `IT'S  | ITS \n
Apakah kata ini:`,
  type: "single" as const,
  options: [
    "memiliki arti yang sama",
    "memiliki arti yang berlawanan",
    "tidak memiliki arti yang sama atau berlawanan"
  ],
  answer: 3
},
{
  content: `Anggaplah dua pernyataan pertama adalah benar. Apakah pernyataan terakhir:
1) John seusia dengan Sally.
2) Sally lebih muda dari Bill.
3) John lebih muda dari Bill.`,
  type: "single" as const,
  options: [
    "benar",
    "salah",
    "tidak tahu"
  ],
  answer: "1"
},
{
  content: `Seorang dealer membeli beberapa barrel seharga 4.000 rupiah. 
Ia menjual dengan harga 5.000 rupiah, mendapat untung 50 rupiah setiap barrel. 
Berapa banyak barel yang dijual?`,
  type: "essay" as const,
   answer: ["20", "dua puluh", "20 barrel", "dua puluh barrel"]
  // answerScore: [
  //      { keyword: "20", score: 1 },
  //      { keyword: "dua puluh", score: 1 },
  //      { keyword: "", score: 1 },
  //      { keyword: "Tiga Belas Tahun", score: 1 },
  //      { keyword: "Tiga Belas", score: 1 },
  // ]
},
{
  content: `Misalkan Anda menyusun kata-kata berikut sehingga menjadi kalimat lengkap. 
Jika kalimat itu benar, tulislah (B). Jika salah, tulislah (S).
telur     menghasilkan    semua    ayam`,
  type: "single" as const,
  options: [
    "B",
    "S"
  ],
  answer: "S"
},
{
  content: `Dua dari peribahasa berikut ini memiliki arti sama. Manakah itu? \n
1) Semakin banyak memiliki sapi, akan memiliki satu anak sapi yang buruk
2) Anak seperti Ayahnya
3) Bila tertinggal sama jauhnya dengan satu mil
4) Seorang dikenal dari persahabatan yang dijalin
5) Mereka adalah benih dari mangkuk yang sama`,
    type: "essay" as const,
options: [],
  answer: ["2 dan 5", "2,5", "2 5", "25"]
},
{
  content: "Sebuah jam terlambat 1 menit 18 detik dalam 39 hari. Berapa detik ia terlambat dalam sehari?",
  type: "essay" as const,
  answer: ["2", "2 detik", "dua"]
},
{
  content: "CANVASS  |  CANVAS\nApakah kata-kata ini:",
  type: "single" as const,
  options: [
    "memiliki arti yang sama",
    "memiliki arti yang berlawanan",
    "tidak memiliki arti sama atau berlawanan"
  ],
  answer: "3"
},
{
  content: `Anggaplah dua pernyataan pertama adalah benar. Pernyataan terakhir:
1) Semua siswa mengikuti ujian.
2) Beberapa orang di ruangan ini adalah siswa.
3) Beberapa orang di ruangan ini mengikuti ujian.
Pernyataan (3) apakah:`,
  type: "single" as const,
  options: [
    "benar",
    "salah",
    "tidak tahu"
  ],
  answer: "1"
},
{
  content: "Dalam 30 hari seorang menabung 1 dolar. Berapa rata-rata tabungannya setiap hari?",
  type: "essay" as const,
  answer: ["1/30", "0.0333", "0,0333", "0,03333", "0.03333", "1/30 dolar", "0,0333333333333333", "0,033"]
},
{
  content: "INGENIOUS |  INGENUOUS\nApakah kata-kata ini:",
  type: "single" as const,
  options: [
    "memiliki arti sama",
    "memiliki arti berlawanan",
    "tidak memiliki arti sama atau berlawanan"
  ],
  answer: "3"
},
{
  content: "Dua orang menangkap 36 ikan. X menangkap 5 kali lebih banyak dari Y. Berapa ikan yang ditangkap Y?",
  type: "essay" as const,
  answer: ["6", "enam"]
},
{
  content: "Sebuah kotak segi empat, yang terisi penuh, memuat 800 kubik kaki gandum. Jika satu kotak lebarnya 8 kaki dan panjangnya 10 kaki, berapa kedalaman kotak itu?",
  type: "essay" as const,
  answer: ["10", "10 kaki", "sepuluh"]
},
{
  content: "Satu angka dari rangkaian berikut tidak cocok dengan pola angka yang lainnya. Angka manakah itu?\n½, ¼, 1/6, 1/8, 1/9, 1/12",
  type: "single" as const,
  options: [
    "1/2",
    "1/4",
    "1/6",
    "1/8",
    "1/9",
    "1/12"
  ],
  // yang tidak seragam (semua denominators genap kecuali 9)
  answer: "5"
},
// soal 32-38 (tambahkan ke CPMIquestions)
{
  content: "Jawablah pertanyaan ini dengan menulis YA atau TIDAK. \n Apakah P.M. berarti ‘post merediem’?",
  type: "essay" as const,
  options: [],
  answer: "YA"
},
{
  content: "DAPAT DIPERCAYA    GAMPANG PERCAYA\nApakah kata-kata ini:",
  type: "single" as const,
  options: [
    "memiliki arti yang sama",
    "memiliki arti berlawanan",
    "tidak memiliki arti sama atau berlainan"
  ],
  answer: "3"
},
{
  content: "Sebuah rok membutuhkan 2 ¼ meter kain. Berapa banyak potong yang dihasilkan dari 45 meter kain?",
  type: "essay" as const,
  answer: ["20", "dua puluh", "20 potong"]
},
{
  content: "Sebuah jam menunjuk tepat pada pukul 12 siang hari pada hari Senin. Pada pukul 2 siang, hari Rabu, jam itu terlambat 26 detik. Pada rata-rata yang sama, berapa banyak jam itu terlambat dalam ½ jam?",
  type: "essay" as const,
  answer: ["0.25", "0.250", "0,25 detik", "0.250 detik"]
},
{
  content: "Tim bisbol kami kalah 9 permainan dalam musim ini. Ini merupakan 3/8 bagian dari semua pertandingan mereka. Berapa banyak pertandingan yang mereka mainkan dalam musim kompetisi saat ini?",
  type: "essay" as const,
  answer: ["24", "dua puluh empat"]
},
{
  content: "Apakah angka selanjutnya dari seri ini? 1, 0.5, 0.25, 0.125, ...",
  type: "essay" as const,
  answer: ["0.0625", "0,0625", "1/16"]
},
{
  content: `Bentuk geometris ini dapat dibagi oleh suatu garis lurus menjadi dua bagian yang dapat disatukan dengan suatu cara hingga membentuk bujur sangkar yang sempurna. 
Gambarlah garis yang menghubungkan dua dari angka-angka yang ada. Lalu tuliskan angka tersebut sebagai jawaban.`,
  type: "essay" as const,
  image: "/WPTsoal38.jpg",
  answer: ["6,9", "6 dan 9", "6 9", "6, 9", "69"],
},
{
  content: "Apakah arti dari kalimat berikut: Sebuah sapu yang baru menyapu dengan bersih. Sepatu yang sudah lama sifatnya makin lunak...",
  type: "single" as const,
  options: ["sama", "berlawanan", "tidak sama atau berlawanan"],
  answer: "2"
},
{
    content: `Berapa banyak duplikasi yang sama dari lima pasangan kata di bawah ini?
1) Rexford, J.D.   Rockford, J.D.
2) Singleton, M.O.   Simbleten, M.O.
3) Richards, W.E.   Richad, W.E.
4) Siegel, A.B.   Seigel, A.B.
5) Wood, A.O.   Wood, A.O.`,
  type: "essay" as const,
  answer: ["1", "satu"]
},
{
   content: `Dua dari peribahasa ini memiliki makna yang serupa. Manakah itu?
1. Anda tidak dapat membuat dompet sutra dari kuping babi betina.
2. Orang yang mencuri telur akan mencuri sapi.
3. Batu yang berguling tidak akan mengumpulkan lumut.
4. Anda tidak mungkin menghancurkan kapal yang sudah rusak.
5. Ini ketidakmungkinan yang terjadi.`,
type: "essay" as const,
  answer: ["1 dan 4", "1,4", "1 4", "1, 4", "14"]
},
{
  content: "Gambar geometris ini dapat dibagi dengan garis lurus menjadi dua bagian yang dapat disatukan untuk membentuk sebuah bujur sangkar yang sempurna. Gambarlah suatu garis dengan menghubungkan dua angka. Lalu tulislah angka itu sebagai jawaban.",
   type: "essay" as const,
  image: "/WPTsoal42.jpg",
  answer: ["3,22", "3 dan 22", "3 22", "3, 22", "322"],
},
//43
{
  content: `Dalam kelompok angka berikut ini, manakah angka yang terkecil?
10    1    .999    .33     11`,
  type: "essay" as const,
  answer: ["0.33", ".33", "0,33", "33/100"]
},
{
  content: "Apakah makna dari kalimat berikut: Tidak ada orang jujur meminta maaf atas kejujurannya. Kejujuran dihormati dan lapar pujian.",
  type: "single" as const,
  options: ["sama", "berlawanan", "tidak sama atau berlawanan"],
  answer: "2"
},
{
  content: `Dengan harga 1.80 dolar, seorang grosir membeli satu kardus buah yang berisi 12 lusin. 
Ia tahu dua lusin akan busuk sebelum dia menjualnya. 
Dengan harga berapa per lusin dia harus menjual jeruk itu untuk mendapat 1/3 dari harga seluruhnya?`,
  type: "essay" as const,
    answer: ["0.24", "0,24", "24 sen", "0.24 dolar", "0,24 dolar"]
},
{
  content: "Dalam rangkaian kata berikut ini, manakah kata yang berbeda dari yang lainnya?",
  options: [ "koloni", "perkawanan", "kawanan" , "kru", "konstelasi"
  ],
  type: "single" as const,
  answer: ["2"]
},
{
  content: `Anggaplah dua pernyataan pertama ini benar. Apakah pertanyaan terakhir: 
1. benar    2. salah    3. tidak tahu
Orang besar dibodohi. Saya dibodohi. Saya adalah orang besar.`,
  type: "single" as const,
  options: ["benar", "salah", "tidak tahu"],
  answer: "3"
},
{
  content: `Tiga orang membentuk kemitraan dan setuju membagi keuntungan secara rata. 
X menginvestasi 4.500 dolar. Y sebesar 3.500 dolar dan Z sebesar 2.000 dolar. 
Jika keuntungan mencapai 1.500 dolar, lebih kurang berapa yang akan diperoleh X dibanding jika keuntungan dibagi berdasarkan besarnya investasi?`,
  type: "essay" as const,
   answer: ["175", "175 dolar", "175 dollar", "seratus tujuh puluh lima"]
},
{
  content: "Empat dari 5 bagian ini dapat digabungkan untuk membuat segitiga. Manakah keempat gambar ini?",
  type: "essay" as const,
  options: [
"/WPTsoal49_pilihan1.jpg",
"/WPTsoal49_pilihan2.jpg",
"/WPTsoal49_pilihan3.jpg",
"/WPTsoal49_pilihan4.jpg",
"/WPTsoal49_pilihan5.jpg"
  ],
  answer: ["1,2,4,5", "1245", "1 2 4 5", "1 dan 2 dan 4 dan 5", "1, 2, 4 dan 5"]
},
{
  content: "Untuk mencetak sebuah artikel berisi 30.000 kata, sebuah percetakan memutuskan untuk memakai dua ukuran jenis. Dengan menggunakan tipe yang lebih besar, sebuah halaman tercetak akan memuat 1.200 kata. Dengan tipe yang lebih kecil, sebuah halaman memuat 1.500 kata. Artikel ini masuk dalam 22 halaman di majalah. Berapa banyak halaman yang dibutuhkan untuk tipe yang lebih kecil?",
  type: "essay" as const,
  answer: ["12", "dua belas", "12 halaman"]
}



// {
//     content: "zyioayu1237865432   dan  zyioayu1237865432   ",
//     type: "single" as const,
//     options: [
//       "A. Sama",
//       "B. Berbeda",
//       "C. Tidak ada jawaban yang tepat."
//     ],
//     aspek: "Konsentrasi",
//     answerScores: [  
//       { options: "A. Sama", score: 3 },
//       { options: "B. Berbeda", score: 2 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 1 },
//     ],
//   },
//   {
//      content: "cfgho#$%^&*()3$%^&*   dan   cfgho#$%^&*()3$%^&*   ",
//     type: "single" as const,
//     options: [
//       "A. Sama",
//       "B. Berbeda",
//       "C. Tidak ada jawaban yang tepat."
//     ],
//     aspek: "Konsentrasi",
//     answerScores: [  
//       { options: "A. Sama", score: 3 },
//       { options: "B. Berbeda", score: 2 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 1 },
//     ]
//   },
//     {
//      content: "yzuop94%^&*()3@567   dan   yzuop94%^&*()3@567    ",
//     type: "single" as const,
//     options: [
//       "A. Sama",
//       "B. Berbeda",
//       "C. Tidak ada jawaban yang tepat."
//     ],
//     aspek: "Konsentrasi",
//     answerScores: [  
//       { options: "A. Sama", score: 3 },
//       { options: "B. Berbeda", score: 2 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 1 },
//     ]
//   },
//       {
//      content: "chjkjlpoiuertyioewty   dan chj kjlpoiuertyoewty    ",
//     type: "single" as const,
//     options: [
//       "A. Sama",
//       "B. Berbeda",
//       "C. Tidak ada jawaban yang tepat."
//     ],
//     aspek: "Kecermatan",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//      content: "noinmeruiop098657346   dan  noinmeruiop09867346      ",
//     type: "single" as const,
//     options: [
//       "A. Sama",
//       "B. Berbeda",
//       "C. Tidak ada jawaban yang tepat."
//     ],
//     aspek: "Kecermatan",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//      content: "yuiolkcjnmkp9856$%^&8*   dan yuiolkcjnmp9856$%^&8*     ",
//     type: "single" as const,
//     options: [
//       "A. Sama",
//       "B. Berbeda",
//       "C. Tidak ada jawaban yang tepat."
//     ],
//     aspek: "Kecermatan",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//     content: "Bagi saya, mengeluh itu adalah hal yang wajar karena memang hidup saya kurang beruntung.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Pengendalian Diri",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//     content: "Saya merasa bahwa marah yang tak terkendali memang harus dilakukan.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Pengendalian Diri",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//     content: "Bersikap tidak jujur adalah hal yang wajar.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Pengendalian Diri",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//     content: "Ketika menghadapi perkelahian dengan orang lain, saya harus menjadi pemenang.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Stabilitas Emosi",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//     content: "Orang lain harus tunduk kepada saya.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Stabilitas Emosi",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//     content: "Mengalah kepada orang lain adalah hal yang tabu untuk saya.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Stabilitas Emosi",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//   {
//     content: "Melempar barang-barang dapat meredakan rasa stres saya.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Penyesuaian Diri",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//    {
//     content: "Memaki pengendara lain di jalan menjadi kepuasan bagi saya.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Penyesuaian Diri",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//    {
//     content: "Melanggar peraturan adalah hal yang wajar ketika dikejar oleh waktu.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Penyesuaian Diri",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//    {
//     content: "Bagi saya membalas tindakan orang lain yang tidak menyenangkan, memang perlu dilakukan.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Ketahanan Kerja",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//    {
//     content: "Ketika saya cemas, berpengaruh pada kondisi fisik saya.",
//     type: "single" as const,
//     options: [
//       "A. Setuju",
//       "B. Tidak Setuju",
//       "C. Tidak Tahu."
//     ],
//     aspek: "Ketahanan Kerja",
//     answerScores: [  
//       { options: "A. Sama", score: 1 },
//       { options: "B. Berbeda", score: 3 },
//       { options: "C. Tidak ada jawaban yang tepat.", score: 2 },
//     ]
//   },
//    {
//     content: "Bagi saya aturan itu.....",
//     type: "single" as const,
//     options: [
//       "A. Membatasi",
//       "B. Membantu",
//       "C. Sekedar Simbol."
//     ],
//     aspek: "Ketahanan Kerja",
//     answerScores: [  
//       { options: "A.  Membatasi", score: 1 },
//       { options: "B. Membantu", score: 3 },
//       { options: "C. Sekedar Simbol.", score: 2 },
//     ]
//   },
];