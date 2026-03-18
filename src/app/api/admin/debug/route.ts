import { NextResponse } from "next/server";
export async function GET() {
  const pw = process.env.ADMIN_PASSWORD ?? "NOT_SET";
  return NextResponse.json({
    length: pw.length,
    chars: pw.split("").map((c) => c.charCodeAt(0)),
    value: pw,
  });
}
