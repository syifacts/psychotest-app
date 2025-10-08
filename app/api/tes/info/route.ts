import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get("type"); // contoh: "IST"

    if (!type) {
      return NextResponse.json({ error: "Tipe tes wajib diisi" }, { status: 400 });
    }

    const test = await prisma.testType.findUnique({
      where: { name: type },
      select: {
        id: true,
        name: true,
        duration: true,
        price: true,
        judul: true,
        deskripsijudul: true,
        juduldesk1: true,
        desk1: true,
        juduldesk2: true,
        desk2: true,
        judulbenefit: true,
        pointbenefit: true,
        cp: true,
        subTests: {
          select: {
            id: true,
            name: true,
            desc: true,
            duration: true,
          },
        },
      },
    });

    if (!test) {
      return NextResponse.json({ error: "Tes tidak ditemukan" }, { status: 404 });
    }

    // ✅ Map subTests: normalisasi nama field dan handle khusus untuk HAPALAN_ME
    const mappedTest = {
      ...test,
      subTests: test.subTests.map((st) => {
        let hapalan = null;
        let description = st.desc ?? "Deskripsi subtest belum tersedia";

        if (st.name === "HAPALAN_ME" && st.desc) {
          try {
            const parsed = JSON.parse(st.desc);
            if (Array.isArray(parsed)) {
              hapalan = parsed;
              // simpan string-nya juga agar kompatibel dengan frontend lama
              description = st.desc;
            }
          } catch (err) {
            console.warn("❌ Gagal parse hapalan:", err);
          }
        }

        return {
          id: st.id,
          name: st.name,
          description,
          hapalan, // 👈 field tambahan hanya untuk HAPALAN_ME
          durationMinutes: st.duration ?? 6,
        };
      }),
    };

    return NextResponse.json(mappedTest);
  } catch (err) {
    console.error("❌ Error GET test info:", err);
    return NextResponse.json({ error: "Gagal ambil info tes" }, { status: 500 });
  }
}
