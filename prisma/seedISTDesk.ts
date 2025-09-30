import { prisma } from "../lib/prisma"; // Sesuaikan path jika perlu

async function main() {
  // Ambil dulu TestType yang sudah ada
  const istTest = await prisma.testType.findUnique({
    where: { name: "IST" },
  });

  if (!istTest) throw new Error("TestType IST belum ada");

  // Tambahkan beberapa SubTest
  await prisma.subTest.createMany({
    data: [
 {
       //   id: 1, // tambahkan id manual
  testTypeId: istTest.id,
  name: "SE",
  desc: `Soal-soal 01-20 terdiri atas kalimat-kalimat. 
Pada setiap kalimat satu kata hilang dan disediakan 5 (lima) kata pilihan sebagai penggantinya. Pilihan kata yang tepat dapat menyempurnakan kalimat itu!

Contoh 01
Seekor kuda mempunyai kesamaan terbanyak dengan seekor …..
a) kucing b) bajing c) keledai d) lembu e) anjing
Jawaban yang benar ialah : c) keledai
Oleh karena itu, pilihlah jawaban yang benar tersebut, pilihan C harus dijawab.

Contoh berikutnya :
Lawannya “harapan” ialah …..
a) duka b) putus asa c) sengsara d) cinta e) benci
Jawabannya ialah b) putus asa
Maka pilihan B yang seharusnya dijawab.`,
  duration: 6,
},

{
     //     id: 2, // tambahkan id manual
  testTypeId: istTest.id,
  name: "WA",
  desc: `Ditentukan 5 kata.
Pada 4 dari 5 kata itu terdapat suatu kesamaan.
Carilah kata yang kelima yang tidak memiliki kesamaan dengan keempat kata itu..

Contoh 02
a) meja  b) kursi  c) burung  d) lemari  e) tempat tidur
a), b), d), dan e) ialah perabot rumah (meubel)
c) burung, bukan perabot rumah atau tidak memiliki kesamaan dengan keempat kata itu.
Oleh karena itu, pilihan c harus dipilih.

Contoh berikutnya:
a) duduk  b) berbaring  c) berdiri  d) berjalan  e) berjongkok
pada a), b), c) dan e) orang berada dalam keadaan tidak bergerak, sedangkan d) orang dalam keadaan bergerak.
Maka jawaban yang benar ialah : d) berjalan Oleh karena itu huruf d yang seharusnya dipilih.`,
  duration: 6,
},

{
 //    id: 3,
  testTypeId: istTest.id,
  name: "AN",
  desc: `Ditentukan 3 (tiga) kata.
Antara kata pertama dan kata kedua terdapat suatu hubungan tertentu.
Antara kata ketiga dan salah satu diantara lima kata pilihan harus pula terdapat hubungan yang sama itu.
Carilah kata itu.

Contoh 03
Hutan : pohon = tembok : ?

a) batu bata  b) rumah  c) semen  d) putih  e) dinding
hubungan antara hutan dan pohon ialah bahwa hutan terdiri atas pohon-pohon, maka hubungan antara tembok dan salah satu kata pilihan bahwa tembok terdiri atas batu-batu bata.
Oleh karena itu huruf A yang seharusnya dipilih.

Contoh berikutnya:

Gelap : terang = basah : ?
a) Hujan  b) hari  c) lembab  d) angin  e) kering
Gelap ialah lawannya dari terang, maka untuk basah lawannya ialah kering. Maka jawaban yang benar ialah : e) kering
Oleh karena itu huruf E yang seharusnya dipilih.`,
  duration: 7,
},
{
 //    id: 4,
  testTypeId: istTest.id,
  name: "GE",
  desc: `Ditentukan dua kata.
Carilah satu perkataan yang meliputi pengertian kedua kata tadi.
Tulislah perkataan itu pada lembar jawaban di belakang nomor soal yang sesuai.

Contoh 04
Ayam – itik
Perkataan “burung” dapat meliputi pengertian kedua kata itu. Maka jawabannya ialah “burung”

Contoh berikutnya:
Gaun – celana
Pada contoh ini jawabannya ialah “pakaian” maka “pakaian” yang seharusnya ditulis. 
Carilah selalu perkataan yang tepat yang dapat meliputi pengertian kedua kata itu.`,
  duration: 8,
},
{
//     id: 5,
  testTypeId: istTest.id,
  name: "RA",
  desc: `Persoalan berikutnya ialah soal-soal hitungan. 
  Contoh 05. Sebatang pensil harganya 25 rupiah. Berapakah harga 3 batang? Jawabannya ialah : 75
Perhatikan cara menjawab!

Pada pilihan jawaban terdiri atas angka-angka 1 sampai 9 dan 0
Untuk menunjukkan jawaban suatu soal, maka pilihlah angka-angka yang terdapat di dalam jawaban itu.
Keurutan angka jawaban tidak perlu dihiraukan.

Pada contoh 05 jawaban ialah 75.
Oleh karena itu, pada pilihan jawaban, angka 7 dan 5 harus dicoret.

Contoh lain :

Dengan sepeda Husin dapat mencapai 15 km dalam waktu 1 jam. Berapa km-kah yang dapat ia capai dalam waktu 4 jam?

Jawabannya ialah : 60
Maka untuk menunjukkan jawaban itu angka 6 dan 0 yang seharusnya dipilih.`,
  duration: 10,
},
{
//     id: 6,
  testTypeId: istTest.id,
  name: "ZR",
  desc: `Pada persoalan berikut akan diberikan deret angka.
Setiap deret tersusun menurut suatu aturan yang tertentu dan dapat dilanjutkan menurut aturan itu.
Carilah untuk setiap deret, angka berikutnya dan pilihlah jawaban yang tepat.

Contoh 06

2  4  6  8  10  12  14  ?

Pada deret ini angka berikutnya selalu didapat jika angka di depannya ditambah dengan 2. Maka jawabanya ialah 16
Oleh karena itu, pada pilihan jawaban, angka 1 dan 6 harus dipilih.

Contoh berikutnya :

9  7  10  8  11  9  12  ?

Pada deret ini berganti-ganti harus dikurangi dengan 2 dan setelah itu ditambah dengan 3. Jawaban contoh ini ialah 10, maka dari itu angka 1 dan 0 seharusnya yang dipilih.
Kadang-kadang pada beberapa soal harus pula dikalikan atau dibagi.`,
  duration: 10,
},

{ 
  //id: 7,
  testTypeId: istTest.id,
  name: "FA",
  desc: `Pada persoalan berikutnya, setiap soal memperlihatkan suatu bentuk tertentu yang terpotong menjadi beberapa bagian.
Carilah di antara bentuk-bentuk yang ditentukan (a, b, c, d, e) bentuk yang dibangun dengan cara menyusun potongan-potongan itu sedemikian rupa, sehingga tidak ada kelebihan sudut atau ruang di antaranya.
Carilah bentuk-bentuk itu dan pilihlah jawaban yang menunjukkan bentuk tadi.`,
  duration: 7
},
{
   //  id: 8,
  testTypeId: istTest.id,
  name: "WU",
  desc: `Ditentukan 5 (lima) buah kubus a, b, c, d, e. Pada tiap-tiap kubus terdapat enam tanda yang berlainan pada setiap sisinya. Tiga dari tanda itu dapat dilihat.
Kubus-kubus yang ditentukan itu (a, b, c, d, e) ialah kubus-kubus yang berbeda, artinya kubus-kubus itu dapat mempunyai tanda-tanda yang sama, akan tetapi susunannya berlainan, setiap soal memperlihatkan salah satu kubus yang ditentukan di dalam kedudukan yang berbeda.
Carilah kubus yang dimaksudkan itu dan pilihlah jawaban yang sesuai.
Kubus itu dapat diputar, dapat digulingkan atau dapat diputar dan digulingkan dalam pikiran.`,
  duration: 9
},
{
  testTypeId: istTest.id,
  name: "HAPALAN_ME",
  desc: JSON.stringify([
    { category: "BUNGA", words: ["SOKA", "LARAT", "FLAMBOYAN", "YASMIN", "DAHLIA"] },
    { category: "PERKAKAS", words: ["WAJAN", "JARUM", "KIKIR", "CANGKUL", "PALU"] },
    { category: "BURUNG", words: ["ITIK", "ELANG", "WALET", "TEKUKUR", "NURI"] },
    { category: "KESENIAN", words: ["QUINTET", "ARCA", "OPERA", "UKIRAN", "GAMELAN"] },
    { category: "BINATANG", words: ["RUSA", "MUSANG", "BERUANG", "HARIMAU", "ZEBRA"] },
  ]),
  duration: 3, // menit hapalan
},

{
  //   id: 9,
  testTypeId: istTest.id,
  name: "ME",
  desc: `Pada persoalan berikutnya, terdapat sejumlah pertanyaan mengenai kata-kata yang telah saudara hafalkan tadi. Pilihlah jawaban saudara yang sesuai.

Contoh 09
Kata yang mempunyai huruf permulaan – Q – adalah suatu …….
a) bunga b) perkakas c) burung d) kesenian e) binatang
Quintet adalah termasuk dalam jenis kesenian, sehingga jawaban yang benar adalah d). Oleh karena itu, pada pilihan jawaban huruf d harus dipilih.
Contoh berikutnya :
Kata yang mempunyai huruf pertama – Z – adalah suatu ……
a) bunga b) perkakas c) burung d) kesenian e) binatang
Jawabannya adalah e, karena Zebra termasuk dalam jenis binatang.`,
  duration: 3
},

    ],
    skipDuplicates: true, // supaya nggak error kalau sudah ada
  });

  console.log("Seed subtests selesai!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
