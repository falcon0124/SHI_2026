import { NextResponse } from "next/server";
import { mockAnomalies } from "@/lib/api/mock/quality";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") ?? 50) || 50;
  const data = mockAnomalies();
  return NextResponse.json({ ...data, items: data.items.slice(0, limit) });
}
