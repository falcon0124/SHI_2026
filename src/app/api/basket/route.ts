import { NextResponse } from "next/server";
import { mockBasket } from "@/lib/api/mock/routes";

export function GET() {
  return NextResponse.json(mockBasket());
}
