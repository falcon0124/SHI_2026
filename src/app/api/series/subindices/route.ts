import { NextResponse } from "next/server";
import { mockSubIndices } from "@/lib/api/mock/apix";

export function GET() {
  return NextResponse.json(mockSubIndices());
}
