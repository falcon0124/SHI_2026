import { NextResponse } from "next/server";
import { mockApix } from "@/lib/api/mock/apix";
import { FreqSchema } from "@/lib/api/schemas";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const parsed = FreqSchema.safeParse(searchParams.get("freq") ?? "monthly");
  const freq = parsed.success ? parsed.data : "monthly";
  return NextResponse.json(mockApix(freq));
}
