import { NextResponse } from "next/server";
import { mockRoutes } from "@/lib/api/mock/routes";

export function GET() {
  return NextResponse.json(mockRoutes());
}
