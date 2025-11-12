import { NextResponse } from "next/server";
import questions from "../../../prisma/data/HOLLAND/question";

export async function GET() {
  return NextResponse.json(questions);
}