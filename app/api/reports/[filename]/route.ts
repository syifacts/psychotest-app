import fs from "fs";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  const filePath = path.join(
    process.cwd(),
    "public",
    "reports",
    filename
  );

  if (!fs.existsSync(filePath)) {
    return new Response("File not found", {
      status: 404,
    });
  }

  const buffer = fs.readFileSync(filePath);

  return new Response(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}