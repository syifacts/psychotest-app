// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// interface Params {
//   params: { id: string };
// }

// export async function GET(req: Request, { params }: Params) {
//   const id = Number(params.id);
//   if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

//   const test = await prisma.testType.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       desc: true,
//       judul: true,
//       deskripsijudul: true,
//       juduldesk1: true,
//       desk1: true,
//       juduldesk2: true,
//       desk2: true,
//       judulbenefit: true,
//       pointbenefit: true,
//       price: true,
//       duration: true,
//       priceDiscount: true,
//       percentDiscount: true,
//     noteDiscount: true,
//     },
//   });

//   if (!test) return NextResponse.json({ error: "Test not found" }, { status: 404 });

//   return NextResponse.json(test);
// }
// // PUT untuk update
// export async function PUT(req: Request, { params }: Params) {
//   const id = Number(params.id);
//   if (isNaN(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

//   const body = await req.json();

//   const updated = await prisma.testType.update({
//     where: { id },
//     data: {
//       desc: body.desc,
//       judul: body.judul,
//       deskripsijudul: body.deskripsijudul,
//       juduldesk1: body.juduldesk1,
//       desk1: body.desk1,
//       juduldesk2: body.juduldesk2,
//       desk2: body.desk2,
//       judulbenefit: body.judulbenefit,
//       pointbenefit: body.pointbenefit,
//       price: body.price,
//       duration: body.duration,
//       priceDiscount: body.priceDiscount,
//     noteDiscount: body.noteDiscount,
//       percentDiscount: body.percentDiscount, // ✅ samakan dengan nama di schema Prisma
//     },
//   });

//   return NextResponse.json(updated);
// }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ← HARUS di-await
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const test = await prisma.testType.findUnique({
    where: { id: numId },
    select: {
      id: true,
      name: true,
      desc: true,
      judul: true,
      deskripsijudul: true,
      juduldesk1: true,
      desk1: true,
      juduldesk2: true,
      desk2: true,
      judulbenefit: true,
      pointbenefit: true,
      price: true,
      duration: true,
      priceDiscount: true,
      percentDiscount: true,
      noteDiscount: true,
      cp: true,
    },
  });

  if (!test) {
    return NextResponse.json({ error: "Test not found" }, { status: 404 });
  }

  return NextResponse.json(test);
}


export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const numId = Number(id);

  if (isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();

  const updated = await prisma.testType.update({
    where: { id: numId },
    data: {
      desc: body.desc,
      judul: body.judul,
      deskripsijudul: body.deskripsijudul,
      juduldesk1: body.juduldesk1,
      desk1: body.desk1,
      juduldesk2: body.juduldesk2,
      desk2: body.desk2,
      judulbenefit: body.judulbenefit,
      pointbenefit: body.pointbenefit,
      price: body.price,
      duration: body.duration,
      priceDiscount: body.priceDiscount,
      noteDiscount: body.noteDiscount,
      percentDiscount: body.percentDiscount,
      cp: body.cp,
    },
  });

  return NextResponse.json(updated);
}
