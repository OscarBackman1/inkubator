import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";

export async function GET() {
  await requireUser();
  const documents = await prisma.document.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return NextResponse.json({ documents });
}
