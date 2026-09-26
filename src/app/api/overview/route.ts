import { NextResponse } from "next/server";
import { mockOverview } from "@/lib/api/mock/apix";

export function GET() {
  return NextResponse.json(mockOverview());
}
