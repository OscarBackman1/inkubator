import { NextResponse } from "next/server";
import { getAiRuntimeStatus } from "@/lib/ai/client";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  await requireUser();
  return NextResponse.json(getAiRuntimeStatus());
}
