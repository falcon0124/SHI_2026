import { NextResponse } from "next/server";
import { mockQualitySummary } from "@/lib/api/mock/quality";

export function GET() {
  return NextResponse.json(mockQualitySummary());
}
