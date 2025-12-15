// import { prisma } from "@/lib/prisma";

// export async function GET() {
//   try {
//     // ambil semua user
//     const users = await prisma.user.findMany({
//       select: {
//         id: true,
//         fullName: true,
//         email: true,
//         role: true,
//         companyId: true,
//         createdAt: true,
//         defaultPassword: true,
//             password: true, 

//       },
//       orderBy: { createdAt: "desc" },
//     });

    
//     // ambil semua perusahaan
//     const companies = await prisma.user.findMany({
//       where: { role: "PERUSAHAAN" },
//       select: { id: true, fullName: true },
//     });

//     const companyMap = new Map(companies.map(c => [c.id, c.fullName]));

//     const result = users.map(u => ({
//       ...u,
//       companyName: u.companyId ? companyMap.get(u.companyId) : null,
//       passwordDisplay: u.defaultPassword,
//     }));

//     return new Response(JSON.stringify(result), { status: 200 });
//   } catch (err) {
//     console.error(err);
//     return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
//   }
// }


import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Ambil semua user
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
        defaultPassword: true,
        password: true, // hash bcrypt
      },
      orderBy: { createdAt: "desc" },
    });

    // Ambil list perusahaan untuk mapping nama
    const companies = await prisma.user.findMany({
      where: { role: "PERUSAHAAN" },
      select: { id: true, fullName: true },
    });

    // const companyMap = new Map(companies.map(c => [c.id, c.fullName]));
    const companyMap = new Map(
  companies.map((c: { id: number; fullName: string }) => [c.id, c.fullName])
);

    // Proses password display
    const result = await Promise.all(
  users.map(async (u: any) => {
        let passwordDisplay = "-";

        // Jika punya defaultPassword → cek apakah masih sama dengan hash
        if (u.defaultPassword) {
          const isSame = await bcrypt.compare(u.defaultPassword, u.password);

          passwordDisplay = isSame
            ? u.defaultPassword          // belum pernah ganti password
            : "HASHED";                // sudah ganti password
        }

        return {
          ...u,
          companyName: u.companyId ? companyMap.get(u.companyId) : null,
          passwordDisplay,
        };
      })
    );

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
  }
}
