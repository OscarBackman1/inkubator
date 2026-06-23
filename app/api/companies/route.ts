import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  await requireUser();
  const companies = await prisma.company.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ companies });
}
