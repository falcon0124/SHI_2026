import { NextResponse } from "next/server";
import { mockSources } from "@/lib/api/mock/quality";

export function GET() {
  return NextResponse.json(mockSources());
}
