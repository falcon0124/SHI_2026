import { NextResponse } from "next/server";
import { mockRouteDetail } from "@/lib/api/mock/routes";

export async function GET(_req: Request, { params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const detail = mockRouteDetail(decodeURIComponent(pair).replace("-", "–"));
  if (!detail) return NextResponse.json({ error: `Unknown route ${pair}.` }, { status: 404 });
  return NextResponse.json(detail);
}
